import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'

import { ALBUM_PLATES } from '../data/album'

import { Picture } from './picture'

/**
 * How far each frame leans, in degrees, and how far it has straightened by the
 * time the strip is fully on screen.
 *
 * Authored rather than generated, for the reason `data/postcards.ts` sets out
 * at length: a `Math.random()` would re-roll on every render, and a frame
 * re-renders whenever the lightbox opens — so the strip would visibly reshuffle
 * itself the moment you touched it. Six numbers, no two alike, none of them
 * zero, because a contact strip that is perfectly square reads as printed
 * rather than as something that was cut and laid out by hand.
 */
const LEANS = [-3.1, 2.2, -1.4, 2.8, -2.3, 1.6]

/**
 * The contact strip: all six plates at once, under the book.
 *
 * It exists because the album can only ever show you one plate, and because the
 * lightbox needs somewhere for a photograph to travel *from* — a shared layout
 * animation is only legible if the reader can see both ends of it.
 *
 * Why the strip rather than the open plate in the book: `album-book.tsx` covers
 * the whole board with two full-height paging halves, so a click on the
 * photograph never reaches the photograph. A third click region stacked over
 * those two would make the most delicate thing on the page ambiguous to use.
 * Here every frame is a plain labelled button and the book is untouched.
 */
export function PlateIndex({ onOpen }: { onOpen: (index: number) => void }) {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // One scroll subscription for the whole strip, read six times. Six separate
  // ones would measure the same rectangle six times a frame for no gain.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center 70%'],
  })

  return (
    <div className="mt-1 flex flex-col items-center gap-3.5">
      <p className="font-label text-label-sm tracking-label text-muted-hint uppercase">
        {t('album.index.label')}
      </p>

      <div ref={ref} className="flex flex-wrap items-start justify-center gap-3 sm:gap-4">
        {ALBUM_PLATES.map((plate, index) => (
          <PlateFrame
            key={plate.id}
            index={index}
            progress={scrollYProgress}
            reduced={reduced}
            title={t(plate.keys.title)}
            image={plate.image}
            id={plate.id}
            onOpen={() => onOpen(index)}
          />
        ))}
      </div>

      <p className="font-hand text-polaroid text-ink-faint text-center">{t('album.index.hint')}</p>
    </div>
  )
}

function PlateFrame({
  index,
  progress,
  reduced,
  title,
  image,
  id,
  onOpen,
}: {
  index: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  reduced: boolean
  title: string
  image: string
  id: string
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const lean = LEANS[index % LEANS.length]
  // Straightens to a third of its entry lean rather than to zero, so the strip
  // keeps a residual unevenness once it has arrived.
  const rotate = useTransform(progress, [0, 1], [lean, lean / 3])

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={t('a11y.openPlate', { title })}
      data-cursor-src={`journey/${image}`}
      data-cursor-label={title}
      style={reduced ? undefined : { rotate }}
      whileHover={reduced ? undefined : { scale: 1.06, y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.2, 0.75, 0.2, 1] }}
      className="plate-frame w-[clamp(64px,13vw,104px)] shrink-0 cursor-pointer px-1.5 py-1"
    >
      {/* The photo is the shared element. `layoutId` is on this wrapper rather
          than the <img> so Motion animates one box rather than fighting the
          image's own intrinsic sizing on the way up. */}
      <motion.div layoutId={`plate-${id}`} className="aspect-photo bg-photo-bed overflow-hidden">
        <Picture name={`journey/${image}`} alt="" className="size-full object-cover" />
      </motion.div>
    </motion.button>
  )
}
