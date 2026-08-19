import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SeekInput } from '@/features/journey/components/seek-input'
import { formatTime, useMediaTransport } from '@/features/journey/hooks/use-media-transport'

import { FILM_SRC, VOICE_SRC, memoriesFor } from '../data/memories'

import { TrackRow } from './components/track-row'
import { Sleeve, Turntable } from './components/turntable'

const COUNT = 6

/**
 * VI · Our Mixtape — a turntable, and a list of what the record is about.
 *
 * The one design whose premise had to be rethought rather than translated. The
 * prototype gave each of six memories its own song, its own running time and
 * its own play button; the archive holds exactly one song and one film. Porting
 * it literally meant either inventing five songs or building six players, four
 * of which would have nothing to play — a transport that does nothing when
 * pressed is worse than no transport.
 *
 * So the record is the record: side A is our song, it plays straight through,
 * and the platter turns for as long as it is playing. The tracklist selects
 * which memory you are *reading* — the label under the spindle, the sleeve, the
 * words. That is what a mixtape insert has always been: one continuous side,
 * and a list telling you what each part of it meant. Nothing is invented and
 * every gesture in the prototype survives.
 *
 * Two transports would be one too many, so there is only ever one `<audio>`,
 * mounted here. Selecting a different memory does not interrupt it.
 */
export function MixtapeDesign() {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const memories = memoriesFor(COUNT)
  const [index, setIndex] = useState(0)
  const audio = useMediaTransport<HTMLAudioElement>()

  const memory = memories[index]
  const step = (delta: number) => setIndex((i) => (i + delta + memories.length) % memories.length)

  const elapsed = formatTime(audio.current)
  const total = formatTime(audio.duration)

  return (
    <div className="d-mixtape d-body min-h-screen bg-[var(--d-ink)] pb-16 text-[var(--d-cream)]">
      <div className="mx-auto max-w-[520px] px-5">
        <header className="pt-11 text-center">
          <p className="d-label text-[11px] tracking-[0.34em] text-[var(--d-brass)] uppercase">
            {td('mixtape.eyebrow')}
          </p>
          <h1 className="d-display mt-2.5 text-[clamp(42px,13vw,64px)] leading-[0.92] font-extrabold tracking-[-0.02em]">
            {td('mixtape.titleA')}
            <span className="text-[var(--d-coral)]">{td('mixtape.titleAccent')}</span>
            {td('mixtape.titleB')}
          </h1>
          <p className="mt-1 text-[15px] text-[var(--d-muted)]">{td('mixtape.sub')}</p>
        </header>

        <Turntable memory={memory} playing={audio.playing} />

        {/* ── Now playing ──────────────────────────────────────────────── */}
        <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-[var(--d-brass)]/20 bg-white/[0.03] p-3">
          <Sleeve memory={memory} />
          <div className="min-w-0 flex-1">
            <p className="d-label text-[10px] tracking-[0.12em] text-[var(--d-brass)] uppercase">
              {td('mixtape.nowPlaying')}
            </p>
            <h2 className="d-display mt-0.5 text-[19px] leading-tight font-bold">
              {t(memory.keys.title)}
            </h2>
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#cbd8d2]">
              “{t(memory.keys.caption)}”
            </p>
          </div>
        </div>

        {/* ── Transport ────────────────────────────────────────────────── */}
        <audio ref={audio.ref} src={VOICE_SRC} preload="metadata" />

        <div className="relative mt-4">
          <div
            ref={audio.surfaceRef}
            className="h-[5px] overflow-hidden rounded-[5px] bg-[#0c1615]"
          >
            <i className="block h-full w-[calc(var(--played,0)*100%)] bg-[linear-gradient(90deg,var(--d-coral),var(--d-brass))] transition-[width] duration-100" />
          </div>
          <SeekInput
            permille={audio.permille}
            label={td('a11y.seek')}
            valueText={`${elapsed} / ${total}`}
            disabled={!audio.ready}
            onSeek={audio.seekToPermille}
          />
        </div>

        <div className="d-label mt-1.5 flex justify-between text-[11px] text-[var(--d-muted)] tabular-nums">
          <span>{elapsed}</span>
          <span>{total}</span>
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={td('a11y.prevTrack')}
            className="grid size-11 place-items-center transition-transform active:scale-95"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5.5 fill-current">
              <path d="M6 6h2v12H6zM20 6v12l-9-6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={audio.toggle}
            aria-label={td(audio.playing ? 'a11y.pauseSound' : 'a11y.playSound')}
            className="grid size-[60px] place-items-center rounded-full bg-[linear-gradient(150deg,var(--d-brass-l),var(--d-brass))] text-[#1a1310] shadow-[0_8px_20px_rgb(214_162_74_/_0.35)] transition-transform active:scale-95"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-6.5 fill-current">
              {audio.playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
          </button>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label={td('a11y.nextTrack')}
            className="grid size-11 place-items-center transition-transform active:scale-95"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5.5 fill-current">
              <path d="M16 6h2v12h-2zM4 6l9 6-9 6z" />
            </svg>
          </button>
        </div>

        {/* The one moving picture on the tape. It gets its own full-width panel
            rather than the 78px sleeve, which is not a place to watch a film. */}
        {memory.kind === 'film' && (
          <video
            src={FILM_SRC}
            poster={`/images/journey/${memory.image}.jpg`}
            controls
            playsInline
            preload="none"
            className="mt-5 aspect-video w-full rounded-xl border border-[var(--d-brass)]/20 bg-black object-cover"
          />
        )}

        {/* ── Tracklist ────────────────────────────────────────────────── */}
        <div className="mt-6 border-t border-[var(--d-brass)]/20 pt-4">
          <h2 className="d-label px-0.5 text-[11px] tracking-[0.24em] text-[var(--d-brass)] uppercase">
            {td('mixtape.tracklist', { total: memories.length })}
          </h2>
          <p className="mt-1.5 px-0.5 text-[12px] leading-relaxed text-[var(--d-muted)]">
            {td('mixtape.tracklistNote')}
          </p>

          <div className="mt-2">
            {memories.map((entry, i) => (
              <TrackRow
                key={entry.id}
                memory={entry}
                selected={i === index}
                playing={audio.playing}
                onSelect={() => setIndex(i)}
              />
            ))}
          </div>
        </div>

        <footer className="d-label mt-6 text-center text-[11px] tracking-[0.18em] text-[var(--d-muted)]">
          {td('mixtape.footer')}
        </footer>
      </div>
    </div>
  )
}
