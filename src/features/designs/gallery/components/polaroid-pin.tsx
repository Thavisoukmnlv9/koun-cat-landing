import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import { MediaChip } from '../../components/media-chip'
import type { Memory } from '../../data/memories'

/**
 * Three rolls of washi, cycling down the wall.
 *
 * The prototype varied these with `nth-child(3n+1)`, `(3n+2)`, `(4n)` rules,
 * which works exactly until the list is filtered or reordered and every strip
 * silently changes colour. Index arithmetic gives the same repeating scatter and
 * survives React deciding to render six of eight.
 */
const TAPES = ['--d-tape-mint', '--d-tape-blush', '--d-tape-butter'] as const

export function PolaroidPin({
  memory,
  index,
  onLift,
}: {
  memory: Memory
  index: number
  onLift: () => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const title = t(memory.keys.title)

  return (
    <button
      type="button"
      onClick={onLift}
      aria-label={td('a11y.liftPhoto', { title })}
      // The lean is journey's authored `tilt`, the same number the timeline
      // hangs its postcards at. Hover straightens the photograph and lifts it a
      // few pixels, as though taking it off the wall to look closer.
      style={{ '--rot': `${memory.tilt}deg` } as React.CSSProperties}
      className="d-pola group mb-4 block w-full break-inside-avoid rounded-[2px] bg-[var(--d-cream)] px-2.5 pt-2.5 pb-11 text-left shadow-[0_8px_20px_rgb(51_48_43_/_0.16)]"
    >
      <span
        aria-hidden
        style={{ background: `var(${TAPES[index % TAPES.length]})` }}
        className="absolute top-[-9px] left-1/2 h-[22px] w-[38%] -translate-x-1/2 -rotate-2 opacity-90"
      />

      <span className="relative block aspect-square overflow-hidden bg-[var(--color-photo-bed)]">
        <Picture name={`journey/${memory.image}`} alt={title} className="size-full object-cover" />

        <MediaChip
          kind={memory.kind}
          iconOnly
          className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[var(--d-charcoal)]/70 text-[11px] text-white"
        />

        {/* The date is printed on the photograph, and a photograph is whatever
            it happens to be — these are outdoor daylight frames, so a white sky
            in the bottom corner left the caption at roughly 1.2:1 and nothing
            but a hairline `drop-shadow` between it and disappearing. A short
            gradient under the lower edge gives it a ground of its own that no
            photograph can take away, and it only darkens the last fifth of the
            frame, which is where a print's caption band sits anyway. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-[linear-gradient(to_top,rgb(20_18_16/0.62),transparent)]"
        />

        <span className="d-body absolute right-2 bottom-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
          {t(memory.keys.shortDate)}
        </span>
      </span>

      <span className="d-script absolute inset-x-2 bottom-1.5 block truncate text-center text-[22px] text-[var(--d-charcoal)]">
        {title}
      </span>
    </button>
  )
}
