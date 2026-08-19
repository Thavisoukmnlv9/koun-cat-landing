import type { SpecimenId } from '../data/specimens'

/**
 * A maker's mark for each design — the smallest drawing that says which one it
 * is: sprocket holes, a stamp's perforation, a pin on a trail, a wax seal, a
 * record's grooves.
 *
 * Eleven glyphs rather than one shared bullet, because on a specimen sheet the
 * mark is doing the same job the palette and the typeface are doing — telling
 * you what you are about to open before you read its name. They are drawn at a
 * common 20×20 box and inherit `currentColor`, so the tile decides the size and
 * the accent without any of them knowing which design they belong to.
 *
 * Decorative, and named by the tile's own text, so every one is `aria-hidden`.
 */
const MARKS: Record<SpecimenId, React.ReactNode> = {
  // The dashed spine of the timeline, with two cards hanging off it.
  journey: (
    <>
      <path d="M10 2v16" strokeDasharray="2 2.5" />
      <rect x="2.5" y="5" width="5" height="4" rx="0.6" />
      <rect x="12.5" y="11" width="5" height="4" rx="0.6" />
    </>
  ),
  // A frame between two perforated edges.
  filmstrip: (
    <>
      <rect x="2" y="6.5" width="16" height="7" rx="0.6" />
      <path d="M3.5 3.5h1M7.5 3.5h1M11.5 3.5h1M15.5 3.5h1" strokeLinecap="round" />
      <path d="M3.5 16.5h1M7.5 16.5h1M11.5 16.5h1M15.5 16.5h1" strokeLinecap="round" />
    </>
  ),
  // A stamp in the corner of a card, and the ring of a postmark over it.
  postcards: (
    <>
      <rect x="2" y="4" width="16" height="12" rx="0.6" />
      <rect x="12" y="6" width="4" height="4" rx="0.4" strokeDasharray="1 1" />
      <circle cx="6.5" cy="11.5" r="2.6" />
    </>
  ),
  // A trail, and the pin standing at the end of it.
  map: (
    <>
      <path d="M2.5 15c3-1 3.5-6 7-6.5s4.5 2 6 1" strokeDasharray="2 2" strokeLinecap="round" />
      <path d="M15 3.5a2.4 2.4 0 0 0-2.4 2.4c0 1.7 2.4 4.1 2.4 4.1s2.4-2.4 2.4-4.1A2.4 2.4 0 0 0 15 3.5Z" />
    </>
  ),
  // Two prints overlapping on the wall, one taped.
  gallery: (
    <>
      <rect x="2.5" y="5" width="9" height="10" rx="0.5" transform="rotate(-6 7 10)" />
      <rect x="9.5" y="6" width="8" height="9" rx="0.5" transform="rotate(5 13.5 10.5)" />
      <path d="M5.5 4.2h3.5" strokeLinecap="round" />
    </>
  ),
  // An envelope, still sealed.
  letters: (
    <>
      <rect x="2" y="4.5" width="16" height="11" rx="0.8" />
      <path d="M2 5.5 10 11l8-5.5" />
      <circle cx="10" cy="11.8" r="2" />
    </>
  ),
  // The record, its label, and the spindle.
  mixtape: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="10" cy="10" r="3" />
      <circle cx="10" cy="10" r="0.7" />
    </>
  ),
  // A spine with its gold rules.
  album: (
    <>
      <rect x="3" y="2.5" width="14" height="15" rx="1.2" />
      <path d="M6.5 2.5v15" />
      <path d="M9.5 6.5h5M9.5 10h5M9.5 13.5h3" strokeLinecap="round" />
    </>
  ),
  // Four stars and the lines between them.
  constellation: (
    <>
      <path d="m4 14 3.5-7.5L13 11l3.5-6.5" strokeLinejoin="round" />
      <circle cx="4" cy="14" r="1.3" />
      <circle cx="7.5" cy="6.5" r="1.3" />
      <circle cx="13" cy="11" r="1.3" />
      <circle cx="16.5" cy="4.5" r="1.3" />
    </>
  ),
  // An open book.
  storybook: (
    <>
      <path d="M10 5.5C8.5 4 6 3.5 2.5 3.8v11c3.5-.3 6 .2 7.5 1.7 1.5-1.5 4-2 7.5-1.7v-11C14 3.5 11.5 4 10 5.5Z" />
      <path d="M10 5.5v11" />
    </>
  ),
  // A framed piece, matted, under its spotlight.
  exhibition: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="0.6" />
      <rect x="6" y="6" width="8" height="8" rx="0.4" />
      <path d="M10 3V1" strokeLinecap="round" />
    </>
  ),
}

export function TileMark({ id, className }: { id: SpecimenId; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      className={className}
    >
      {MARKS[id]}
    </svg>
  )
}
