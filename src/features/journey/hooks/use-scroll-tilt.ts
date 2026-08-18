import { useScroll, useTransform, type MotionValue, type UseScrollOptions } from 'motion/react'
import { useRef, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Where a card starts arriving and where it has finished.
 *
 * Read as "the card's top edge crossing the bottom of the viewport" through to
 * "the card's centre sitting 62% of the way up it". The end point is above
 * centre on purpose, and it is the same instinct as `useReveal`'s `-14%` root
 * margin: a card should have committed to arriving slightly before it is fully
 * on screen, or the settling happens in the reader's peripheral vision.
 */
const OFFSET: UseScrollOptions['offset'] = ['start end', 'center 62%']

export interface ScrollTiltOptions {
  /** Degrees the card enters at. */
  from: number
  /** The residual lean it settles into. Never zero, or it looks printed. */
  to: number
  /** px the card rises through as it arrives. */
  rise?: number
}

export interface ScrollTilt<T extends HTMLElement> {
  ref: RefObject<T | null>
  rotate: MotionValue<number> | number
  y: MotionValue<number> | number
}

/**
 * A card straightening up as it travels through the viewport.
 *
 * This replaces, for the postcards only, what `.reveal` + `useReveal` do
 * everywhere else on the page: a one-shot CSS transition fired by an
 * IntersectionObserver. The difference is that a transition decides its own
 * pace once it has been triggered, where this is tied to the scrollbar — you
 * can hold a card half-settled, or push it back down. That is what makes the
 * timeline feel handled rather than played.
 *
 * The two cannot share an element. `.reveal` writes the whole `transform`
 * shorthand and so does Motion, and the loser is silently dropped; so the four
 * sections that still want the one-shot reveal keep it untouched, and the cards
 * moved wholesale rather than half each.
 *
 * What it deliberately does *not* drive is opacity. A scroll position is a
 * measurement, and a measurement can be wrong — an element whose offsets can
 * never be satisfied, a layout that has not settled — and the failure mode of a
 * scroll-linked fade is text nobody can read. The cards keep fading in on
 * `useReveal`'s intersection observer, which only ever answers yes or no
 * (see `.card-fade` in globals.css), and scroll is left to move the parts whose
 * worst case is a card sitting at a slight angle. That
 * is also why `src/test/setup.ts` makes its observer fire: in an environment
 * with no viewport, on screen is the useful default.
 *
 * Under reduced motion the card is handed its resting values as plain numbers,
 * so Motion writes no transform and nothing on the element moves. Note what
 * this does *not* claim: `useScroll` is a hook and cannot be skipped, so the
 * subscription is still made and the transforms are still built — they are
 * simply never read. That falls short of the rule `usePrefersReducedMotion`
 * states, and it is a deliberate concession: honouring it fully would mean
 * splitting the postcard into two components with two copies of its markup,
 * which is a worse thing to maintain than one idle listener.
 */
export function useScrollTilt<T extends HTMLElement = HTMLElement>({
  from,
  to,
  rise = 40,
}: ScrollTiltOptions): ScrollTilt<T> {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<T>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: OFFSET })

  // Hooks cannot be skipped, so the transforms are always built; what reduced
  // motion controls is whether anything downstream reads them.
  const rotate = useTransform(scrollYProgress, [0, 1], [from, to])
  const y = useTransform(scrollYProgress, [0, 1], [rise, 0])

  if (reduced) return { ref, rotate: to, y: 0 }
  return { ref, rotate, y }
}
