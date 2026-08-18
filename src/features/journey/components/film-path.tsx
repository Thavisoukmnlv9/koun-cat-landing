import type { RefObject } from 'react'

import { cn } from '@/lib/utils'

import { SeekInput } from './seek-input'

/**
 * The reel's transport: a strip of perforated film you drag to wind it.
 *
 * Picture is pulled through a projector by its sprocket holes, so the
 * perforations are the honest scrubber here — the one control that could sit
 * under a film gate without turning the page into a media player. Its sibling,
 * the optical track, scrubs on a waveform for the same reason: that is what
 * carries sound on a print. Same strip, read left to right, different job.
 *
 * `surfaceRef` is where useMediaTransport writes `--played`; the lamp and the
 * exposed tint below inherit it rather than being told about it separately.
 */
export function FilmPath({
  surfaceRef,
  permille,
  label,
  valueText,
  disabled,
  onSeek,
  className,
}: {
  surfaceRef: RefObject<HTMLDivElement | null>
  permille: number
  label: string
  valueText: string
  disabled: boolean
  onSeek: (permille: number) => void
  className?: string
}) {
  return (
    <div ref={surfaceRef} className={cn('film-path h-7 w-full select-none', className)}>
      <div aria-hidden className="lamp-line" />
      <SeekInput
        permille={permille}
        label={label}
        valueText={valueText}
        disabled={disabled}
        onSeek={onSeek}
      />
    </div>
  )
}
