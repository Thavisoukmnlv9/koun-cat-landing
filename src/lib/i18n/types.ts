import type { SupportedLocale } from '@/config/languages'

/**
 * Maps every leaf of a source object `T` to `string`, preserving its structure.
 *
 * Applied as `TranslationShape<typeof en>` to a translation file, it forces every
 * other language to mirror `en`'s exact key tree while leaving the values free —
 * so a missing or misspelled key in `lo`/`th`/`vi`/`zh` becomes a compile error.
 * This is most of the cross-language key-parity guarantee, for free, at `tsc` time.
 */
export type TranslationShape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly unknown[]
      ? T[K]
      : TranslationShape<T[K]>
}

/**
 * A feature's contribution to i18n: one namespace, one resource object per
 * supported locale. Feature `i18n/index.ts` files export one of these; the app
 * layer (`@/app/i18n`) composes them into the i18next instance.
 */
export interface I18nFeatureBundle {
  namespace: string
  resources: Record<SupportedLocale, Record<string, unknown>>
}
