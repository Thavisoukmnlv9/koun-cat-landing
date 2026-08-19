import { useAnimationFrame } from 'motion/react'
import { useCallback, useEffect, useState, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/** Pixels per frame at 60fps — the prototype's 1.4, which reads as a hand-cranked reel. */
const SPEED = 1.4

/**
 * Rolls the film strip forward on its own until it reaches the end.
 *
 * The prototype drove this with a bare `requestAnimationFrame` loop and a
 * module-level `let running`. `useAnimationFrame` is the same loop with the
 * teardown handled — which matters more than it sounds, because the projector
 * has to stop when the reel unmounts on a tab change, and a stray rAF writing
 * `scrollLeft` on a detached node is the kind of thing that survives a tab
 * switch and is very hard to find later.
 *
 * Reduced motion does not disable this: a visitor who asked for less movement
 * is not asking for the projector button to do nothing when they press it. It
 * is an explicit action, not ambient animation, so it stays — the page simply
 * never starts it for them.
 */
export function useProjector(ref: RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion()
  const [running, setRunning] = useState(false)

  useAnimationFrame(() => {
    if (!running) return
    const el = ref.current
    if (!el) return

    const end = el.scrollWidth - el.clientWidth
    if (el.scrollLeft >= end - 1) {
      setRunning(false)
      return
    }
    el.scrollLeft += SPEED
  })

  const toggle = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Restarting from the end rewinds, rather than pressing play on a reel that
    // has already run out.
    if (!running && el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
      el.scrollTo({ left: 0, behavior: reduced ? 'auto' : 'smooth' })
    }
    setRunning((was) => !was)
  }, [ref, running, reduced])

  const stop = useCallback(() => setRunning(false), [])

  return { running, toggle, stop }
}

/**
 * Which frame is under the gate, as a 1-based index.
 *
 * The strip holds one more child than there are memories — the "Fin." end card —
 * so the divisor is `total + 1`, exactly as the prototype had it. Getting that
 * wrong is invisible until the last frame, which then reads one short.
 */
export function useFrameCounter(ref: RefObject<HTMLElement | null>, total: number): number {
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const read = () => {
      const width = el.scrollWidth / (total + 1)
      if (width <= 0) return
      setFrame(Math.min(total, Math.round(el.scrollLeft / width) + 1))
    }

    read()
    el.addEventListener('scroll', read, { passive: true })
    return () => el.removeEventListener('scroll', read)
  }, [ref, total])

  return frame
}
