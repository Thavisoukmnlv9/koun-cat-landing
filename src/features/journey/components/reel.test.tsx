import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/test/utils'

import { Reel } from './reel'

/**
 * The parts of a projector a screenshot cannot show: that it loads nothing
 * until it is asked to, that it starts silent, and that both of its controls
 * say what pressing them will do next rather than what state they are in.
 */
const SRC = '/videos/summertime_sadness.mp4'

const runButton = () => screen.getByRole('button', { name: /reel$/i })

describe('Reel', () => {
  it('fetches nothing until someone presses run', () => {
    const { container } = renderWithProviders(<Reel src={SRC} />)
    const video = container.querySelector('video')!

    expect(video).toHaveAttribute('preload', 'none')
    expect(video).not.toHaveAttribute('poster')
    expect(video).not.toHaveAttribute('autoplay')
  })

  it('starts silent, because that is what a home movie was', () => {
    const { container } = renderWithProviders(<Reel src={SRC} />)

    expect(container.querySelector('video')).toHaveProperty('muted', true)
    expect(screen.getByRole('button', { name: "Turn on the reel's sound" })).toBeInTheDocument()
  })

  it('goes fullscreen-free on iOS', () => {
    const { container } = renderWithProviders(<Reel src={SRC} />)
    expect(container.querySelector('video')).toHaveAttribute('playsinline')
  })

  it('relabels run to stop once the picture is running', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Reel src={SRC} />)

    expect(screen.getByRole('button', { name: 'Run the reel' })).toBeInTheDocument()
    await user.click(runButton())
    expect(screen.getByRole('button', { name: 'Stop the reel' })).toBeInTheDocument()

    // `data-running` is the single state the whole film stack reads — the lamp,
    // the grain, the weave and the flicker all hang off this one attribute.
    expect(container.querySelector('[data-running]')).toBeInTheDocument()
  })

  it('is stopped, and dark, before any of that', () => {
    const { container } = renderWithProviders(<Reel src={SRC} />)
    expect(container.querySelector('[data-running]')).not.toBeInTheDocument()
  })

  it('withholds the transport until there is something to seek through', () => {
    renderWithProviders(<Reel src={SRC} />)
    // duration is unknown until metadata lands, and a slider over an unknown
    // reel would be a tab stop that does nothing.
    expect(screen.getByRole('slider', { name: /Reel position/ })).toBeDisabled()
  })

  it('hides every effect layer from the accessibility tree', () => {
    const { container } = renderWithProviders(<Reel src={SRC} />)

    for (const layer of container.querySelectorAll('.film-layer, .lamp-spill, .lamp-line')) {
      expect(layer).toHaveAttribute('aria-hidden')
    }
  })
})
