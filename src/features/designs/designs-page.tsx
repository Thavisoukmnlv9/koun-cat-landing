import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/features/journey/components/language-switcher'
import { usePrefersReducedMotion } from '@/lib/hooks'

import { DesignTabs } from './shell/design-tabs'
import { DEFAULT_DESIGN, DESIGNS, toDesignId, type DesignId } from './shell/registry'

/**
 * Keeps the document title and description in step with the language, the way
 * `journey-page` used to for itself. It moves up here because the page is now
 * eleven pages behind a tab bar, and two components writing `document.title` is
 * a race decided by render order.
 */
function useDocumentMeta() {
  const { t, i18n } = useTranslation('designs')

  useEffect(() => {
    document.title = t('meta.title')
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'))
  }, [t, i18n.resolvedLanguage])
}

/**
 * Reads and writes the active design through `location.hash`.
 *
 * The site has no router and does not want one for this — but a tab that resets
 * on every reload is a tab you cannot send to anyone, and comparing eleven
 * designs means reloading a lot. The hash is the whole of the persistence: it survives a
 * refresh, it makes each design a link, and it costs one listener.
 */
function useHashDesign(): [DesignId, (id: DesignId) => void] {
  const [active, setActive] = useState<DesignId>(
    () => toDesignId(typeof location === 'undefined' ? '' : location.hash) ?? DEFAULT_DESIGN,
  )

  useEffect(() => {
    const onHashChange = () => setActive(toDesignId(location.hash) ?? DEFAULT_DESIGN)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const select = (id: DesignId) => {
    setActive(id)
    // `replaceState` rather than assigning `location.hash`: eleven tabs
    // explored back and forth would otherwise bury the page the visitor arrived
    // on under dozens of history entries.
    history.replaceState(null, '', id === DEFAULT_DESIGN ? location.pathname : `#${id}`)
  }

  return [active, select]
}

/**
 * Publishes the sticky header's height as `--designs-header` on the page root.
 *
 * A design that wants a full-screen section cannot simply ask for `100svh`: the
 * tab bar is sticky and sits over the top of it, so the last few rem of every
 * such section fall below the fold. That is harmless in the middle of a scroll
 * — you can always scroll further — but on the *first* screen there is nothing
 * to scroll up from, and the storybook's "scroll to begin" cue sat permanently
 * out of sight because of it.
 *
 * The height cannot be hard-coded because the header is two rows on a phone and
 * one from `sm:` up, and it cannot be expressed in CSS alone because no
 * selector reaches from a section back up to a sibling's box. So it is measured
 * — once, and again whenever it changes — and written where any design can read
 * it as `calc(100svh - var(--designs-header, 0px))`.
 */
function useHeaderHeight(root: React.RefObject<HTMLDivElement | null>) {
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = header.current
    const target = root.current
    if (!element || !target || typeof ResizeObserver !== 'function') return

    const publish = () => target.style.setProperty('--designs-header', `${element.offsetHeight}px`)

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(element)
    return () => observer.disconnect()
  }, [root])

  return header
}

export function DesignsPage() {
  const { t } = useTranslation('designs')
  const reduced = usePrefersReducedMotion()
  const [active, select] = useHashDesign()
  const rootRef = useRef<HTMLDivElement>(null)
  const headerRef = useHeaderHeight(rootRef)
  useDocumentMeta()

  // Each design is a full page of its own, so arriving at one halfway down is
  // arriving in the middle of somebody's story.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [active, reduced])

  const entry = DESIGNS.find((d) => d.id === active) ?? DESIGNS[0]
  const { Component } = entry

  return (
    <div ref={rootRef} className="bg-paper min-h-screen">
      {/* The bar stays put: it is the only way back out of a design, and every
          one of them is several screens tall. */}
      <header
        ref={headerRef}
        className="border-rule/40 bg-paper/85 sticky top-0 z-[70] border-b backdrop-blur-md"
      >
        {/* Two rows on a phone, one on anything wider. Eleven tabs and a
            language switcher come to roughly 1000px of content, so sharing a
            375px row left the tabs clipped mid-word — which reads as broken
            rather than as scrollable. Given a full row of their own they still
            scroll, but the cut falls between tabs where it looks deliberate. */}
        <div className="max-w-page mx-auto flex flex-col px-2 sm:flex-row sm:items-center sm:gap-2 sm:px-4">
          <div className="order-1 flex justify-end sm:order-2">
            <LanguageSwitcher className="shrink-0" />
          </div>
          <DesignTabs
            active={active}
            onSelect={select}
            className="order-2 min-w-0 flex-1 sm:order-1"
          />
        </div>
      </header>

      {/* A plain <main>, with no entrance animation on the panel itself.

          Two reasons, and the second is the one that decided it. A crossfade
          needs something to fade against, and there is nothing: only one design
          is ever mounted, and the page scrolls back to the top on every change.
          More importantly, an opacity animation is driven by
          `requestAnimationFrame`, which the browser pauses whenever the document
          is hidden — so a panel that is only visible once its animation has run
          renders as a blank page in a backgrounded tab and stays blank until the
          tab is looked at. Making a design's visibility depend on a frame loop
          buys a 240ms fade and risks the whole page.

          The designs are not motionless as a result. Each brings its own
          entrance — the map's stops reveal on scroll, the filmstrip's frames
          settle, and the tab underline travels between tabs on a `layoutId`. */}
      {/* The panel is a child of <main> rather than <main> itself.
          `role="tabpanel"` on a <main> is not an addition to it — an explicit
          role replaces the implicit one, so the whole site had a banner
          landmark and nothing else, and a screen-reader reader jumping by
          landmark had no way to get past the tab bar to the page. Nesting the
          two keeps both: <main> is the landmark, the div inside it is what the
          tabs control and what takes focus. */}
      <main>
        <div
          key={active}
          id={`design-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`design-tab-${active}`}
          tabIndex={-1}
          data-design={active}
        >
          <Component />
        </div>
      </main>

      <span className="sr-only" aria-live="polite">
        {t(entry.labelKey)}
      </span>
    </div>
  )
}
