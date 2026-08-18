import type { Transition } from 'motion/react'

/**
 * The Motion half of the page's motion vocabulary.
 *
 * `globals.css` names four cubic-beziers for four gestures and says outright
 * that they are not interchangeable — a card settling decelerates gently, a
 * card turning over is heavier at the start, a page in a book snaps, a wax flap
 * falls open. These are the same idea for the things CSS cannot drive: a spring
 * has no fixed duration, so it is the honest curve for motion whose distance is
 * decided at runtime by a scroll position or by where a thumbnail happened to
 * be sitting when it was clicked.
 *
 * They are constants rather than inline objects for the same reason the eases
 * are tokens: a spring retuned in one place and not the other is how a page
 * stops feeling like one object.
 */

/**
 * A photograph lifted off the album and opened. Slightly underdamped, so it
 * overshoots by a hair and settles — paper has mass, and a lightbox that
 * arrives dead-on reads as a rectangle being resized.
 */
export const SPRING_LIFT: Transition = {
  type: 'spring',
  stiffness: 210,
  damping: 26,
  mass: 0.9,
}

/**
 * Small parts moving inside something that has already arrived: the lightbox's
 * caption, a control fading in. Critically damped — a second overshoot
 * alongside SPRING_LIFT's reads as a wobble rather than as weight.
 */
export const SPRING_SETTLE: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.6,
}

/**
 * The two ends of the cursor's multifollow, and the whole effect is the gap
 * between them. The lead is stiff enough to sit under the pointer at speed;
 * the trail is deliberately slack and heavier, so the photograph swings behind
 * the hand rather than tracking it. Narrow the difference and the two elements
 * look like one late cursor; widen it and the photograph looks detached.
 */
export const CURSOR_LEAD = { stiffness: 900, damping: 48, mass: 0.35 } as const
export const CURSOR_TRAIL = { stiffness: 165, damping: 20, mass: 0.85 } as const

/**
 * Smoothing for scroll-linked rotation. Scroll arrives in coarse, uneven jumps
 * — a trackpad fling, a mouse wheel notch — and mapping it straight onto a
 * rotation shows every one of them. Low stiffness with high damping is a
 * low-pass filter here, not a bounce: it must not overshoot, or the reel would
 * keep winding for a moment after the page has stopped.
 */
export const SCROLL_SMOOTH = { stiffness: 90, damping: 30, restDelta: 0.001 } as const

/**
 * The seal breaking. The only tween in this file, and deliberately so: wax does
 * not bounce, and a spring here would put a wobble on the one thing that is
 * supposed to snap. It is also the quickest movement on the page — a seal that
 * takes its time reads as a lid being lifted rather than as something giving
 * way.
 */
export const SEAL_BREAK: Transition = {
  type: 'tween',
  duration: 0.26,
  ease: [0.3, 0, 0.2, 1],
}

/**
 * The flap falling open. This is `--ease-flap` from globals.css, restated in
 * JavaScript rather than left as a CSS transition, because the gesture is a
 * chain: the paper cannot start leaving the envelope until the flap is out of
 * its way. A CSS transition has no completion Motion can sequence off, and the
 * alternative — a setTimeout carrying the same duration as the stylesheet — is
 * two numbers that must agree and eventually will not.
 */
const FLAP_SECONDS = 0.84

export const FLAP_FALL: Transition = {
  type: 'tween',
  duration: FLAP_SECONDS,
  ease: [0.5, 0.02, 0.2, 1],
}

/**
 * The same duration in milliseconds, for the one caller that has to wait out
 * the flap without being able to watch it.
 *
 * Derived rather than restated: the whole reason the curve lives in this file
 * is that a duration in two places is a duration that will disagree.
 */
export const FLAP_FALL_MS = FLAP_SECONDS * 1000

/**
 * How long the flap waits before falling shut again, in seconds.
 *
 * The letter has to be back inside before the envelope closes on it. The
 * modal's own exit runs 240ms, so this is that plus enough for the sheet to
 * land. Opening needs no equivalent constant, because it is sequenced off the
 * flap reporting itself finished rather than off a clock.
 */
export const RESEAL_LEAD = 0.3
