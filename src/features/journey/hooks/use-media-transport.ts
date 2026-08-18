import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Everything both film strips need from a `<video>` or an `<audio>`: whether it
 * is running, where it is, and how to move it.
 *
 * The element is the source of truth, not React state. `playing` follows the
 * element's own play/pause/ended events rather than being set optimistically at
 * the call site, so the two stay in step even when the browser stops playback
 * on its own — an autoplay refusal, a stall, a phone call, a sleeping tab.
 *
 * Position is deliberately reported twice, at two rates. The sweeping lamp
 * needs every frame, so it is written straight to the DOM as one custom
 * property on `surfaceRef` and never passes through React. The clock and the
 * seek input only need about four updates a second, and get them from
 * `timeupdate`. Putting the lamp on state instead would re-render the reel
 * sixty times a second and re-diff a 600-point path to move a clock that
 * changes once — and would make a screen reader announce the slider on every
 * one of those frames.
 */

const BLANK_CLOCK = '--:--'

/** The seek input's fixed domain. See `toPermille` for why it is not seconds. */
export const SEEK_RANGE = 1000

/**
 * Seconds → `mm:ss`.
 *
 * Returns the blank clock for the gap before metadata arrives, where `duration`
 * is `NaN`: the reel loads nothing at all until someone presses run, so that
 * gap is this component's opening state rather than a rare edge case.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return BLANK_CLOCK

  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60

  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/**
 * Position as a 0..1000 integer.
 *
 * The seek input's range is per-mille rather than seconds because `duration` is
 * `NaN` until metadata lands — a duration-bound `max` would mean either an
 * invalid input or a conditional render on first paint. A fixed domain is
 * stable from the very first frame and needs neither. `aria-valuetext` carries
 * the real time, which is the value anyone would actually want read out.
 */
export function toPermille(current: number, duration: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(duration) || duration <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, current / duration)) * SEEK_RANGE)
}

/** ...and back to seconds. */
export function fromPermille(permille: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return (Math.min(SEEK_RANGE, Math.max(0, permille)) / SEEK_RANGE) * duration
}

export interface MediaTransport<T extends HTMLMediaElement> {
  /** Attach to the `<video>` or `<audio>`. */
  ref: RefObject<T | null>
  /** Attach to the strip that shows progress; receives `--played`. */
  surfaceRef: RefObject<HTMLDivElement | null>
  playing: boolean
  muted: boolean
  /** Seconds elapsed. `NaN` until metadata lands. */
  current: number
  /** `NaN` until metadata lands. */
  duration: number
  ready: boolean
  /** Current position on the seek input's 0..1000 scale. */
  permille: number
  toggle: () => void
  toggleMuted: () => void
  seekToPermille: (permille: number) => void
}

export function useMediaTransport<T extends HTMLMediaElement>(
  startMuted = false,
): MediaTransport<T> {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<T>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(startMuted)
  const [current, setCurrent] = useState(Number.NaN)
  const [duration, setDuration] = useState(Number.NaN)
  const [ready, setReady] = useState(false)

  /**
   * One write per frame, straight to the node. Unitless, so the strips can do
   * arithmetic on it in `calc()`; a percentage cannot be multiplied. Falls back
   * to 0 rather than writing `NaN`, which would invalidate the whole `calc()`
   * at computed-value time and drop the lamp back to the left edge.
   */
  const paint = useCallback((media: HTMLMediaElement) => {
    const total = media.duration
    const ratio = Number.isFinite(total) && total > 0 ? media.currentTime / total : 0
    surfaceRef.current?.style.setProperty('--played', ratio.toFixed(5))
  }, [])

  useEffect(() => {
    const media = ref.current
    if (!media) return

    const onPlay = () => setPlaying(true)
    const onStop = () => setPlaying(false)
    const onMeta = () => {
      setDuration(media.duration)
      setCurrent(media.currentTime)
      setReady(true)
      paint(media)
    }
    // The clock's and the slider's source — and the only position signal left
    // once reduced motion has taken the rAF loop away.
    const onTime = () => {
      setCurrent(media.currentTime)
      paint(media)
    }
    const onVolume = () => setMuted(media.muted)

    media.addEventListener('play', onPlay)
    media.addEventListener('pause', onStop)
    media.addEventListener('ended', onStop)
    media.addEventListener('loadedmetadata', onMeta)
    media.addEventListener('durationchange', onMeta)
    media.addEventListener('timeupdate', onTime)
    media.addEventListener('seeked', onTime)
    media.addEventListener('volumechange', onVolume)

    return () => {
      media.removeEventListener('play', onPlay)
      media.removeEventListener('pause', onStop)
      media.removeEventListener('ended', onStop)
      media.removeEventListener('loadedmetadata', onMeta)
      media.removeEventListener('durationchange', onMeta)
      media.removeEventListener('timeupdate', onTime)
      media.removeEventListener('seeked', onTime)
      media.removeEventListener('volumechange', onVolume)
    }
  }, [paint])

  /**
   * The lamp. Only runs while something is actually playing, so a stopped reel
   * costs nothing, and never runs under reduced motion — there `timeupdate`
   * alone moves it, in visible four-times-a-second steps, which is the honest
   * trade rather than a smooth animation nobody asked for.
   *
   * `frame` and `cancelled` are locals rather than refs: React 19's StrictMode
   * runs effect, cleanup, effect, and a local closure cannot be confused by
   * that ordering. The flag is needed alongside the cancel because a callback
   * may already be queued when cleanup lands.
   */
  useEffect(() => {
    if (!playing || reduced) return
    const media = ref.current
    if (!media || typeof requestAnimationFrame !== 'function') return

    let cancelled = false
    let frame = requestAnimationFrame(function tick() {
      if (cancelled) return
      paint(media)
      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [playing, reduced, paint])

  const toggle = useCallback(() => {
    const media = ref.current
    if (!media) return

    if (!media.paused) {
      media.pause()
      return
    }

    // Called with nothing awaited in front of it: Chrome spends the transient
    // user activation on the first await, and then refuses with NotAllowedError.
    // jsdom and some older engines return undefined here rather than a promise,
    // hence the optional call.
    const started = media.play() as Promise<void> | undefined

    // AbortError is the normal outcome of pressing stop while 15 MB is still
    // buffering, and NotAllowedError is the browser's decision to make. Neither
    // is actionable, and the element's own events keep `playing` honest either
    // way — but left unhandled both surface as console noise on every fast tap.
    started?.catch(() => {})
  }, [])

  const toggleMuted = useCallback(() => {
    const media = ref.current
    if (!media) return
    media.muted = !media.muted
    setMuted(media.muted)
  }, [])

  const seekToPermille = useCallback(
    (value: number) => {
      const media = ref.current
      if (!media || !Number.isFinite(media.duration)) return

      media.currentTime = fromPermille(value, media.duration)
      // Set now rather than waiting for `seeked`, so the input does not snap
      // back to its old value for a frame mid-drag.
      setCurrent(media.currentTime)
      paint(media)
    },
    [paint],
  )

  return {
    ref,
    surfaceRef,
    playing,
    muted,
    current,
    duration,
    ready,
    permille: toPermille(current, duration),
    toggle,
    toggleMuted,
    seekToPermille,
  }
}
