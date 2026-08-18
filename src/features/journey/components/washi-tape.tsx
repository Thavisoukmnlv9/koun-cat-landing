import type { CSSProperties } from 'react'

import type { WashiTape as WashiTapeRecord } from '../data/postcards'

/**
 * One strip of tape holding something to the page.
 *
 * Size, angle and opacity differ on every strip because a person stuck them on
 * one at a time; those numbers live on the card's data record and arrive here
 * as custom properties, since Tailwind compiles from source text and cannot see
 * a runtime value. The `.washi` class in globals.css turns them into a strip.
 *
 * The length and the offset carry a `%` and the height carries `px` — that is
 * the data record's distinction, not this component's invention. See the note
 * on `WashiTape` in data/postcards.ts for why a roll has a fixed width and a
 * variable length.
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
          '--tape-x': `${tape.offset}%`,
          '--tape-w': `${tape.width}%`,
          '--tape-h': `${tape.height}px`,
          '--tape-rot': `${tape.rotate}deg`,
          '--tape-a': tape.opacity,
        } as CSSProperties
      }
    />
  )
}
