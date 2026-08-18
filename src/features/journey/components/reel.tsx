import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { formatTime, useMediaTransport } from '../hooks/use-media-transport'

import { FilmPath } from './film-path'

/**
 * A reel of home movie, projected onto the paper.
 *
 * It loads nothing at all until someone presses run — no poster, no metadata,
 * not a byte of the fifteen megabyte file. Design and performance happen to
 * agree here: you should not be able to see the picture before you have turned
 * the projector on, and a visitor who never presses run should not pay for it.
 * That is also why the gate needs an explicit aspect ratio; an empty video with
 * no poster lays out at 300×150 and would shift the page the moment the first
 * frame decoded.
 *
 * It runs silent by default, which is not a technical hedge but what Super 8
 * was: silent film, with a record playing beside it. The sound toggle is here
 * for anyone who wants the picture's own audio instead.
 *
 * Every layer over the picture is one real thing a projector does — lifted
 * blacks, halation, grain, shutter flicker, the vignette of the gate — and each
 * lives in globals.css as a named material. `data-running` is the only state
 * this component publishes to CSS, and it drives all of them at once, including
 * the lamp coming up to heat.
 */
export function Reel({ src, className }: { src: string; className?: string }) {
  const { t } = useTranslation()
  const {
    ref,
    surfaceRef,
    playing,
    muted,
    current,
    duration,
    ready,
    permille,
    toggle,
    toggleMuted,
    seekToPermille,
  } = useMediaTransport<HTMLVideoElement>(true)

  const clock = `${formatTime(current)} / ${formatTime(duration)}`

  return (
    <div
      data-running={playing || undefined}
      className={cn('flex w-full flex-col items-stretch gap-3.5', className)}
    >
      {/* The spill is a sibling of the gate rather than a child, so it can
          reach past the frame onto the paper instead of being clipped by it. */}
      <div className="relative">
        <div aria-hidden className="lamp-spill" />

        <div className="film-gate aspect-gate w-full">
          <video
            ref={ref}
            src={src}
            className="film-image"
            preload="none"
            muted={muted}
            playsInline
            aria-label={t('a11y.reelLabel')}
          />
          <div aria-hidden className="film-layer film-lift" />
          <div aria-hidden className="film-layer film-halation" />
          <div aria-hidden className="film-layer film-grain" />
          <div aria-hidden className="film-layer film-flicker" />
          <div aria-hidden className="film-layer film-vignette" />
        </div>
      </div>

      <FilmPath
        surfaceRef={surfaceRef}
        permille={permille}
        disabled={!ready}
        label={t('a11y.reelPosition', {
          current: formatTime(current),
          total: formatTime(duration),
        })}
        valueText={clock}
        onSeek={seekToPermille}
      />

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
        {/* Not gated on `ready`: muting an element that has not loaded is
            perfectly valid, and someone deciding they want sound before they
            press run should not meet a dead control. */}
        <button
          type="button"
          aria-label={t(muted ? 'a11y.unmuteReel' : 'a11y.muteReel')}
          onClick={toggleMuted}
          className="font-label text-label-sm tracking-label text-muted-label border-rule cursor-pointer border px-4 py-2.5 whitespace-nowrap uppercase"
        >
          {t(muted ? 'reel.soundOn' : 'reel.soundOff')}
        </button>

        {/* Not aria-live. The album's page count is, because a turn is
            otherwise silent — but a clock that ticks every second would talk
            over everything else on the page. The position is on the slider's
            aria-valuetext instead, where it is read on request. */}
        <span className="font-label text-label-sm tracking-count text-muted-label whitespace-nowrap uppercase tabular-nums">
          {ready ? clock : t('reel.slate')}
        </span>

        <button
          type="button"
          aria-label={t(playing ? 'a11y.stopReel' : 'a11y.runReel')}
          onClick={toggle}
          className="font-label text-label-sm tracking-label text-paper-card bg-accent border-accent cursor-pointer border px-4 py-2.5 whitespace-nowrap uppercase"
        >
          {t(playing ? 'reel.stop' : 'reel.run')}
        </button>
      </div>
    </div>
  )
}
