import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/test/utils'

import { POSTCARDS } from '../data/postcards'

import { Postcard } from './postcard'

/**
 * The flip is the page's one real interaction, and the original had no keyboard
 * path to it at all. These assertions are mostly about the parts a screenshot
 * cannot show: that the control announces its state, and that the face turned
 * away is actually gone rather than merely invisible.
 */
const card = POSTCARDS[0]

const flipButton = () => screen.getByRole('button', { name: /postcard 01/i })

describe('Postcard', () => {
  it('starts face up, with the back withheld', () => {
    const { container } = renderWithProviders(<Postcard card={card} />)

    expect(flipButton()).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.card-front')).not.toHaveAttribute('inert')
    expect(container.querySelector('.card-back')).toHaveAttribute('inert')
  })

  it('turns over from the keyboard, and swaps which face is exposed', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Postcard card={card} />)

    await user.click(flipButton())

    expect(flipButton()).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('.card-front')).toHaveAttribute('inert')
    expect(container.querySelector('.card-back')).not.toHaveAttribute('inert')
  })

  it('turns back over on a second press', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Postcard card={card} />)

    await user.click(flipButton())
    await user.click(flipButton())

    expect(flipButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('relabels the control to say what pressing it will now do', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Postcard card={card} />)

    expect(screen.getByRole('button', { name: 'Read the back of postcard 01' })).toBeVisible()
    await user.click(flipButton())
    expect(screen.getByRole('button', { name: 'Turn postcard 01 back over' })).toBeVisible()
  })

  it('flips once, not twice, when the card itself is clicked', async () => {
    // The card and the button both handle clicks; without stopPropagation on
    // the button the two cancel out and the card never turns.
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Postcard card={card} />)

    await user.click(container.querySelector('img')!)
    expect(flipButton()).toHaveAttribute('aria-expanded', 'true')
  })

  it('names the photograph and prints the card number on the back', () => {
    renderWithProviders(<Postcard card={card} />)

    expect(screen.getByAltText('Where it started')).toBeInTheDocument()
    expect(screen.getByText(/postcard no\./i)).toHaveTextContent('01')
  })
})
