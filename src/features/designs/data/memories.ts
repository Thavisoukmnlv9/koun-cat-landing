import { POSTCARDS, type Postcard, type PostcardId } from '@/features/journey/data/postcards'

/**
 * One archive, read five ways.
 *
 * The prototypes each declared their own `MEM` array — `{t,d,s}` for the
 * filmstrip, `{place,greet,note,sign}` for the postcards, `{place,when,dist}`
 * for the map — and told the same six memories five times over in five
 * different sets of words. Five copies of a love letter is five places for it
 * to drift.
 *
 * So there is one list, and it is derived rather than retyped: the photographs,
 * the dates, the places and the notes all still belong to
 * `features/journey/data/postcards.ts`, which stays the single source of truth.
 * This module adds only what the designs need on top — which of the three media
 * a memory is, and where to find the flavour copy that decorates it.
 *
 * That makes `designs` depend on `journey`, deliberately. The alternative was to
 * lift the archive into a shared layer, which would have moved ten postcards and
 * their washi tape out of the feature that actually renders them in order to
 * serve five previews. Journey owns the content; these are five readings of it.
 */

/** The three kinds of thing a memory can be. Drives the badge and the player. */
export type MemoryKind = 'photo' | 'voice' | 'film'

/**
 * Full i18n key paths into the `designs` namespace for one memory, following
 * the convention journey established: stored `as const` so each is a literal
 * type `t()` accepts, rather than a template built at the call site that widens
 * into a union.
 */
const flavourKeys = <Id extends PostcardId>(id: Id) =>
  ({
    dist: `memories.${id}.dist`,
    greet: `memories.${id}.greet`,
    postSign: `memories.${id}.postSign`,
    salut: `memories.${id}.salut`,
    sign: `memories.${id}.sign`,
    who: `memories.${id}.who`,
  }) as const

export interface Memory {
  id: PostcardId
  /** Zero-padded, printed as "frame 01", "postcard № 01". */
  number: string
  /** Basename under `/public/images/journey`. */
  image: string
  kind: MemoryKind
  /** Degrees of residual lean, authored per card. Reused by the gallery wall. */
  tilt: number
  /** Into the `journey` namespace: date, place, title, caption, back, shortDate. */
  keys: Postcard['keys']
  /** Into the `designs` namespace: the decoration each design adds. */
  flavour: ReturnType<typeof flavourKeys<PostcardId>>
}

/** The one film and the one song the archive actually holds. */
export const FILM_SRC = '/videos/summertime_sadness.mp4'
export const VOICE_SRC = '/music/summertime_sadness.mp3'

/**
 * Which memory is a film and which is a song.
 *
 * Authored here rather than derived, because there is exactly one of each and
 * the choice is editorial: Songkran in the street is the one that wants moving
 * pictures, and the usual table is the one with a song over it. Both sit inside
 * the first six so every design shows all three kinds — the filmstrip, the map
 * and the letters only reach that far.
 */
const KINDS: Partial<Record<PostcardId, MemoryKind>> = {
  c05: 'film',
  c06: 'voice',
}

/**
 * The first eight postcards, which is as far as the flavour copy goes.
 *
 * Six is the count every prototype was composed for; the wall was built for
 * eight. Going further means writing four more salutations and four more
 * distances — copy about a real relationship, which belongs to its author
 * rather than to whoever is porting the markup. Raising `memoryCount` in
 * `shell/registry.ts` is the only other change it would need.
 */
export const MEMORIES: readonly Memory[] = POSTCARDS.slice(0, 8).map((card) => ({
  id: card.id,
  number: card.number,
  image: card.image,
  kind: KINDS[card.id] ?? 'photo',
  tilt: card.tilt,
  keys: card.keys,
  flavour: flavourKeys(card.id),
}))

/** The first `count` memories, for a design composed for fewer than all of them. */
export function memoriesFor(count: number): readonly Memory[] {
  return MEMORIES.slice(0, count)
}
