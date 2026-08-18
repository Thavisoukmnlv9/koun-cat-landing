import { useEffect, useState } from 'react'

/**
 * True when the visitor has asked the OS to reduce motion.
 *
 * Most of this page's motion is gated in CSS with `motion-safe:` or a
 * `prefers-reduced-motion: no-preference` media query, which is the right place
 * for it. This hook exists for the cases where JavaScript has to branch instead
 * — deciding whether to construct an IntersectionObserver at all, or whether to
 * attach a page-turn animation class — because a transition you never start is
 * cheaper and more honest than one you start and immediately suppress.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
