import { motion } from 'motion/react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { Postcard as PostcardRecord } from '../data/postcards'
import { useReveal } from '../hooks/use-reveal'
import { useScrollTilt } from '../hooks/use-scroll-tilt'

import { Picture } from './picture'
import { WashiTape } from './washi-tape'

/**
 * One postcard: a photograph and a caption on the front, a handwritten note on
 * the back, turning over on click.
 *
 * Two things here differ deliberately from the original page.
 *
 * The flip control is a real `<button>` — the "tap to read the back" line,
 * which was only ever styled text over a click handler bound to the whole card.
 * The card itself keeps its click handler as a pointer affordance, which is
 * fine now that a labelled, focusable control exists; what is not fine is a
 * card that a keyboard cannot open at all. The whole card is not the button
 * because its accessible name would then be every word printed on it.
 *
 * The card settles as it scrolls rather than on a one-shot transition — see
 * `useScrollTilt` for why it does not use `.reveal` like everything else — and
 * it declares the photograph it is holding so the cursor can carry it.
 *
 * And `backface-visibility` hides a face visually only. In the original, the
 * note on the back sat in the accessibility tree and could be selected with a
 * cursor while facing away from the reader — so a screen reader announced both
 * sides of every card at once. `inert` on the face that is turned away fixes
 * that, and it is the single biggest correctness gain in the port.
 */
export function Postcard({ card }: { card: PostcardRecord }) {
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState(false)
  const { ref, rotate, y } = useScrollTilt<HTMLElement>({
    from: card.enterTilt,
    to: card.tilt,
  })
  // The fade rides on the flip wrapper rather than the article so the two
  // observers do not have to share a ref, and so nothing competes with Motion
  // for the article's `transform`.
  const { ref: fadeRef, revealed } = useReveal<HTMLDivElement>()
  const backId = useId()

  const toggle = () => setFlipped((open) => !open)

  return (
    <motion.article
      ref={ref}
      data-cursor-src={`journey/${card.image}`}
      data-cursor-label={t(card.keys.date)}
      onClick={toggle}
      style={{ rotate, y }}
      className={cn(
        'perspective-card w-[min(88vw,430px)]',
        card.align === 'start' ? 'self-start' : 'self-end',
      )}
    >
      <div
        ref={fadeRef}
        data-flipped={flipped || undefined}
        data-revealed={revealed || undefined}
        className="flip-card card-fade relative cursor-pointer"
      >
        {/* ─── Front ─────────────────────────────────────────────────────── */}
        <div
          inert={flipped}
          className="card-front shadow-card relative px-5 pt-5 pb-6 backface-hidden"
        >
          {card.tapes.map((tape, index) => (
            <WashiTape key={index} tape={tape} />
          ))}

          <Picture
            name={`journey/${card.image}`}
            alt={t(card.keys.title)}
            className="aspect-photo bg-photo-bed w-full object-cover"
          />

          <div className="font-label text-label tracking-date text-muted-label mt-4 flex items-baseline justify-between gap-3 uppercase">
            <span>{t(card.keys.date)}</span>
            <span>{t(card.keys.place)}</span>
          </div>

          <h2 className="font-hand text-card-title text-ink-strong mt-2 mb-1.5 font-semibold">
            {t(card.keys.title)}
          </h2>

          <p className="text-prose text-ink text-pretty">{t(card.keys.caption)}</p>

          <button
            type="button"
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={t(flipped ? 'a11y.flipToFront' : 'a11y.flipToBack', { n: card.number })}
            onClick={(event) => {
              // The card toggles on click too; without stopping here the event
              // reaches it as well and the card flips twice, i.e. not at all.
              event.stopPropagation()
              toggle()
            }}
            className="font-label text-label-sm tracking-label text-accent hover:text-accent-strong mt-3.5 cursor-pointer uppercase"
          >
            {t('timeline.flipHint')}
          </button>
        </div>

        {/* ─── Back ──────────────────────────────────────────────────────── */}
        <div
          id={backId}
          inert={!flipped}
          className="card-back shadow-card-back absolute inset-0 flex rotate-y-180 flex-col px-6.5 pt-6.5 pb-6 backface-hidden"
        >
          <div className="font-label text-label-sm tracking-label text-muted-label border-rule-strong flex items-start justify-between border-b border-dashed pb-2.5 whitespace-nowrap uppercase">
            <span>{t('timeline.cardNumber', { n: card.number })}</span>
            <span className="border-accent/50 text-accent border px-[7px] py-1 whitespace-nowrap">
              {t(card.keys.shortDate)}
            </span>
          </div>

          <p className="font-hand text-note text-ink-soft mt-5 text-pretty">{t(card.keys.back)}</p>
        </div>
      </div>
    </motion.article>
  )
}
