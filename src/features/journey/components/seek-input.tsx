import { SEEK_RANGE } from '../hooks/use-media-transport'

/**
 * The scrub control for both film strips — a real range input, stretched
 * invisibly over the strip it belongs to.
 *
 * This is the accessible control and the mouse and touch surface at once. A div
 * carrying `role="slider"` would have meant hand-rolling arrow, Home, End and
 * drag handling, and iOS VoiceOver's adjust gesture still would have done
 * nothing — it sends increment and decrement actions that only a native control
 * can receive. Since the visible strip is drawn separately, there is no styling
 * left here to fight; `.seek-input` in globals.css does nothing but make it
 * invisible and give it a one-pixel thumb, so the value maps edge to edge.
 *
 * The range is per-mille rather than seconds, and `aria-valuetext` carries the
 * real time — see `toPermille` for why the domain cannot depend on duration.
 */
export function SeekInput({
  permille,
  label,
  valueText,
  disabled,
  onSeek,
}: {
  permille: number
  label: string
  valueText: string
  disabled: boolean
  onSeek: (permille: number) => void
}) {
  return (
    <input
      type="range"
      className="seek-input"
      min={0}
      max={SEEK_RANGE}
      // About five seconds a press on a four-and-a-half minute reel, which is
      // the scrubber convention. A step of 1 would be a thousand presses end
      // to end; PageUp and PageDown take a larger stride from this for free.
      step={20}
      value={permille}
      disabled={disabled}
      aria-label={label}
      aria-valuetext={valueText}
      onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
    />
  )
}
