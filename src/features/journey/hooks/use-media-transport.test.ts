import { describe, expect, it } from 'vitest'

import { formatTime, fromPermille, toPermille } from './use-media-transport'

/**
 * The transport's decisions are pure functions and the hook is a thin shell
 * around them, following the precedent set in use-album-pager: the parts worth
 * testing are the ones that get boundary conditions wrong, and none of them
 * need a media element or a layout engine to exercise.
 */

describe('formatTime', () => {
  it('pads both fields', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(5)).toBe('00:05')
    expect(formatTime(59)).toBe('00:59')
  })

  it('rolls over at the minute', () => {
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(61)).toBe('01:01')
    expect(formatTime(265)).toBe('04:25')
  })

  it('truncates rather than rounding, so the clock never shows a second early', () => {
    expect(formatTime(59.9)).toBe('00:59')
  })

  // The reel loads nothing until someone presses run, so this is its opening
  // state rather than an edge case.
  it('shows a blank clock when there is no duration yet', () => {
    expect(formatTime(Number.NaN)).toBe('--:--')
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('--:--')
    expect(formatTime(-1)).toBe('--:--')
  })
})

describe('toPermille', () => {
  it('maps position onto the seek input`s fixed domain', () => {
    expect(toPermille(0, 265)).toBe(0)
    expect(toPermille(132.5, 265)).toBe(500)
    expect(toPermille(265, 265)).toBe(1000)
  })

  it('clamps past either end', () => {
    expect(toPermille(-10, 265)).toBe(0)
    expect(toPermille(400, 265)).toBe(1000)
  })

  it('is zero while duration is unknown, rather than NaN', () => {
    expect(toPermille(12, Number.NaN)).toBe(0)
    expect(toPermille(Number.NaN, 265)).toBe(0)
    expect(toPermille(12, 0)).toBe(0)
  })
})

describe('fromPermille', () => {
  it('round-trips against toPermille', () => {
    expect(fromPermille(500, 265)).toBe(132.5)
    expect(fromPermille(0, 265)).toBe(0)
    expect(fromPermille(1000, 265)).toBe(265)
  })

  it('clamps, so a seek can never leave the reel', () => {
    expect(fromPermille(-50, 265)).toBe(0)
    expect(fromPermille(4000, 265)).toBe(265)
  })

  // currentTime = NaN throws in some engines and silently breaks seeking in
  // the rest, so this guard is load-bearing rather than defensive.
  it('is zero while duration is unknown', () => {
    expect(fromPermille(500, Number.NaN)).toBe(0)
    expect(fromPermille(500, 0)).toBe(0)
  })
})
