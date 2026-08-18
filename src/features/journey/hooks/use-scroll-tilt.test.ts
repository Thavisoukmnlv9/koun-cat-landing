import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/utils'

import { useScrollTilt, type ScrollTilt, type ScrollTiltOptions } from './use-scroll-tilt'

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

/**
 * The ref has to land on a mounted element, the way `postcard.tsx` lands it on
 * its `<article>`. `useScroll` measures its target on the frame *after* render,
 * so a hook rendered on its own — ref handed back, never attached — throws
 * "target ref is defined but not hydrated" from inside Motion's frame loop,
 * after the test that caused it has already passed. Rendering the hook the way
 * a card renders it keeps that failure in front of the assertions instead of
 * behind them.
 */
function renderTilt(options: ScrollTiltOptions): ScrollTilt<HTMLElement> {
  let tilt: ScrollTilt<HTMLElement> | undefined

  function Card() {
    tilt = useScrollTilt<HTMLElement>(options)
    return createElement('article', { ref: tilt.ref })
  }

  render(createElement(Card))
  if (!tilt) throw new Error('useScrollTilt returned nothing')
  return tilt
}

const read = (value: unknown) => (value as { get: () => unknown }).get()

describe('useScrollTilt', () => {
  it('hands back motion values that the scrollbar can drive', () => {
    withReducedMotion(false)
    const tilt = renderTilt({ from: -6, to: -1.5 })

    // Motion values, not primitives: they update the DOM without a re-render.
    for (const [key, value] of Object.entries(tilt)) {
      if (key === 'ref') continue
      expect(typeof value).toBe('object')
    }
  })

  it('starts a card at its entry angle and lands it on its resting one', () => {
    withReducedMotion(false)
    const tilt = renderTilt({ from: -6, to: -1.5, rise: 40 })

    // Nothing has scrolled, so everything sits at the start of its range.
    expect(read(tilt.rotate)).toBe('-6deg')
    expect(read(tilt.y)).toBe('40px')
  })

  it('carries units, because a custom property is not a number', () => {
    withReducedMotion(false)
    const tilt = renderTilt({ from: -6, to: -1.5 })

    expect(read(tilt.rotate)).toMatch(/deg$/)
    expect(read(tilt.y)).toMatch(/px$/)
    expect(read(tilt.photoY)).toMatch(/%$/)
  })

  it('starts the print oversize, adrift and under paper', () => {
    withReducedMotion(false)
    const tilt = renderTilt({ from: -6, to: -1.5 })

    expect(read(tilt.photoY)).toBe('-5%')
    expect(read(tilt.photoScale)).toBeCloseTo(1.1)
    expect(read(tilt.wash)).toBeCloseTo(0.5)
  })

  it('gives plain resting values under reduced motion', () => {
    withReducedMotion(true)
    const tilt = renderTilt({ from: -6, to: -1.5 })

    expect(tilt.rotate).toBe('-1.5deg')
    expect(tilt.y).toBe('0px')
    // The print sits still, square in its window, with nothing lying over it.
    expect(tilt.photoY).toBe('0%')
    expect(tilt.photoScale).toBeCloseTo(1.02)
    expect(tilt.wash).toBe(0)
  })
})
