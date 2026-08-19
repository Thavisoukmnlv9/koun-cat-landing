import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AudioNote } from '../components/audio-note'
import { memoriesFor, yearOf } from '../data/memories'

import { Artwork } from './components/artwork'

const COUNT = 6

/** Below this many pixels a horizontal drag is a tap, not a swipe. */
const SWIPE_PX = 40

/**
 * X · The Exhibition — the archive hung in a gallery, walked through in 3D.
 *
 * A coverflow: pieces laid out along one axis in perspective, the centred one
 * face-on and lit, its neighbours turned away and dimmed. Underneath it hangs a
 * museum placard, and the placard is where this design earns its keep — it is
 * the only one of the ten that gives each memory a caption written *about* it
 * rather than *by* it, which is a genuinely different way to read the same
 * archive.
 *
 * The accession number is derived, the way a real one is: year of acquisition,
 * then the running number. So is the collection's founding year on the header.
 * The prototype wrote all seven out by hand.
 *
 * Keyboard is bound to the stage rather than the document. The prototype bound
 * Left and Right to `document`, which in this app would have fought the design
 * tab bar in the header for the same two keys.
 */
export function ExhibitionDesign() {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const memories = memoriesFor(COUNT)
  const [index, setIndex] = useState(0)
  const startX = useRef<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const go = (next: number) => setIndex((next + memories.length) % memories.length)

  // Bound to the stage, not the window: the header's tablist owns Left/Right
  // when the focus is up there, and this owns them when the focus is in here.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((i) => (i + 1) % memories.length)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((i) => (i - 1 + memories.length) % memories.length)
      }
    }

    stage.addEventListener('keydown', onKeyDown)
    return () => stage.removeEventListener('keydown', onKeyDown)
  }, [memories.length])

  const memory = memories[index]
  const title = t(memory.keys.title)

  return (
    <div className="d-exhibition d-body flex min-h-[100svh] flex-col bg-[var(--d-wall)] text-[var(--d-charcoal)]">
      {/* Where the wall meets the floor. */}
      <span
        aria-hidden
        className="d-floor pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[26vh]"
      />

      <header className="relative z-[3] px-5 pt-9.5 pb-1.5 text-center">
        <p className="d-label text-[11px] tracking-[0.36em] text-[var(--d-brass)] uppercase">
          {td('exhibition.eyebrow')}
        </p>
        <h1 className="d-display mt-2 text-[clamp(34px,10vw,52px)] font-semibold">
          {td('exhibition.titleA')}
          <em className="text-[var(--d-brass)] italic">{td('exhibition.titleAccent')}</em>
        </h1>
        <p className="text-[13px] font-light tracking-[0.2em] text-[var(--d-muted)] uppercase">
          {td('exhibition.curated', { from: yearOf(t(memories[0].keys.date)) })}
        </p>
      </header>

      {/* ── The wall ─────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        tabIndex={-1}
        onTouchStart={(event) => {
          startX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (startX.current === null) return
          const dx = (event.changedTouches[0]?.clientX ?? 0) - startX.current
          startX.current = null
          if (dx < -SWIPE_PX) go(index + 1)
          if (dx > SWIPE_PX) go(index - 1)
        }}
        className="relative z-[2] flex min-h-[46vh] flex-1 items-center justify-center overflow-hidden py-3.5 [perspective:1400px] focus:outline-none"
      >
        <div className="relative size-full [transform-style:preserve-3d]">
          {memories.map((piece, i) => (
            <Artwork
              key={piece.id}
              memory={piece}
              offset={i - index}
              onSelect={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Arrows ───────────────────────────────────────────────────── */}
      <div className="relative z-[3] mt-1 flex items-center justify-center gap-6.5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={td('a11y.prevPiece')}
          className="grid size-11 place-items-center rounded-full border border-[var(--d-brass)]/50 bg-white/50 transition-colors hover:bg-[var(--d-brass)] hover:text-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
            <path d="M15 6l-6 6 6 6z" />
          </svg>
        </button>

        <span
          aria-live="polite"
          className="d-label min-w-[70px] text-center text-[12px] tracking-[0.14em] text-[var(--d-muted)] tabular-nums"
        >
          {td('exhibition.counter', {
            current: memory.number,
            total: String(memories.length).padStart(2, '0'),
          })}
        </span>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={td('a11y.nextPiece')}
          className="grid size-11 place-items-center rounded-full border border-[var(--d-brass)]/50 bg-white/50 transition-colors hover:bg-[var(--d-brass)] hover:text-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
            <path d="M9 6l6 6-6 6z" />
          </svg>
        </button>
      </div>

      {/* ── Placard ──────────────────────────────────────────────────── */}
      <div className="relative z-[3] mx-auto mt-3 mb-7.5 w-[min(90vw,440px)] rounded-[3px] border border-[#786c52]/35 bg-[var(--d-placard)] px-5.5 py-5 shadow-[0_12px_26px_rgb(40_36_28_/_0.14)]">
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-[var(--d-brass)] shadow-[0_2px_4px_rgb(0_0_0_/_0.3)]"
        />

        <p className="d-label text-[11px] tracking-[0.16em] text-[var(--d-brass)]">
          {td('exhibition.accession', {
            year: yearOf(t(memory.keys.date)),
            number: memory.number,
          })}
        </p>
        <h2 className="d-display mt-1 text-[28px] leading-tight font-semibold text-balance italic">
          {title}
        </h2>
        <p className="mt-0.5 text-[12px] tracking-[0.14em] text-[var(--d-muted)] uppercase">
          {td(memory.flavour.medium)}
        </p>
        <p className="d-display mt-3 text-[18px] leading-relaxed text-[#4a463c]">
          {t(memory.keys.back)}
        </p>

        {memory.kind === 'voice' && (
          <AudioNote
            label={td('exhibition.listening')}
            className="mt-3.5 rounded-3xl border border-[#786c52]/30 bg-[#efe9dc] px-2 py-1.5 text-[var(--d-charcoal)]"
            barClassName="bg-[#dad2c0]"
          />
        )}

        <p className="mt-3 text-center text-[11px] tracking-[0.16em] text-[var(--d-muted)] uppercase">
          {td('exhibition.hint')}
        </p>
      </div>
    </div>
  )
}
