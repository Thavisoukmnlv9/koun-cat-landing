import { useTranslation } from 'react-i18next'

import { ALBUM_PLATES } from '../data/album'

/**
 * What the album's left leaf says, on a screen too narrow to hold a spread.
 *
 * Below 640px the book shows one leaf — the photograph — and this is where the
 * words that were on the facing page go: a slip of paper under the book rather
 * than a column squeezed in beside it. It reads the same i18n keys the leaf
 * does, so there is one copy of every sentence and nothing to keep in step.
 *
 * `aria-hidden` is wrong here and `sm:hidden` is enough. The leaf it stands in
 * for is `display: none` at this width, so these words are the only ones in the
 * accessibility tree; above it the leaf is back and this slip is gone. Exactly
 * one of the two is ever present, which is the whole reason this is a class
 * rather than a `useMediaQuery` — a hook would have to guess before it had a
 * viewport to measure, and would guess wrong on the first paint.
 */
export function AlbumLeafNote({ page }: { page: number }) {
  const { t } = useTranslation()
  const plate = page === 0 ? undefined : ALBUM_PLATES[page - 1]

  return (
    <div className="leaf-left shadow-leaf-left flex w-[min(94vw,900px)] flex-col gap-2 p-[clamp(16px,5vw,22px)] sm:hidden">
      {plate ? (
        // The leaf's own label is dropped here and only here. It reads "plate
        // one — keep childlike", which is the board's footer and this slip's
        // title with a dash between them; on a spread those three sit far
        // enough apart to be a heading, a caption and a plate number, but
        // stacked down a phone they are the same words three times.
        <>
          <h3 className="font-hand text-plate text-ink-strong font-semibold">
            {t(plate.keys.title)}
          </h3>
          <p className="text-plate-body text-ink text-pretty">{t(plate.keys.caption)}</p>
        </>
      ) : (
        <>
          <p className="font-label text-label-sm tracking-label text-muted-label uppercase">
            {t('album.endpaper.label')}
          </p>
          <p className="font-hand text-endpaper text-ink-faint text-pretty">
            {t('album.endpaper.note')}
          </p>
        </>
      )}
    </div>
  )
}
