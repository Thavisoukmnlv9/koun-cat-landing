import { afterEach, describe, expect, it, vi } from 'vitest'

import { act, renderWithProviders, waitFor } from '@/test/utils'

import { PhotoCursor } from './photo-cursor'

/**
 * The cursor's most important behaviour is declining to exist. A photograph
 * trailing a pointer that is a finger is nothing but a layer over the content,
 * and a visitor who has asked for less motion has asked for exactly the thing
 * this is. Both cases construct nothing rather than mounting and hiding.
 */
function withMedia(matches: (query: string) => boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
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

describe('PhotoCursor', () => {
  it('renders nothing on a touch device', () => {
    withMedia((query) => !query.includes('pointer: fine'))
    const { container } = renderWithProviders(<PhotoCursor />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the visitor has asked for less motion', () => {
    withMedia((query) => query.includes('pointer: fine') || query.includes('reduce'))
    const { container } = renderWithProviders(<PhotoCursor />)

    expect(container).toBeEmptyDOMElement()
  })

  it('mounts an inert overlay for a mouse', () => {
    withMedia((query) => query.includes('pointer: fine'))
    const { container } = renderWithProviders(<PhotoCursor />)

    const layer = container.firstElementChild as HTMLElement
    expect(layer).toBeInTheDocument()
    // Covers the viewport, so it must never take a click or be announced.
    expect(layer.className).toContain('pointer-events-none')
    expect(layer).toHaveAttribute('aria-hidden')
  })

  it('carries the photograph a hovered target declares, and puts it away again', async () => {
    withMedia((query) => query.includes('pointer: fine'))
    const { container } = renderWithProviders(
      <>
        <div data-testid="card" data-cursor-src="journey/m20" data-cursor-label="August">
          <span data-testid="child">a caption inside the card</span>
        </div>
        <div data-testid="elsewhere" />
        <PhotoCursor />
      </>,
    )

    // The listener is on `document`, not on any rendered element, so the event
    // is dispatched rather than fired through testing-library's helpers — and
    // wrapped, because it lands in a setState.
    const fire = (target: Element) =>
      act(() => {
        target.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
      })

    // From a descendant, to prove the lookup walks up rather than requiring the
    // attribute to sit on whatever the pointer happens to be over.
    fire(container.querySelector('[data-testid="child"]')!)
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/journey/m20.jpg')
    expect(container).toHaveTextContent('August')

    fire(container.querySelector('[data-testid="elsewhere"]')!)
    // It fades out rather than vanishing, so it is still there for a moment.
    await waitFor(() => expect(container.querySelector('img')).not.toBeInTheDocument())
  })
})
