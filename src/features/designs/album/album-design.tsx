import { useTranslation } from 'react-i18next'

import { memoriesFor, yearOf } from '../data/memories'

import { AlbumLeaf, MemoryLeaf } from './components/album-leaf'
import { useLeafTurn } from './hooks/use-leaf-turn'

const COUNT = 6

/**
 * VII · The Album of Us — a leather book on a table, turned one leaf at a time.
 *
 * The leaves are cover + one per memory + an end leaf, stacked absolutely
 * inside a `perspective` box and rotated about their left edge. What makes it
 * read as a book rather than as cards being flipped is entirely the trimmings:
 * cut page edges down the fore-edge, a spine down the gutter, and shading at
 * both margins of every leaf.
 *
 * The cover's date range is derived rather than written — `yearOf` on the first
 * memory's own date — so it cannot drift out of step with the archive the way
 * the prototype's hardcoded "2019 — TODAY" did.
 */
export function AlbumDesign() {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const memories = memoriesFor(COUNT)
  // Cover, one per memory, and the closing leaf.
  const total = memories.length + 2
  const { turned, forward, back, handlers } = useLeafTurn(total)

  const label =
    turned === 0
      ? td('album.cover')
      : turned === total
        ? td('album.end')
        : td('album.leaf', { current: turned, total: total - 1 })

  return (
    <div className="d-album d-body flex min-h-screen flex-col items-center bg-[var(--d-wood)] px-3.5 pt-7 pb-10 text-[var(--d-ink)]">
      <header className="mb-4 text-center">
        <p className="d-body text-[11px] tracking-[0.4em] text-[var(--d-gold-l)] uppercase">
          {td('album.volume')}
        </p>
        <h1 className="d-label mt-1.5 text-[clamp(24px,7vw,34px)] font-semibold tracking-[0.08em] text-[var(--d-page)]">
          {td('album.title')}
        </h1>
      </header>

      <div {...handlers} className="relative aspect-3/4 w-[min(92vw,400px)] [perspective:2200px]">
        {/* Fore-edge: the cut edges of every page still to come. */}
        <span
          aria-hidden
          className="d-page-stack absolute top-1.5 -right-1.5 bottom-1.5 w-2.5 rounded-[0_4px_4px_0] shadow-[2px_4px_10px_rgb(0_0_0_/_0.4)]"
        />
        {/* Spine. */}
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1 z-[9] w-3.5 rounded-[6px_0_0_6px] bg-[linear-gradient(90deg,var(--d-leather-d),var(--d-leather))] shadow-[-3px_4px_14px_rgb(0_0_0_/_0.5)]"
        />

        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {/* ── Cover ────────────────────────────────────────────────── */}
          <AlbumLeaf turned={turned > 0} z={turned > 0 ? 0 : total}>
            <div className="d-leather absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[3px_7px_7px_3px] p-[30px] text-center text-[var(--d-gold-l)] backface-hidden">
              <span className="d-page-curl pointer-events-none absolute inset-0" />
              <span
                aria-hidden
                className="absolute inset-3.5 rounded-[4px] border-[1.5px] border-[var(--d-gold)]/55 shadow-[0_0_0_4px_rgb(201_162_75_/_0.12)_inset]"
              />

              <span
                aria-hidden
                className="relative mb-3.5 grid size-[66px] place-items-center rounded-full border-[1.4px] border-[var(--d-gold-l)]"
              >
                <span className="d-label text-[16px]">{td('album.monogram')}</span>
              </span>

              <p className="d-label text-[30px] leading-tight tracking-[0.1em]">
                {td('album.coverTitle')}
              </p>
              <p className="d-body mt-2 text-[15px] text-[#e9d3a8] italic">
                {td('album.coverSub')}
              </p>
              <p className="d-body mt-4.5 text-[11px] tracking-[0.34em] text-[#d8bd8a] uppercase">
                {td('album.coverYears', { from: yearOf(t(memories[0].keys.date)) })}
              </p>

              <p className="d-body absolute bottom-5.5 text-[13px] text-[#e9d3a8]/90 italic">
                {td('album.openCue')}
              </p>
            </div>
          </AlbumLeaf>

          {/* ── One leaf per memory ──────────────────────────────────── */}
          {memories.map((memory, i) => {
            const leaf = i + 1
            const isTurned = turned > leaf
            return (
              <AlbumLeaf key={memory.id} turned={isTurned} z={isTurned ? leaf : total - leaf}>
                <MemoryLeaf memory={memory} page={leaf} />
              </AlbumLeaf>
            )
          })}

          {/* ── The end ──────────────────────────────────────────────── */}
          <AlbumLeaf turned={turned > total - 1} z={turned > total - 1 ? total - 1 : 1}>
            <div className="d-leaf absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[3px_7px_7px_3px] p-[30px] text-center backface-hidden">
              <span className="d-page-curl pointer-events-none absolute inset-0" />
              <p className="d-display text-[40px] text-[var(--d-leather)] italic">
                {td('album.finTitle')}
              </p>
              <p className="d-body mt-2 text-[11px] tracking-[0.28em] text-[var(--d-sepia)] uppercase">
                {td('album.finSub')}
              </p>
            </div>
          </AlbumLeaf>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="mt-5.5 flex items-center gap-5">
        <button
          type="button"
          onClick={back}
          disabled={turned === 0}
          aria-label={td('a11y.prevPage')}
          className="d-body flex min-h-11 items-center gap-2 rounded-[3px] border border-[var(--d-gold)]/50 px-4.5 text-[13px] tracking-[0.1em] text-[var(--d-gold-l)] transition-colors hover:bg-[var(--d-gold)]/15 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 fill-current">
            <path d="M15 6l-6 6 6 6z" />
          </svg>
          {td('album.back')}
        </button>

        <span
          aria-live="polite"
          className="d-body min-w-[78px] text-center text-[13px] text-[#e9d3a8] italic"
        >
          {label}
        </span>

        <button
          type="button"
          onClick={forward}
          disabled={turned === total}
          aria-label={td('a11y.turnPage')}
          className="d-body flex min-h-11 items-center gap-2 rounded-[3px] border border-[var(--d-gold)]/50 px-4.5 text-[13px] tracking-[0.1em] text-[var(--d-gold-l)] transition-colors hover:bg-[var(--d-gold)]/15 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          {td('album.turn')}
          <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 fill-current">
            <path d="M9 6l6 6-6 6z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
