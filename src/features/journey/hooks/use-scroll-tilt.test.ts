import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@/test/utils'

import { useScrollTilt } from './use-scroll-tilt'

/**
 * The hook has two modes and the important one is the quiet one: a visitor who
 * has asked for less motion should get the card's resting angle as a plain
 * number, with nothing listening to the scrollbar on their behalf.
 */
function withReducedMotion(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

const original = window.matchMedia

afterEach(() => {
  window.matchMedia = original
  vi.restoreAllMocks()
})

describe('useScrollTilt', () => {
  it('hands back motion values that the scrollbar can drive', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    // A motion value, not a number: it updates the DOM without a re-render.
    expect(typeof result.current.rotate).toBe('object')
    expect(typeof result.current.y).toBe('object')
  })

  it('starts a card at its entry angle and lands it on its resting one', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5, rise: 40 }))

    const rotate = result.current.rotate as { get: () => number }
    const y = result.current.y as { get: () => number }

    // Nothing has scrolled, so both sit at the start of their range.
    expect(rotate.get()).toBeCloseTo(-6)
    expect(y.get()).toBeCloseTo(40)
  })

  it('gives plain resting numbers under reduced motion', () => {
    withReducedMotion(true)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    expect(result.current.rotate).toBe(-1.5)
    expect(result.current.y).toBe(0)
  })
})
