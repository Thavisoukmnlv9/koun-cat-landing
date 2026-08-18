import { describe, expect, it } from 'vitest'

import { splitGraphemes, typingSchedule } from './use-typewriter'

/**
 * The rhythm is the hook, so it is tested directly rather than by watching an
 * animation run. Two things have to hold: the pauses land where a person would
 * pause, and Lao comes out as syllables rather than as a pile of marks.
 */
describe('splitGraphemes', () => {
  it('keeps Lao tone marks and vowels attached to their consonant', () => {
    // ເປີດ — five code points, three graphemes: ເ, ປີ, ດ. Split naively, the
    // vowel sign ີ would be typed on its own frame with nothing under it.
    const text = 'ເປີດ'
    const parts = splitGraphemes(text, 'lo')

    expect([...text]).toHaveLength(4)
    expect(parts.length).toBeLessThan([...text].length)
    expect(parts.join('')).toBe(text)
    // No fragment may be a lone combining mark.
    for (const part of parts) expect(/^[ະ-ຼ່-ໍ]/.test(part)).toBe(false)
  })

  it('round-trips Latin unchanged', () => {
    expect(splitGraphemes('Ten stops.', 'en').join('')).toBe('Ten stops.')
    expect(splitGraphemes('Ten stops.', 'en')).toHaveLength(10)
  })

  it('handles an empty line', () => {
    expect(splitGraphemes('', 'en')).toEqual([])
  })
})

describe('typingSchedule', () => {
  const delaysFor = (text: string) => typingSchedule(splitGraphemes(text, 'en'))

  it('is deterministic, so the line types the same way every time', () => {
    expect(delaysFor('Ten stops, so far.')).toEqual(delaysFor('Ten stops, so far.'))
  })

  it('holds longest after a full stop, and less after a comma', () => {
    const chars = splitGraphemes('a. b, c d', 'en')
    const delays = typingSchedule(chars)

    // The pause belongs to the character *after* the punctuation.
    const afterStop = delays[chars.indexOf('.') + 1]
    const afterComma = delays[chars.indexOf(',') + 1]
    const afterLetter = delays[chars.indexOf('c')]

    expect(afterStop).toBeGreaterThan(afterComma)
    expect(afterComma).toBeGreaterThan(afterLetter)
  })

  it('never schedules a keystroke so short it reads as a paste', () => {
    for (const delay of delaysFor('Ten stops, so far. Scroll slowly.')) {
      expect(delay).toBeGreaterThanOrEqual(16)
    }
  })

  it('gives one delay per grapheme', () => {
    const chars = splitGraphemes('ເປີດ', 'lo')
    expect(typingSchedule(chars)).toHaveLength(chars.length)
  })
})
