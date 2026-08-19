import { motion } from 'motion/react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'
import { FLAP_FALL, SEAL_BREAK } from '@/lib/motion/springs'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/**
 * One sealed envelope and the letter inside it.
 *
 * The prototype coupled the two with an adjacent-sibling selector —
 * `.env.open + .letter { max-height: 1200px }` — which is elegant in a static
 * document and unusable here: it puts the open state on one element and reads
 * it from another, so React would need the two to be siblings forever and the
 * height would be a guess (1200px) that clips the moment a letter runs long.
 * Both problems go away by lifting `open` into this component and animating
 * `height` to `auto`, which Motion measures for real.
 *
 * `FLAP_FALL` and `SEAL_BREAK` come from journey's springs file, where they were
 * written for this exact gesture: the seal is the one tween in that file because
 * wax does not bounce, and the flap is a tween because opening is a chain — the
 * paper cannot start leaving until the flap is out of its way.
 */
export function SealedLetter({ memory }: { memory: Memory }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const [open, setOpen] = useState(false)
  const letterId = useId()

  const place = t(memory.keys.place)

  return (
    <article className="perspective-[1400px]">
      <div className="relative">
        {/* ── The envelope ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setOpen((was) => !was)}
          aria-expanded={open}
          aria-controls={letterId}
          aria-label={td('a11y.openLetter', { place })}
          className="d-env relative block w-full overflow-hidden rounded-[6px] px-5 pt-5 pb-6 text-left shadow-[0_12px_28px_rgb(88_51_73_/_0.2)]"
        >
          {/* The folded pocket seams. */}
          <span aria-hidden className="d-env-seam absolute inset-0" />

          <span className="d-body relative block text-[10px] font-bold tracking-[0.16em] text-[var(--d-plum)]/60 uppercase">
            {t(memory.keys.date)}
          </span>

          {/* The chip sits on its own row. In the prototype it was absolutely
              positioned across the middle of the envelope and landed on top of
              the addressee's name, leaving both unreadable. */}
          <span className="relative mt-3 flex items-start justify-between gap-3">
            <MediaChip
              kind={memory.kind}
              variant="enclosed"
              className="d-body rounded-full bg-[var(--d-plum)] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[var(--d-cream)] uppercase"
            />
            <span
              aria-hidden
              className="h-[46px] w-[38px] shrink-0 rotate-6 rounded-[2px] border border-dashed border-[var(--d-plum)]/35 bg-[var(--d-cream)]"
            />
          </span>

          <span className="relative mt-6 block text-center">
            <span className="d-body block text-[10px] font-bold tracking-[0.2em] text-[var(--d-plum)]/60 uppercase">
              {td('letters.addrTo')}
            </span>
            <span className="d-script mt-0.5 block text-[34px] leading-none text-[var(--d-plum)]">
              {td('letters.addrName')}
            </span>
            <span aria-hidden className="mx-auto mt-2 block h-px w-1/2 bg-[var(--d-plum)]/25" />
          </span>

          <span className="d-display relative mt-5 block text-center text-[15px] text-[var(--d-plum)]/70 italic">
            {td('letters.tapCue')}
          </span>

          {/* The flap. `initial={false}` so a letter that mounts closed does not
              animate shut on arrival. */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ rotateX: open ? 178 : 0 }}
            transition={FLAP_FALL}
            style={{ transformOrigin: 'top center' }}
            className="d-env-flap absolute inset-x-0 top-0 h-[54%]"
          />

          <motion.span
            aria-hidden
            initial={false}
            animate={
              open ? { opacity: 0, scale: 0.4, rotate: 30 } : { opacity: 1, scale: 1, rotate: 0 }
            }
            transition={SEAL_BREAK}
            className="d-seal absolute top-[42%] left-1/2 grid size-[62px] -translate-x-1/2 place-items-center rounded-full"
          >
            <span className="d-script text-[24px] text-[#f7dbe2]">{td('letters.seal')}</span>
          </motion.span>
        </button>

        {/* ── The letter ────────────────────────────────────────────────── */}
        <motion.div
          id={letterId}
          initial={false}
          animate={{ height: open ? 'auto' : 0 }}
          transition={{ duration: 0.6, ease: [0.5, 0.02, 0.2, 1] }}
          className="overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : -14 }}
            transition={{ duration: 0.45, delay: open ? 0.2 : 0 }}
            className="mt-3 rounded-[4px] bg-[var(--d-cream)] px-6 pt-7 pb-6 shadow-[0_10px_26px_rgb(88_51_73_/_0.16)]"
          >
            <span
              aria-hidden
              className="mb-5 block h-px border-t border-dashed border-[var(--d-gold)]/55"
            />

            <p className="d-script text-[30px] leading-none text-[var(--d-plum)]">
              {td(memory.flavour.salut)}
            </p>

            <div className="mt-4 overflow-hidden rounded-[2px] border-[6px] border-white bg-[var(--color-photo-bed)] shadow-sm">
              {memory.kind === 'film' ? (
                <video
                  src={FILM_SRC}
                  poster={`/images/journey/${memory.image}.jpg`}
                  controls
                  playsInline
                  className="aspect-[16/11] w-full object-cover"
                />
              ) : (
                <Picture
                  name={`journey/${memory.image}`}
                  alt={place}
                  className="aspect-[16/11] w-full object-cover"
                />
              )}
            </div>

            <p className="d-display mt-5 text-[17px] leading-relaxed text-[var(--d-plum-soft)]">
              <em className="text-[var(--d-mauve)]">{place} — </em>
              {t(memory.keys.back)}
            </p>

            {memory.kind === 'voice' && (
              <AudioNote
                label={t('sound.title')}
                className="mt-5 text-[var(--d-plum)]"
                barClassName="bg-[var(--d-plum)]/15"
              />
            )}

            <p className="d-display mt-6 text-[16px] text-[var(--d-plum-soft)] italic">
              {td(memory.flavour.sign)}
            </p>
            <p className="d-script text-[26px] leading-tight text-[var(--d-plum)]">
              {td(memory.flavour.who)}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </article>
  )
}
