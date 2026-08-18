import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AlbumSection } from './components/album-section'
import { AskSection } from './components/ask-section'
import { JourneyHeader } from './components/journey-header'
import { LanguageSwitcher } from './components/language-switcher'
import { ReelSection } from './components/reel-section'
import { TimelineSection } from './components/timeline-section'

/**
 * Keeps the document title and meta description in step with the active
 * language. With no router and no SSR this is the whole of the page's metadata
 * handling; `<html lang>` is already maintained by the font preloader.
 */
function useDocumentMeta() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('meta.title')
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'))
  }, [t, i18n.resolvedLanguage])
}

export function JourneyPage() {
  const { t } = useTranslation()
  useDocumentMeta()

  return (
    // The paper ground sits here rather than on <body> because it also needs to
    // clip the cards, which overhang the viewport while they are still tilted.
    <div className="paper-ground font-body relative min-h-screen overflow-x-hidden">
      {/* There is no header chrome to hang the switcher on, so it floats in the
          corner — small, and out of the way of the title. */}
      <LanguageSwitcher className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6" />

      <main>
        <JourneyHeader />
        <TimelineSection />
        <AlbumSection />
        <ReelSection />
        <AskSection />
      </main>

      <footer className="pt-5.5 pb-[clamp(90px,14vw,180px)] text-center">
        <p className="font-hand text-polaroid text-ink-faint">{t('footer.line')}</p>
      </footer>
    </div>
  )
}
