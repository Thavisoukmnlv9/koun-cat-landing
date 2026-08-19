import { useTranslation } from 'react-i18next'

import { AlbumSection } from './components/album-section'
import { AskSection } from './components/ask-section'
import { JourneyHeader } from './components/journey-header'
import { ReelSection } from './components/reel-section'
import { TimelineSection } from './components/timeline-section'

/**
 * The journey page — now the first of six tabs rather than the whole site.
 *
 * Two things it used to own moved up to `DesignsPage` when it did: the document
 * title, because six pages writing `document.title` is a race decided by render
 * order, and the language switcher, because it has to be reachable from every
 * design and not just this one. Nothing else changed — this is still the page
 * the other five are alternatives to.
 */
export function JourneyPage() {
  const { t } = useTranslation()

  return (
    // The paper ground sits here rather than on <body> because it also needs to
    // clip the cards, which overhang the viewport while they are still tilted.
    <div className="paper-ground font-body relative min-h-screen overflow-x-hidden">
      <div>
        <JourneyHeader />
        <TimelineSection />
        <AlbumSection />
        <ReelSection />
        <AskSection />
      </div>

      <footer className="pt-5.5 pb-[clamp(90px,14vw,180px)] text-center">
        <p className="font-hand text-polaroid text-ink-faint">{t('footer.line')}</p>
      </footer>
    </div>
  )
}
