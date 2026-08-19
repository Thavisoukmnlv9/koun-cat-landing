import { MotionConfig } from 'motion/react'

import { I18nProvider } from '@/app/providers/i18n-provider'
import { PhotoCursor } from '@/components/photo-cursor'
import { DesignsPage } from '@/features/designs/designs-page'

/**
 * Composition root. The site is a single static page, so there is no router,
 * no data layer, and no auth — just the i18n provider around the page.
 *
 * That page is now `DesignsPage`, a tab bar over six of them: the finished
 * journey and the five design variants it is being weighed against. The tab
 * lives in `location.hash`, which is as much routing as comparing six layouts
 * needs — no dependency, and each design is still a link you can send.
 *
 * `MotionConfig reducedMotion="user"` is the JavaScript counterpart of the
 * `@media (prefers-reduced-motion: no-preference)` guard that wraps every
 * transition in globals.css. Motion animations opt in to movement rather than
 * out of it: with this set, transforms are dropped for a visitor who has asked
 * for less motion while opacity and colour still cross-fade, so nothing on the
 * page goes missing — it simply stops moving.
 *
 * The cursor is a sibling of the page rather than a child of it because it is
 * a fixed overlay over the whole document, and because it must survive being
 * above the lightbox, which portals to <body>.
 */
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <DesignsPage />
        <PhotoCursor />
      </I18nProvider>
    </MotionConfig>
  )
}
