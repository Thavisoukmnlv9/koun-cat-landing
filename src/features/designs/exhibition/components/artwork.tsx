import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/** How far apart the pieces hang, as a percentage of one frame's width. */
const SPREAD = 46
/** How far a flanking piece turns away from the viewer. */
const TURN = 32
/** How far back it sits, in px of Z. */
const DEPTH = 140

/**
 * One framed piece on the wall: moulding, mount, glazing, and a medal.
 *
 * The whole carousel is one transform per piece, computed from its distance
 * from the centre — translate along X, push back along Z, turn on Y, and scale
 * down. Written as an inline `transform` rather than as Motion values because
 * every piece moves at once when the selection changes, and a CSS transition
 * over six transforms is one declaration rather than six springs.
 *
 * The frame is a `<div>` and the "bring this to the centre" control is a button
 * laid over it — rather than the whole piece being a button, which is what the
 * prototype's `role="button"` div amounted to. A button cannot contain
 * interactive content, and the film in this collection has controls: nesting
 * them inside the selector both invalidates the markup and makes the play
 * button un-pressable. So the overlay exists only while the piece is *off*
 * centre, which is the only time selecting it means anything. Once it is
 * centred the overlay is gone and the film underneath is reachable.
 *
 * Pieces more than two places out are hidden and taken out of the flow of both
 * the pointer and the accessibility tree — they sit behind the ones in front
 * and would otherwise still be clickable through them.
 */
export function Artwork({
  memory,
  offset,
  onSelect,
}: {
  memory: Memory
  /** Places from the centred piece. 0 is the one on show. */
  offset: number
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const distance = Math.abs(offset)
  const centred = offset === 0
  const hidden = distance > 2
  const title = t(memory.keys.title)

  return (
    <div
      data-center={centred}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      style={{
        transform: [
          'translate(-50%, -50%)',
          `translateX(${offset * SPREAD}%)`,
          `translateZ(${-distance * DEPTH}px)`,
          `rotateY(${centred ? 0 : offset < 0 ? TURN : -TURN}deg)`,
          `scale(${centred ? 1 : 0.86})`,
        ].join(' '),
        opacity: hidden ? 0 : 1,
        filter: centred ? undefined : 'brightness(0.72) saturate(0.9)',
        zIndex: 100 - distance,
      }}
      className="d-art absolute top-1/2 left-1/2 aspect-4/5 w-[60vw] max-w-[300px] transition-[transform,opacity,filter] duration-600 ease-[cubic-bezier(0.4,0.1,0.2,1)] motion-reduce:transition-[opacity] motion-reduce:duration-300"
    >
      {/* The pool of light the centred piece stands in. */}
      <span
        aria-hidden
        className={`d-spot pointer-events-none absolute -top-[30%] left-1/2 z-[1] h-[70%] w-[120%] -translate-x-1/2 transition-opacity duration-500 ${
          centred ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="d-frame-moulding relative size-full rounded-[2px] p-3">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[5px] z-[3] rounded-[1px] border-2 border-[var(--d-brass-l)]/55"
        />

        <div className="size-full rounded-[1px] bg-[#f3efe6] p-2.5 shadow-[0_0_0_1px_rgb(0_0_0_/_0.05)_inset]">
          <div className="relative size-full overflow-hidden bg-black">
            {memory.kind === 'film' ? (
              <video
                src={FILM_SRC}
                poster={`/images/journey/${memory.image}.jpg`}
                controls={centred}
                playsInline
                preload="none"
                className="size-full object-cover"
              />
            ) : (
              <Picture
                name={`journey/${memory.image}`}
                alt={title}
                className="size-full object-cover [filter:saturate(1.02)_contrast(1.03)]"
              />
            )}

            <MediaChip
              kind={memory.kind}
              className="d-label absolute top-2.5 right-2.5 z-[4] rounded-[2px] bg-[var(--d-ink)] px-1.5 py-[3px] text-[8px] tracking-[0.08em] text-[var(--d-brass-l)] uppercase"
            />

            <span className="d-glass pointer-events-none absolute inset-0" />
          </div>
        </div>
      </div>

      {!centred && !hidden && (
        <button
          type="button"
          onClick={onSelect}
          aria-label={td('a11y.showPiece', { title })}
          className="absolute inset-0 z-[5] cursor-pointer"
        />
      )}
    </div>
  )
}
