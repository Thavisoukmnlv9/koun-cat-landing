import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAlbumPager } from '../hooks/use-album-pager'
import { useReveal } from '../hooks/use-reveal'

import { AlbumBook } from './album-book'
import { AlbumControls } from './album-controls'
import { AlbumLeafNote } from './album-leaf-note'
import { PlateIndex } from './plate-index'
import { PlateLightbox } from './plate-lightbox'

/**
 * The album.
 *
 * Paging state lives here rather than in the book because both the book (which
 * spread shows, which way it turns) and the controls (their labels and disabled
 * states) are reading the same number.
 *
 * Which plate is being held up lives here for the same reason, and separately:
 * the contact strip below the book raises it and the lightbox lowers it, and
 * neither can own a number the other has to read. It is deliberately not tied
 * to the book's own page — you can hold up plate six while the book is still
 * open at the cover, because the strip is a way of seeing all six at once
 * rather than a second set of controls for the book.
 */
export function AlbumSection() {
  const { t } = useTranslation()
  const { page, direction, turn, labels } = useAlbumPager()
  const { ref, revealed } = useReveal<HTMLElement>()
  const [heldUp, setHeldUp] = useState<number | null>(null)

  return (
    <section
      ref={ref}
      data-revealed={revealed || undefined}
      className="reveal max-w-page mx-auto flex flex-col items-center gap-[clamp(16px,4vw,22px)] px-[clamp(14px,4vw,24px)] pt-[clamp(40px,7vw,90px)] pb-[clamp(20px,4vw,50px)]"
    >
      <p className="font-label text-label tracking-section text-muted uppercase">
        {t('album.kicker')}
      </p>
      <h2 className="font-hand text-album text-ink-strong font-semibold">{t('album.title')}</h2>

      <AlbumBook page={page} direction={direction} onTurn={turn} />
      {/* The facing page's words, on a screen that cannot hold a spread. */}
      <AlbumLeafNote page={page} />
      <AlbumControls labels={labels} onTurn={turn} />

      <PlateIndex onOpen={setHeldUp} />
      <PlateLightbox index={heldUp} onClose={() => setHeldUp(null)} onSelect={setHeldUp} />
    </section>
  )
}
