import type { DesignId } from '../../shell/registry'

/**
 * What each design looks like, in eleven lines.
 *
 * The home page is a specimen sheet rather than a menu: every tile is painted in
 * its design's own ground, set in its design's own faces, and carries one of the
 * archive's photographs treated the way that design treats photographs. A tile
 * is a miniature of the thing behind it, not a thumbnail of it.
 *
 * Most of that comes free. `designs.css` already declares each design's palette
 * *and* its font stacks in a single scoped class, and those classes set nothing
 * but custom properties and a background — so putting `d-mixtape` on a tile
 * hands it the mixtape's exact typography in one attribute, with the
 * `"Noto Sans"` tail that keeps Lao readable already on every stack.
 *
 * What a scope class cannot give a *shared* component is a name for "the ink" or
 * "the accent": those are `--d-cream`/`--d-brass` on one design and
 * `--d-page`/`--d-gold` on the next. So the four colour roles are repeated here
 * as plain hexes and reach the tile as `--s-*`. That is the one duplication in
 * this file, and it is the price of one tile component instead of eleven.
 */

/** Every design except home itself — a sheet does not list the sheet. */
export type SpecimenId = Exclude<DesignId, 'home'>

export interface Specimen {
  /**
   * The numeral the prototype filed itself under (`01-filmstrip.html` → I).
   * Journey has none: it is the finished page, not one of the ten variants.
   */
  numeral: string
  /** Basename under `/public/images/journey`. One photograph per design, never repeated. */
  image: string
  /**
   * The plate's `aspect-ratio`, as an inline style rather than a class.
   *
   * It varies per design because it is a true fact about each — the storybook is
   * a full-height scene, the wall is a square polaroid, the map is a wide
   * landscape — and because varying heights are what make a column flow read as
   * a wall rather than a grid. Inline, because Tailwind extracts candidates from
   * source text and would need every `aspect-[…]` to appear here verbatim; a
   * style rule cannot be missed by a scanner.
   */
  aspect: string
  /** Which of the eleven photo treatments `specimen-plate.tsx` should draw. */
  treatment:
    | 'polaroid'
    | 'sprockets'
    | 'stamp'
    | 'parchment'
    | 'pinned'
    | 'blush'
    | 'label'
    | 'sepia'
    | 'night'
    | 'bleed'
    | 'framed'
  /** Whether the name is set in the design's display face or its script face. */
  voice: 'display' | 'script'
  /** The four colour roles, lifted from the design's own scope class. */
  ground: string
  ink: string
  /**
   * The design's accent, as *ink*.
   *
   * The tile spends it on the numeral, the mark beside it and the "open →"
   * line, all of which are text at 9-13px — so where a design keeps a separate
   * readable companion for its metal (the map's and the wall's `--d-gold-ink`)
   * this takes that one, not the metal itself. The metal still appears on the
   * tile: it is one of the five stops in `swatch` below, which is a picture of
   * a palette rather than something anyone has to read.
   */
  accent: string
  muted: string
  /** Five stops, for the tile's swatch bar and the hero's continuous rule. */
  swatch: readonly [string, string, string, string, string]
  /**
   * Two faces this design actually sets, named.
   *
   * Not in the i18n bundle: they are proper nouns that read the same in every
   * language, and twenty-two untranslatable strings would be twenty-two more
   * lines for a translator to skip past.
   *
   * Chosen by hand rather than taken mechanically from `--d-display`/`--d-body`,
   * because five of the eleven share Cormorant Garamond as their display face
   * and naming it five times says nothing. Each pair is the two faces that
   * actually characterise its design.
   */
  faces: readonly [string, string]
}

/**
 * Keyed rather than ordered, deliberately.
 *
 * The order of the wall is the order of the tab bar, and that lives in
 * `shell/registry.ts`. A second ordered list here would be a second place for it
 * to drift. As a `Record` over `SpecimenId` it also fails to compile the moment
 * a design is added to the registry without a specimen to go with it.
 */
export const SPECIMENS: Record<SpecimenId, Specimen> = {
  journey: {
    numeral: '',
    image: 'm20',
    aspect: '4 / 3',
    treatment: 'polaroid',
    voice: 'display',
    ground: '#efe7d7',
    ink: '#2e2921',
    accent: '#a54b3a',
    muted: '#73654e',
    swatch: ['#efe7d7', '#a54b3a', '#5a5142', '#73654e', '#2e2921'],
    faces: ['EB Garamond', 'Caveat'],
  },
  filmstrip: {
    numeral: 'I',
    image: 'n1',
    aspect: '16 / 9',
    treatment: 'sprockets',
    voice: 'display',
    ground: '#17100c',
    ink: '#efe6d4',
    accent: '#c8a24b',
    muted: '#9b8468',
    swatch: ['#17100c', '#2c1c15', '#c8a24b', '#e8785a', '#efe6d4'],
    faces: ['Cormorant Garamond', 'Space Mono'],
  },
  postcards: {
    numeral: 'II',
    image: 'n4',
    aspect: '3 / 2',
    treatment: 'stamp',
    voice: 'display',
    ground: '#f4ece0',
    ink: '#2a2320',
    accent: '#b23a48',
    muted: '#776859',
    swatch: ['#f4ece0', '#b23a48', '#1d3b6e', '#b98a2e', '#2a2320'],
    faces: ['Fraunces', 'Karla'],
  },
  map: {
    numeral: 'III',
    image: 'n6',
    aspect: '2 / 1',
    treatment: 'parchment',
    voice: 'display',
    ground: '#ece3cf',
    ink: '#33291b',
    accent: '#7b6122',
    muted: '#7a6134',
    swatch: ['#ece3cf', '#7a6134', '#2f4a3c', '#9a792b', '#486787'],
    faces: ['Cinzel', 'Spectral'],
  },
  gallery: {
    numeral: 'IV',
    image: 'n3',
    aspect: '1 / 1',
    treatment: 'pinned',
    voice: 'script',
    ground: '#efe7db',
    ink: '#33302b',
    accent: '#836221',
    muted: '#6d665d',
    swatch: ['#efe7db', '#d9a7a0', '#9fb0a0', '#e6cf94', '#33302b'],
    faces: ['DM Serif Display', 'Sacramento'],
  },
  letters: {
    numeral: 'V',
    image: 'm09',
    aspect: '3 / 4',
    treatment: 'blush',
    voice: 'script',
    ground: '#efd9dd',
    ink: '#583349',
    accent: '#7f5566',
    muted: '#795867',
    swatch: ['#efd9dd', '#d8a3ad', '#7f5566', '#583349', '#c19a3f'],
    faces: ['Pinyon Script', 'EB Garamond'],
  },
  mixtape: {
    numeral: 'VI',
    image: 'm19',
    aspect: '1 / 1',
    treatment: 'label',
    voice: 'display',
    ground: '#0d1214',
    ink: '#efe7d6',
    accent: '#d6a24a',
    muted: '#8fa39c',
    swatch: ['#0d1214', '#123b3a', '#d6a24a', '#e2674a', '#efe7d6'],
    faces: ['Bricolage Grotesque', 'Figtree'],
  },
  album: {
    numeral: 'VII',
    image: 'm14',
    aspect: '4 / 3',
    treatment: 'sepia',
    voice: 'display',
    ground: '#2a1a15',
    ink: '#f6efe0',
    accent: '#c9a24b',
    muted: '#a58a6a',
    swatch: ['#2a1a15', '#5a1f22', '#c9a24b', '#f6efe0', '#3a2f22'],
    faces: ['Cormorant Garamond', 'Cinzel'],
  },
  constellation: {
    numeral: 'VIII',
    image: 'm17',
    aspect: '3 / 2',
    treatment: 'night',
    voice: 'display',
    ground: '#0a0e1f',
    ink: '#fdf6e3',
    accent: '#e9c877',
    muted: '#8890b8',
    swatch: ['#0a0e1f', '#3a2a5e', '#e9c877', '#b7a6e6', '#cfe0ff'],
    faces: ['Cormorant Garamond', 'Space Mono'],
  },
  storybook: {
    numeral: 'IX',
    image: 'm18',
    aspect: '9 / 16',
    treatment: 'bleed',
    voice: 'display',
    ground: '#1a1614',
    ink: '#f4ece1',
    accent: '#c8a24b',
    muted: '#c9bba9',
    swatch: ['#1a1614', '#d98b7a', '#c8a24b', '#f4ece1', '#8a8478'],
    faces: ['Fraunces', 'Karla'],
  },
  exhibition: {
    numeral: 'X',
    image: 'm11',
    aspect: '4 / 5',
    treatment: 'framed',
    voice: 'display',
    ground: '#e7e2d8',
    ink: '#1c1a17',
    accent: '#7a602b',
    muted: '#68635a',
    swatch: ['#e7e2d8', '#7a602b', '#3a352c', '#2c2926', '#f6f2e9'],
    faces: ['Cormorant Garamond', 'Jost'],
  },
}

/**
 * The order the wall is laid out in, taken from the object above.
 *
 * `Object.keys` rather than a second hand-written array: the `Record` type
 * already forces an entry for every design, so this list cannot go short, gain a
 * duplicate, or name something that does not exist. It matches the tab bar's
 * order in `shell/registry.ts`, which is where that order is decided — reading
 * it from there directly would mean `registry → home-design → registry`, and a
 * module cycle is a steep price for eleven strings.
 */
export const SPECIMEN_IDS = Object.keys(SPECIMENS) as SpecimenId[]
