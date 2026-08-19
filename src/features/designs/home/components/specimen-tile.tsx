import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { useReveal } from '@/features/journey/hooks/use-reveal'
import { cn } from '@/lib/utils'

import { SPECIMENS, type SpecimenId } from '../data/specimens'
import { SpecimenPlate } from './specimen-plate'
import { TileMark } from './tile-mark'

/**
 * One specimen: a design, shown in its own colours and its own type.
 *
 * Two things dress the tile and they come from different places. The design's
 * *typography* arrives through its scope class — `d-mixtape` and the rest are
 * already declared in `designs.css` and set nothing but custom properties and a
 * background, so borrowing one costs a single attribute and brings the
 * `"Noto Sans"` tail that keeps a Lao reader's glyphs from falling back. The
 * design's *colour roles* arrive as `--s-*` from the data, because a scope class
 * calls its ink `--d-cream` in one design and `--d-page` in the next, and a
 * shared component cannot know which.
 *
 * The tile's own `background` is a Tailwind utility, and utilities cascade after
 * `@layer components`, so it wins over the scope class's background without
 * `!important`.
 *
 * It is an `<a href="#filmstrip">` rather than a button. `useHashDesign` in
 * `designs-page.tsx` already listens for `hashchange`, so this needs no
 * JavaScript at all — and it gets middle-click, open-in-new-tab, copy-link and
 * keyboard activation for free. The one deliberate difference from the tab bar:
 * a tab *replaces* the history entry, so that flicking between eleven designs
 * does not bury the page you arrived on, while a tile *pushes* one — which is
 * what makes Back return you to this page, exactly as clicking into something
 * should.
 */
export function SpecimenTile({ id }: { id: SpecimenId }) {
  const { t } = useTranslation('designs')
  const { ref, revealed } = useReveal<HTMLLIElement>({ threshold: 0.1 })
  const specimen = SPECIMENS[id]

  // Eleven ids across three keys — small enough to build here rather than store
  // eleven `as const` triples in the data, which is what journey's postcards do
  // for a union six times this size.
  const name = t(`home.designs.${id}.name`)

  return (
    <li
      ref={ref}
      data-revealed={revealed || undefined}
      className="reveal mb-3 break-inside-avoid sm:mb-4"
      style={{ '--reveal-y': '18px' } as CSSProperties}
    >
      <a
        href={`#${id}`}
        aria-label={t('a11y.openDesign', { name })}
        className={cn(
          `d-${id}`,
          'group block overflow-hidden rounded-[4px] bg-[var(--s-ground)] p-2.5 text-[var(--s-ink)] shadow-[0_2px_10px_rgb(90_81_66_/_0.13)] ring-1 ring-[var(--s-accent)]/25 sm:p-3',
          'outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--s-accent)]',
          // The lift is the only movement, and it is entirely optional — under
          // reduced motion the ring still brightens, so hover and focus are
          // never invisible.
          'transition-[box-shadow,transform,--tw-ring-color] duration-300',
          'hover:ring-[var(--s-accent)]/70 focus-visible:ring-[var(--s-accent)]/70',
          'motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_12px_26px_rgb(90_81_66_/_0.26)]',
          'motion-safe:focus-visible:-translate-y-1',
        )}
        style={
          {
            '--s-ground': specimen.ground,
            '--s-ink': specimen.ink,
            '--s-accent': specimen.accent,
            '--s-muted': specimen.muted,
          } as CSSProperties
        }
      >
        <SpecimenPlate id={id} />

        <div className="mt-3 px-0.5">
          <div className="flex items-center gap-1.5 text-[var(--s-accent)]">
            <TileMark id={id} className="size-[15px] shrink-0" />
            {specimen.numeral ? (
              <span className="d-display text-[13px] leading-none italic">{specimen.numeral}</span>
            ) : (
              <span className="d-body text-[10px] leading-none tracking-[0.16em] uppercase">
                {t('home.featured')}
              </span>
            )}
          </div>

          {/* Set in the design's own voice — its display face, or its script
              face where that is the more telling one (Pinyon on the letters,
              Sacramento on the wall). Five of the eleven share Cormorant
              Garamond as a display face, so taking `--d-display` for all of them
              would have made a specimen sheet that shows one typeface. */}
          <h2
            className={cn(
              'mt-1.5 text-[clamp(19px,5.2vw,26px)] leading-[1.08] text-balance',
              specimen.voice === 'script' ? 'd-script' : 'd-display',
            )}
          >
            {name}
          </h2>

          {/* The two faces this design actually sets. On a 168px tile a long
              pair wraps to three lines, which is what a specimen sheet does —
              so it is set tight rather than shortened. */}
          <p className="d-body mt-1 text-[9px] leading-[1.55] tracking-[0.1em] text-[var(--s-muted)] uppercase">
            {specimen.faces[0]} · {specimen.faces[1]}
          </p>

          <p className="d-body mt-2 text-[12.5px] leading-[1.45] text-[var(--s-ink)]/85 sm:text-[13.5px]">
            {t(`home.designs.${id}.blurb`)}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-[5px] flex-1 overflow-hidden rounded-full ring-1 ring-[var(--s-ink)]/15"
            >
              {specimen.swatch.map((stop, i) => (
                <i key={i} style={{ background: stop }} className="flex-1" />
              ))}
            </span>
            <span
              aria-hidden
              className="d-body shrink-0 text-[9.5px] tracking-[0.18em] text-[var(--s-accent)] uppercase"
            >
              {t('home.open')}{' '}
              <span className="inline-block transition-transform duration-300 motion-safe:group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </a>
    </li>
  )
}
