import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { peaksToPath, useAudioPeaks } from '../hooks/use-audio-peaks'
import { formatTime, useMediaTransport } from '../hooks/use-media-transport'

import { SeekInput } from './seek-input'

/** Nominal — the SVG stretches to the strip with preserveAspectRatio="none". */
const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 100

/**
 * The record playing beside the projector, drawn the way film carries sound.
 *
 * On a print the audio is a variable-area optical stripe printed alongside the
 * picture: a mirrored silhouette of the waveform, read by a lamp and a
 * photocell. So this component's scrubber is not a progress bar with a waveform
 * decorating it — it is the waveform, and the playhead is the lamp reading it.
 * That is also what makes it read as the reel's sibling rather than a second
 * widget: both are strips of film, each carrying its own medium's transport.
 *
 * The silhouette is one closed path built from the real decoded audio, and two
 * copies of it are stacked: unexposed underneath, exposed on top, revealed by
 * clipping against `--played`. So moving the playhead costs one custom-property
 * write per frame — the path itself is built once and never re-rendered.
 *
 * Nothing is fetched for the picture of the sound until the sound is wanted,
 * and if it never arrives the stripe stays flat, like leader. Playing and
 * seeking do not depend on it.
 */
export function OpticalTrack({ src, className }: { src: string; className?: string }) {
  const { t } = useTranslation()
  const { ref, surfaceRef, playing, current, duration, ready, permille, toggle, seekToPermille } =
    useMediaTransport<HTMLAudioElement>()

  const [wanted, setWanted] = useState(false)
  const { peaks } = useAudioPeaks(src, wanted)
  const path = useMemo(() => peaksToPath(peaks, VIEW_WIDTH, VIEW_HEIGHT), [peaks])

  const clock = `${formatTime(current)} / ${formatTime(duration)}`

  const onToggle = () => {
    // Set before toggling, and nothing is awaited in between: the play() call
    // has to stay inside the gesture that caused it.
    setWanted(true)
    toggle()
  }

  return (
    <div className={cn('flex w-full flex-col items-stretch gap-3.5', className)}>
      <audio ref={ref} src={src} preload="none" />

      <div ref={surfaceRef} className="optical-bed h-[clamp(46px,7vw,64px)] w-full select-none">
        <svg
          aria-hidden
          className="optical-wave optical-wave-dim"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <path d={path} />
        </svg>
        <svg
          aria-hidden
          className="optical-wave optical-wave-lit track-lit"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <path d={path} />
        </svg>
        <div aria-hidden className="lamp-line" />

        <SeekInput
          permille={permille}
          disabled={!ready}
          label={t('a11y.soundPosition', {
            current: formatTime(current),
            total: formatTime(duration),
          })}
          valueText={clock}
          onSeek={seekToPermille}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
        <span className="font-label text-label-sm tracking-label text-muted-label whitespace-nowrap uppercase">
          {t('sound.label')}
        </span>

        <span className="font-label text-label-sm tracking-count text-muted-label whitespace-nowrap uppercase tabular-nums">
          {ready ? clock : t('sound.title')}
        </span>

        <button
          type="button"
          aria-label={t(playing ? 'a11y.pauseSound' : 'a11y.playSound')}
          onClick={onToggle}
          className="font-label text-label-sm tracking-label text-muted-label border-rule cursor-pointer border px-4 py-2.5 whitespace-nowrap uppercase"
        >
          {t(playing ? 'sound.pause' : 'sound.play')}
        </button>
      </div>
    </div>
  )
}
