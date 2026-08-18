import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useReveal } from './use-reveal'

/**
 * A fake observer that hands the test its callback, so intersection can be
 * fired on demand. Deliberately not the global polyfill from test/setup.ts —
 * that one fires on observe, which is the right default everywhere else but
 * would make "starts hidden" impossible to assert here.
 */
class FakeObserver {
  static instances: FakeObserver[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this)
  }

  fire(isIntersecting: boolean) {
    const target = this.observe.mock.calls[0]?.[0] as Element
    this.callback(
      [
        {
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  }
}

/** Exercised through a real component, so the ref is attached before effects run. */
function Probe() {
  const { ref, revealed } = useReveal<HTMLDivElement>()
  return <div ref={ref} data-testid="probe" data-revealed={revealed ? 'true' : 'false'} />
}

const realObserver = globalThis.IntersectionObserver
const latest = () => FakeObserver.instances.at(-1)!
const probe = () => screen.getByTestId('probe')

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  FakeObserver.instances = []
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
  setReducedMotion(false)
})

afterEach(() => {
  globalThis.IntersectionObserver = realObserver
})

describe('useReveal', () => {
  it('starts hidden and reveals when the element scrolls into view', () => {
    render(<Probe />)
    expect(probe()).toHaveAttribute('data-revealed', 'false')

    act(() => latest().fire(true))
    expect(probe()).toHaveAttribute('data-revealed', 'true')
  })

  it('stops watching an element once it has arrived', () => {
    render(<Probe />)
    act(() => latest().fire(true))
    expect(latest().unobserve).toHaveBeenCalledTimes(1)
  })

  it('never re-hides something that has already been seen', () => {
    render(<Probe />)
    act(() => latest().fire(true))
    act(() => latest().fire(false))
    expect(probe()).toHaveAttribute('data-revealed', 'true')
  })

  it('carries the viewport margins the original page was tuned with', () => {
    render(<Probe />)
    expect(latest().options).toMatchObject({
      rootMargin: '0px 0px -14% 0px',
      threshold: 0.15,
    })
  })

  it('reveals immediately under reduced motion, without observing at all', () => {
    setReducedMotion(true)
    render(<Probe />)

    expect(probe()).toHaveAttribute('data-revealed', 'true')
    expect(FakeObserver.instances).toHaveLength(0)
  })
})
