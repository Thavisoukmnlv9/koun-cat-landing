import { motion } from 'motion/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/modal'
import { Picture } from '@/features/journey/components/picture'
import { SPRING_LIFT } from '@/lib/motion/springs'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, yearOf, type Memory } from '../../data/memories'

/**
 * A star, opened.
 *
 * The catalogue line under the photograph is derived rather than written: the
 * year comes out of the memory's own date and the magnitude out of its place in
 * the sky, so "★ HD-2022 · mag 1.1" costs no copy and cannot drift when the
 * archive changes. The prototype hardcoded all six.
 *
 * `Modal` supplies the portal, the focus trap, the scroll lock and Escape.
 */
export function StarCard({
  memory,
  index,
  hasUnlit,
  onNext,
  onClose,
}: {
  memory: Memory | null
  index: number
  /** Whether "light the next star" still has anywhere to go. */
  hasUnlit: boolean
  onNext: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const titleId = useId()

  const title = memory ? t(memory.keys.title) : ''

  return (
    <Modal
      open={memory !== null}
      onClose={onClose}
      labelledBy={titleId}
      className="w-full max-w-[400px]"
    >
      {memory && (
        <motion.div
          initial={{ y: 16, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={SPRING_LIFT}
          className="relative overflow-hidden rounded-[14px] border border-[var(--d-gold)]/35 bg-[linear-gradient(160deg,rgb(30_26_58_/_0.96),rgb(16_20_44_/_0.98))] shadow-[0_30px_80px_rgb(0_0_0_/_0.6)]"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-black">
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
              <Picture
                name={`journey/${memory.image}`}
                alt={title}
                className="size-full object-cover"
              />
            )}

            <MediaChip
              kind={memory.kind}
              className="d-label absolute top-3 left-3 z-[2] rounded-full border border-[var(--d-gold)]/40 bg-[rgb(6_8_20_/_0.7)] px-2 py-[3px] text-[9px] tracking-[0.1em] text-[var(--d-gold)] uppercase"
            />

            {/* The photograph fades into the card rather than butting against
                it, which is what lets the title sit over its lower edge. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(16_20_44_/_0.95))]"
            />
          </div>

          <div className="relative z-[2] -mt-7 px-5.5 pb-6">
            <p className="d-label text-[10px] tracking-[0.16em] text-[var(--d-silver)]">
              {td('constellation.catalogue', {
                year: yearOf(t(memory.keys.date)),
                mag: `1.${index}`,
              })}
            </p>
            <h2
              id={titleId}
              className="d-display mt-1 text-[30px] leading-tight font-semibold text-[var(--d-star)] italic"
            >
              {title}
            </h2>
            <p className="d-body mt-2 text-[16px] leading-relaxed text-[#d7d3ea]">
              {t(memory.keys.back)}
            </p>

            {memory.kind === 'voice' && (
              <AudioNote
                label={td('constellation.ourSong')}
                className="mt-4 rounded-3xl border border-[var(--d-violet)]/30 bg-[var(--d-violet)]/10 px-2 py-1.5 text-[var(--d-silver)]"
                barClassName="bg-white/15"
              />
            )}

            {hasUnlit && (
              <button
                type="button"
                onClick={onNext}
                className="d-label mt-4 min-h-11 w-full rounded-lg border border-[var(--d-gold)]/40 p-3 text-[11px] tracking-[0.14em] text-[var(--d-gold)] transition-colors hover:bg-[var(--d-gold)]/10"
              >
                {td('constellation.nextStar')}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-[5] grid size-11 place-items-center rounded-full border border-[var(--d-gold)]/40 bg-[rgb(6_8_20_/_0.6)] text-[19px] text-[var(--d-gold)]"
          >
            <span aria-hidden>✕</span>
            <span className="sr-only">{td('a11y.closeFrame')}</span>
          </button>
        </motion.div>
      )}
    </Modal>
  )
}
