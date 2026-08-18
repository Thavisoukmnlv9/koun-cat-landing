import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/test/utils'

import { ALBUM_PLATES } from '../data/album'

import { PlateIndex } from './plate-index'

/**
 * The strip's whole job is to be six labelled ways into the lightbox. The
 * frames are decoration; the buttons are the interface.
 */
describe('PlateIndex', () => {
  it('offers one named control per plate', () => {
    renderWithProviders(<PlateIndex onOpen={() => {}} />)

    const frames = screen.getAllByRole('button')
    expect(frames).toHaveLength(ALBUM_PLATES.length)
    expect(screen.getByRole('button', { name: 'Hold up Keep childlike' })).toBeInTheDocument()
  })

  it('raises the plate that was pressed, by index', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    renderWithProviders(<PlateIndex onOpen={onOpen} />)

    await user.click(screen.getAllByRole('button')[2])

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(2)
  })

  it('declares the photograph each frame is holding, for the cursor to carry', () => {
    renderWithProviders(<PlateIndex onOpen={() => {}} />)

    expect(screen.getAllByRole('button')[0]).toHaveAttribute(
      'data-cursor-src',
      `journey/${ALBUM_PLATES[0].image}`,
    )
  })

  it('leaves the thumbnails out of the accessibility tree', () => {
    // The button is already named after the plate; an alt text here would make
    // a screen reader announce the same photograph twice.
    const { container } = renderWithProviders(<PlateIndex onOpen={() => {}} />)

    for (const image of container.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt', '')
    }
  })
})
