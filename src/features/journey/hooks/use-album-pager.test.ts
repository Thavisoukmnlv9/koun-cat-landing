import { describe, expect, it } from 'vitest'

import { LAST_SPREAD, SPREAD_COUNT } from '../data/album'

import { nextPage, pagerLabels } from './use-album-pager'

/**
 * The album's boundaries are where this is easy to get wrong: seven spreads but
 * six plates, a next button that reads three different ways, and two covers
 * that must refuse to turn further. All of it is a pure function precisely so
 * these cases can be asserted without a book on screen.
 */
describe('nextPage', () => {
  it('turns one spread at a time in both directions', () => {
    expect(nextPage(0, 1)).toBe(1)
    expect(nextPage(3, 1)).toBe(4)
    expect(nextPage(3, -1)).toBe(2)
  })

  it('clamps at the front cover', () => {
    expect(nextPage(0, -1)).toBe(0)
    expect(nextPage(0, -5)).toBe(0)
  })

  it('clamps at the last plate', () => {
    expect(nextPage(LAST_SPREAD, 1)).toBe(LAST_SPREAD)
    expect(nextPage(LAST_SPREAD, 5)).toBe(LAST_SPREAD)
  })

  it('returns the same page for a move that changes nothing', () => {
    // The hook leans on this to avoid replaying the turn animation when a
    // reader clicks a button that has nowhere left to go.
    expect(nextPage(2, 0)).toBe(2)
    expect(nextPage(0, -1)).toBe(0)
  })
})

describe('pagerLabels', () => {
  it('reads as a closed book on the cover', () => {
    const labels = pagerLabels(0)
    expect(labels.count).toEqual({ key: 'album.controls.countCover' })
    expect(labels.nextKey).toBe('album.controls.openAlbum')
    expect(labels.canPrev).toBe(false)
    expect(labels.canNext).toBe(true)
  })

  it('counts plates rather than spreads once open', () => {
    // Spread 3 is plate 3 of 6, not 3 of 7 — the cover is not a plate.
    expect(pagerLabels(3).count).toEqual({
      key: 'album.controls.countPlate',
      params: { current: 3, total: LAST_SPREAD },
    })
    expect(pagerLabels(3).nextKey).toBe('album.controls.turnPage')
  })

  it('announces the end at the last plate', () => {
    const labels = pagerLabels(LAST_SPREAD)
    expect(labels.count).toEqual({
      key: 'album.controls.countPlate',
      params: { current: LAST_SPREAD, total: LAST_SPREAD },
    })
    expect(labels.nextKey).toBe('album.controls.lastPlate')
    expect(labels.canNext).toBe(false)
    expect(labels.canPrev).toBe(true)
  })

  it('has one more spread than it has plates', () => {
    expect(SPREAD_COUNT).toBe(LAST_SPREAD + 1)
  })
})
