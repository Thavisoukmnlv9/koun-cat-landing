import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTypingSound } from './use-typing-sound'

/**
 * The gate is the whole hook, and it is a thing that happens between
 * keystrokes — so it is exercised directly, through a harness, rather than by
 * waiting on a typewriter that would take half a minute to reach a paragraph
 * break.
 *
 * A `.tsx` test because the gate needs a real `<audio>` on the ref: everything
 * it does, it does by setting `muted` on an element.
 */
function Harness({ running = true }: { running?: boolean }) {
  const sound = useTypingSound(running)

  return (
    <>
      <audio
        ref={sound.ref}
        src="/sound-effects/typing.mp3"
        loop
        preload="none"
        data-testid="tape"
      />
      <button type="button" onClick={sound.prime}>
        prime
      </button>
      <button type="button" onClick={sound.onType}>
        type
      </button>
      <button type="button" onClick={sound.toggleSound}>
        {sound.soundOn ? 'on' : 'off'}
      </button>
    </>
  )
}

const tape = () => screen.getByTestId('tape') as HTMLAudioElement
const press = (name: string) => screen.getByRole('button', { name })

// jsdom's `paused` never moves — `src/test/setup.ts` stubs play() and pause()
// to fire their events rather than to model playback, which is why everything
// in this codebase reads media state from events instead of from the property.
// Here the calls themselves are the assertion.
let play: ReturnType<typeof vi.spyOn>
let pause: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  play = vi.spyOn(HTMLMediaElement.prototype, 'play')
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useTypingSound', () => {
  it('starts the tape silent, so nothing is heard through the seal and the flap', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness />)

    await user.click(press('prime'))

    expect(play).toHaveBeenCalled()
    expect(tape().muted).toBe(true)
  })

  it('opens the mute on a keystroke and closes it again after the tail', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness />)

    await user.click(press('prime'))
    await user.click(press('type'))
    expect(tape().muted).toBe(false)

    vi.advanceTimersByTime(200)
    expect(tape().muted).toBe(true)
  })

  it('stays open while the keystrokes keep coming', async () => {
    // The re-arm is the mechanism. Without it the clatter would stutter at
    // every character rather than at every pause.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness />)

    await user.click(press('prime'))
    await user.click(press('type'))

    vi.advanceTimersByTime(100)
    await user.click(press('type'))
    vi.advanceTimersByTime(100)

    // 200ms after the first keystroke, which would have expired a tail armed
    // only once.
    expect(tape().muted).toBe(false)
  })

  it('stays silent once the sound is turned off, keystrokes or not', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness />)

    await user.click(press('prime'))
    await user.click(press('type'))
    expect(tape().muted).toBe(false)

    await user.click(press('on'))
    // Silence lands on the press rather than at the end of the current burst.
    expect(tape().muted).toBe(true)

    await user.click(press('type'))
    expect(tape().muted).toBe(true)
  })

  it('stops and rewinds when the letter is put back', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { rerender } = render(<Harness running />)

    await user.click(press('prime'))
    await user.click(press('type'))
    tape().currentTime = 3

    pause.mockClear()
    rerender(<Harness running={false} />)

    expect(pause).toHaveBeenCalled()
    expect(tape().muted).toBe(true)
    expect(tape().currentTime).toBe(0)
  })
})
