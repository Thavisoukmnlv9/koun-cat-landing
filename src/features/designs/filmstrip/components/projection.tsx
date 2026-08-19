import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/modal'
import { Picture } from '@/features/journey/components/picture'
import { useTypewriter } from '@/features/journey/hooks/use-typewriter'

import { AudioNote } from '../../components/audio-note'
import { FILM_SRC, type Memory } from '../../data/memories'

/**
 * A frame projected full-screen, with its story typed out underneath.
 *
 * The typewriter is journey's, which already solved the parts the prototype's
 * `setInterval(…, 16)` did not: it splits on graphemes rather than code units,
 * so Lao's combining marks land as one keystroke instead of coming apart; it
 * varies the rhythm around punctuation; and it short-circuits to the full text
 * under reduced motion rather than typing at an unreadable speed.
 */
export function Projection({
  memory,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  memory: Memory | null
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const { t, i18n } = useTranslation()
  const { t: td } = useTranslation('designs')
  const titleId = useId()

  const story = memory ? t(memory.keys.back) : ''
  const typed = useTypewriter(story, i18n.resolvedLanguage ?? 'en')

  return (
    <Modal
      open={memory !== null}
      onClose={onClose}
      labelledBy={titleId}
      // The design's scope class has to be repeated here. `Modal` portals its
      // panel to <body>, which is outside the `.d-*` element that declares this
      // design's palette — so every `var(--d-…)` inside would resolve to
      // nothing and the card would inherit the page's colours instead. The
      // class travels with the content that needs it.
      className="d-filmstrip w-full max-w-[560px]"
    >
      {memory && (
        <div className="d-filmstrip rounded-[3px] bg-[var(--d-plate)] p-3 shadow-[0_30px_80px_rgb(0_0_0_/_0.6)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            {memory.kind === 'film' ? (
              <video
                src={FILM_SRC}
                poster={`/images/journey/${memory.image}.jpg`}
                controls
                autoPlay
                playsInline
                className="size-full object-contain"
              />
            ) : (
              <Picture
                name={`journey/${memory.image}`}
                alt={t(memory.keys.title)}
                className="d-film-look size-full object-cover"
              />
            )}
          </div>

          {memory.kind === 'voice' && (
            <AudioNote
              label={t('sound.title')}
              className="mt-3 text-[var(--d-gold-soft)]"
              barClassName="bg-[var(--d-gold)]/25"
            />
          )}

          <p className="d-label mt-4 text-[10px] tracking-[0.22em] text-[var(--d-gold)] uppercase">
            {t(memory.keys.date)}
          </p>
          <h2
            id={titleId}
            className="d-display text-[26px] leading-tight text-[var(--d-cream)] italic"
          >
            {t(memory.keys.title)}
          </h2>

          {/* The ref lands on the paragraph; the hook owns its textContent. */}
          <p
            ref={typed.ref as React.RefObject<HTMLParagraphElement>}
            className="d-body mt-2.5 min-h-[5.5em] text-[15px] leading-relaxed text-[#c9b79a]"
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrev}
              className="d-label text-[11px] tracking-[0.18em] text-[var(--d-gold)] uppercase"
            >
              {td('filmstrip.prev')}
            </button>

            <span className="d-label text-[11px] tracking-[0.2em] text-[#8f7a5f]">
              {td('filmstrip.count', { current: String(index + 1), total: String(total) })}
            </span>

            <button
              type="button"
              onClick={onNext}
              className="d-label text-[11px] tracking-[0.18em] text-[var(--d-gold)] uppercase"
            >
              {td('filmstrip.next')}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3 -right-3 grid size-9 place-items-center rounded-full bg-[var(--d-gold)] text-[var(--d-espresso)]"
          >
            <span aria-hidden>✕</span>
            <span className="sr-only">{td('a11y.closeFrame')}</span>
          </button>
        </div>
      )}
    </Modal>
  )
}
