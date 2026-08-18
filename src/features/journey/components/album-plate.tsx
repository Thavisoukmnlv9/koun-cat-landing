import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { AlbumPlate as AlbumPlateRecord } from '../data/album'

import { Picture } from './picture'

/**
 * One opened spread: what I remember on the left, the photograph on the right.
 *
 * The left leaf is duller than the right and carries an inset shadow on its
 * inner edge, the right one on the opposite edge — together they read as a book
 * bent open in the middle rather than two rectangles side by side.
 *
 * Only the right leaf turns, which is why the animation class arrives as a prop
 * from the book rather than being decided here.
 */
export function AlbumPlate({
  plate,
  leafClassName,
}: {
  plate: AlbumPlateRecord
  leafClassName?: string
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="leaf-left shadow-leaf-left absolute top-2 bottom-2 left-2 flex w-[calc(50%-12px)] flex-col justify-center gap-3 p-[clamp(18px,2.8vw,34px)]">
        <p className="font-label text-label-sm tracking-label text-muted-label whitespace-nowrap uppercase">
          {t(plate.keys.label)}
        </p>
        <h3 className="font-hand text-plate text-ink-strong font-semibold">
          {t(plate.keys.title)}
        </h3>
        <p className="text-plate-body text-ink text-pretty">{t(plate.keys.caption)}</p>
      </div>

      <div
        className={cn(
          'leaf-right shadow-leaf-right absolute top-2 right-2 bottom-2 flex w-[calc(50%-12px)] origin-left flex-col gap-2.5 p-[clamp(14px,2.1vw,24px)]',
          leafClassName,
        )}
      >
        <div className="flex min-h-0 flex-1">
          <Picture
            name={`journey/${plate.image}`}
            alt={t(plate.keys.title)}
            className="bg-photo-bed size-full object-cover"
          />
        </div>
        <p className="font-label text-label-sm tracking-label text-muted-label whitespace-nowrap uppercase">
          {t(plate.keys.footer)}
        </p>
      </div>
    </>
  )
}
