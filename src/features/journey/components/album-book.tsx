import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'

import { ALBUM_PLATES, SPREAD_COUNT } from '../data/album'

import { AlbumCover } from './album-cover'
import { AlbumPlate } from './album-plate'

/**
 * The book itself: a board, seven spreads, and a shadow down the crease.
 *
 * All seven spreads stay mounted and the inactive ones are `hidden`, which
 * keeps every already-loaded photograph loaded — paging back and forth does not
 * re-fetch anything. `display: none` also removes them from the accessibility
 * tree on its own, so no `aria-hidden` is needed alongside.
 *
 * That same `display: none` is what restarts the page-turn animation: an
 * element whose animation was cancelled by being undisplayed starts it over
 * when it is shown again. The original page forced this by clearing
 * `style.animation` and reading `offsetWidth` to flush a reflow — a trick that
 * also breaks under StrictMode's double effect invocation. Here the browser
 * does it, and the only state involved is which spread is visible.
 *
 * Clicking either half of the book pages it, as in the original. Those two
 * halves are real buttons rather than a coordinate check on a div, but they are
 * `aria-hidden` and unfocusable on purpose: they duplicate the labelled pager
 * directly below, and two invisible full-height tab stops over the photograph
 * would be worse than the div they replace. The keyboard path is the arrow keys
 * on the book itself, plus the pager.
 */
export function AlbumBook({
  page,
  direction,
  onTurn,
}: {
  page: number
  direction: number
  onTurn: (delta: number) => void
}) {
  const { t } = useTranslation()
  const reducedMotion = usePrefersReducedMotion()

  // No animation on the first paint (direction 0), and none at all when the
  // visitor has asked for less motion — the spread simply swaps.
  const turnClass =
    reducedMotion || direction === 0
      ? undefined
      : direction > 0
        ? 'animate-turn'
        : 'animate-turn-back'

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    // Otherwise the browser scrolls the page sideways as well as turning.
    event.preventDefault()
    onTurn(event.key === 'ArrowRight' ? 1 : -1)
  }

  return (
    <div
      role="group"
      aria-roledescription="album"
      aria-label={t('a11y.albumLabel')}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="book-board shadow-board aspect-book perspective-book relative mt-2.5 w-[min(94vw,900px)] cursor-pointer"
    >
      {Array.from({ length: SPREAD_COUNT }, (_, spread) => (
        <div key={spread} hidden={spread !== page} className="absolute inset-0">
          {spread === 0 ? (
            <AlbumCover leafClassName={turnClass} />
          ) : (
            <AlbumPlate plate={ALBUM_PLATES[spread - 1]} leafClassName={turnClass} />
          )}
        </div>
      ))}

      {/* The crease. Above both leaves, and eats no clicks. */}
      <div
        aria-hidden
        className="book-gutter pointer-events-none absolute top-2 bottom-2 left-1/2 z-40 -ml-[7px] w-3.5"
      />

      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => onTurn(-1)}
        className="absolute inset-y-0 left-0 z-50 w-1/2 cursor-pointer"
      />
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => onTurn(1)}
        className="absolute inset-y-0 right-0 z-50 w-1/2 cursor-pointer"
      />
    </div>
  )
}
