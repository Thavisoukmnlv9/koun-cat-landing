import { motion, useScroll } from 'motion/react'
import { useRef } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

import { POSTCARDS } from '../data/postcards'

import { Postcard } from './postcard'

/**
 * The ten postcards, alternating either side of a dashed spine.
 *
 * The spine stops short of the bottom so it reads as a thread the cards hang
 * from rather than a border, and a second line draws down it as you scroll. A
 * dashed rule is decoration; a rule that fills in is a measurement — how far
 * through the ten you have come — and it is the only place on the page that
 * says so. It is drawn in the accent at low opacity because the accent is
 * rationed to five uses and this is the sixth thing that has earned it: it is
 * the one mark on the page that means "you are here".
 *
 * This is the only scroll subscription outside the cards themselves. It watches
 * the section rather than the window so the reading is a fraction of the
 * timeline and not of the document, which is mostly album and reel and letter.
 *
 * The alternation survives at phone width now. It used not to: a card sized
 * from the viewport rather than from the column was wider than the column it
 * sat in before it had leaned at all, and the lean then pushed it another 30-odd
 * px past each edge, where `overflow-x-hidden` on the page root quietly cut it
 * off. The card is sized from the column, the gutter narrows on a small screen,
 * and `--tilt-scale` takes the lean down with the width — see `.card-tilt`.
 */
export function TimelineSection() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  // Zero when the first card is still below the fold, one when the last has
  // gone by. `end end` rather than `end start` so the thread finishes with the
  // timeline rather than a screen height after it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })

  return (
    <section ref={ref} className="max-w-page relative mx-auto px-[clamp(14px,6vw,56px)] pb-10">
      <div
        aria-hidden
        className="border-rule absolute top-0 bottom-[clamp(64px,12vw,120px)] left-1/2 w-0 border-l border-dashed"
      />

      {/* The same line, filling in. Under reduced motion it is simply already
          drawn: a progress mark that never arrives is worse than one that was
          there all along. */}
      <motion.div
        aria-hidden
        style={{ scaleY: reduced ? 1 : scrollYProgress }}
        className="border-accent/30 absolute top-0 bottom-[clamp(64px,12vw,120px)] left-1/2 w-0 origin-top border-l"
      />

      <div className="relative flex flex-col gap-[clamp(64px,9vw,132px)]">
        {POSTCARDS.map((card) => (
          <Postcard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
