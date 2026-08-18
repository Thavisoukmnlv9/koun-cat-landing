import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, waitFor } from '@/test/utils'

import { ALBUM_PLATES } from '../data/album'

import { PlateIndex } from './plate-index'
import { PlateLightbox } from './plate-lightbox'

/**
 * The shared layout animation is the part a test cannot see, so these
 * assertions are about the part that matters more and is easier to get wrong: a
 * dialog that announces itself, holds the keyboard, hands it back, and can be
 * left without reaching for the mouse.
 *
 * The two components are exercised together because the thing being tested is
 * the round trip — press a frame, page, close, and land back on the frame.
 */
function Album() {
  const [heldUp, setHeldUp] = useState<number | null>(null)
  return (
    <>
      <PlateIndex onOpen={setHeldUp} />
      <PlateLightbox index={heldUp} onClose={() => setHeldUp(null)} onSelect={setHeldUp} />
    </>
  )
}

const frames = () => screen.getAllByRole('button', { name: /^Hold up/ })

describe('PlateLightbox', () => {
  it('stays shut until a frame is pressed', () => {
    renderWithProviders(<Album />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on the plate that was pressed, named after it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    await user.click(frames()[1])

    expect(screen.getByRole('dialog', { name: 'Under the lanterns' })).toBeInTheDocument()
  })

  it('moves focus into the dialog, and gives it back to the frame on close', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    const frame = frames()[0]
    await user.click(frame)

    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))

    await user.click(screen.getByRole('button', { name: 'Put the plate back' }))

    await waitFor(() => expect(document.activeElement).toBe(frame))
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    await user.click(frames()[0])
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('pages with the arrow keys, and wraps at both ends', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    await user.click(frames()[0])
    expect(screen.getByText(`Plate 1 of ${ALBUM_PLATES.length}`)).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText(`Plate 2 of ${ALBUM_PLATES.length}`)).toBeInTheDocument()

    // Back past the first plate, which is where an off-by-one would throw.
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(
      screen.getByText(`Plate ${ALBUM_PLATES.length} of ${ALBUM_PLATES.length}`),
    ).toBeInTheDocument()
  })

  it('pages from its own controls too', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    await user.click(frames()[0])
    await user.click(screen.getByRole('button', { name: 'Next plate' }))

    expect(screen.getByRole('dialog', { name: 'Under the lanterns' })).toBeInTheDocument()
  })

  it('locks the page behind it, and unlocks it again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Album />)

    await user.click(frames()[0])
    expect(document.documentElement.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.documentElement.style.overflow).toBe(''))
  })
})
