import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/test/utils'

import { OpticalTrack } from './optical-track'

/**
 * jsdom has no Web Audio, so every one of these runs the unavailable path —
 * which is the point. The stripe is a picture of the sound; playing, seeking
 * and labelling all have to keep working when that picture never arrives.
 */
const SRC = '/music/summertime_sadness.mp3'

const playButton = () => screen.getByRole('button', { name: /sound$/i })

describe('OpticalTrack', () => {
  it('fetches nothing until someone presses play', () => {
    const { container } = renderWithProviders(<OpticalTrack src={SRC} />)
    const audio = container.querySelector('audio')!

    expect(audio).toHaveAttribute('preload', 'none')
    expect(audio).not.toHaveAttribute('autoplay')
  })

  it('draws leader rather than nothing while the track is unread', () => {
    const { container } = renderWithProviders(<OpticalTrack src={SRC} />)

    // One path per exposure state, both drawable from the first paint — there
    // is no branch here that could render an empty stripe.
    const paths = container.querySelectorAll('.optical-wave path')
    expect(paths).toHaveLength(2)
    for (const path of paths) expect(path.getAttribute('d')).toMatch(/^M.*Z$/)
  })

  it('relabels play to pause once the sound is up', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OpticalTrack src={SRC} />)

    expect(screen.getByRole('button', { name: 'Play the sound' })).toBeInTheDocument()
    await user.click(playButton())
    expect(screen.getByRole('button', { name: 'Pause the sound' })).toBeInTheDocument()
  })

  it('keeps playing even though the waveform never decodes', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<OpticalTrack src={SRC} />)

    await user.click(playButton())

    expect(screen.getByRole('button', { name: 'Pause the sound' })).toBeInTheDocument()
    expect(container.querySelectorAll('.optical-wave path')).toHaveLength(2)
  })

  it('withholds the transport until there is something to seek through', () => {
    renderWithProviders(<OpticalTrack src={SRC} />)
    expect(screen.getByRole('slider', { name: /Sound position/ })).toBeDisabled()
  })
})
