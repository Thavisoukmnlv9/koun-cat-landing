import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { HEADER_POLAROID } from '../data/postcards'
import { useReveal } from '../hooks/use-reveal'

import { Picture } from './picture'
import { WashiTape } from './washi-tape'

/**
 * The single taped-up photograph under the title.
 *
 * It is the only image on the page outside the timeline and the album, and it
 * is doing one job: telling the reader within the first screen what kind of
 * page this is before they have scrolled to a single postcard.
 */
export function Polaroid() {
  const { t } = useTranslation()
  const { ref, revealed } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      data-revealed={revealed || undefined}
      data-cursor-src={`journey/${HEADER_POLAROID.image}`}
      data-cursor-label={t('header.polaroidCaption')}
      className="reveal relative mt-1.5 w-[min(78vw,300px)]"
      style={
        {
          '--enter-tilt': `${HEADER_POLAROID.enterTilt}deg`,
          '--tilt': `${HEADER_POLAROID.tilt}deg`,
          '--reveal-y': `${HEADER_POLAROID.revealY}px`,
        } as CSSProperties
      }
    >
      <WashiTape tape={HEADER_POLAROID.tape} />
      <div className="bg-paper-card shadow-polaroid px-3 pt-3 pb-11">
        {/* `priority`, which is what the paragraph above is describing: this is
            the one image on this page that is on screen before anyone has
            scrolled, and `#journey` is a link people are meant to send. It was
            being deferred like the ten postcards below it, so the first screen
            of the finished page finished loading last. */}
        <Picture
          name={`journey/${HEADER_POLAROID.image}`}
          alt={t('header.polaroidAlt')}
          priority
          className="aspect-photo bg-photo-bed w-full object-cover"
        />
        <p className="font-hand text-polaroid text-ink-caption mt-3">
          {t('header.polaroidCaption')}
        </p>
      </div>
    </div>
  )
}
