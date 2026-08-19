import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/features/journey/components/language-switcher'
import { usePrefersReducedMotion } from '@/lib/hooks'

import { DesignTabs } from './shell/design-tabs'
import { DEFAULT_DESIGN, DESIGNS, toDesignId, type DesignId } from './shell/registry'

/**
 * Keeps the document title and description in step with the language, the way
 * `journey-page` used to for itself. It moves up here because the page is now
 * six pages behind a tab bar, and two components writing `document.title` is a
 * race decided by render order.
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
 * on every reload is a tab you cannot send to anyone, and comparing six designs
 * means reloading a lot. The hash is the whole of the persistence: it survives a
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
    // `replaceState` rather than assigning `location.hash`: six tabs explored
    // back and forth would otherwise bury the page the visitor arrived on under
    // a dozen history entries.
    history.replaceState(null, '', id === DEFAULT_DESIGN ? location.pathname : `#${id}`)
  }

  return [active, select]
}

export function DesignsPage() {
  const { t } = useTranslation('designs')
  const reduced = usePrefersReducedMotion()
  const [active, select] = useHashDesign()
  useDocumentMeta()

  // Each design is a full page of its own, so arriving at one halfway down is
  // arriving in the middle of somebody's story.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [active, reduced])

  const entry = DESIGNS.find((d) => d.id === active) ?? DESIGNS[0]
  const { Component } = entry

  return (
    <div className="bg-paper min-h-screen">
      {/* The bar stays put: it is the only way back out of a design, and every
          one of them is several screens tall. */}
      <header className="border-rule/40 bg-paper/85 sticky top-0 z-[70] border-b backdrop-blur-md">
        {/* Two rows on a phone, one on anything wider. Six tabs and a language
            switcher come to about 510px of content, so sharing a 375px row left
            the tabs clipped mid-word — which reads as broken rather than as
            scrollable. Given a full row of their own they still scroll, but the
            cut falls between tabs where it looks deliberate. */}
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

      {/* `mode="wait"` so the outgoing design is gone before the next arrives.
          Only the active one is mounted at all — five designs at once would mean
          five scroll observers, a projector loop and a self-measuring SVG all
          running for panels nobody is looking at, and the map in particular
          cannot measure a subtree that has never been laid out. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={active}
          id={`design-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`design-tab-${active}`}
          tabIndex={-1}
          data-design={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
        >
          <Component />
        </motion.main>
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {t(entry.labelKey)}
      </span>
    </div>
  )
}
