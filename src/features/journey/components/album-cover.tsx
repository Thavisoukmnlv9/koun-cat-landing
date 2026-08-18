import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

/**
 * Spread 0: the endpaper on the left, and a printed board on the right.
 *
 * Different markup from a plate, not a plate with different content — which is
 * why the cover is not an entry in ALBUM_PLATES. The right leaf is the only
 * place on the page where the accent covers a whole surface rather than a few
 * words, and it works because it is a closed cover: you see it once, and every
 * leaf after it is paper again.
 *
 * Below 640px the endpaper steps aside and the cover takes the whole board, for
 * the reason set out in `AlbumPlate`. Its note reappears on the slip below the
 * book.
 */
export function AlbumCover({ leafClassName }: { leafClassName?: string }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="leaf-left shadow-leaf-left absolute top-2 bottom-2 left-2 hidden w-[calc(50%-12px)] flex-col justify-center gap-3 p-[clamp(18px,2.8vw,34px)] sm:flex">
        <p className="font-label text-label-sm tracking-label text-muted-label whitespace-nowrap uppercase">
          {t('album.endpaper.label')}
        </p>
        <p className="font-hand text-endpaper text-ink-faint text-pretty">
          {t('album.endpaper.note')}
        </p>
      </div>

      <div
        className={cn(
          'book-cover shadow-leaf-right absolute inset-2 flex origin-left flex-col justify-between p-[clamp(20px,3vw,34px)] sm:left-auto sm:w-[calc(50%-12px)]',
          leafClassName,
        )}
      >
        <p className="font-label text-label-sm tracking-edition text-paper-card/80 whitespace-nowrap uppercase">
          {t('album.cover.edition')}
        </p>

        <div className="flex flex-col gap-2">
          <p className="font-hand text-cover text-paper-card">{t('album.cover.title')}</p>
          <p className="font-label text-label-sm tracking-count text-paper-card/75 uppercase">
            {t('album.cover.hint')}
          </p>
        </div>
      </div>
    </>
  )
}
