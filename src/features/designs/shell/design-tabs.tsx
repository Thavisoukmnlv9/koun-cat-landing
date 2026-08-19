import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import { DESIGNS, type DesignId } from './registry'

/**
 * The header tab bar.
 *
 * Hand-rolled, because the project has no headless UI library and adding one
 * for eleven buttons would be more dependency than component — the same call
 * `modal.tsx` made for the dialog. What that costs is the keyboard contract,
 * which a real tablist owes and which is implemented here rather than assumed:
 * roving `tabIndex` so the group is a single tab stop, arrow keys to move
 * between tabs, Home and End to jump to the ends.
 *
 * Eleven tabs are far wider than any phone, so the bar scrolls — and a
 * scrolling tablist owes one more thing: the selected tab has to be *visible*.
 * Arrow-keying to a tab off the right-hand edge, or arriving on one from a
 * `#hash` in a shared link, both leave the active tab out of frame with no
 * indication anything is selected at all. So the active tab is scrolled into
 * view whenever it changes, from wherever the change came from.
 *
 * The moving underline is a `layoutId`, so it travels between tabs rather than
 * fading in a new place. It is safe to animate here in a way the lightbox's
 * shared id was not — see `modal.tsx` — because nothing about this element ever
 * unmounts while an `AnimatePresence` exit is in flight.
 */
export function DesignTabs({
  active,
  onSelect,
  className,
}: {
  active: DesignId
  onSelect: (id: DesignId) => void
  className?: string
}) {
  const { t } = useTranslation('designs')
  const reduced = usePrefersReducedMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const index = DESIGNS.findIndex((d) => d.id === active)
    refs.current[index]?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      // `nearest` on the block axis, or scrolling the bar would also scroll the
      // whole page up to meet it.
      block: 'nearest',
      inline: 'center',
    })
  }, [active, reduced])

  const move = (from: number, delta: number) => {
    const next = (from + delta + DESIGNS.length) % DESIGNS.length
    onSelect(DESIGNS[next].id)
    refs.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const jump = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : undefined

    if (jump !== undefined) {
      event.preventDefault()
      move(index, jump)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const target = event.key === 'Home' ? 0 : DESIGNS.length - 1
      onSelect(DESIGNS[target].id)
      refs.current[target]?.focus()
    }
  }

  return (
    <div
      role="tablist"
      aria-label={t('a11y.tablist')}
      className={cn(
        // Scrolls rather than wraps: eleven tabs do not fit across a 375px
        // phone, and a second row would push the design itself below the fold.
        'flex snap-x snap-mandatory scrollbar-none gap-1 overflow-x-auto',
        className,
      )}
    >
      {DESIGNS.map((design, index) => {
        const selected = design.id === active
        return (
          <button
            key={design.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            role="tab"
            type="button"
            id={`design-tab-${design.id}`}
            aria-selected={selected}
            aria-controls={`design-panel-${design.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(design.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'font-label tracking-chip relative shrink-0 snap-start px-3 py-2.5 text-[11px] whitespace-nowrap uppercase transition-colors',
              selected ? 'text-ink-strong' : 'text-muted hover:text-ink',
            )}
          >
            {t(design.labelKey)}
            {selected && (
              <motion.span
                layoutId="design-tab-underline"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="bg-accent absolute inset-x-2 -bottom-px h-0.5 rounded-full"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
