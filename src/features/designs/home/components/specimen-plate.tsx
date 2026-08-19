import { Picture } from '@/features/journey/components/picture'
import { cn } from '@/lib/utils'

import { SPECIMENS, type SpecimenId } from '../data/specimens'

/**
 * One photograph, mounted the way its design mounts photographs.
 *
 * This is the part that makes the wall a specimen sheet rather than a grid of
 * thumbnails. The filmstrip's plate runs between sprocket holes; the wall's is a
 * taped polaroid; the mixtape's is cropped to a circle and *becomes the record's
 * label*; the exhibition's hangs in a brass frame on a mat. None of these are
 * screenshots — they are the same gesture the design itself makes, drawn small.
 *
 * The aspect ratio is part of the same argument and comes from the data: the
 * storybook is a full-height scene, the map is a wide landscape, the wall is a
 * square print. Eleven different heights are also what make a column flow read
 * as a wall.
 *
 * `alt=""` throughout, and deliberately: the tile is a link whose accessible
 * name is already the design's name and its description. A photograph announced
 * again inside it would be a second name for the same destination.
 */
export function SpecimenPlate({ id }: { id: SpecimenId }) {
  const { image, aspect, treatment } = SPECIMENS[id]

  const photo = (className?: string) => (
    <Picture name={`journey/${image}`} alt="" className={cn('size-full object-cover', className)} />
  )

  const ratio = { aspectRatio: aspect }

  switch (treatment) {
    // Journey — a card hung on the timeline, held by a strip of washi.
    case 'polaroid':
      return (
        <div className="relative -rotate-[1.5deg] rounded-[2px] bg-[#fcf9f1] p-2 pb-5 shadow-[0_6px_16px_rgb(90_81_66_/_0.22)]">
          {/* Journey's own washi, `--color-tape` — not its accent. The burnt
              red is rationed to six things in globals.css and holding a card
              down is not one of them. */}
          <span
            aria-hidden
            className="absolute -top-2 left-[18%] h-[15px] w-[34%] -rotate-3 bg-[#e4d6b7]/85"
          />
          <div style={ratio} className="overflow-hidden bg-[#e6dccb]">
            {photo()}
          </div>
          <span
            aria-hidden
            className="absolute right-3 bottom-2 left-3 border-b border-dashed border-[#96856b]/50"
          />
        </div>
      )

    // Filmstrip — a frame of 8mm stock, running between its perforations.
    case 'sprockets':
      return (
        // A column rather than three stacked layers: on real stock the
        // perforations run *beside* the frame, not over it, and laying them on
        // top put a row of holes across two faces.
        <div style={ratio} className="flex flex-col overflow-hidden bg-[#241611]">
          <span
            aria-hidden
            className="h-[13%] shrink-0 bg-[repeating-linear-gradient(90deg,#0d0906_0_7px,#241611_7px_16px)]"
          />
          <div className="min-h-0 flex-1 overflow-hidden">
            {photo('[filter:sepia(0.34)_contrast(1.06)_brightness(0.94)]')}
          </div>
          <span
            aria-hidden
            className="h-[13%] shrink-0 bg-[repeating-linear-gradient(90deg,#0d0906_0_7px,#241611_7px_16px)]"
          />
        </div>
      )

    // Postcards — the picture side, with the stamp and the postmark over it.
    case 'stamp':
      return (
        <div
          style={ratio}
          className="relative border-[5px] border-white bg-white shadow-[0_5px_14px_rgb(58_44_32_/_0.22)]"
        >
          {photo()}
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-[22px] border border-dashed border-[#b23a48]/70 bg-[#f4ece0]"
          />
          <span
            aria-hidden
            className="absolute top-1 right-1 size-[30px] -rotate-12 rounded-full border border-[#b23a48]/55"
          />
        </div>
      )

    // The map — the same photograph, printed onto the parchment.
    case 'parchment':
      return (
        <div style={ratio} className="relative overflow-hidden rounded-[2px]">
          {photo('[filter:sepia(0.5)_contrast(0.95)_brightness(1.04)]')}
          <span
            aria-hidden
            className="absolute inset-0 bg-[#ece3cf] opacity-45 mix-blend-overlay"
          />
          <svg
            aria-hidden
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <path
              d="M8 40C26 40 30 12 52 14s24 22 40 18"
              fill="none"
              stroke="#a9852f"
              strokeWidth="1.4"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            aria-hidden
            className="absolute top-[24%] right-[8%] size-2 rounded-full border-2 border-[#2f4a3c] bg-[#ece3cf]"
          />
        </div>
      )

    // The wall — a polaroid, taped up crooked.
    case 'pinned':
      return (
        <div className="relative rotate-[2.5deg] bg-[#fbf7ef] p-2 pb-7 shadow-[0_8px_20px_rgb(51_48_43_/_0.2)]">
          <span
            aria-hidden
            className="absolute -top-2.5 left-1/2 h-[17px] w-[38%] -translate-x-1/2 rotate-2 bg-[rgb(159_176_160_/_0.55)]"
          />
          <div style={ratio} className="overflow-hidden bg-[#e6dccb]">
            {photo()}
          </div>
        </div>
      )

    // Letters — seen through the rose paper, with the wax still on it.
    case 'blush':
      return (
        <div style={ratio} className="relative overflow-hidden rounded-[2px]">
          {photo('[filter:saturate(0.88)]')}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(239_217_221_/_0.4),rgb(88_51_73_/_0.42))]"
          />
          {/* The pocket of the envelope the photograph is sitting in, and the
              wax on its point. The seal was on its own to begin with and read
              as a pink balloon on the table — it needs the flap under it to be
              legible as wax. */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(160deg,#e6bcc4,#d8a3ad_55%,#c78d99)] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]"
          />
          <span
            aria-hidden
            className="absolute bottom-[32%] left-1/2 size-[19px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#b9707f,#8c4a5c)] ring-1 ring-[#c19a3f]/70"
          />
        </div>
      )

    // The mixtape — the photograph *is* the record's label.
    case 'label':
      return (
        <div style={ratio} className="relative grid place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_50%_50%,#0a0c0d_0_2px,#16211f_2px_4px)] shadow-[0_8px_22px_rgb(0_0_0_/_0.5)]"
          />
          <div className="relative size-[54%] overflow-hidden rounded-full ring-1 ring-[#d6a24a]/50">
            {photo()}
          </div>
          <span
            aria-hidden
            className="absolute size-[7%] rounded-full bg-[#0d1214] ring-1 ring-[#d6a24a]/40"
          />
        </div>
      )

    // The album — pressed onto the leaf, gone warm with age.
    case 'sepia':
      return (
        <div className="rounded-[2px] bg-[#f6efe0] p-1.5 shadow-[0_6px_16px_rgb(0_0_0_/_0.4)]">
          <div style={ratio} className="overflow-hidden ring-1 ring-[#c9a24b]/45">
            {photo('[filter:sepia(0.38)_contrast(1.03)]')}
          </div>
        </div>
      )

    // The constellation — the same night, with the stars out.
    case 'night':
      return (
        <div style={ratio} className="relative overflow-hidden rounded-[2px]">
          {photo('[filter:brightness(0.5)_saturate(0.65)]')}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_14_31_/_0.5),rgb(58_42_94_/_0.55))]"
          />
          <svg aria-hidden viewBox="0 0 100 60" className="absolute inset-0 size-full">
            <path
              d="M16 44 34 20l22 16 24-22"
              fill="none"
              stroke="#e9c877"
              strokeWidth="0.7"
              opacity="0.65"
            />
            <circle cx="16" cy="44" r="1.9" fill="#fdf6e3" />
            <circle cx="34" cy="20" r="1.9" fill="#fdf6e3" />
            <circle cx="56" cy="36" r="1.9" fill="#fdf6e3" />
            <circle cx="80" cy="14" r="1.9" fill="#e9c877" />
          </svg>
        </div>
      )

    // The storybook — a full-bleed scene, with the type's ground already laid.
    case 'bleed':
      return (
        <div style={ratio} className="relative overflow-hidden">
          {photo()}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(26_22_20_/_0.85))]"
          />
        </div>
      )

    // The exhibition — hung, matted and framed in brass.
    case 'framed':
      return (
        <div className="bg-[linear-gradient(145deg,#5a5344,#3a352c)] p-[6px] shadow-[0_10px_24px_rgb(60_54_40_/_0.35)]">
          <div className="bg-[#f6f2e9] p-[7px]">
            <div style={ratio} className="overflow-hidden ring-1 ring-[#b08a3e]/45">
              {photo()}
            </div>
          </div>
        </div>
      )
  }
}
