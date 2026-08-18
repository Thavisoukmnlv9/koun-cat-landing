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
 *
 * The input is a sibling of the strip rather than a child of it. `.film-path`
 * is `overflow: hidden` — it has to be, the exposed tint is a full-width layer
 * clipped to the strip — and a child that grows to a 44px touch target inside
 * it is clipped straight back to the strip's 28px. Nothing about the layout
 * shows it: the box still measures 44, it just stops receiving anything below
 * the fold of the clip. So the input moves out, the ref stays on the strip
 * where `--played` is read, and `.film-path:has(+ .seek-input:focus-visible)`
 * in globals.css puts the focus ring back on the strip.
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
    <div className={cn('relative w-full select-none', className)}>
      <div ref={surfaceRef} className="film-path h-7 w-full">
        <div aria-hidden className="lamp-line" />
      </div>

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
