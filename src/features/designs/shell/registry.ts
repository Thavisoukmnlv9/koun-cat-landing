import type { ComponentType } from 'react'

import { JourneyPage } from '@/features/journey/journey-page'

import { FilmstripDesign } from '../filmstrip/filmstrip-design'
import { GalleryDesign } from '../gallery/gallery-design'
import { LettersDesign } from '../letters/letters-design'
import { MapDesign } from '../map/map-design'
import { PostcardsDesign } from '../postcards/postcards-design'

export type DesignId = 'journey' | 'filmstrip' | 'postcards' | 'map' | 'gallery' | 'letters'

export interface DesignEntry {
  id: DesignId
  /**
   * Key into the `designs` namespace for the tab's label. A template literal
   * rather than `string`, so `t()` can still prove the key exists — a widened
   * `string` puts the whole call back on the untyped overload.
   */
  labelKey: `tabs.${DesignId}`
  /**
   * How many memories this design shows.
   *
   * Not a style choice — each prototype was composed for a particular count,
   * and the wall was the only one built to hold eight. Journey ignores it and
   * renders its own ten.
   */
  memoryCount: number
  Component: ComponentType
}

/**
 * The six tabs, in the order the hub page listed them.
 *
 * Journey comes first because it is the finished page and the thing the other
 * five are alternatives to — and because putting it anywhere else would make
 * the default view a prototype.
 */
export const DESIGNS: readonly DesignEntry[] = [
  { id: 'journey', labelKey: 'tabs.journey', memoryCount: 10, Component: JourneyPage },
  { id: 'filmstrip', labelKey: 'tabs.filmstrip', memoryCount: 6, Component: FilmstripDesign },
  { id: 'postcards', labelKey: 'tabs.postcards', memoryCount: 6, Component: PostcardsDesign },
  { id: 'map', labelKey: 'tabs.map', memoryCount: 6, Component: MapDesign },
  { id: 'gallery', labelKey: 'tabs.gallery', memoryCount: 8, Component: GalleryDesign },
  { id: 'letters', labelKey: 'tabs.letters', memoryCount: 6, Component: LettersDesign },
]

export const DEFAULT_DESIGN: DesignId = 'journey'

/** Narrow a `location.hash` fragment to a design id. */
export function toDesignId(value: string | undefined | null): DesignId | undefined {
  const slug = value?.replace(/^#/, '')
  return DESIGNS.find((d) => d.id === slug)?.id
}
