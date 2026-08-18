import { useEffect, useRef, useState } from 'react'

/**
 * The shape of the optical sound track, read off the actual audio.
 *
 * On a film print the sound is a variable-area stripe printed beside the
 * picture: a continuous mirrored silhouette of the waveform, read by a lamp and
 * a photocell. So this draws a silhouette, not bars — one closed path, which is
 * both the accurate answer and by far the cheapest one to animate.
 *
 * Nothing is fetched until the visitor first presses play. Until then, and if
 * decoding is unsupported or fails, the stripe stays flat — which is what
 * unexposed leader looks like, so it needs no spinner and no error state. The
 * hook always returns a full-length array for that reason: there is exactly one
 * rendering path, the path is always drawable, and seeking never depends on any
 * of this. The stripe is a picture of the sound; the sound does not need it.
 */

/** Enough to read as a waveform at full width, small enough to build in one pass. */
const BUCKETS = 600

/** Unexposed leader still has an edge — a flat zero would read as nothing there. */
const LEADER = 0.05

/**
 * Decode at 16 kHz rather than the file's 44.1 kHz. `decodeAudioData` resamples
 * as it decodes, and 600 buckets over four and a half minutes still leaves
 * ~7,000 samples each — far more than a silhouette can show. The full-rate
 * decode of this track would allocate around 94 MB of Float32 PCM, which is a
 * plausible out-of-memory reload on a cheap phone. This is about 12.
 */
const DECODE_RATE = 16000

export type PeaksState = 'idle' | 'reading' | 'ready' | 'unavailable'

interface WebkitWindow {
  webkitOfflineAudioContext?: typeof OfflineAudioContext
}

/**
 * Offline rather than a live AudioContext, for three reasons in increasing
 * order of importance: no autoplay-policy console warning, no hardware audio
 * device opened for something that never makes a sound, and — the real one — on
 * iOS constructing a live context changes the audio session category and can
 * duck the `<audio>` element that is doing the actual playing.
 */
function offlineContextCtor(): typeof OfflineAudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  return window.OfflineAudioContext ?? (window as unknown as WebkitWindow).webkitOfflineAudioContext
}

function leaderPeaks(): Float32Array {
  return new Float32Array(BUCKETS).fill(LEADER)
}

/**
 * Reduce decoded audio to one peak per bucket, normalised.
 *
 * Peak rather than RMS because this is a silhouette, and RMS would flatten the
 * track into a sausage. Normalising means a quietly-mastered song still fills
 * the stripe instead of drawing a thin line down the middle.
 */
export function peaksFromBuffer(buffer: AudioBuffer, buckets = BUCKETS): Float32Array {
  const peaks = new Float32Array(buckets)
  if (buckets <= 0 || buffer.length === 0) return peaks

  const channel = buffer.getChannelData(0)
  const span = channel.length / buckets
  let ceiling = 0

  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const start = Math.floor(bucket * span)
    const end = Math.min(Math.floor(start + span), channel.length)
    let peak = 0

    for (let sample = start; sample < end; sample += 1) {
      const value = Math.abs(channel[sample])
      if (value > peak) peak = value
    }

    peaks[bucket] = peak
    if (peak > ceiling) ceiling = peak
  }

  if (ceiling > 0) {
    for (let bucket = 0; bucket < buckets; bucket += 1) peaks[bucket] /= ceiling
  }

  return peaks
}

/**
 * Peaks → one closed SVG path, mirrored about the centre line.
 *
 * Runs out along the top edge and back along the bottom, so the fill is the
 * silhouette itself. The viewBox is nominal and the SVG stretches with
 * `preserveAspectRatio="none"`, which is why nothing here needs to know the
 * strip's real width.
 */
export function peaksToPath(peaks: Float32Array, width: number, height: number): string {
  if (peaks.length === 0) return ''

  const mid = height / 2
  const step = width / Math.max(1, peaks.length - 1)
  const top: string[] = []
  const bottom: string[] = []

  for (let index = 0; index < peaks.length; index += 1) {
    const x = (index * step).toFixed(2)
    const amplitude = peaks[index] * mid
    top.push(`${x},${(mid - amplitude).toFixed(2)}`)
    bottom.push(`${x},${(mid + amplitude).toFixed(2)}`)
  }

  bottom.reverse()
  return `M${top.join('L')}L${bottom.join('L')}Z`
}

export interface AudioPeaks {
  /** Always full length: leader until the real thing is decoded. */
  peaks: Float32Array
  state: PeaksState
}

export function useAudioPeaks(src: string, enabled: boolean): AudioPeaks {
  const [peaks, setPeaks] = useState<Float32Array>(leaderPeaks)
  const [state, setState] = useState<PeaksState>('idle')
  // Read inside the effect rather than listed as a dependency: re-running on
  // every state change would restart the fetch it had just finished.
  const doneRef = useRef(false)

  useEffect(() => {
    if (!enabled || doneRef.current) return

    // Checked before anything is fetched, so an environment without Web Audio
    // — jsdom, notably — takes the leader path without touching the network.
    const Ctor = offlineContextCtor()
    if (!Ctor || typeof fetch !== 'function') {
      setState('unavailable')
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setState('reading')

    void (async () => {
      try {
        const response = await fetch(src, { signal: controller.signal })
        const bytes = await response.arrayBuffer()
        // Decoding needs no user gesture: the autoplay policy governs whether a
        // context may start rendering, not whether it may decode.
        const decoded = await new Ctor(1, 1, DECODE_RATE).decodeAudioData(bytes)
        if (cancelled) return

        doneRef.current = true
        // The AudioBuffer goes out of scope here and is never stored. Holding
        // one in state or a ref is how a page like this ends up carrying tens
        // of megabytes for the rest of the session.
        setPeaks(peaksFromBuffer(decoded))
        setState('ready')
      } catch {
        // Includes the abort StrictMode's second pass triggers, which is why
        // `doneRef` is not latched here — that retry is meant to happen.
        if (!cancelled) setState('unavailable')
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, src])

  return { peaks, state }
}
