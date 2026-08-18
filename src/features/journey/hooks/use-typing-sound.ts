import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * The sound of the letter being written.
 *
 * The recording is eight seconds of continuous fast typing, and the letter
 * takes about half a minute — so this is not a matter of playing a file. The
 * typewriter deliberately leaves gaps: 330ms after a full stop, 520ms at a
 * paragraph break. A clatter that runs straight through those reads as
 * background music playing near a letter. A clatter that stops in them reads as
 * somebody writing one.
 *
 * So the element loops from the moment the envelope is tapped until the letter
 * is put back, and `onType` opens and closes the mute around it. Within a
 * sentence the gaps are 46–108ms and the tail timer keeps being pushed out, so
 * the sound is unbroken; at a sentence end or a paragraph break it outruns the
 * timer and the room goes quiet until the next character lands.
 */

/**
 * How long the clatter carries past the last keystroke, in ms.
 *
 * It has to sit above the longest gap inside a sentence — a space is 62ms and
 * jitter puts the worst case near 108 — and below the shortest gap between
 * them, which is a full stop at 376. Anywhere in that band works; this is
 * roughly the middle, and short enough that the silence lands with the pause
 * rather than after it.
 */
const TAIL_MS = 130

/**
 * Quiet enough to sit under the optical track, which someone may well have
 * running on the section above.
 *
 * Ignored on iOS Safari, where `volume` is read-only — see the README. The mute
 * control is the answer there, and it is the reason there is one.
 */
const LEVEL = 0.34

export interface TypingSound {
  /** Goes on the `<audio>`. */
  ref: RefObject<HTMLAudioElement | null>
  /**
   * Starts the element rolling, silently. **Must be called from a real click
   * handler** — see the note on the implementation.
   */
  prime: () => void
  /** Hand to `useTypewriter` as its third argument. */
  onType: () => void
  /** False when there is nothing a control could usefully do. */
  available: boolean
  soundOn: boolean
  toggleSound: () => void
}

/**
 * `running` is true from the tap that breaks the seal until the letter is put
 * back — not just while the dialog is open. The element is started early and on
 * purpose, and stopping it is what `running` going false is for.
 */
export function useTypingSound(running: boolean): TypingSound {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLAudioElement>(null)
  const tailRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [blocked, setBlocked] = useState(false)
  const blockedRef = useRef(false)
  const [soundOn, setSoundOn] = useState(true)
  // `onType` is invoked from a Motion frame callback, which closes over
  // whatever this hook returned when the animation started. A ref is how it
  // reads the preference as it is now rather than as it was — the same reason
  // `use-letter-speech` keeps a `stopRef`.
  const soundOnRef = useRef(soundOn)

  useEffect(() => {
    soundOnRef.current = soundOn
    // Silence lands on the press rather than waiting out the tail timer.
    if (!soundOn && ref.current) ref.current.muted = true
  }, [soundOn])

  /** There is no sound to be had on this device. Latched, and hides the control. */
  const refuse = useCallback(() => {
    blockedRef.current = true
    setBlocked(true)
  }, [])

  /**
   * Starts or resumes the tape, and decides what a refusal meant.
   *
   * `AbortError` is not a verdict. Chrome counts a muted element as *video-only*
   * media and suspends it to save power whenever the page is backgrounded — so
   * a visitor who opens the letter and glances at another tab gets one of these
   * through no fault of the page. Treating it as permanent would silence the
   * rest of the letter and take the control away mid-read. Only a policy
   * refusal is forever, and that is what `refuse` is for.
   */
  const roll = useCallback(() => {
    const audio = ref.current
    if (!audio || blockedRef.current) return

    // Nothing awaited in front of it, for the reason `use-media-transport`
    // gives at its own play(): Chrome spends the activation on the first await.
    const started = audio.play() as Promise<void> | undefined
    started?.catch((error: DOMException) => {
      if (error.name !== 'AbortError') refuse()
    })
  }, [refuse])

  /**
   * Starts the tape, muted.
   *
   * This is the whole reason the element lives in the section rather than in
   * the letter, and the reason this is a method rather than an effect. WebKit
   * only grants an element the right to play audio if `play()` was called
   * inside a user gesture, and — the part that catches people — it *pauses* a
   * muted element that started without one the moment script unmutes it. Left
   * to an effect, this would run about a second after the tap, in a React
   * passive effect, in a different task: on an iPhone the letter would type in
   * silence and nothing would say why.
   *
   * Muted playback is permitted everywhere, so nothing is heard through the
   * seal and the flap. The call is what buys the right to unmute later.
   *
   * It runs whether or not the sound is currently on, so that turning it back
   * on mid-letter is one property change rather than a second permission
   * problem.
   */
  const prime = useCallback(() => {
    const audio = ref.current
    if (!audio || reduced) return

    // Muted before play() rather than after: a frame of full-level clatter
    // between the two calls is audible.
    audio.muted = true
    audio.volume = LEVEL
    roll()
  }, [reduced, roll])

  const onType = useCallback(() => {
    const audio = ref.current
    if (!audio || !soundOnRef.current || blockedRef.current) return

    audio.muted = false
    // Coming back to a tab Chrome suspended should not find the letter
    // permanently silent. Guarded on `paused`, so a rolling tape is left alone
    // and a genuinely refused one is not asked four hundred times.
    if (audio.paused) roll()

    if (tailRef.current !== null) clearTimeout(tailRef.current)
    tailRef.current = setTimeout(() => {
      tailRef.current = null
      const node = ref.current
      if (node) node.muted = true
    }, TAIL_MS)
  }, [roll])

  const toggleSound = useCallback(() => setSoundOn((on) => !on), [])

  /**
   * A file that will not load is not a control the reader should be offered,
   * for the same reason `use-letter-speech` hides read-aloud on a device with
   * no voice.
   */
  useEffect(() => {
    const audio = ref.current
    if (!audio) return

    const onError = () => refuse()
    audio.addEventListener('error', onError)
    return () => audio.removeEventListener('error', onError)
  }, [refuse])

  /**
   * Putting the letter back.
   *
   * `running` follows the phase, which returns to `sealed` on the press itself
   * — so this fires while the modal is still fading rather than 240ms later
   * when it has finished. Escape, the scrim and the close button all reach it
   * the same way, which is why nothing else in this feature has to remember to
   * stop the sound.
   */
  useEffect(() => {
    if (running) return

    const audio = ref.current
    if (!audio) return

    if (tailRef.current !== null) {
      clearTimeout(tailRef.current)
      tailRef.current = null
    }
    audio.muted = true
    audio.pause()
    audio.currentTime = 0
  }, [running])

  useEffect(() => {
    const audio = ref.current
    return () => {
      if (tailRef.current !== null) clearTimeout(tailRef.current)
      audio?.pause()
    }
  }, [])

  return {
    ref,
    prime,
    onType,
    // Under reduced motion the letter is complete on its first paint, so there
    // are no keystrokes to accompany and nothing to turn off. The element is
    // never primed either, which means that visitor does not download the file.
    available: !blocked && !reduced,
    soundOn,
    toggleSound,
  }
}
