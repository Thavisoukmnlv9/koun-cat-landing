import { useEffect, useRef, useState, type RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Shrinks the viewport from the bottom, so a card commits to arriving slightly
 * before it is fully on screen. Carried over from the original page verbatim —
 * the exact figures are what make the timeline feel unhurried rather than
 * snappy, and they are worth preserving even though they look arbitrary.
 */
const DEFAULT_ROOT_MARGIN = '0px 0px -14% 0px'
const DEFAULT_THRESHOLD = 0.15

export interface UseRevealOptions {
  threshold?: number
  rootMargin?: string
}

export interface Reveal<T extends HTMLElement> {
  ref: RefObject<T | null>
  revealed: boolean
}

/**
 * Reports whether an element has scrolled into view yet, once.
 *
 * Replaces the original page's single document-wide IntersectionObserver that
 * wrote `style.opacity` and `style.transform` directly. Here the hook only
 * decides *whether*; `.reveal` in globals.css decides *how*, reading the card's
 * two tilt values from custom properties.
 *
 * Under reduced motion the element starts revealed and no observer is ever
 * constructed — a transition you never begin is cheaper and more honest than
 * one you begin and immediately suppress. The original page exposed the same
 * behaviour as an authoring toggle (`revealStyle: "none"`); reduced motion is
 * the honest trigger for it.
 *
 * Reveal is one-way: the original never re-hid anything, so the observer stops
 * watching an element the moment it arrives.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({
  threshold = DEFAULT_THRESHOLD,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseRevealOptions = {}): Reveal<T> {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(() => reduced)

  useEffect(() => {
    if (revealed) return

    const element = ref.current
    if (reduced || !element || typeof IntersectionObserver !== 'function') {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          setRevealed(true)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(element)
    // disconnect() rather than unobserve() so cleanup is idempotent under
    // StrictMode's double effect invocation in development.
    return () => observer.disconnect()
  }, [reduced, revealed, rootMargin, threshold])

  return { ref, revealed }
}
