import { useEffect, useState } from 'react'

/**
 * Tracks a media query, and keeps tracking it.
 *
 * A sibling of `usePrefersReducedMotion`, which predates it and stays as it is:
 * that hook is used in four places and tested, and rewriting it in terms of
 * this one would buy nothing but churn.
 *
 * The initialiser reads `matchMedia` rather than starting `false` and correcting
 * in an effect. The difference matters for the cursor, which is mounted on the
 * result — starting false would mount the whole overlay for one frame on every
 * desktop load and then tear it down again.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    // Re-read on subscribe: the query can have changed between the initial
    // render and this effect, and on a prop change `query` itself is new.
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * True for a mouse, trackpad or stylus; false for a finger.
 *
 * `pointer: fine` rather than a width breakpoint or a touch-support sniff,
 * because the question the cursor is actually asking is "is there a pointer on
 * screen for a photograph to trail behind" — and a laptop with a touchscreen
 * answers yes to touch support while still being driven by a trackpad. Devices
 * with both report `fine` as their primary pointer, which is the right answer.
 */
export function usePointerFine(): boolean {
  return useMediaQuery('(pointer: fine)')
}
