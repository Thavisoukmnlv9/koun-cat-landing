import { useTranslation } from 'react-i18next'

import type { PagerLabels } from '../hooks/use-album-pager'

/**
 * Back / where you are / forward.
 *
 * The count is `aria-live` because it is the only thing that reports the turn:
 * without it a screen-reader user presses "turn the page" and hears nothing
 * change. The next button's own label shifts three times across the seven
 * spreads — "open the album", then "turn the page", then "last plate" — which
 * is the pager telling you how much book is left without a progress bar.
 */
export function AlbumControls({
  labels,
  onTurn,
}: {
  labels: PagerLabels
  onTurn: (delta: number) => void
}) {
  const { t } = useTranslation()
  const { count, nextKey, canPrev, canNext } = labels

  return (
    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-4">
      <button
        type="button"
        disabled={!canPrev}
        aria-label={t('a11y.prevPage')}
        onClick={() => onTurn(-1)}
        className="font-label text-label-sm tracking-label text-accent border-accent/45 cursor-pointer border px-4 py-3.5 whitespace-nowrap uppercase disabled:cursor-default disabled:opacity-35"
      >
        {t('album.controls.prev')}
      </button>

      <span
        aria-live="polite"
        className="font-label text-label-sm tracking-count text-muted-label whitespace-nowrap uppercase"
      >
        {'params' in count ? t(count.key, count.params) : t(count.key)}
      </span>

      <button
        type="button"
        disabled={!canNext}
        aria-label={t('a11y.nextPage')}
        onClick={() => onTurn(1)}
        className="font-label text-label-sm tracking-label text-paper-card bg-accent border-accent cursor-pointer border px-4 py-3.5 whitespace-nowrap uppercase disabled:cursor-default disabled:opacity-35"
      >
        {t(nextKey)}
      </button>
    </div>
  )
}
