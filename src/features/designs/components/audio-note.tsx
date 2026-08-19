import { useTranslation } from 'react-i18next'

import { SeekInput } from '@/features/journey/components/seek-input'
import { formatTime, useMediaTransport } from '@/features/journey/hooks/use-media-transport'
import { cn } from '@/lib/utils'

import { VOICE_SRC } from '../data/memories'

/**
 * The song attached to a memory.
 *
 * Four of the five prototypes built this by hand and built it almost the same
 * way each time — a button that swapped two inline SVG paths, a `timeupdate`
 * listener writing `bar.style.width`, an `ended` listener putting both back.
 * Only the letters bothered with a time readout. It is one component here, and
 * the transport underneath it is journey's `useMediaTransport`, which already
 * handles the parts the prototypes skipped: it paints `--played` once per frame
 * straight to the node instead of through React, it survives StrictMode's
 * double-mounted effects, and it comes with a real `<input type="range">` for
 * scrubbing rather than a div that a screen reader cannot adjust.
 *
 * Everything visual is the caller's. `className` styles the shell, and the
 * progress fill reads `--played` (a unitless 0..1) so each design can draw it
 * as a bar, a wave, or a lit strip of optical track.
 */
export function AudioNote({
  label,
  className,
  barClassName,
}: {
  /** What this song is, in the design's own words. */
  label: string
  className?: string
  barClassName?: string
}) {
  const { t } = useTranslation('designs')
  const audio = useMediaTransport<HTMLAudioElement>()

  const elapsed = formatTime(audio.current)
  const total = formatTime(audio.duration)

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      // The player sits inside a card that flips, a stop that expands and an
      // envelope that opens. Without this, reaching for the scrubber would turn
      // the postcard over.
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="group"
      aria-label={label}
    >
      <audio ref={audio.ref} src={VOICE_SRC} preload="metadata" />

      <button
        type="button"
        onClick={audio.toggle}
        aria-label={t(audio.playing ? 'a11y.pauseSound' : 'a11y.playSound')}
        className="grid size-11 shrink-0 place-items-center rounded-full transition-transform active:scale-95"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
          {audio.playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] tracking-[0.14em] uppercase opacity-70">{label}</p>

        {/* The strip is the visual, the range input is the control: it lies
            invisibly across this box, which is why the wrapper is relative. */}
        <div className="relative mt-1.5">
          <div
            ref={audio.surfaceRef}
            className={cn('h-[3px] overflow-hidden rounded-full', barClassName)}
          >
            <i className="block h-full w-[calc(var(--played,0)*100%)] bg-current transition-[width] duration-100" />
          </div>
          <SeekInput
            permille={audio.permille}
            label={t('a11y.seek')}
            valueText={`${elapsed} / ${total}`}
            disabled={!audio.ready}
            onSeek={audio.seekToPermille}
          />
        </div>
      </div>

      <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-70">{elapsed}</span>
    </div>
  )
}
