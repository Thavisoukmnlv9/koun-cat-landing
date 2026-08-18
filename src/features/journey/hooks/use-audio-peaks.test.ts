import { describe, expect, it } from 'vitest'

import { peaksFromBuffer, peaksToPath } from './use-audio-peaks'

/** jsdom has no Web Audio at all, so the buffer is the smallest thing that reads like one. */
function buffer(samples: number[]): AudioBuffer {
  const data = Float32Array.from(samples)
  return { length: data.length, getChannelData: () => data } as unknown as AudioBuffer
}

describe('peaksFromBuffer', () => {
  it('takes the loudest sample in each bucket', () => {
    const peaks = peaksFromBuffer(buffer([0, 0.5, 0, 1]), 2)
    expect(Array.from(peaks)).toEqual([0.5, 1])
  })

  it('reads the absolute value, so the trough of a wave counts', () => {
    const peaks = peaksFromBuffer(buffer([-0.8, 0.2]), 1)
    expect(Array.from(peaks)).toEqual([1])
  })

  // Without this a quietly-mastered track draws a thin line down the middle of
  // the stripe instead of filling it.
  it('normalises against the loudest bucket', () => {
    const peaks = peaksFromBuffer(buffer([0.2, 0.1]), 2)
    expect(Array.from(peaks)).toEqual([1, 0.5])
  })

  it('returns silence rather than NaN for an empty buffer', () => {
    expect(Array.from(peaksFromBuffer(buffer([]), 3))).toEqual([0, 0, 0])
  })
})

describe('peaksToPath', () => {
  it('draws nothing when there is nothing to draw', () => {
    expect(peaksToPath(new Float32Array(0), 1000, 100)).toBe('')
  })

  it('closes the silhouette', () => {
    const path = peaksToPath(Float32Array.from([1, 0.5, 1]), 1000, 100)
    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })

  it('spans the full nominal width', () => {
    const path = peaksToPath(Float32Array.from([1, 1, 1]), 1000, 100)
    expect(path).toContain('0.00,')
    expect(path).toContain('1000.00,')
  })

  // The stripe is only convincing if it is a true mirror: every point on the
  // top edge has a partner the same distance below the centre line.
  it('mirrors about the centre line', () => {
    const height = 100
    const peaks = Float32Array.from([1, 0.25, 0.6, 0])
    const points = peaksToPath(peaks, 1000, height)
      .replace(/^M/, '')
      .replace(/Z$/, '')
      .split('L')
      .map((pair) => pair.split(',').map(Number))

    expect(points).toHaveLength(peaks.length * 2)

    for (let index = 0; index < peaks.length; index += 1) {
      const top = points[index]
      const bottom = points[points.length - 1 - index]
      expect(top[0]).toBe(bottom[0])
      expect(top[1] + bottom[1]).toBeCloseTo(height, 5)
    }
  })
})
