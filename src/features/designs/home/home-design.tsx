import { useTranslation } from 'react-i18next'

import { SpecimenTile } from './components/specimen-tile'
import { SPECIMENS, SPECIMEN_IDS } from './data/specimens'

/**
 * The way in: a specimen sheet of every way this archive can be read.
 *
 * The hub the prototypes shipped with (`design/index.html`) listed the ten as
 * rows of text over a strip of five colour chips. This is the same job done as a
 * specimen sheet instead — each design gets a tile painted in its own ground,
 * set in its own faces, showing one of the photographs mounted the way that
 * design mounts photographs. A tile is a miniature of the thing behind it, so
 * you can tell the letters from the exhibition before you have read either name.
 *
 * The ground is paper, close to the shell's own `--color-paper`. That is not
 * timidity: the tab bar above is `bg-paper/85` and sticky, so a dark home would
 * meet it in a hard seam and read as a twelfth design. On paper the page reads
 * as the site's cover, which is what it is.
 *
 * Nothing here waits on an observer to become visible except the tiles. This is
 * the first page anyone sees, and an `IntersectionObserver` does not deliver
 * while the document is hidden — a hero that fades in is a hero that is blank in
 * a backgrounded tab.
 */
export function HomeDesign() {
  const { t } = useTranslation('designs')

  return (
    <div className="d-home d-body min-h-screen bg-[var(--d-paper)] pb-16 text-[var(--d-ink)]">
      <header className="mx-auto max-w-[560px] px-5 pt-10 text-center sm:pt-14">
        <p className="d-label text-[10px] tracking-[0.34em] text-[var(--d-muted)] uppercase">
          {t('home.eyebrow')}
        </p>
        <h1 className="d-display mt-3 text-[clamp(42px,13vw,66px)] leading-[0.95] text-[var(--d-ink-strong)] italic">
          {t('home.title')}
        </h1>
        <p className="d-script mt-1 text-[clamp(24px,7vw,32px)] leading-tight text-[var(--d-accent)]">
          {t('home.script')}
        </p>

        {/* The prototype hub's flourish, kept. It is the only ornament on the
            page and it earns its place by separating two voices of type. */}
        <div
          aria-hidden
          className="mt-4 flex items-center justify-center gap-3 text-[var(--d-accent)]"
        >
          <span className="h-px w-14 bg-[linear-gradient(90deg,transparent,currentColor)]" />
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
            <path d="M12 21s-7-4.5-9.5-9C.8 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.5 0 5.2 3.5 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
          </svg>
          <span className="h-px w-14 bg-[linear-gradient(270deg,transparent,currentColor)]" />
        </div>

        <p className="d-body mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[var(--d-ink)]/80 italic">
          {t('home.lede')}
        </p>
      </header>

      {/* Every palette on the page, end to end — fifty-five stops in the order
          the wall runs. An index of the index, and the one place you can see all
          eleven designs at once. */}
      <div
        aria-hidden
        className="mx-auto mt-8 flex h-[7px] max-w-[1040px] overflow-hidden rounded-full px-3 sm:px-5"
      >
        {/* Ringed, because six of the fifty-five stops are within a shade of
            the paper they sit on — without an edge the bar reads as four bars
            with gaps torn in it rather than as one continuous rule. */}
        <span className="flex flex-1 overflow-hidden rounded-full ring-1 ring-[var(--d-rule)]">
          {SPECIMEN_IDS.flatMap((id) =>
            SPECIMENS[id].swatch.map((stop, i) => (
              <i key={`${id}-${i}`} style={{ background: stop }} className="flex-1" />
            )),
          )}
        </span>
      </div>

      {/* A column flow rather than a grid, so the tiles pack against each other
          at whatever height their plate came out — which is what makes eleven
          different aspect ratios read as a wall instead of a ragged table. The
          wall design next door lays its polaroids out the same way. */}
      <ul className="mx-auto mt-7 max-w-[1040px] columns-2 gap-3 px-3 sm:gap-4 sm:px-5 lg:columns-3">
        {SPECIMEN_IDS.map((id) => (
          <SpecimenTile key={id} id={id} />
        ))}
      </ul>

      <footer className="mx-auto mt-10 max-w-[560px] px-5 text-center">
        <p className="d-body mx-auto max-w-[38ch] rounded-[4px] border border-dashed border-[var(--d-rule)] px-4 py-3.5 text-[13.5px] leading-relaxed text-[var(--d-ink)]/75 italic">
          {t('home.note')}
        </p>
        <p className="d-script mt-7 text-[30px] text-[var(--d-accent)]">{t('home.fin')}</p>
      </footer>
    </div>
  )
}
