import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import { MediaChip } from '../components/media-chip'
import { memoriesFor } from '../data/memories'

import { Projection } from './components/projection'
import { useFrameCounter, useProjector } from './hooks/use-projector'

const COUNT = 6

/**
 * I · Filmstrip Reel — an 8mm strip you swipe, or let the projector roll.
 *
 * The most machinery of the five: a scroll-snapping strip, a self-advancing
 * projector, a frame counter reading the scroll position, and a full-screen
 * projection with the story typed out under it.
 *
 * The strip itself stays CSS. `scroll-snap-type: x mandatory` with
 * `scroll-snap-align: center` on each frame is a better carousel than anything
 * built out of transforms — it keeps native momentum, it works with a trackpad,
 * a touch drag and a keyboard, and the projector can drive it just by writing
 * `scrollLeft`.
 */
export function FilmstripDesign() {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const reelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  const memories = memoriesFor(COUNT)
  const projector = useProjector(reelRef)
  const frame = useFrameCounter(reelRef, memories.length)

  // A reel that keeps winding behind an open frame drags the strip out from
  // under the visitor while they are reading.
  useEffect(() => {
    if (open !== null) projector.stop()
  }, [open, projector])

  const step = (delta: number) =>
    setOpen((current) =>
      current === null ? current : (current + delta + memories.length) % memories.length,
    )

  return (
    <div className="d-filmstrip d-body min-h-screen bg-[var(--d-espresso)] pb-20 text-[var(--d-cream)]">
      <div aria-hidden className="d-grain pointer-events-none fixed inset-0 z-[60]" />

      <header className="mx-auto max-w-[520px] px-5 pt-11 text-center">
        <p className="d-label text-[11px] tracking-[0.3em] text-[#8f7a5f] uppercase">
          — {td('filmstrip.leader')} —
        </p>

        <h1 className="d-display mt-3 text-[clamp(44px,14vw,64px)] leading-none italic">
          {td('filmstrip.titleA')}{' '}
          <span className="text-[var(--d-gold)]">{td('filmstrip.titleAmp')}</span>{' '}
          {td('filmstrip.titleB')}
        </h1>

        <p className="d-display mt-2 text-[15px] text-[#a2917a] italic">
          {td('filmstrip.tagline')}
        </p>

        <button
          type="button"
          onClick={projector.toggle}
          aria-pressed={projector.running}
          className="d-label mt-6 inline-flex items-center gap-2 border border-[var(--d-gold)] px-6 py-3 text-[12px] tracking-[0.2em] text-[var(--d-gold)] uppercase transition-colors hover:bg-[var(--d-gold)]/10"
        >
          <span aria-hidden>{projector.running ? '❚❚' : '▶'}</span>
          {td(projector.running ? 'filmstrip.pause' : 'filmstrip.run')}
        </button>

        <p className="d-label mt-3 text-[11px] tracking-[0.22em] text-[#6f5c44] uppercase">
          {td('filmstrip.frame', {
            current: String(frame).padStart(2, '0'),
            total: String(memories.length).padStart(2, '0'),
          })}
        </p>
      </header>

      {/* The strip. Sprocket holes above and below are one repeating gradient
          each; the mask fades both ends so frames leave rather than stop. */}
      <div className="d-reel-mask mt-8">
        <div
          ref={reelRef}
          className="d-reel flex snap-x snap-mandatory scrollbar-none gap-0 overflow-x-auto"
        >
          {/* Half a viewport minus half a frame, so `snap-align: center` can
                actually centre the first and last frames — and so neither of
                them sits under the strip's edge fade, which was eating the
                corner of frame one's slate. */}
          <div className="d-film flex shrink-0 gap-4 px-[calc((100vw-min(74vw,360px))/2)] py-3">
            {memories.map((memory, index) => (
              <button
                key={memory.id}
                type="button"
                onClick={() => setOpen(index)}
                aria-label={td('a11y.openFrame', { title: t(memory.keys.title) })}
                className="w-[74vw] max-w-[360px] shrink-0 snap-center text-left transition-transform hover:scale-[1.02]"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-black">
                  <Picture
                    name={`journey/${memory.image}`}
                    alt={t(memory.keys.title)}
                    className="d-film-look size-full object-cover"
                    priority={index === 0}
                  />

                  <span // Over a photograph rather than over film stock, so it carries its own
                    // ground — the slate was unreadable wherever a frame happened to be
                    // bright, which with real photographs is most of them.
                    className="d-label absolute top-2.5 left-2.5 border border-[var(--d-gold)]/50 bg-[var(--d-ink)]/55 px-2 py-0.5 text-[10px] tracking-[0.14em] text-[var(--d-cream)] backdrop-blur-[2px]"
                  >
                    FR {memory.number}
                  </span>

                  <MediaChip
                    kind={memory.kind}
                    glyph="✷"
                    className="d-label absolute top-2.5 right-2.5 bg-[var(--d-gold)] px-2 py-0.5 text-[10px] tracking-[0.14em] text-[var(--d-espresso)] uppercase"
                  />
                </span>

                <span className="block px-1 pt-3 pb-1 text-center">
                  <span className="d-label block text-[10px] tracking-[0.22em] text-[#8f7a5f] uppercase">
                    {t(memory.keys.date)}
                  </span>
                  <span className="d-display mt-1 block text-[22px] leading-tight text-[var(--d-cream)] italic">
                    {t(memory.keys.title)}
                  </span>
                </span>
              </button>
            ))}

            <div className="grid w-[74vw] max-w-[360px] shrink-0 snap-center place-items-center text-center">
              <div>
                <p className="d-display text-[40px] text-[var(--d-gold)] italic">
                  {td('filmstrip.fin')}
                </p>
                <p className="d-label mt-2 text-[10px] tracking-[0.24em] text-[#6f5c44] uppercase">
                  {td('filmstrip.continued')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="d-label mt-6 text-center text-[10px] tracking-[0.2em] text-[#6f5c44] uppercase">
        {td('filmstrip.hint')}
      </p>

      <Projection
        memory={open === null ? null : memories[open]}
        index={open ?? 0}
        total={memories.length}
        onClose={() => setOpen(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </div>
  )
}
