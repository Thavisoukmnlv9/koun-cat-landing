import { motion, useScroll } from 'motion/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { memoriesFor } from '../data/memories'

import { Chapter } from './components/chapter'

const COUNT = 6

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

/**
 * IX · Storybook — the archive as a film, one full-screen scene at a time.
 *
 * The only design of the ten with no chrome at all: no cards, no frames, no
 * furniture. Each memory is a photograph the size of the screen with the story
 * rising over its lower edge, and the whole interaction is scrolling.
 *
 * The progress rail is `useScroll().scrollYProgress` driven straight onto
 * `scaleX` — a motion value, so the bar is repainted by the compositor and the
 * page never re-renders while you scroll. The prototype recalculated it inside a
 * `requestAnimationFrame` on every scroll event and wrote `style.width`, which
 * is both a layout property and a main-thread write.
 *
 * The dot rail is real anchor links rather than the prototype's `href="#ch0"`
 * with `scroll-behavior: smooth` on `html` — that rule was global and would have
 * applied to every other design in the tab bar too.
 */
export function StorybookDesign() {
  const { t: td } = useTranslation('designs')
  const memories = memoriesFor(COUNT)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll()

  // Stable, so the chapters' observers are not torn down and rebuilt on every
  // scroll-driven state change.
  const onEnter = useCallback((index: number) => setActive(index), [])

  const goTo = (index: number) => {
    document
      .getElementById(`storybook-chapter-${index}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="d-storybook d-body bg-[var(--d-ink)] text-[var(--d-cream)]">
      {/* ── Progress rail ────────────────────────────────────────────── */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[3px] bg-white/8">
        <motion.i
          style={{ scaleX: scrollYProgress }}
          className="block h-full origin-left bg-[linear-gradient(90deg,var(--d-rose),var(--d-gold))]"
        />
      </div>

      {/* ── Chapter dots ─────────────────────────────────────────────── */}
      <nav
        aria-label={td('a11y.chapters')}
        className="fixed top-1/2 right-2 z-50 flex -translate-y-1/2 flex-col gap-1"
      >
        {memories.map((memory, i) => (
          <button
            key={memory.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={td('a11y.goToChapter', { numeral: NUMERALS[i] })}
            aria-current={i === active || undefined}
            className="grid size-6 place-items-center"
          >
            <span
              aria-hidden
              className={`block size-[9px] rounded-full transition-all duration-300 ${
                i === active ? 'scale-[1.35] bg-[var(--d-gold)]' : 'bg-white/25'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* ── Cover ────────────────────────────────────────────────────── */}
      <section className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div
          aria-hidden
          style={{ backgroundImage: `url(/images/journey/${memories[0].image}.jpg)` }}
          className="absolute -inset-[8%] z-0 bg-cover bg-center [filter:brightness(0.5)_contrast(1.05)_saturate(1.05)]"
        />
        <span
          aria-hidden
          className="absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_50%_40%,transparent,rgb(20_18_16_/_0.7))]"
        />

        <div className="relative z-[2]">
          <p className="d-label text-[12px] font-bold tracking-[0.44em] text-[var(--d-gold)] uppercase">
            {td('storybook.eyebrow', { total: memories.length })}
          </p>
          <h1 className="d-display mt-4 mb-1.5 text-[clamp(52px,18vw,110px)] leading-[0.9] font-light tracking-[-0.02em]">
            {td('storybook.titleA')}
            <em className="font-semibold text-[var(--d-rose)] italic">
              {td('storybook.titleAccent')}
            </em>
          </h1>
          <p className="d-display mx-auto max-w-[26ch] text-[19px] text-[var(--d-muted)] italic">
            {td('storybook.sub')}
          </p>
        </div>

        <div className="d-bob d-label absolute bottom-6.5 z-[2] text-center text-[11px] tracking-[0.2em] text-[var(--d-muted)] uppercase">
          {td('storybook.scrollCue')}
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="mx-auto mt-1.5 size-4.5 fill-[var(--d-gold)]"
          >
            <path d="M12 16l-6-6h12z" />
          </svg>
        </div>
      </section>

      {/* ── The chapters ─────────────────────────────────────────────── */}
      <main>
        {memories.map((memory, i) => (
          <div key={memory.id} id={`storybook-chapter-${i}`}>
            <Chapter memory={memory} index={i} onEnter={onEnter} />
          </div>
        ))}
      </main>

      {/* ── Closing ──────────────────────────────────────────────────── */}
      <section className="flex min-h-[90svh] flex-col items-center justify-center bg-[radial-gradient(120%_90%_at_50%_30%,#2a211b,var(--d-ink))] px-7 text-center">
        <p aria-hidden className="mb-2.5 text-[26px] text-[var(--d-gold)]">
          ✦
        </p>
        <h2 className="d-display text-[clamp(34px,9vw,52px)] leading-tight font-light text-balance italic">
          {td('storybook.closingA')}{' '}
          <em className="font-semibold text-[var(--d-rose)] italic">
            {td('storybook.closingAccent')}
          </em>
        </h2>
        <p className="d-label mt-4.5 text-[12px] tracking-[0.28em] text-[var(--d-muted)] uppercase">
          {td('storybook.closingSub')}
        </p>
      </section>
    </div>
  )
}
