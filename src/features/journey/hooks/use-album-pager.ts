import { useCallback, useState } from 'react'

import { LAST_SPREAD, SPREAD_COUNT } from '../data/album'

/**
 * Paging state for the album.
 *
 * The decisions are a pure function and the hook is a thin shell around it,
 * following the precedent set by this project's earlier scroll-spy: that one
 * started as an effect full of DOM reads, could not be unit-tested, and quietly
 * got its boundary conditions wrong. Clamping at the covers and the label that
 * changes three times across seven spreads are exactly the kind of off-by-one
 * that deserves a test rather than a careful read.
 */

/** Clamp a page move to the covers. Returns the same page when it cannot move. */
export function nextPage(page: number, delta: number, last = LAST_SPREAD): number {
  return Math.min(last, Math.max(0, page + delta))
}

/**
 * The count readout, as a discriminated union rather than a key plus a maybe-
 * undefined params bag. i18next's typed `t()` wants the params to match the key
 * it was given, and this is the shape that lets a single `'params' in count`
 * check satisfy it at the call site without a cast.
 */
export type PagerCount =
  | { key: 'album.controls.countCover' }
  | { key: 'album.controls.countPlate'; params: { current: number; total: number } }

export interface PagerLabels {
  count: PagerCount
  /** i18n key for the next button, which reads differently at each end. */
  nextKey: 'album.controls.openAlbum' | 'album.controls.turnPage' | 'album.controls.lastPlate'
  canPrev: boolean
  canNext: boolean
}

export function pagerLabels(page: number, last = LAST_SPREAD): PagerLabels {
  return {
    count:
      page === 0
        ? { key: 'album.controls.countCover' }
        : { key: 'album.controls.countPlate', params: { current: page, total: last } },
    nextKey:
      page === 0
        ? 'album.controls.openAlbum'
        : page === last
          ? 'album.controls.lastPlate'
          : 'album.controls.turnPage',
    canPrev: page > 0,
    canNext: page < last,
  }
}

export interface AlbumPager {
  page: number
  /** +1 forward, -1 back, 0 on the first paint. Picks the turn animation. */
  direction: number
  turn: (delta: number) => void
  labels: PagerLabels
  last: number
  total: number
}

export function useAlbumPager(last = LAST_SPREAD): AlbumPager {
  const [{ page, direction }, setState] = useState({ page: 0, direction: 0 })

  const turn = useCallback(
    (delta: number) => {
      setState((current) => {
        const target = nextPage(current.page, delta, last)
        // A move that changes nothing must not re-key the leaf, or the page
        // would replay its turn animation every time you click a dead button.
        if (target === current.page) return current
        return { page: target, direction: Math.sign(delta) }
      })
    },
    [last],
  )

  return { page, direction, turn, labels: pagerLabels(page, last), last, total: SPREAD_COUNT }
}
