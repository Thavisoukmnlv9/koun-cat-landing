import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SCROLL_SMOOTH } from '@/lib/motion/springs'

import { memoriesFor } from '../data/memories'

import { TrailStop } from './components/trail-stop'
import { useTrailPath } from './hooks/use-trail-path'

const COUNT = 6

/**
 * III · The Map of Us — a trail that draws itself as you walk down it.
 *
 * The one design whose centrepiece is genuinely scroll-driven, and the one that
 * needed the most rethinking rather than the most typing.
 *
 * Three things move off one number. `useScroll` reports how far through the
 * trail the viewport is; from that come the gold stroke's `strokeDashoffset`
 * (the drawing), the pin's position along the curve, and the compass needle's
 * rotation. The prototype recomputed all three inside a scroll listener, which
 * meant every one of them ran at the browser's scroll rate on the main thread.
 * As motion values they are read on the animation frame instead, and only the
 * pin — which has to ask the path where a length lands — costs anything.
 *
 * The progress is passed through `SCROLL_SMOOTH`, journey's low-pass filter for
 * exactly this: scroll arrives in coarse jumps from a wheel notch or a fling,
 * and a stroke mapped straight onto it shows every one of them.
 */
export function MapDesign() {
  const { t } = useTranslation('designs')
  const trailRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [length, setLength] = useState(0)

  const memories = memoriesFor(COUNT)
  const { geometry, registerDot } = useTrailPath(trailRef, memories.length)

  const { scrollYProgress } = useScroll({
    target: trailRef,
    offset: ['start center', 'end center'],
  })
  const progress = useSpring(scrollYProgress, SCROLL_SMOOTH)

  // `getTotalLength` has to be asked after the browser has taken the new `d`,
  // so it runs in a layout effect keyed on the curve rather than during render.
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path || !geometry.d) return
    setLength(path.getTotalLength())
  }, [geometry.d])

  const dashOffset = useTransform(progress, (p) => length * (1 - p))
  const barScale = useTransform(progress, (p) => Math.min(1, Math.max(0, p)))
  const needle = useTransform(progress, [0, 1], [0, 300])

  // The pin has to ask the path where a given length falls, which is a DOM
  // call — so it is written to motion values rather than through React state,
  // and never causes a render.
  const pinX = useMotionValue(0)
  const pinY = useMotionValue(0)

  useMotionValueEvent(progress, 'change', (p) => {
    const path = pathRef.current
    if (!path || length === 0) return
    const point = path.getPointAtLength(length * Math.min(1, Math.max(0, p)))
    pinX.set(point.x)
    pinY.set(point.y)
  })

  return (
    <div className="d-map d-body relative min-h-screen bg-[var(--d-bg)] pb-24 text-[#4a3d29]">
      <div aria-hidden className="d-parchment pointer-events-none fixed inset-0 z-0" />

      {/* The reading-progress rule, pinned under the tab bar. */}
      <motion.div
        aria-hidden
        style={{ scaleX: barScale }}
        className="fixed inset-x-0 top-0 z-[75] h-1 origin-left bg-[linear-gradient(90deg,var(--d-forest),var(--d-gold))]"
      />

      <header className="relative z-10 mx-auto max-w-[560px] px-5 pt-12 text-center">
        <p className="d-label text-[11px] tracking-[0.16em] text-[var(--d-sepia)]">
          {t('map.coord')}
        </p>

        <h1 className="d-display mt-3 text-[clamp(38px,11vw,56px)] leading-none text-[var(--d-forest)]">
          {t('map.title')}
        </h1>

        <span
          aria-hidden
          className="mx-auto mt-4 flex items-center justify-center gap-3 text-[var(--d-gold)]"
        >
          <em className="h-px w-14 bg-current" />
          <em className="text-[15px] not-italic">★</em>
          <em className="h-px w-14 bg-current" />
        </span>

        <p className="d-body mx-auto mt-4 max-w-[34ch] text-[16px] leading-relaxed italic">
          {t('map.lede')}
        </p>
      </header>

      <div
        ref={trailRef}
        className="relative z-10 mx-auto mt-12 flex max-w-[560px] flex-col gap-14 px-5"
      >
        {/* Sits behind the stops and ignores the pointer entirely. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 size-full overflow-visible"
          viewBox={`0 0 ${geometry.width || 1} ${geometry.height || 1}`}
          fill="none"
          preserveAspectRatio="none"
        >
          <path d={geometry.d} stroke="var(--d-parch-d)" strokeWidth={7} strokeLinecap="round" />
          <path
            d={geometry.d}
            stroke="var(--d-forest)"
            strokeWidth={3}
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
          <motion.path
            ref={pathRef}
            d={geometry.d}
            stroke="var(--d-gold)"
            strokeWidth={3.4}
            strokeLinecap="round"
            style={{ strokeDasharray: length, strokeDashoffset: dashOffset }}
          />
          <motion.circle r={7} fill="var(--d-gold)" style={{ cx: pinX, cy: pinY }} />
        </svg>

        {memories.map((memory, index) => (
          <TrailStop
            key={memory.id}
            memory={memory}
            index={index}
            registerDot={registerDot(index)}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="d-compass fixed right-4 bottom-5 z-20 grid size-16 place-items-center rounded-full"
      >
        <span className="d-label absolute top-1 text-[8px] text-[var(--d-sepia)]">
          {t('map.north')}
        </span>
        <motion.span
          style={{ rotate: needle }}
          className="block h-9 w-1 rounded-full bg-[linear-gradient(180deg,#b23a48_0_50%,var(--d-forest)_50%_100%)]"
        />
      </div>

      <footer className="relative z-10 mt-14 text-center">
        <p className="d-display text-[22px] text-[var(--d-forest)]">{t('map.here')}</p>
        <p className="d-label mt-1 text-[10px] tracking-[0.2em] text-[var(--d-sepia)] uppercase">
          {t('map.footer')}
        </p>
      </footer>
    </div>
  )
}
