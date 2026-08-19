import { motion } from 'motion/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/modal'
import { Picture } from '@/features/journey/components/picture'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { SPRING_LIFT } from '@/lib/motion/springs'

import { AudioNote } from '../../components/audio-note'
import { FILM_SRC, type Memory } from '../../data/memories'

/** How long the print takes to come up. Long enough to watch, short enough to wait for. */
const DEVELOP = 1.6

/**
 * A photograph taken off the wall, developing.
 *
 * The gesture is the prototype's and it is a good one: the print arrives
 * face-down in sepia and darkness and resolves into colour over a second and a
 * half, the way a Polaroid does in your hand. Two things carry it — a dark
 * layer fading out, and a `filter` easing off the image underneath.
 *
 * Neither is a transform, which is the point worth writing down: under
 * `reducedMotion="user"` Motion drops transforms and leaves opacity and filter
 * alone, so a visitor who asked for less motion still sees the print develop
 * rather than a picture that never appears. What they lose is only the spring
 * the card arrives on.
 *
 * `SPRING_LIFT` is journey's, and its comment describes this exact gesture — "a
 * photograph lifted off the album and opened", underdamped so it overshoots by a
 * hair, because paper has mass.
 */
export function WallLightbox({ memory, onClose }: { memory: Memory | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const reduced = usePrefersReducedMotion()
  const titleId = useId()

  const title = memory ? t(memory.keys.title) : ''

  return (
    <Modal
      open={memory !== null}
      onClose={onClose}
      labelledBy={titleId}
      // The design's scope class has to be repeated here. `Modal` portals its
      // panel to <body>, which is outside the `.d-*` element that declares this
      // design's palette — so every `var(--d-…)` inside would resolve to
      // nothing and the card would inherit the page's colours instead. The
      // class travels with the content that needs it.
      className="d-gallery w-full max-w-[420px]"
    >
      {memory && (
        <motion.div
          initial={{ scale: 0.86, rotate: -3, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={SPRING_LIFT}
          className="relative rounded-[2px] bg-[var(--d-cream)] px-3 pt-3 pb-6 shadow-[0_30px_70px_rgb(0_0_0_/_0.4)]"
        >
          <span
            aria-hidden
            className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f4f1ea,#b23a48_60%)] shadow"
          />

          <div className="relative aspect-square overflow-hidden bg-[var(--color-photo-bed)]">
            {memory.kind === 'film' ? (
              <video
                src={FILM_SRC}
                poster={`/images/journey/${memory.image}.jpg`}
                controls
                autoPlay
                playsInline
                className="size-full object-cover"
              />
            ) : (
              <>
                <motion.div
                  initial={{ filter: 'sepia(0.5) brightness(0.7)' }}
                  animate={{ filter: 'sepia(0) brightness(1)' }}
                  transition={{ duration: reduced ? 0 : DEVELOP, delay: 0.1, ease: 'easeOut' }}
                  className="size-full"
                >
                  <Picture
                    name={`journey/${memory.image}`}
                    alt={title}
                    className="size-full object-cover"
                  />
                </motion.div>

                {/* The emulsion still coming up. Purely decorative, so it stays
                    out of the accessibility tree. */}
                <motion.div
                  aria-hidden
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : DEVELOP, delay: 0.1, ease: 'easeOut' }}
                  className="absolute inset-0 bg-[#26221b]"
                />
              </>
            )}
          </div>

          <p className="d-body mt-3 text-[10px] font-bold tracking-[0.14em] text-[var(--d-charcoal)]/55 uppercase">
            {t(memory.keys.date)}
          </p>
          <h2 id={titleId} className="d-script text-[30px] leading-tight text-[var(--d-charcoal)]">
            {title}
          </h2>
          <p className="d-body mt-1.5 text-[14px] leading-relaxed text-[var(--d-charcoal)]/80 italic">
            “{t(memory.keys.caption)}”
          </p>

          {memory.kind === 'voice' && (
            <AudioNote
              label={t('sound.title')}
              className="mt-4 text-[var(--d-charcoal)]"
              barClassName="bg-[var(--d-charcoal)]/15"
            />
          )}

          <button
            type="button"
            onClick={onClose}
            className="d-body absolute -top-3 -right-3 grid size-9 place-items-center rounded-full bg-[var(--d-charcoal)] text-white"
          >
            <span aria-hidden>✕</span>
            <span className="sr-only">{td('a11y.closeFrame')}</span>
          </button>
        </motion.div>
      )}
    </Modal>
  )
}
