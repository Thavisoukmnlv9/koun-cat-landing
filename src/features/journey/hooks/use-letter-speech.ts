import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import { useSpeech, useVoices } from 'react-text-to-speech'

import { codeToTag } from '@/config/languages'

/**
 * The language part of a BCP-47 tag, normalised.
 *
 * Voice tags cannot be trusted to match ours. `codeToTag('en')` is `en-US`, but
 * a British machine may only have `en-GB` — refusing to read the letter because
 * someone's voice is the wrong flavour of English would be absurd. Android has
 * also shipped tags with an underscore.
 */
const primarySubtag = (tag: string) => tag.toLowerCase().replaceAll('_', '-').split('-')[0]

/**
 * Every voice that could read this letter, best first.
 *
 * Exported and pure so the ordering can be checked without a speech engine,
 * which is the same reason `use-typewriter` exports its schedule.
 *
 * `voiceURI` takes an array and walks it until one resolves, so the whole
 * preference order is handed over rather than decided here:
 *   1. an exact tag match, so `en-US` wins on a machine that has both;
 *   2. a local voice, which needs no network — nothing about this letter should
 *      leave the device, which matters more here than it usually would;
 *   3. whatever is left.
 */
export function pickVoices(voices: readonly SpeechSynthesisVoice[], tag: string): string[] {
  const wanted = primarySubtag(tag)
  return voices
    .filter((voice) => primarySubtag(voice.lang) === wanted)
    .sort(
      (a, b) =>
        Number(b.lang === tag) - Number(a.lang === tag) ||
        Number(b.localService) - Number(a.localService),
    )
    .map((voice) => voice.voiceURI)
}

/**
 * Reading the letter out loud, where that is a real offer rather than a pretend
 * one.
 *
 * The Web Speech API only has the voices the device happens to ship, and Lao is
 * not among them on macOS, iOS, Windows, Android or Chrome. Asked to speak Lao
 * without a Lao voice, a browser either stays silent or hands the text to a
 * Latin voice, which pronounces it as noise. Both are worse than not offering:
 * a machine mispronouncing a love letter is not a degraded feature, it is an
 * insult. So `available` gates the control out of existence rather than
 * disabling it — a dead button on somebody's present reads as the present being
 * broken, and `disabled` also drops it out of the tab order, so whatever
 * explanation it carried would be unreachable by the people most likely to need
 * it. The page simply does not offer what it cannot do.
 *
 * It reads the device's voice list rather than a hardcoded allowlist, so the day
 * a Lao voice does ship the control appears on its own, already translated.
 *
 * The tag comes from `config/languages.ts`, the one place that knows `lo` means
 * `lo-LA`; a second mapping here would be a second thing to keep in step.
 *
 * `voices` is empty on the first render always — the list is populated in an
 * effect — so `available` is false for a beat after the letter opens. That is
 * "not known yet", not "no voice", which is why the control fades in rather
 * than appearing instantly.
 */
export interface LetterSpeech {
  /**
   * Renders the letter's real copy and marks each phrase as it is read.
   *
   * Typed to the props this page actually passes rather than to the library's
   * own `DivProps`, which is not exported — an inferred return type here cannot
   * be named without reaching into node_modules, and TypeScript says so.
   */
  Text: ComponentType<{ className?: string; style?: CSSProperties }>
  start: () => void
  stop: () => void
  speaking: boolean
  /** False when the device has no voice for this language. */
  available: boolean
}

export function useLetterSpeech(text: string, locale: string): LetterSpeech {
  const { voices } = useVoices()
  const [failed, setFailed] = useState(false)

  const tag = codeToTag(locale)
  const voiceURI = useMemo(() => pickVoices(voices, tag), [voices, tag])

  const { Text, speechStatus, start, stop } = useSpeech({
    text,
    // The text is a string derived by useMemo, so referential identity is value
    // identity and the utterance is rebuilt on exactly one event: a language
    // change — which is when the typewriter restarts too.
    stableText: true,
    lang: tag,
    voiceURI,
    // A shade under natural pace. This was meant to be read slowly.
    rate: 0.92,
    highlightText: true,
    // Lao is written without spaces between words, so a word boundary — if the
    // engine emits one at all — lands on a whole phrase and the mark jumps in
    // blocks. A sentence is the honest unit there. Mostly insurance, since the
    // control is hidden in Lao today, but it costs one ternary and means the
    // feature is correct rather than merely absent on a device that has a voice.
    highlightMode: primarySubtag(tag) === 'lo' ? 'sentence' : 'word',
    highlightProps: { className: 'letter-mark' },
    // If the engine fails at the moment of speaking, the control withdraws
    // rather than sitting there having done nothing.
    onError: () => setFailed(true),
  })

  // Speech belongs to the browser, not to React, and outlives the component
  // that started it. The library stops on unmount, but the modal's exit holds
  // this subtree for another 240ms — long enough to hear a word of a letter
  // that has visibly been put away.
  const stopRef = useRef(stop)
  useEffect(() => {
    stopRef.current = stop
  }, [stop])
  useEffect(() => () => stopRef.current(), [])

  return {
    Text,
    start,
    stop,
    speaking: speechStatus === 'started',
    available: !failed && voiceURI.length > 0,
  }
}
