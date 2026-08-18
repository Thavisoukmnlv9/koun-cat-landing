import { describe, expect, it } from 'vitest'

import { pickVoices } from './use-letter-speech'

/**
 * Voice selection is the whole of the read-aloud feature's judgement, and none
 * of it needs a speech engine — so it is tested directly, the way
 * `use-media-transport` tests its arithmetic without a media element.
 *
 * The case that matters most is the empty one. Returning nothing is what hides
 * the control, and hiding the control is the entire Lao story.
 */
const voice = (lang: string, localService = true, name = lang) =>
  ({
    lang,
    voiceURI: `uri-${name}`,
    name,
    localService,
    default: false,
  }) as SpeechSynthesisVoice

describe('pickVoices', () => {
  it('finds nothing for Lao on a device that only speaks English', () => {
    expect(pickVoices([voice('en-US'), voice('en-GB')], 'lo-LA')).toEqual([])
  })

  it('accepts a different flavour of the same language', () => {
    // A British machine has no en-US, and refusing to read the letter to
    // someone because their English is the wrong English would be absurd.
    expect(pickVoices([voice('en-GB')], 'en-US')).toEqual(['uri-en-GB'])
  })

  it('puts an exact tag match first', () => {
    const picked = pickVoices([voice('en-GB'), voice('en-US')], 'en-US')
    expect(picked[0]).toBe('uri-en-US')
  })

  it('prefers a local voice over one that needs the network', () => {
    const remote = voice('en-US', false, 'remote')
    const local = voice('en-US', true, 'local')
    expect(pickVoices([remote, local], 'en-US')[0]).toBe('uri-local')
  })

  it('matches a tag written with an underscore, as Android has shipped', () => {
    expect(pickVoices([voice('lo_LA')], 'lo-LA')).toEqual(['uri-lo_LA'])
  })

  it('returns nothing when the device offers no voices at all', () => {
    // Which is also jsdom, and some Linux Firefox builds. One branch, three
    // failure modes.
    expect(pickVoices([], 'en-US')).toEqual([])
  })
})
