import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { memoriesFor } from '../data/memories'

import { StarCard } from './components/star-card'
import { StarPoint } from './components/star-point'
import { SKY, SPECKS } from './data/sky'

const COUNT = 6

/**
 * VIII · The Constellation of Us — every memory a star, and the shape they make.
 *
 * The lines are the design, and they are drawn between consecutive *lit* stars
 * in archive order: light them out of sequence and the figure assembles in
 * pieces, which is the whole pleasure of it.
 *
 * How they are drawn is the one place this departs from the prototype
 * substantially, and it removes a class of bug rather than adding a feature.
 * The prototype rebuilt every `<line>` on each change, measured the skybox with
 * `getBoundingClientRect`, computed each segment's length with `Math.hypot` to
 * feed `stroke-dasharray`, and re-ran the lot on `resize` — at which point every
 * line already on screen re-animated from nothing.
 *
 * Here the SVG carries `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`,
 * so a star's percentage position *is* its coordinate and the box can be any
 * size at all. No measurement, no resize listener, nothing to get out of step.
 * `vector-effect="non-scaling-stroke"` keeps the hairline a hairline under the
 * non-uniform scale that buys, and Motion's `pathLength` handles the draw, so
 * the segment lengths never have to be computed either. Each line is keyed by
 * the pair it joins, so existing lines are untouched when a new one appears.
 */
export function ConstellationDesign() {
  const { t: td } = useTranslation('designs')

  const memories = memoriesFor(COUNT)
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set())
  const [open, setOpen] = useState<number | null>(null)

  const light = (index: number) => {
    setOpen(index)
    setLit((current) => (current.has(index) ? current : new Set(current).add(index)))
  }

  /** The next unlit star after the open one, wrapping. */
  const nextUnlit = () => {
    for (let step = 1; step <= memories.length; step += 1) {
      const candidate = ((open ?? 0) + step) % memories.length
      if (!lit.has(candidate)) return candidate
    }
    return null
  }

  const litIndexes = [...lit].sort((a, b) => a - b)
  const segments = litIndexes.slice(1).map((to, i) => ({ from: litIndexes[i], to }))
  const complete = lit.size >= memories.length

  return (
    <div className="d-constellation d-body relative min-h-screen overflow-hidden bg-[var(--d-space)] text-[var(--d-star)]">
      {/* Background starfield. Fixed, so it sits behind the page rather than
          scrolling with it — the sky does not move when you do. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {SPECKS.map((speck, i) => (
          <i
            key={i}
            style={{
              left: `${speck.x}%`,
              top: `${speck.y}%`,
              width: `${speck.size}px`,
              height: `${speck.size}px`,
              // Read by the shared keyframe, so ninety specks blink out of step
              // without ninety animations.
              ['--twinkle-delay' as string]: `${speck.delay}s`,
            }}
            className="d-twinkle absolute rounded-full bg-[var(--d-star)]"
          />
        ))}
      </div>

      <div className="relative z-[2] mx-auto max-w-[560px] px-5 pb-20">
        <header className="pt-13 text-center">
          <p className="d-label text-[11px] tracking-[0.34em] text-[var(--d-gold)] uppercase">
            {td('constellation.coord')}
          </p>
          <h1 className="d-display mt-3 bg-[linear-gradient(120deg,#fff,var(--d-violet),var(--d-gold))] bg-clip-text text-[clamp(42px,13vw,64px)] leading-[0.96] font-semibold text-transparent italic">
            {td('constellation.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-[32ch] text-[16px] text-[var(--d-muted)] italic">
            {td('constellation.lede')}
          </p>
        </header>

        {/* ── The sky ────────────────────────────────────────────────── */}
        <div className="relative mt-6.5 h-[74vh] min-h-[460px] overflow-hidden rounded-2xl border border-[var(--d-violet)]/20 bg-[radial-gradient(120%_90%_at_30%_20%,rgb(70_50_110_/_0.35),transparent_60%),rgb(10_14_31_/_0.5)] shadow-[0_20px_60px_rgb(0_0_0_/_0.5),0_0_0_1px_rgb(255_255_255_/_0.03)_inset]">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-[1] size-full"
          >
            {segments.map(({ from, to }) => (
              <motion.line
                key={`${from}-${to}`}
                x1={SKY[from].x}
                y1={SKY[from].y}
                x2={SKY[to].x}
                y2={SKY[to].y}
                stroke="var(--d-gold)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.55 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            ))}
          </svg>

          {memories.map((memory, i) => (
            <StarPoint
              key={memory.id}
              memory={memory}
              at={SKY[i]}
              lit={lit.has(i)}
              onOpen={() => light(i)}
            />
          ))}
        </div>

        <p
          aria-live="polite"
          className="d-label mt-4 text-center text-[11px] tracking-[0.16em] text-[var(--d-muted)]"
        >
          {td('constellation.progress', { lit: lit.size, total: memories.length })}
        </p>

        {complete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="d-display mt-3.5 text-center text-[22px] text-[var(--d-gold)] italic"
          >
            {td('constellation.complete')}
          </motion.p>
        )}

        <footer className="d-label mt-5 text-center text-[10px] tracking-[0.2em] text-[var(--d-muted)]">
          {td('constellation.footer')}
        </footer>
      </div>

      <StarCard
        memory={open === null ? null : memories[open]}
        index={open ?? 0}
        hasUnlit={!complete}
        onNext={() => {
          const next = nextUnlit()
          if (next === null) setOpen(null)
          else light(next)
        }}
        onClose={() => setOpen(null)}
      />
    </div>
  )
}
