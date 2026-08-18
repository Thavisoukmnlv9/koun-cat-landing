import { motion } from 'motion/react'
import { useEffect, useId, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/modal'
import { SPRING_LIFT, SPRING_SETTLE } from '@/lib/motion/springs'

import { ALBUM_PLATES } from '../data/album'

import { Picture } from './picture'

interface PlateLightboxProps {
  /** Index into ALBUM_PLATES, or null when nothing is held up. */
  index: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

/**
 * One plate, lifted off the contact strip and held up to the light.
 *
 * The photograph does not fade in — it is the same element as the thumbnail
 * that was pressed, and `layoutId` walks it from there to here. That is the
 * whole reason this is a shared layout animation rather than a dissolve: it
 * answers "which one did I just tap" without the reader having to remember.
 * Paging inside the lightbox works the same way, so the next plate comes up off
 * the strip rather than appearing where the last one was.
 *
 * `borderRadius` and the shadow are set through `style` rather than a class
 * because Motion can only undo the distortion a layout `scale()` does to them
 * if it is the one writing them.
 *
 * Arrow keys page it, matching the album itself — the two are the same six
 * photographs and it would be strange if they took different keys.
 */
export function PlateLightbox({ index, onClose, onSelect }: PlateLightboxProps) {
  const { t } = useTranslation()
  const titleId = useId()

  const open = index !== null
  const plate = open ? ALBUM_PLATES[index] : null

  // Paging is bound on the document rather than the panel so it works wherever
  // focus has landed inside the dialog — on the close button, on a pager, or on
  // the panel itself. The Modal already owns Escape.
  useEffect(() => {
    if (index === null) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const delta = event.key === 'ArrowRight' ? 1 : -1
      onSelect((index + delta + ALBUM_PLATES.length) % ALBUM_PLATES.length)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, onSelect])

  const step = (delta: number) => {
    if (index === null) return
    onSelect((index + delta + ALBUM_PLATES.length) % ALBUM_PLATES.length)
  }

  // Swallow arrow keys that reach a button, so the document handler above is
  // the only thing that pages and a focused pager does not double-step.
  const swallowArrows = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="max-h-[88dvh] w-[min(94vw,880px)] overflow-y-auto"
    >
      {plate && index !== null && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SETTLE}
          style={{ borderRadius: 2 }}
          className="bg-paper-card shadow-board grid gap-5 p-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-7 sm:p-6"
        >
          <motion.div
            key={plate.id}
            layoutId={`plate-${plate.id}`}
            transition={SPRING_LIFT}
            style={{ borderRadius: 2 }}
            className="aspect-photo bg-photo-bed overflow-hidden"
          >
            <Picture
              name={`journey/${plate.image}`}
              alt={t(plate.keys.title)}
              className="size-full object-cover"
            />
          </motion.div>

          <div className="flex min-w-0 flex-col justify-center gap-3">
            <p className="font-label text-label-sm tracking-label text-muted-label uppercase">
              {t(plate.keys.label)}
            </p>
            <h3 id={titleId} className="font-hand text-plate text-ink-strong font-semibold">
              {t(plate.keys.title)}
            </h3>
            <p className="text-plate-body text-ink text-pretty">{t(plate.keys.caption)}</p>
            <p className="font-label text-label-sm tracking-label text-muted-label uppercase">
              {t(plate.keys.footer)}
            </p>

            <div className="border-rule mt-2 flex items-center justify-between gap-3 border-t border-dashed pt-3.5">
              <button
                type="button"
                onClick={() => step(-1)}
                onKeyDown={swallowArrows}
                aria-label={t('a11y.prevPlate')}
                className="font-label text-label-sm tracking-label text-muted-label hover:text-ink active:text-ink border-rule cursor-pointer border px-3 py-3 uppercase"
              >
                {t('album.index.prev')}
              </button>

              {/* Announced, unlike the reel's clock: paging a lightbox is
                  otherwise completely silent, which is the same reason the
                  album's own page count is a live region. */}
              <span
                aria-live="polite"
                className="font-label text-label-sm tracking-count text-muted-label uppercase tabular-nums"
              >
                {t('a11y.platePosition', { current: index + 1, total: ALBUM_PLATES.length })}
              </span>

              <button
                type="button"
                onClick={() => step(1)}
                onKeyDown={swallowArrows}
                aria-label={t('a11y.nextPlate')}
                className="font-label text-label-sm tracking-label text-muted-label hover:text-ink active:text-ink border-rule cursor-pointer border px-3 py-3 uppercase"
              >
                {t('album.index.next')}
              </button>
            </div>

            {/* Quiet, deliberately. globals.css rations the burnt red to five
                things and a full-width red bar would be a sixth — and closing a
                lightbox is not the point of opening one. Escape and the scrim
                do the same job; this exists so there is something visible and
                labelled to press. */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t('a11y.closePlate')}
              className="font-label text-label-sm tracking-label text-ink hover:border-ink/45 active:border-ink/45 border-ink/25 mt-1 cursor-pointer border px-4 py-3.5 uppercase"
            >
              {t('album.index.close')}
            </button>
          </div>
        </motion.div>
      )}
    </Modal>
  )
}
