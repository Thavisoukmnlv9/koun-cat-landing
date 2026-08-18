import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'
import { SCROLL_SMOOTH } from '@/lib/motion/springs'
import { cn } from '@/lib/utils'

/** Full turns across the section. Enough to read as winding, not as a fan. */
const TURNS = 1.5

/**
 * A take-up reel beside the projector, wound by the page.
 *
 * The one piece of motion on the page tied to the scrollbar rather than to a
 * transition or a clock, and it is here because a reel is the object that most
 * obviously has a scroll position: scrolling down winds it forward, scrolling
 * back rewinds it. The reel does not know how far the film has run — that is
 * the strip below the gate — it only knows how far the reader has come.
 *
 * Drawn rather than imaged so it stays crisp at any size, in the film stock's
 * own two colours, so it reads as the same material as `.optical-bed` and the
 * perforated strip rather than as an icon dropped beside them.
 *
 * `aria-hidden`, because it is a decoration and the section it decorates
 * already has a labelled transport, a clock, and a scrubber that announce
 * everything this could.
 */
export function FilmReel({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Smoothed, not raw. A wheel notch arrives as one large jump and mapping it
  // straight onto a rotation makes the reel step rather than turn; the spring
  // is a low-pass filter here and is tuned not to overshoot, or the reel would
  // keep winding after the page had stopped.
  const turns = useSpring(scrollYProgress, SCROLL_SMOOTH)
  const rotate = useTransform(turns, [0, 1], [0, TURNS * 360])

  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none', className)}>
      <motion.svg
        viewBox="0 0 100 100"
        style={reduced ? undefined : { rotate }}
        className="size-full"
      >
        {/* The flange, and the three lightening holes cut through it. A real
            reel has these to save weight; here they are the only thing that
            makes the rotation visible at all — a plain disc turning reads as
            a disc standing still. */}
        <circle cx="50" cy="50" r="46" fill="var(--color-emulsion)" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--color-perf)"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />
        {[0, 120, 240].map((angle) => (
          <circle
            key={angle}
            cx={50 + 27 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 27 * Math.sin((angle * Math.PI) / 180)}
            r="11"
            fill="var(--color-paper)"
            stroke="var(--color-perf)"
            strokeWidth="1.5"
          />
        ))}
        {/* The hub, and the square drive slot the projector's spindle takes. */}
        <circle cx="50" cy="50" r="12" fill="var(--color-perf)" />
        <rect x="45" y="45" width="10" height="10" rx="1.5" fill="var(--color-gate)" />
      </motion.svg>
    </div>
  )
}
