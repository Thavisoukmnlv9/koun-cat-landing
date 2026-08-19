import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/** The rubber stamp's year, pulled off whatever shape the date is written in. */
function yearOf(date: string): string {
  return /\d{4}/.exec(date)?.[0] ?? ''
}

/**
 * One airmail postcard, photograph on the front and the note on the back.
 *
 * The turn is CSS, not Motion, and that is journey's `.flip-card` doing the
 * work — `preserve-3d` on the inner box, `rotateY(180deg)` when `data-flipped`
 * is set, and the transition itself wrapped in `prefers-reduced-motion:
 * no-preference`. Which is the property that made it worth reusing: a visitor
 * who has asked for less motion still gets a card that turns over, it simply
 * turns over at once. Animating `rotateY` through Motion instead would have
 * been dropped entirely under `reducedMotion="user"`, and the back of the card
 * would have become unreachable for the people most likely to need it plainly.
 *
 * The flip control is the "turn over" line rather than the whole card, for the
 * reason journey's postcard gives: a card-sized button swallows the audio
 * scrubber and the film's controls sitting inside it.
 */
export function FlipPostcard({ memory }: { memory: Memory }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const [flipped, setFlipped] = useState(false)
  const backId = useId()

  const place = t(memory.keys.place)

  return (
    <article className="perspective-card">
      <div
        data-flipped={flipped || undefined}
        className="flip-card relative aspect-[3/3.9] w-full sm:aspect-[3/2.1]"
      >
        {/* ── Front ─────────────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[3px] border border-[var(--d-line)] bg-[var(--d-paper)] p-2.5 shadow-[0_10px_26px_var(--d-shadow)] backface-hidden">
          <div className="relative min-h-0 flex-1 shrink overflow-hidden bg-[var(--color-photo-bed)]">
            {memory.kind === 'film' ? (
              <video
                src={FILM_SRC}
                poster={`/images/journey/${memory.image}.jpg`}
                controls
                playsInline
                className="size-full object-cover"
              />
            ) : (
              <Picture
                name={`journey/${memory.image}`}
                alt={place}
                className="size-full object-cover"
              />
            )}

            <MediaChip
              kind={memory.kind}
              className="d-body absolute top-2.5 left-2.5 rounded-full bg-[var(--d-ink)]/85 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-[var(--d-paper)] uppercase"
            />

            {/* The postmark is printed over the photograph, so it multiplies
                into it rather than sitting on top as a sticker would. */}
            <div
              aria-hidden
              className="d-body absolute top-2.5 right-2.5 grid size-[74px] -rotate-12 place-items-center rounded-full border-2 border-[var(--d-red)]/70 text-center text-[9px] leading-tight font-bold tracking-[0.1em] text-[var(--d-red)]/80 uppercase mix-blend-multiply"
            >
              <span>
                Our
                <br />
                Journey
                <br />·{yearOf(t(memory.keys.date))}·
              </span>
            </div>
          </div>

          {/* Everything here is in normal flow rather than absolutely placed.
              The prototype hung the flip hint in the bottom-right corner, which
              worked while every place was two short words — "The Rooftop", "By
              the Sea". These places are real and some of them are long, and
              "Coffee shop, downtown" ran straight through the hint. */}
          <div className="flex shrink-0 flex-col pt-3">
            <p className="d-body text-[10px] font-bold tracking-[0.18em] text-[var(--d-blue)] uppercase">
              {td(memory.flavour.greet)}
            </p>
            <h3 className="d-display mt-0.5 text-[clamp(20px,5.5vw,26px)] leading-tight font-semibold text-balance text-[var(--d-ink)] italic">
              {place}
            </h3>

            <button
              type="button"
              aria-expanded={flipped}
              aria-controls={backId}
              aria-label={td('a11y.flipCard', { title: place })}
              onClick={() => setFlipped(true)}
              className="d-hand mt-1 self-end text-[17px] text-[var(--d-red)]"
            >
              {td('postcards.flipHint')}
            </button>
          </div>
        </div>

        {/* ── Back ──────────────────────────────────────────────────────── */}
        <div
          id={backId}
          className="absolute inset-0 flex rotate-y-180 gap-4 overflow-hidden rounded-[3px] border border-[var(--d-line)] bg-[var(--d-paper-2)] p-4 shadow-[0_10px_26px_var(--d-shadow)] backface-hidden"
        >
          <div className="flex min-w-0 flex-[1.35] flex-col border-r border-[var(--d-line)] pr-4">
            <p className="d-body text-[10px] font-bold tracking-[0.18em] text-[var(--d-blue)] uppercase">
              {t(memory.keys.date)}
            </p>
            <p className="d-hand mt-2 min-h-0 flex-1 overflow-y-auto text-[19px] leading-snug text-[var(--d-ink)]">
              {t(memory.keys.back)}
            </p>
            <p className="d-hand mt-2 text-[18px] text-[var(--d-blue)]">
              {td(memory.flavour.postSign)}
            </p>
          </div>

          <div className="flex flex-1 flex-col">
            <div
              aria-hidden
              className="mb-3 h-12 w-9 self-end border border-dashed border-[var(--d-red)]/50 bg-[var(--d-paper)]"
            />

            {memory.kind === 'voice' && (
              <AudioNote
                label={t('sound.title')}
                className="mb-3 text-[var(--d-ink)]"
                barClassName="bg-[var(--d-ink)]/15"
              />
            )}

            <p className="d-body mt-auto text-[9px] font-bold tracking-[0.16em] text-[var(--d-blue)] uppercase">
              {td('postcards.addrTo')}
            </p>
            <p className="d-display text-[17px] leading-tight text-[var(--d-ink)] italic">
              {td('postcards.addrName')}
            </p>
            <span aria-hidden className="mt-2 block h-px bg-[var(--d-line)]" />
            <span aria-hidden className="mt-2 block h-px bg-[var(--d-line)]" />

            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="d-hand mt-3 self-start text-[16px] text-[var(--d-red)]"
            >
              {td('postcards.flipHint')}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
