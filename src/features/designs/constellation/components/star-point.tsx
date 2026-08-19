import { useTranslation } from 'react-i18next'

import type { Memory } from '../../data/memories'
import type { SkyPosition } from '../data/sky'

/**
 * One star: a 44px target with a 12px lit core inside it.
 *
 * The core is the size the design wants; the button is the size a thumb needs.
 * Separating them is the whole reason this is a `<button>` wrapping a `<span>`
 * rather than a styled dot — a 12px tap target is unusable, and growing the dot
 * to 44px would turn a star into a ball.
 *
 * The label above and the date below both live inside the button, so a screen
 * reader gets the memory's name and date from the accessible name rather than
 * from two floating text nodes it would read out of order.
 */
export function StarPoint({
  memory,
  at,
  lit,
  onOpen,
}: {
  memory: Memory
  at: SkyPosition
  lit: boolean
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const title = t(memory.keys.title)

  return (
    <button
      type="button"
      onClick={onOpen}
      data-lit={lit}
      aria-label={td('a11y.openStar', { title })}
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      className="d-star absolute z-[3] grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
    >
      <span
        aria-hidden
        className={`d-display absolute -top-5.5 left-1/2 -translate-x-1/2 text-[14px] whitespace-nowrap text-[var(--d-star)] italic transition-opacity [text-shadow:0_1px_6px_#000] ${
          lit ? 'opacity-95' : 'opacity-0'
        }`}
      >
        {title}
      </span>

      <span aria-hidden className="d-star-core relative size-3 rounded-full" />

      <span
        aria-hidden
        className="d-label absolute top-[30px] left-1/2 -translate-x-1/2 text-[9px] tracking-[0.08em] whitespace-nowrap text-[var(--d-silver)]/75 [text-shadow:0_1px_4px_#000]"
      >
        {t(memory.keys.shortDate)}
      </span>
    </button>
  )
}
