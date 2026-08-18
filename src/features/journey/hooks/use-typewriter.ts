import { animate } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * The rhythm, in milliseconds. These are the whole point of the hook — a
 * constant tick reads as a progress bar wearing a monospace font, and what
 * makes typing sound like typing is that it is uneven in specific places.
 */
const BASE = 46
/** A full stop is a breath, not a keystroke. */
const AFTER_SENTENCE = 330
/** A comma is half of one. */
const AFTER_CLAUSE = 165
/** A paragraph break is the writer looking up, not drawing breath. */
const AFTER_NEWLINE = 520
/** The gap between words, which is a hand moving rather than a finger. */
const AFTER_SPACE = 62
/** Doubled letters come out fast — the finger is already there. */
const DOUBLED = -18
/** How far a character may drift from its nominal delay, either way. */
const JITTER = 17

const SENTENCE_END = /[.!?។…]/
const CLAUSE_END = /[,;:—–]/

/**
 * Splits into graphemes, which on this page is not a nicety.
 *
 * Exported alongside the hook, the way `use-album-pager` exports `nextPage`:
 * both of these are pure and are the whole substance of the rhythm, so they are
 * worth being able to check directly rather than through a running animation.
 *
 * Lao stacks vowels above the consonant and tone marks above those, and every
 * one of them is a separate code point that means nothing on its own. A naive
 * `[...text]` would type "ເ", then "ດ", then a bare tone mark hanging in space
 * — and because Lao has no gaps between words, the reader would be watching a
 * column of orphaned marks assemble rather than words appearing. Segmenting by
 * grapheme puts each consonant on screen already wearing its marks.
 *
 * The fallback is the naive split. `Intl.Segmenter` has been in every browser
 * that reads AVIF for years, so it is unreachable in practice; it is here so
 * the hook degrades to slightly wrong rather than throwing.
 */
export function splitGraphemes(text: string, locale: string): string[] {
  if (typeof Intl.Segmenter !== 'function') return [...text]
  const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' })
  return Array.from(segmenter.segment(text), (s) => s.segment)
}

/**
 * How long to wait before revealing each grapheme.
 *
 * Deterministic, and that matters: `data/postcards.ts` already documents why a
 * `Math.random()` inside a component is a bug on this page — it re-rolls on
 * every render. The same trap applies here with an extra edge, since the line
 * retypes on a language change. The jitter is therefore a hash of the position,
 * so the same sentence always types the same way and two people watching it
 * side by side see the same thing.
 */
export function typingSchedule(chars: string[]): number[] {
  return chars.map((char, index) => {
    const previous = index > 0 ? chars[index - 1] : ''

    let delay = BASE
    // Newline first: the character after a paragraph-ending full stop is the
    // break itself, so testing for the stop first would swallow the longer pause.
    if (previous === '\n') delay += AFTER_NEWLINE
    else if (SENTENCE_END.test(previous)) delay += AFTER_SENTENCE
    else if (CLAUSE_END.test(previous)) delay += AFTER_CLAUSE
    else if (previous === ' ') delay += AFTER_SPACE
    if (char === previous) delay += DOUBLED

    // Knuth's multiplicative hash, folded to ±JITTER. Cheap, and spread evenly
    // enough over adjacent indices that neighbouring characters do not drift
    // the same way.
    const hash = Math.imul(index + 1, 2654435761) >>> 0
    return Math.max(16, delay + ((hash % (JITTER * 2 + 1)) - JITTER))
  })
}

export interface Typewriter {
  /** Goes on the element the text is written into. */
  ref: RefObject<HTMLElement | null>
  /** False until the last character has landed. Drives the caret. */
  done: boolean
  /**
   * Stops typing and puts the whole line up at once.
   *
   * The header's intro is one sentence and reads as a flourish; a letter is
   * long enough that watching it arrive has to be a choice rather than a toll.
   * Idempotent, and safe to call after the line has already finished.
   */
  finish: () => void
}

/**
 * Types a line out, one grapheme at a time, at a human rhythm.
 *
 * Motion drives it. The per-character delays are handed to `animate` as a
 * `times` array against integer keyframes, so the library's own scheduler owns
 * the clock — one animation with an uneven curve rather than two hundred
 * chained timeouts, which means it also stops cleanly the moment the language
 * changes or the component unmounts.
 *
 * The text is written to the DOM through a ref rather than held in state. A
 * two-hundred-character line would otherwise be two hundred renders of the
 * header; this is the same reason `use-media-transport` writes `--played`
 * straight onto its node. The single piece of state is `done`, which changes
 * once.
 *
 * Under reduced motion the line is complete on the first paint and no animation
 * is ever started.
 *
 * `onType` is reported once per grapheme as it lands, and exists so the letter
 * can be heard being typed without a second clock anywhere trying to guess this
 * one's rhythm. It is optional and the header passes nothing, which is what
 * keeps the page's opening line silent.
 */
export function useTypewriter(text: string, locale: string, onType?: () => void): Typewriter {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [done, setDone] = useState(false)
  // Held rather than closed over. The animation is started once per text, and a
  // caller that rebuilt this callback on every render would otherwise restart
  // the line from nothing each time it did.
  const onTypeRef = useRef(onType)
  useEffect(() => {
    onTypeRef.current = onType
  }, [onType])
  // Held so `finish` can cut the animation short from outside the effect that
  // started it, and cleared on teardown so a stale handle is never stopped.
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (reduced) {
      node.textContent = text
      setDone(true)
      return
    }

    setDone(false)
    node.textContent = ''

    const chars = splitGraphemes(text, locale)
    if (chars.length === 0) {
      setDone(true)
      return
    }

    const delays = typingSchedule(chars)
    const total = delays.reduce((sum, delay) => sum + delay, 0)

    // Cumulative delays, normalised to 0..1. `times[k]` is the moment grapheme
    // k appears, so flooring the animated value below turns a continuous ramp
    // back into discrete keystrokes landing on exactly those beats.
    let elapsed = 0
    const times = delays.map((delay) => {
      const at = elapsed / total
      elapsed += delay
      return at
    })
    times.push(1)

    // Prefixes are precomputed so each frame is one assignment rather than a
    // slice and a join.
    const prefixes: string[] = ['']
    for (const char of chars) prefixes.push(prefixes[prefixes.length - 1] + char)

    const counts = prefixes.map((_, index) => index)

    // The last grapheme actually written. A local rather than a ref for the
    // reason `use-media-transport` gives about StrictMode's effect, cleanup,
    // effect ordering — a closure cannot be confused by it.
    let landed = 0

    controlsRef.current = animate(0, counts, {
      duration: total / 1000,
      times,
      ease: 'linear',
      onUpdate: (count) => {
        const index = Math.min(Math.floor(count), chars.length)
        // The animation runs at sixty frames a second and the text lands at
        // about twenty-one characters a second, so most frames have nothing to
        // report. Skipping them is what makes a keystroke distinguishable from
        // a frame — which is what the sound is listening for — and it drops two
        // redundant DOM writes per character on the way.
        if (index === landed) return
        landed = index

        node.textContent = prefixes[index]
        onTypeRef.current?.()
      },
      onComplete: () => {
        node.textContent = text
        setDone(true)
      },
    })

    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [text, locale, reduced])

  const finish = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null

    const node = ref.current
    if (node) node.textContent = text
    setDone(true)
  }, [text])

  return { ref, done, finish }
}
