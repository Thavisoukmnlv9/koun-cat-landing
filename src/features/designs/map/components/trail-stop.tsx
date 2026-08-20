import { motion } from 'motion/react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'
import { useReveal } from '@/features/journey/hooks/use-reveal'
import { cn } from '@/lib/utils'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/**
 * One stop on the trail: a marker the path passes through, and a card hanging
 * off it that opens to say more.
 *
 * The dot is what the trail is drawn between, so its node is handed up to the
 * measuring hook rather than kept here. Everything else is local.
 *
 * Arrival is journey's `useReveal`, which is the same one-way IntersectionObserver
 * the prototype wrote inline — with the difference that it never builds an
 * observer at all under reduced motion and starts revealed instead, so nothing
 * is left invisible waiting for a transition that will not run.
 */
export function TrailStop({
  memory,
  index,
  registerDot,
}: {
  memory: Memory
  index: number
  registerDot: (node: HTMLElement | null) => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const [open, setOpen] = useState(false)
  const detailId = useId()
  const reveal = useReveal<HTMLDivElement>()

  const place = t(memory.keys.place)
  const onRight = index % 2 === 1

  return (
    <div
      ref={reveal.ref}
      data-revealed={reveal.revealed || undefined}
      className={cn(
        'reveal relative flex w-[82%] flex-col',
        onRight ? 'items-end self-end' : 'items-start self-start',
      )}
    >
      <div className={cn('flex items-center gap-2', onRight && 'flex-row-reverse')}>
        <span
          ref={registerDot}
          aria-hidden
          className="block size-3.5 rounded-full border-2 border-[var(--d-parch)] bg-[var(--d-forest)] shadow"
        />
        <span className="d-label text-[10px] tracking-[0.2em] text-[var(--d-sepia)] uppercase">
          {td('map.stop', { n: memory.number })}
        </span>
      </div>

      <div className="mt-2 w-full overflow-hidden rounded-[3px] bg-[var(--d-card)] shadow-[0_8px_22px_rgb(51_41_27_/_0.14)]">
        <div className="relative aspect-[16/10] bg-[var(--color-photo-bed)]">
          {memory.kind === 'film' ? (
            <video
              src={FILM_SRC}
              poster={`/images/journey/${memory.image}.jpg`}
              controls
              playsInline
              className="size-full object-cover"
            />
          ) : (
            <Picture
              name={`journey/${memory.image}`}
              alt={place}
              className="size-full object-cover"
            />
          )}

          <MediaChip
            kind={memory.kind}
            className="d-label absolute top-2 left-2 rounded-[2px] bg-[var(--d-forest)]/85 px-2 py-1 text-[9px] tracking-[0.14em] text-[var(--d-parch)] uppercase"
          />
        </div>

        <div className={cn('p-4', onRight && 'text-right')}>
          <h3 className="d-display text-[24px] leading-tight text-[var(--d-forest)]">{place}</h3>
          <p className="d-label mt-0.5 text-[10px] tracking-[0.18em] text-[var(--d-sepia)] uppercase">
            {t(memory.keys.date)}
          </p>

          <p className="d-body mt-2.5 text-[16px] leading-relaxed text-[#4a3d29] italic">
            “{t(memory.keys.caption)}”
          </p>

          <p className="d-label mt-3 text-[11px] tracking-[0.1em] text-[var(--d-gold-ink)]">
            <span aria-hidden>◆ </span>
            {td(memory.flavour.dist)}
          </p>

          <button
            type="button"
            onClick={() => setOpen((was) => !was)}
            aria-expanded={open}
            aria-controls={detailId}
            // The only control on a stop, and it was 17px tall — a line of
            // 11px type with nothing around it. `min-h-11` gives it a thumb's
            // worth of box without moving the words: the margin above comes
            // down by the same amount the box grows.
            // It is inline-flex rather than flex so that the parent's
            // `text-right` still carries it to the correct edge on the stops
            // that hang on the right.
            className="d-label mt-1 inline-flex min-h-11 items-center text-[11px] tracking-[0.16em] text-[var(--d-sky)] uppercase"
          >
            {td(open ? 'map.close' : 'map.open')}
          </button>

          {/* Height to `auto` rather than the prototype's `max-height: 340px`,
              which silently clipped any note longer than it guessed. */}
          <motion.div
            id={detailId}
            initial={false}
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.42, ease: [0.2, 0.75, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="d-body pt-3 text-[15px] leading-relaxed text-[#4a3d29]">
              {t(memory.keys.back)}
            </p>

            {memory.kind === 'voice' && (
              <AudioNote
                label={t('sound.title')}
                className="mt-3 text-[var(--d-forest)]"
                barClassName="bg-[var(--d-forest)]/15"
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
