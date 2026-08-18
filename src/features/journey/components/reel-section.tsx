import { useTranslation } from 'react-i18next'

import { useReveal } from '../hooks/use-reveal'

import { FilmReel } from './film-reel'
import { OpticalTrack } from './optical-track'
import { Reel } from './reel'

/**
 * Where the archive starts moving.
 *
 * It sits between the album and the letter because that is the order the page
 * already implies: ten postcards, six album plates, then the one thing that
 * moves, then the ask. The last postcard says there is one more card after it —
 * this is what you keep going to.
 *
 * Picture and sound are two objects rather than one apparatus, and both can run
 * at once. They are set apart deliberately: two strips stacked close together
 * would read as a repeated motif rather than as a projector and the record
 * beside it.
 *
 * Vite serves `public/` verbatim from the root, so these are plain paths —
 * the same way Picture references `/images/...`.
 */
const REEL_SRC = '/videos/summertime_sadness.mp4'
const SOUND_SRC = '/music/summertime_sadness.mp3'

export function ReelSection() {
  const { t } = useTranslation()
  const { ref, revealed } = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      data-revealed={revealed || undefined}
      className="reveal max-w-page mx-auto flex flex-col items-center gap-[22px] px-6 pt-[clamp(40px,7vw,90px)] pb-[clamp(20px,4vw,50px)]"
    >
      <p className="font-label text-label tracking-section text-muted uppercase">
        {t('reel.kicker')}
      </p>

      {/* The reel and the title sit on one line so the reel reads as the
          take-up spool of the projector below rather than as an ornament
          floating beside the heading. It drops out below 640px, where there is
          no room for it that does not push the title off-centre. */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <FilmReel className="hidden size-[clamp(46px,7vw,74px)] shrink-0 sm:block" />
        <h2 className="font-hand text-album text-ink-strong font-semibold">{t('reel.title')}</h2>
        <FilmReel className="hidden size-[clamp(46px,7vw,74px)] shrink-0 sm:block" />
      </div>

      <Reel src={REEL_SRC} className="mt-2.5 w-[min(94vw,900px)]" />

      <p className="font-hand text-polaroid text-ink-faint mt-1 text-center text-pretty">
        {t('reel.note')}
      </p>

      <OpticalTrack src={SOUND_SRC} className="mt-[clamp(18px,3.5vw,38px)] w-[min(94vw,900px)]" />
    </section>
  )
}
