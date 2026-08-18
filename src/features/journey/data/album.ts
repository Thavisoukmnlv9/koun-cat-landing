/**
 * The album's six photographic plates.
 *
 * The cover is deliberately not an entry here. Its right-hand leaf is a printed
 * board — an edition line and a title over a red wash, with no photograph — so
 * it is different markup, not a plate with different content. Spread 0 renders
 * `<AlbumCover>`; spreads 1..6 render `ALBUM_PLATES[spread - 1]`.
 */

export type AlbumPlateId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'

/** Full i18n key paths for one plate; see the note in `postcards.ts`. */
const plateKeys = <Id extends AlbumPlateId>(id: Id) =>
  ({
    label: `album.plates.${id}.label`,
    title: `album.plates.${id}.title`,
    caption: `album.plates.${id}.caption`,
    footer: `album.plates.${id}.footer`,
  }) as const

export interface AlbumPlate {
  id: AlbumPlateId
  /** Basename under `/public/images/journey`. */
  image: string
  keys: ReturnType<typeof plateKeys<AlbumPlateId>>
}

export const ALBUM_PLATES: readonly AlbumPlate[] = [
  { id: 'p1', image: 'm02', keys: plateKeys('p1') },
  { id: 'p2', image: 'm07', keys: plateKeys('p2') },
  { id: 'p3', image: 'm08', keys: plateKeys('p3') },
  { id: 'p4', image: 'm11', keys: plateKeys('p4') },
  { id: 'p5', image: 'm06', keys: plateKeys('p5') },
  { id: 'p6', image: 'm03', keys: plateKeys('p6') },
]

/** Spread 0 is the cover; spreads 1..6 are the plates. */
export const SPREAD_COUNT = ALBUM_PLATES.length + 1
export const LAST_SPREAD = SPREAD_COUNT - 1
