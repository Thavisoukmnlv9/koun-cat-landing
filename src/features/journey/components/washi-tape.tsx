import type { CSSProperties } from 'react'

import type { WashiTape as WashiTapeRecord } from '../data/postcards'

/**
 * One strip of tape holding something to the page.
 *
 * Size, angle and opacity differ on every strip because a person stuck them on
 * one at a time; those numbers live on the card's data record and arrive here
 * as custom properties, since Tailwind compiles from source text and cannot see
 * a runtime value. The `.washi` class in globals.css turns them into a strip.
 */
export function WashiTape({ tape }: { tape: WashiTapeRecord }) {
  return (
    <div
      aria-hidden
      className="washi"
      data-anchor={tape.anchor}
      style={
        {
          '--tape-top': `${tape.top}px`,
          '--tape-x': `${tape.offset}px`,
          '--tape-w': `${tape.width}px`,
          '--tape-h': `${tape.height}px`,
          '--tape-rot': `${tape.rotate}deg`,
          '--tape-a': tape.opacity,
        } as CSSProperties
      }
    />
  )
}
