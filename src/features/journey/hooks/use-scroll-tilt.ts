import {
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from 'motion/react'
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

/**
 * The print, developing.
 *
 * A photograph on this page is a print in a paper window, not a picture pasted
 * onto a card, and these four numbers are what make the difference legible. The
 * print is held oversize so it has somewhere to drift, it rises a little as the
 * card travels, and a wash of paper over it thins out to nothing — so a card
 * that has not arrived yet is still milky, the way a print is before it fixes.
 *
 * It never quite settles to 1. A print that lands exactly on its frame has no
 * crop left, and the final frame of drift would show the window's own edge.
 */
const PRINT_SCALE = 1.1
const PRINT_SCALE_REST = 1.02
/** % of the window the print travels. Negative: it rises into place. */
const PRINT_DRIFT = -5
/** How much paper is left lying over the print the moment it enters. */
const PRINT_WASH = 0.5

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
  /**
   * The lean, as an angle rather than a number, because it is written to
   * `--card-rot` and `.card-tilt` multiplies it by `--tilt-scale` — see the
   * note on transform ownership below.
   */
  rotate: MotionValue<string> | string
  /** The rise, as a length, and for the same reason. */
  y: MotionValue<string> | string
  /** The print drifting inside its window, as a % of the window. */
  photoY: MotionValue<string> | string
  /** The oversize that gives the drift somewhere to go. */
  photoScale: MotionValue<number> | number
  /** Opacity of the paper still lying over the print. */
  wash: MotionValue<number> | number
}

/**
 * A card straightening up, and its photograph developing, as they travel
 * through the viewport.
 *
 * This replaces, for the postcards only, what `.reveal` + `useReveal` do
 * everywhere else on the page: a one-shot CSS transition fired by an
 * IntersectionObserver. The difference is that a transition decides its own
 * pace once it has been triggered, where this is tied to the scrollbar — you
 * can hold a card half-settled, or push it back down. That is what makes the
 * timeline feel handled rather than played.
 *
 * Everything here hangs off one `scrollYProgress`. Five values, one
 * measurement: the card leans and rises, and inside it the print drifts, grows
 * a hair smaller, and loses the paper lying over it. A second subscription for
 * any of them would be measuring the same scrollbar twice.
 *
 * `.reveal` and Motion cannot share an element. `.reveal` writes the whole
 * `transform` shorthand and so does Motion, and the loser is silently dropped;
 * so the four sections that still want the one-shot reveal keep it untouched,
 * and the cards moved wholesale rather than half each.
 *
 * The lean leaves here as an *angle* rather than a number because of the same
 * rule, read the other way. A card that fills a phone's screen cannot lean 7°:
 * for a card of width W and height H at angle θ the bounding box is
 * `W·cosθ + H·sinθ`, which at 320px costs about 32px of overhang per side, and
 * the page clipped ten cards at both edges because of it. The angle therefore
 * has to shrink with the viewport, and the cheapest honest way to do that is a
 * `clamp()` — which is CSS. So Motion writes `--card-rot` and `--card-y` and
 * nothing else, `.card-tilt` composes the transform from them, and CSS is the
 * single writer of the article's transform rather than the two of them
 * fighting over it.
 *
 * What none of this drives is opacity. A scroll position is a measurement, and
 * a measurement can be wrong — an element whose offsets can never be satisfied,
 * a layout that has not settled — and the failure mode of a scroll-linked fade
 * is text nobody can read. The cards keep fading in on `useReveal`'s
 * intersection observer, which only ever answers yes or no (see `.card-fade` in
 * globals.css), and scroll is left to move the parts whose worst case is a card
 * sitting at a slight angle. The wash is the one exception and it is a safe
 * one: it is a decorative layer over a photograph, and its worst case is a
 * photograph that looks a little pale. That is also why `src/test/setup.ts`
 * makes its observer fire: in an environment with no viewport, on screen is the
 * useful default.
 *
 * Under reduced motion the card is handed its resting values as plain strings
 * and numbers, so Motion writes no live value and nothing on the element moves.
 * Note what this does *not* claim: `useScroll` is a hook and cannot be skipped,
 * so the subscription is still made and the transforms are still built — they
 * are simply never read. That falls short of the rule
 * `usePrefersReducedMotion` states, and it is a deliberate concession:
 * honouring it fully would mean splitting the postcard into two components with
 * two copies of its markup, which is a worse thing to maintain than one idle
 * listener.
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
  const lean = useTransform(scrollYProgress, [0, 1], [from, to])
  const lift = useTransform(scrollYProgress, [0, 1], [rise, 0])
  const drift = useTransform(scrollYProgress, [0, 1], [PRINT_DRIFT, 0])

  const rotate = useMotionTemplate`${lean}deg`
  const y = useMotionTemplate`${lift}px`
  const photoY = useMotionTemplate`${drift}%`
  const photoScale = useTransform(scrollYProgress, [0, 1], [PRINT_SCALE, PRINT_SCALE_REST])
  const wash = useTransform(scrollYProgress, [0, 1], [PRINT_WASH, 0])

  if (reduced) {
    return {
      ref,
      rotate: `${to}deg`,
      y: '0px',
      photoY: '0%',
      photoScale: PRINT_SCALE_REST,
      wash: 0,
    }
  }

  return { ref, rotate, y, photoY, photoScale, wash }
}
