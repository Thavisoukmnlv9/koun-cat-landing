/**
 * The ten postcards on the timeline, and the polaroid in the header.
 *
 * Everything here is geometry and identity — where a card hangs, how far it
 * leans, where its tape sits. The words live in `../i18n/en.ts`, reached through
 * the `keys` object on each record.
 *
 * Why the angles are data rather than CSS: they are authored, not generated.
 * A `Math.random()` in the component would re-roll on every render, and a
 * postcard re-renders every time it is flipped — the card would jump to a new
 * angle the moment you turned it over. `nth-child` rules would be stable but
 * would duplicate page order into the stylesheet. And Tailwind cannot express
 * them at all: it scans source text and has no runtime, so a class built from
 * `card.tilt` never compiles. The numbers therefore reach CSS as custom
 * properties, while every colour, easing and duration stays in the theme.
 */

/** One strip of washi tape holding a card to the page. */
export interface WashiTape {
  /** Which edge the strip is anchored to. `center` straddles the midline. */
  anchor: 'left' | 'right' | 'center'
  /** px in from that edge; ignored when `anchor` is `center`. */
  offset: number
  /** px above the card's top edge — always negative, so the strip overhangs. */
  top: number
  width: number
  height: number
  /** Degrees. Small, and never the same twice; that is the whole point. */
  rotate: number
  /** 0.60–0.70. The strips are not uniformly opaque in the original either. */
  opacity: number
}

export type PostcardId =
  'c01' | 'c02' | 'c03' | 'c04' | 'c05' | 'c06' | 'c07' | 'c08' | 'c09' | 'c10'

/**
 * Full i18n key paths for one card.
 *
 * Stored rather than composed at the call site, following the same pattern the
 * project already used for hero slide alt text: a stored `as const` string is a
 * literal type that i18next's typed `t()` accepts directly, where a template
 * built in JSX widens into a 10x6 union that is slow to check and easy to break.
 */
const cardKeys = <Id extends PostcardId>(id: Id) =>
  ({
    date: `cards.${id}.date`,
    place: `cards.${id}.place`,
    title: `cards.${id}.title`,
    caption: `cards.${id}.caption`,
    back: `cards.${id}.back`,
    shortDate: `cards.${id}.shortDate`,
  }) as const

export interface Postcard {
  /** Stable id; also the i18n sub-key. */
  id: PostcardId
  /**
   * Printed on the back as "postcard no. NN". Stored zero-padded rather than
   * derived, so the padding is visible here instead of hidden in a `padStart`
   * somewhere in the markup.
   */
  number: string
  /** Basename under `/public/images/journey`, no extension or size suffix. */
  image: string
  /** Which side of the dashed spine the card hangs from. */
  align: 'start' | 'end'
  /** Degrees the card enters at, before the reveal straightens it. */
  enterTilt: number
  /** The residual lean it settles into. Never zero, or it looks printed. */
  tilt: number
  tapes: readonly WashiTape[]
  keys: ReturnType<typeof cardKeys<PostcardId>>
}

export const POSTCARDS: readonly Postcard[] = [
  {
    id: 'c01',
    number: '01',
    image: 'm20',
    align: 'start',
    enterTilt: -7,
    tilt: -2.1,
    tapes: [
      { anchor: 'left', offset: 22, top: -14, width: 92, height: 26, rotate: -5, opacity: 0.68 },
      { anchor: 'right', offset: 18, top: -12, width: 80, height: 24, rotate: 6, opacity: 0.6 },
    ],
    keys: cardKeys('c01'),
  },
  {
    id: 'c02',
    number: '02',
    image: 'n1',
    align: 'end',
    enterTilt: 6,
    tilt: 1.8,
    tapes: [
      { anchor: 'center', offset: 0, top: -13, width: 92, height: 26, rotate: 2, opacity: 0.66 },
    ],
    keys: cardKeys('c02'),
  },
  {
    id: 'c03',
    number: '03',
    image: 'n4',
    align: 'start',
    enterTilt: -6,
    tilt: -1.4,
    tapes: [
      { anchor: 'right', offset: 26, top: -13, width: 86, height: 25, rotate: -7, opacity: 0.62 },
    ],
    keys: cardKeys('c03'),
  },
  {
    id: 'c04',
    number: '04',
    image: 'n6',
    align: 'end',
    enterTilt: 7,
    tilt: 2.2,
    tapes: [
      { anchor: 'left', offset: 24, top: -14, width: 90, height: 26, rotate: 4, opacity: 0.66 },
    ],
    keys: cardKeys('c04'),
  },
  {
    id: 'c05',
    number: '05',
    image: 'n3',
    align: 'start',
    enterTilt: -5,
    tilt: -2.4,
    tapes: [
      { anchor: 'right', offset: 22, top: -13, width: 88, height: 25, rotate: -4, opacity: 0.62 },
    ],
    keys: cardKeys('c05'),
  },
  {
    id: 'c06',
    number: '06',
    image: 'm09',
    align: 'end',
    enterTilt: 6,
    tilt: 1.5,
    tapes: [
      { anchor: 'center', offset: 0, top: -13, width: 88, height: 25, rotate: -2, opacity: 0.64 },
    ],
    keys: cardKeys('c06'),
  },
  {
    id: 'c07',
    number: '07',
    image: 'm19',
    align: 'start',
    enterTilt: -6,
    tilt: -1.8,
    tapes: [
      { anchor: 'right', offset: 24, top: -14, width: 90, height: 26, rotate: 5, opacity: 0.66 },
    ],
    keys: cardKeys('c07'),
  },
  {
    id: 'c08',
    number: '08',
    image: 'm14',
    align: 'end',
    enterTilt: 7,
    tilt: 2.4,
    tapes: [
      { anchor: 'left', offset: 26, top: -13, width: 86, height: 25, rotate: -6, opacity: 0.62 },
    ],
    keys: cardKeys('c08'),
  },
  {
    id: 'c09',
    number: '09',
    image: 'm18',
    align: 'start',
    enterTilt: -7,
    tilt: -1.2,
    tapes: [
      { anchor: 'right', offset: 28, top: -13, width: 84, height: 25, rotate: 4, opacity: 0.6 },
    ],
    keys: cardKeys('c09'),
  },
  {
    id: 'c10',
    number: '10',
    image: 'm17',
    align: 'end',
    enterTilt: 5,
    tilt: 1.2,
    tapes: [
      { anchor: 'center', offset: 0, top: -14, width: 96, height: 27, rotate: -3, opacity: 0.68 },
    ],
    keys: cardKeys('c10'),
  },
]

/** The single photo in the header, taped up above the timeline. */
export const HEADER_POLAROID = {
  image: 'n2',
  enterTilt: -6,
  tilt: -1.6,
  /** Rises less far than a postcard — it is already near the top of the page. */
  revealY: 26,
  tape: {
    anchor: 'center',
    offset: 0,
    top: -15,
    width: 104,
    height: 28,
    rotate: -3,
    opacity: 0.7,
  },
} as const satisfies {
  image: string
  enterTilt: number
  tilt: number
  revealY: number
  tape: WashiTape
}
