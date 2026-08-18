import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@/test/utils'

import { useScrollTilt } from './use-scroll-tilt'

/**
 * The hook has two modes and the important one is the quiet one: a visitor who
 * has asked for less motion should get the card's resting values as plain
 * strings and numbers, with nothing listening to the scrollbar on their behalf.
 *
 * The lean leaves as `"-6deg"` rather than `-6` because it is written to
 * `--card-rot` for `.card-tilt` to scale — a unitless number in a custom
 * property would make `calc(var(--card-rot) * var(--tilt-scale))` invalid, and
 * every card would sit flat with no error anywhere to say why. Hence the unit
 * is asserted, not just the number.
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

const read = (value: unknown) => (value as { get: () => unknown }).get()

describe('useScrollTilt', () => {
  it('hands back motion values that the scrollbar can drive', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    // Motion values, not primitives: they update the DOM without a re-render.
    for (const value of Object.values(result.current)) {
      expect(typeof value).toBe('object')
    }
  })

  it('starts a card at its entry angle and lands it on its resting one', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5, rise: 40 }))

    // Nothing has scrolled, so everything sits at the start of its range.
    expect(read(result.current.rotate)).toBe('-6deg')
    expect(read(result.current.y)).toBe('40px')
  })

  it('carries units, because a custom property is not a number', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    expect(read(result.current.rotate)).toMatch(/deg$/)
    expect(read(result.current.y)).toMatch(/px$/)
    expect(read(result.current.photoY)).toMatch(/%$/)
  })

  it('starts the print oversize, adrift and under paper', () => {
    withReducedMotion(false)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    expect(read(result.current.photoY)).toBe('-5%')
    expect(read(result.current.photoScale)).toBeCloseTo(1.1)
    expect(read(result.current.wash)).toBeCloseTo(0.5)
  })

  it('gives plain resting values under reduced motion', () => {
    withReducedMotion(true)
    const { result } = renderHook(() => useScrollTilt({ from: -6, to: -1.5 }))

    expect(result.current.rotate).toBe('-1.5deg')
    expect(result.current.y).toBe('0px')
    // The print sits still, square in its window, with nothing lying over it.
    expect(result.current.photoY).toBe('0%')
    expect(result.current.photoScale).toBeCloseTo(1.02)
    expect(result.current.wash).toBe(0)
  })
})
