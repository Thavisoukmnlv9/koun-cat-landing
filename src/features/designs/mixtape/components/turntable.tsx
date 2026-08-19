import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import type { Memory } from '../../data/memories'

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
    <div className="relative mx-auto mt-7 aspect-square w-[min(88vw,360px)] rounded-[14px] border border-[var(--d-brass)]/25 bg-[linear-gradient(150deg,var(--d-panel),var(--d-panel-2))] p-[22px] shadow-[0_24px_50px_rgb(0_0_0_/_0.55),0_1px_0_rgb(255_255_255_/_0.06)_inset]">
      <div
        data-spinning={playing}
        className="d-platter relative size-full rounded-full"
        aria-hidden
      >
        <span className="d-shine pointer-events-none absolute inset-0 rounded-full" />

        {/* The paper label. It carries the memory you are reading, not the song
            — the song is the whole side. */}
        <span className="d-disc-label absolute top-1/2 left-1/2 flex size-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full px-1.5 text-center text-[#1a1310]">
          <span className="d-label text-[10px] tracking-[0.1em]">{memory.number}</span>
          <span className="d-display mt-px text-[12px] leading-none font-bold text-balance">
            {t(memory.keys.title)}
          </span>
        </span>

        <span className="absolute top-1/2 left-1/2 z-[2] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#05070a]" />
      </div>

      {/* Tonearm. `transform-origin` sits at the pivot bearing, top-right. */}
      <div
        aria-hidden
        style={{
          transformOrigin: '88% 12%',
          transform: `rotate(${playing ? -12 : -32}deg)`,
        }}
        className="absolute top-2 right-2.5 z-[4] h-[46%] w-[46%] transition-transform duration-[800ms] ease-[cubic-bezier(0.5,0.05,0.2,1)]"
      >
        <span className="absolute top-[2%] right-[2%] size-[26px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#e9e2d4,#8d8574)] shadow-[0_3px_6px_rgb(0_0_0_/_0.5)]" />
        <span className="absolute top-4 right-4 h-[74%] w-[3px] origin-top -rotate-[16deg] rounded-[3px] bg-[linear-gradient(#d9d2c4,#8f8778)]" />
        <span className="absolute bottom-[6%] left-[16%] h-2.5 w-4 rotate-[20deg] rounded-[2px] bg-[#2a2622]" />
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
