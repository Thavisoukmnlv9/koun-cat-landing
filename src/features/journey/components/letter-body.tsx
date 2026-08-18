import type { ComponentType, CSSProperties, RefObject } from 'react'

import { usePrefersReducedMotion } from '@/lib/hooks'

interface LetterBodyProps {
  /** From `useTypewriter` — the node the line is written into. */
  typeRef: RefObject<HTMLElement | null>
  done: boolean
  /**
   * The speech library's own element, which holds the letter's real copy.
   * Always rendered, whether or not the device can actually speak.
   */
  Text: ComponentType<{ className?: string; style?: CSSProperties }>
}

/**
 * The reading surface: one letter, written twice, in one grid cell.
 *
 * Two libraries want to own this text and neither can share it. `useTypewriter`
 * writes `textContent` from a Motion frame callback; `react-text-to-speech`
 * rewrites the same property from a layout effect to wrap the spoken words in a
 * mark. Given one node between them, the typewriter erases the highlight on its
 * next frame and the highlight's cleanup — which restores a snapshot of the
 * whole string — erases the typewriter. So they get a node each, stacked.
 *
 * The speech layer is the real one, and it is present from the first paint:
 *
 *   - it holds the surface's height, so the sheet never grows line by line. The
 *     sheet is a shared-layout element, so a height that changes while you read
 *     would walk the whole reading surface down the screen;
 *   - it is the copy assistive technology reads, whole and at once. There is no
 *     live region anywhere in this feature and there must never be one: a node
 *     rewritten every forty milliseconds would queue hundreds of announcements
 *     and read the letter one grapheme at a time, growing, forever.
 *
 * It is `opacity` zero while the typing runs rather than `visibility: hidden`,
 * because hidden would take it out of the accessibility tree — the one job it
 * is doing.
 *
 * The typed layer is `aria-hidden` and unmounts the moment it is done, so the
 * hand-over is a single frame with no cross-fade. That is deliberate: the two
 * layers are the same words in the same face at the same size, and cross-fading
 * identical text dips through grey in the middle, which reads as the whole
 * letter flickering.
 *
 * `Text` is never given React-managed children — props only — because the
 * library mutates that div's contents itself.
 */
export function LetterBody({ typeRef, done, Text }: LetterBodyProps) {
  const reduced = usePrefersReducedMotion()
  // Read here as well as in the hook: `done` is false for one paint under
  // reduced motion, and that paint would be a blank sheet.
  const typing = !reduced && !done

  return (
    <div className="text-letter text-ink mt-5 grid text-pretty">
      <Text
        className="whitespace-pre-line [grid-area:1/1]"
        style={typing ? { opacity: 0 } : undefined}
      />

      {typing && (
        <div aria-hidden data-typed className="whitespace-pre-line [grid-area:1/1]">
          <span ref={typeRef} />
          <span className="animate-caret text-accent">|</span>
        </div>
      )}
    </div>
  )
}
