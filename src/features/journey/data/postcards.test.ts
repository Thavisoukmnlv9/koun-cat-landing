import { describe, expect, it } from 'vitest'

import { en } from '../i18n/en'

import { ALBUM_PLATES } from './album'
import { HEADER_POLAROID, POSTCARDS } from './postcards'

/**
 * Guards the seam between the data records and the copy.
 *
 * The i18n parity test checks English against Lao; nothing checks English
 * against the records that point into it. A card whose id stops matching its
 * key subtree renders the raw key string — visible, but only to whoever happens
 * to scroll past it. These are the cheapest assertions in the suite.
 */
describe('postcards', () => {
  it('has ten cards, numbered 01 to 10 in page order', () => {
    expect(POSTCARDS).toHaveLength(10)
    expect(POSTCARDS.map((c) => c.number)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
    ])
  })

  it('has a copy subtree for every card', () => {
    for (const card of POSTCARDS) {
      const copy = en.cards[card.id]
      expect(copy, `cards.${card.id}`).toBeDefined()
      for (const field of ['date', 'place', 'title', 'caption', 'back', 'shortDate'] as const) {
        expect(copy[field], `cards.${card.id}.${field}`).toBeTruthy()
      }
    }
  })

  it('points every card at a distinct photograph', () => {
    const images = POSTCARDS.map((c) => c.image)
    expect(new Set(images).size).toBe(images.length)
  })

  it('leans every card, and never leaves one lying flat', () => {
    // A tilt of zero would read as printed rather than placed by hand.
    for (const card of POSTCARDS) {
      expect(card.tilt, card.id).not.toBe(0)
      expect(card.tapes.length, card.id).toBeGreaterThan(0)
    }
  })

  it('alternates sides down the spine', () => {
    expect(POSTCARDS.map((c) => c.align)).toEqual([
      'start',
      'end',
      'start',
      'end',
      'start',
      'end',
      'start',
      'end',
      'start',
      'end',
    ])
  })

  it('tapes the header polaroid up too', () => {
    expect(HEADER_POLAROID.image).toBe('n2')
    expect(HEADER_POLAROID.tape.anchor).toBe('center')
  })
})

describe('album plates', () => {
  it('has a copy subtree for every plate', () => {
    expect(ALBUM_PLATES).toHaveLength(6)
    for (const plate of ALBUM_PLATES) {
      const copy = en.album.plates[plate.id]
      expect(copy, `album.plates.${plate.id}`).toBeDefined()
      for (const field of ['label', 'title', 'caption', 'footer'] as const) {
        expect(copy[field], `album.plates.${plate.id}.${field}`).toBeTruthy()
      }
    }
  })

  it('uses photographs the timeline does not', () => {
    // The album is a second set of pictures, not a reprint of the first.
    const timeline = new Set(POSTCARDS.map((c) => c.image))
    for (const plate of ALBUM_PLATES) {
      expect(timeline.has(plate.image), plate.image).toBe(false)
    }
  })
})
