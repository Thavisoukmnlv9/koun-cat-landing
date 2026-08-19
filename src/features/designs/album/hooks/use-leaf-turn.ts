import { useCallback, useEffect, useRef, useState } from 'react'

/** Below this many pixels a horizontal drag is a tap, not a page turn. */
const SWIPE_PX = 40

export interface LeafTurn {
  /** How many leaves have been turned. 0 is the closed cover. */
  turned: number
  total: number
  forward: () => void
  back: () => void
  /** Bind to the book. Handles the swipe; keyboard is bound to the window. */
  handlers: {
    onTouchStart: (event: React.TouchEvent) => void
    onTouchEnd: (event: React.TouchEvent) => void
  }
}

/**
 * Which leaf of the book is showing, and the three ways to change it.
 *
 * The prototype bound five listeners across three elements for this — touch
 * start and end on the book, a click that read `clientX` against the book's
 * bounding rect to decide left half or right half, and a document-level keydown.
 * The click-half gesture is the one deliberately dropped: it competed with
 * every control on the page (it had to special-case `[data-au], audio, video`
 * to avoid turning the page when you pressed play) and it is invisible — there
 * is nothing telling a reader that half the book is a button. The Back/Turn
 * controls under the book do the same job and say so.
 *
 * Swipe and arrow keys are kept, because both are discoverable by habit rather
 * than by being told, and neither can be triggered by aiming at something else.
 *
 * Clamped rather than wrapping: a book has a first page and a last one, and the
 * controls disable at each end.
 */
export function useLeafTurn(total: number): LeafTurn {
  const [turned, setTurned] = useState(0)
  const startX = useRef<number | null>(null)

  const forward = useCallback(() => setTurned((n) => Math.min(n + 1, total)), [total])
  const back = useCallback(() => setTurned((n) => Math.max(n - 1, 0)), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Let a focused control keep its own arrow-key meaning — the tab bar
      // above this page uses Left and Right to move between designs.
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [role="tablist"]')) return

      if (event.key === 'ArrowRight') forward()
      if (event.key === 'ArrowLeft') back()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [forward, back])

  return {
    turned,
    total,
    forward,
    back,
    handlers: {
      onTouchStart: (event) => {
        startX.current = event.touches[0]?.clientX ?? null
      },
      onTouchEnd: (event) => {
        if (startX.current === null) return
        const dx = (event.changedTouches[0]?.clientX ?? 0) - startX.current
        startX.current = null

        if (dx < -SWIPE_PX) forward()
        if (dx > SWIPE_PX) back()
      },
    },
  }
}
