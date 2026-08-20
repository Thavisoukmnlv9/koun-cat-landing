import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { memoriesFor, type Memory } from '../data/memories'

import { PolaroidPin } from './components/polaroid-pin'
import { WallLightbox } from './components/wall-lightbox'

const COUNT = 8

/**
 * IV · Pinned & Kept — a linen wall of taped polaroids.
 *
 * The only one of the five composed for eight memories rather than six, and the
 * only one whose layout is a CSS column flow: `columns` gives real masonry with
 * no measuring and no JavaScript, at the cost of ordering down each column
 * rather than across the rows. That is the right trade for a wall, where nobody
 * reads in sequence.
 */
export function GalleryDesign() {
  const { t } = useTranslation('designs')
  const [lifted, setLifted] = useState<Memory | null>(null)
  const memories = memoriesFor(COUNT)

  return (
    <div className="d-gallery d-body min-h-screen bg-[var(--d-bg)] pb-24 text-[var(--d-charcoal)]">
      <header className="mx-auto max-w-[600px] px-5 pt-12 text-center">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[var(--d-gold-ink)] uppercase">
          {t('gallery.eyebrow')}
        </p>

        <h1 className="d-display mt-2 text-[clamp(40px,12vw,58px)] leading-none">
          {t('gallery.titleA')}{' '}
          <em className="text-[var(--d-blush)]">{t('gallery.titleAccent')}</em>
        </h1>

        <p className="d-script mt-1 -rotate-3 text-[30px] leading-tight text-[var(--d-sage)]">
          {t('gallery.scribble')}
        </p>

        <span
          aria-hidden
          className="mx-auto mt-5 block h-px w-4/5 border-t-2 border-dashed border-[var(--d-gold)]/45"
        />

        <p className="mt-4 text-[11px] font-bold tracking-[0.16em] text-[var(--d-charcoal)]/55 uppercase">
          {t('gallery.instr')}
        </p>
      </header>

      <div className="mx-auto mt-9 max-w-[600px] columns-2 gap-4 px-4 sm:columns-3">
        {memories.map((memory, index) => (
          <PolaroidPin
            key={memory.id}
            memory={memory}
            index={index}
            onLift={() => setLifted(memory)}
          />
        ))}
      </div>

      <footer className="mt-10 text-center">
        <p className="d-script text-[26px] text-[var(--d-charcoal)]/65">{t('gallery.footer')}</p>
        <p className="mt-1 text-[10px] tracking-[0.18em] text-[var(--d-charcoal)]/40 uppercase">
          {t('gallery.count')}
        </p>
      </footer>

      <WallLightbox memory={lifted} onClose={() => setLifted(null)} />
    </div>
  )
}
