import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import type { Memory } from '../../data/memories'

/** Where the arm sits parked, and where it sits playing, in degrees. */
const REST_ANGLE = 8
const PLAY_ANGLE = 34

/**
 * The deck: a platter, a label, a spindle and a tonearm.
 *
 * All of it is CSS — grooves are a repeating radial gradient, the sheen is a
 * static conic gradient the record turns underneath, and the rotation is one
 * linear keyframe. There is nothing here Motion would do better: the spin is
 * infinite and constant, which is the one case a CSS animation handles more
 * cheaply than a frame loop, and it keeps turning while the main thread is busy
 * because the compositor owns it.
 *
 * `data-spinning` rather than a class, matching how the rest of the designs
 * gate their state, and the animation itself sits behind
 * `prefers-reduced-motion` in designs.css — a record that never stops turning is
 * exactly the kind of thing that setting exists for.
 *
 * The tonearm's rest and play angles are the prototype's (-32° and -12°), and it
 * transitions between them over 0.8s: the arm has to be *seen* to come down, or
 * pressing play just changes an icon.
 */
export function Turntable({ memory, playing }: { memory: Memory; playing: boolean }) {
  const { t } = useTranslation()

  return (
    // `overflow-hidden` is a guard rather than a fix: a plinth is a physical
    // object and nothing should hang off it. The prototype relied on a blanket
    // `overflow-x: hidden` on <body> to hide a tonearm that swung 46px past the
    // deck's right edge; here the arm is drawn so that it does not, and this
    // only guarantees that no future adjustment can put the whole page into
    // sideways scroll again.
    <div className="relative mx-auto mt-7 aspect-square w-[min(88vw,360px)] overflow-hidden rounded-[14px] border border-[var(--d-brass)]/25 bg-[linear-gradient(150deg,var(--d-panel),var(--d-panel-2))] p-[22px] shadow-[0_24px_50px_rgb(0_0_0_/_0.55),0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div
        data-spinning={playing}
        className="d-platter relative size-full rounded-full"
        aria-hidden
      >
        <span className="d-shine pointer-events-none absolute inset-0 rounded-full" />

        {/* The paper label. It carries the memory you are reading, not the song
            — the song is the whole side.

            Number above the spindle hole and title below it, rather than both
            stacked in the middle: the spindle sits dead centre by definition,
            and the prototype's two-word titles were short enough to clear it.
            These are real titles, and "Where it started" ran straight under the
            pin. */}
        <span className="d-disc-label absolute top-1/2 left-1/2 flex size-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full px-2 text-center text-[#1a1310]">
          <span className="d-label mb-3 text-[10px] tracking-[0.1em]">{memory.number}</span>
          <span className="d-display mt-1.5 text-[12px] leading-tight font-bold text-balance">
            {t(memory.keys.title)}
          </span>
        </span>

        <span className="absolute top-1/2 left-1/2 z-[2] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#05070a]" />
      </div>

      {/* Tonearm.
          
          One bar hinged at the bearing, rather than the prototype's box of
          three absolutely-placed parts rotated as a group about a point 88%
          across it. That construction is why the arm hung off the deck: the
          rotation origin was not the pivot, so swinging the arm also *moved*
          it. Here the element's own top edge is the bearing, so the arm turns
          on the spot the way the real thing does — and its reach can be stated
          plainly as a fraction of the deck, which is what keeps it on the
          plinth at both angles.

          Positive degrees swing the head to the left, towards the spindle: a
          point below the origin rotates towards the left under a clockwise
          turn in screen coordinates. */}
      <div
        aria-hidden
        style={{ transform: `rotate(${playing ? PLAY_ANGLE : REST_ANGLE}deg)` }}
        className="absolute top-[13%] right-[13%] z-[4] h-[44%] w-[3px] origin-top rounded-[3px] bg-[linear-gradient(#d9d2c4,#8f8778)] transition-transform duration-[800ms] ease-[cubic-bezier(0.5,0.05,0.2,1)]"
      >
        <span className="absolute -top-3 left-1/2 size-[26px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e9e2d4,#8d8574)] shadow-[0_3px_6px_rgb(0_0_0_/_0.5)]" />
        <span className="absolute -bottom-1 left-1/2 h-2.5 w-4 -translate-x-1/2 rotate-[20deg] rounded-[2px] bg-[#2a2622]" />
      </div>
    </div>
  )
}

/**
 * The sleeve beside the now-playing text — the memory itself, small.
 *
 * A film memory shows its poster rather than a `<video>`: this is a 78px square
 * beside two lines of prose, which is not somewhere anyone wants a video
 * player. The film plays full width further down the page.
 */
export function Sleeve({ memory }: { memory: Memory }) {
  const { t } = useTranslation()

  return (
    <div className="relative size-[78px] shrink-0 overflow-hidden rounded-md bg-black shadow-[0_6px_14px_rgb(0_0_0_/_0.5)]">
      <Picture
        name={`journey/${memory.image}`}
        alt={t(memory.keys.title)}
        className="size-full object-cover"
      />
    </div>
  )
}
