import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/test/utils'

import { LAST_SPREAD } from '../data/album'

import { AlbumSection } from './album-section'

/**
 * Seven spreads but six plates is the off-by-one this whole component invites,
 * so the ends get asserted from the outside: what the buttons say, whether they
 * are dead, and what the live region announces.
 */
const nextButton = () => screen.getByRole('button', { name: 'Next page' })
const prevButton = () => screen.getByRole('button', { name: 'Previous page' })
const count = () => screen.getByText(/cover|plate \d/i)

describe('AlbumSection', () => {
  it('opens closed, with nowhere to go back to', () => {
    renderWithProviders(<AlbumSection />)

    expect(count()).toHaveTextContent('cover')
    expect(nextButton()).toHaveTextContent('open the album')
    expect(prevButton()).toBeDisabled()
    expect(nextButton()).toBeEnabled()
  })

  it('counts plates rather than spreads once open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AlbumSection />)

    await user.click(nextButton())

    expect(count()).toHaveTextContent(`plate 1 of ${LAST_SPREAD}`)
    expect(nextButton()).toHaveTextContent('turn the page')
    expect(prevButton()).toBeEnabled()
  })

  it('stops at the last plate and says so', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AlbumSection />)

    for (let i = 0; i < LAST_SPREAD; i++) await user.click(nextButton())

    expect(count()).toHaveTextContent(`plate ${LAST_SPREAD} of ${LAST_SPREAD}`)
    expect(nextButton()).toHaveTextContent('last plate')
    expect(nextButton()).toBeDisabled()
  })

  it('re-enables the way forward after turning back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AlbumSection />)

    for (let i = 0; i < LAST_SPREAD; i++) await user.click(nextButton())
    await user.click(prevButton())

    expect(nextButton()).toBeEnabled()
    expect(count()).toHaveTextContent(`plate ${LAST_SPREAD - 1} of ${LAST_SPREAD}`)
  })

  it('pages with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AlbumSection />)

    const book = screen.getByRole('group', { name: 'The album' })
    book.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(count()).toHaveTextContent(`plate 2 of ${LAST_SPREAD}`)

    await user.keyboard('{ArrowLeft}')
    expect(count()).toHaveTextContent(`plate 1 of ${LAST_SPREAD}`)
  })

  it('announces the turn, since nothing else reports it', () => {
    renderWithProviders(<AlbumSection />)
    expect(count()).toHaveAttribute('aria-live', 'polite')
  })

  it('keeps the half-page click targets out of the tab order', () => {
    // They duplicate the labelled pager; two invisible full-height tab stops
    // over the photograph would be worse than the div they replace.
    const { container } = renderWithProviders(<AlbumSection />)
    const overlays = container.querySelectorAll('[aria-roledescription="album"] > button')

    expect(overlays).toHaveLength(2)
    for (const overlay of overlays) {
      expect(overlay).toHaveAttribute('aria-hidden', 'true')
      expect(overlay).toHaveAttribute('tabindex', '-1')
    }
  })
})
