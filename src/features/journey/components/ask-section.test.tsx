import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen, waitFor } from '@/test/utils'

import { AskSection } from './ask-section'

/**
 * The seal, the flap and the paper's travel are the parts a test cannot see.
 * These assertions are about the parts that matter more and are easier to get
 * wrong: that the letter is *readable* the instant it opens rather than being
 * delivered one grapheme at a time, that the keyboard gets out again, and that
 * the read-aloud control keeps quiet on a device that cannot speak.
 */
const realMatchMedia = window.matchMedia

function preferReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

// jsdom's `paused` never moves — see the note in `src/test/setup.ts` — so the
// calls themselves are what the sound assertions read.
let play: ReturnType<typeof vi.spyOn>
let pause: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  play = vi.spyOn(HTMLMediaElement.prototype, 'play')
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
})

afterEach(() => {
  window.matchMedia = realMatchMedia
  vi.restoreAllMocks()
})

const hint = () => screen.getByRole('button', { name: 'Open the letter' })
const tape = (container: HTMLElement) => container.querySelector('audio') as HTMLAudioElement

describe('AskSection', () => {
  it('stays sealed until the hint is pressed', () => {
    renderWithProviders(<AskSection />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens without waiting for an animation that will not play', async () => {
    // Reduced motion: the flap never travels, so nothing reports itself
    // finished. The letter has to open anyway — a present that will not open
    // for the one visitor who asked for less movement is the worst version of
    // this bug, because it is invisible to everyone testing it.
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    expect(screen.getByRole('dialog', { name: 'The letter' })).toBeInTheDocument()
  })

  it('has the whole letter in the accessibility tree the moment it opens', async () => {
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    // Asserted with no waiting at all, on purpose. This is the regression test
    // for the typewriter: a screen reader must get the finished letter, not a
    // node being rewritten forty times a second.
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Ten postcards, an album')
    expect(dialog).toHaveTextContent('will you come with me for the next ten')
  })

  it('gives focus back to the hint when the letter is put away', async () => {
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    const trigger = hint()
    await user.click(trigger)
    await waitFor(() =>
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true),
    )

    await user.keyboard('{Escape}')

    // The hint must not be `disabled` while the letter is open: useFocusTrap
    // restores focus by calling .focus() on it, and focusing a disabled button
    // silently does nothing — which would drop the visitor at <body>, at the
    // top of the document, at the very end of the page.
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('can be opened again, and says so', async () => {
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    expect(hint()).toHaveTextContent('tap the envelope')

    await user.click(hint())
    await user.keyboard('{Escape}')

    // The wax does not reform. The second visit reads as "still here".
    await waitFor(() => expect(hint()).toHaveTextContent('read it again'))
    await user.click(hint())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('offers no read-aloud where the device has no voice for the language', async () => {
    // jsdom implements no speechSynthesis, which is the same branch a real
    // phone takes for Lao — so the case that matters most is the default here.
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    expect(screen.queryByRole('button', { name: /read the letter aloud/i })).not.toBeInTheDocument()
  })

  it('types the letter out over a copy that is hidden from assistive tech', async () => {
    preferReducedMotion(false)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    // The flap has to fall before the paper leaves, so the dialog arrives a
    // beat later than the press — the one place this component waits on Motion.
    const dialog = await screen.findByRole('dialog', {}, { timeout: 4000 })

    const typed = dialog.querySelector('[data-typed]')
    expect(typed).toHaveAttribute('aria-hidden')
    expect(screen.getByRole('button', { name: 'Show the whole letter now' })).toBeInTheDocument()
  })

  it('costs a visitor who never opens the letter nothing at all', () => {
    const { container } = renderWithProviders(<AskSection />)

    // `preload="none"` and no play(): not a byte of the recording is fetched
    // for someone who only scrolls past.
    expect(tape(container)).toHaveAttribute('preload', 'none')
    expect(play).not.toHaveBeenCalled()
  })

  it('starts the sound from the tap itself, where the gesture is', async () => {
    // Deliberately *not* under reduced motion, and deliberately not waiting for
    // anything: the whole point is that play() happens inside the click handler
    // rather than in an effect a second later, because on WebKit that is the
    // difference between a letter that can be heard and one that cannot.
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    expect(play).toHaveBeenCalled()
  })

  it('silences the typing the moment the letter is put back', async () => {
    preferReducedMotion(true)
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AskSection />)

    await user.click(hint())
    tape(container).currentTime = 3
    pause.mockClear()

    await user.click(screen.getByRole('button', { name: 'Close the letter' }))

    expect(pause).toHaveBeenCalled()
    expect(tape(container).currentTime).toBe(0)
  })

  it('offers nothing to silence when there is nothing to hear', async () => {
    // Reduced motion completes the letter on its first paint, so there are no
    // keystrokes to accompany. A control that does nothing is worse than none.
    preferReducedMotion(true)
    const user = userEvent.setup()
    renderWithProviders(<AskSection />)

    await user.click(hint())

    expect(screen.queryByRole('button', { name: 'Silence the typing' })).not.toBeInTheDocument()
  })
})
