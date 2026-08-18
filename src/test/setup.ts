import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom gaps the page relies on: matchMedia (reduced-motion detection, which
// gates every animation on the page) and IntersectionObserver (the scroll
// reveal on the header, the postcards and both closing sections).
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

// This polyfill *fires*, rather than being an inert no-op. jsdom never computes
// layout, so a faithful observer would never intersect and every revealed
// element would stay at `opacity: 0` — which reads to jest-dom as not visible,
// failing assertions that have nothing to do with scrolling. Reporting
// everything as on screen is the useful default for a test environment with no
// viewport. A test that needs to control the timing installs its own fake.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    root = null
    rootMargin = ''
    thresholds = []

    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element) {
      this.callback(
        [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// ResizeObserver is absent from jsdom entirely, and Motion's `useScroll`
// constructs one to notice when the tracked element or the page changes size.
// Unlike the observer above this one is an inert no-op on purpose: nothing in
// a test resizes, and the scroll hooks all read a resting scroll position of 0
// on their own at subscribe time. Firing it would only re-measure the same
// zeroes.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// jsdom dispatches pointer events but has no PointerEvent constructor, so the
// cursor's own listeners can never be exercised without this. Extending
// MouseEvent rather than Event keeps clientX/clientY working, which is the
// only part of the interface the cursor actually reads.
if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class extends MouseEvent {
    readonly pointerType: string

    constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
      super(type, init)
      this.pointerType = init.pointerType ?? 'mouse'
    }
  } as unknown as typeof PointerEvent
}

// jsdom implements HTMLMediaElement's shape but none of its behaviour: play()
// returns undefined rather than a promise and logs a "Not implemented" error,
// and no play/pause event is ever dispatched.
//
// These fakes *fire*, for the same reason the observer above does. The reel and
// the optical track both track playback from the element's own events rather
// than by reading `paused` — which is the more correct choice in a real browser
// too, since the element pauses itself on a stall or at the end — so an inert
// no-op would leave every transport permanently stopped in tests. Returning a
// resolved promise also keeps the `.catch()` on play() from throwing.
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  }
  HTMLMediaElement.prototype.pause = function pause(this: HTMLMediaElement) {
    this.dispatchEvent(new Event('pause'))
  }
  HTMLMediaElement.prototype.load = () => {}
}

// Pointer capture is absent from jsdom's Element entirely. Nothing here calls
// it directly — both strips scrub through a native range input — but a range
// input captures the pointer itself, so a drag in a test would throw without
// these.
if (typeof Element !== 'undefined' && typeof Element.prototype.setPointerCapture !== 'function') {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.hasPointerCapture = () => false
}

afterEach(cleanup)
