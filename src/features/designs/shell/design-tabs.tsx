import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import { DESIGNS, type DesignId } from './registry'

/**
 * Whether a horizontally scrolling box has anything left of its left edge or
 * right of its right edge.
 *
 * Read from scroll position rather than guessed from a breakpoint, because
 * whether twelve tabs overflow depends on the width of the words in them, and
 * those are translated — the Lao labels are not the same length as the English
 * ones, and neither is what a reader who has scaled their text up will get.
 *
 * The listener is passive and writes two booleans, so a scroll that changes
 * neither costs one comparison and no render. `scrollWidth`/`clientWidth` are
 * layout reads, hence the ResizeObserver rather than a window resize handler:
 * the bar's own width changes when the header goes from two rows to one, which
 * a window listener would catch, but its *content* width changes when the
 * language does, which one would not.
 */
function useScrollEdges(ref: React.RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ start: false, end: false })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const measure = () => {
      // One pixel of slack: a fractional scroll offset, which is what a
      // trackpad and a `scrollIntoView` both leave behind, would otherwise
      // report an edge that is visually flush as still having something past
      // it, and the fade would never quite go away.
      const start = node.scrollLeft > 1
      const end = node.scrollLeft + node.clientWidth < node.scrollWidth - 1
      setEdges((was) => (was.start === start && was.end === end ? was : { start, end }))
    }

    measure()
    node.addEventListener('scroll', measure, { passive: true })

    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : undefined
    observer?.observe(node)

    return () => {
      node.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  }, [ref])

  return edges
}

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
  const settled = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(listRef)

  useEffect(() => {
    const index = DESIGNS.findIndex((d) => d.id === active)

    // The first pass jumps, every pass after it slides.
    //
    // Not a flourish either way. A smooth scroll is driven by the browser's
    // frame loop, which is paused while the document is hidden — so a page
    // opened in a background tab, or restored from one, would finish loading
    // with its selected tab still off-screen and nothing in the bar appearing
    // selected at all. On the first paint there is also nothing to animate
    // *from*: the reader has not seen the bar in any other position.
    const behavior = settled.current && !reduced ? 'smooth' : 'auto'
    settled.current = true

    const centre = (how: ScrollBehavior) =>
      refs.current[index]?.scrollIntoView({
        behavior: how,
        // `nearest` on the block axis, or scrolling the bar would also scroll
        // the whole page up to meet it.
        block: 'nearest',
        inline: 'center',
      })

    centre(behavior)

    // And again once the faces have arrived, because the first pass is too
    // early to be right.
    //
    // The bar is set in Courier Prime, which is a web font — so on a cold load
    // this effect measures twelve tabs in whatever the fallback monospace is,
    // scrolls to where the selected one is *then*, and never revisits it. Open
    // `#map` from a shared link on a phone and the tab bar arrives scrolled 43
    // pixels in, with "The Map" forty pixels past the right-hand edge and
    // nothing in view appearing selected at all — which is the exact failure
    // this centring exists to prevent, surviving in the one case it was
    // written for.
    //
    // `document.fonts.ready` is the honest signal for "the bar has stopped
    // changing size". It settles once, resolves immediately on a warm load,
    // and the guard drops the result if the tab changed while it was pending.
    let live = true
    void document.fonts?.ready.then(() => {
      if (live) centre('auto')
    })
    return () => {
      live = false
    }
    // `t` is in the dependency list for the same reason: switching to Lao
    // re-letters all twelve tabs, and twelve tabs of a different width put the
    // selected one somewhere new.
  }, [active, reduced, t])

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
      ref={listRef}
      role="tablist"
      aria-label={t('a11y.tablist')}
      data-overflow-start={edges.start || undefined}
      data-overflow-end={edges.end || undefined}
      className={cn(
        // Scrolls rather than wraps: eleven tabs do not fit across a 375px
        // phone, and a second row would push the design itself below the fold.
        //
        // `tabs-rail` is what says so. The bar carries no scrollbar — it is
        // chrome on a page made of paper — so on a phone the only thing
        // distinguishing "twelve tabs, four of them visible" from "four tabs"
        // was a word cut off at the edge, which reads as a broken layout rather
        // than as more to come. The rail fades whichever edge has something
        // beyond it, and only that edge: scrolled to the end, the last tab is
        // sharp again, so the fade always means the same thing.
        'tabs-rail flex snap-x snap-mandatory scrollbar-none gap-1 overflow-x-auto',
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
              // `min-h-11` rather than more padding: this is the site's only
              // navigation and it was 37px tall, which is under the 44px floor
              // both platforms set for a thumb. Padding would have moved the
              // underline with it; a minimum height leaves the label where it
              // was and grows the box around it.
              'font-label tracking-chip relative flex min-h-11 shrink-0 snap-start items-center px-3 text-[11px] whitespace-nowrap uppercase transition-colors',
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
