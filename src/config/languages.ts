/**
 * Single source of truth for the languages the site ships.
 *
 * - `code`  — the i18next language and the persisted value.
 * - `tag`   — the BCP-47 form, used for `<html lang>` and future metadata.
 * - `label` — the native-script name shown in the language switcher.
 * - `dir`   — writing direction; neither language is RTL today.
 *
 * Adding a language is a one-line change here plus a locale file per bundle.
 */
export const LANGUAGE_CODES = ['en', 'lo'] as const

export type SupportedLocale = (typeof LANGUAGE_CODES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export interface LanguageDef {
  code: SupportedLocale
  tag: string
  label: string
  dir: 'ltr' | 'rtl'
}

export const LANGUAGES: readonly LanguageDef[] = [
  { code: 'en', tag: 'en-US', label: 'English', dir: 'ltr' },
  { code: 'lo', tag: 'lo-LA', label: 'ລາວ', dir: 'ltr' },
]

/** Look up a language definition by its short code. */
export function languageOf(code: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.code === code)
}

/** Map a short code to its canonical BCP-47 tag. */
export function codeToTag(code: string): string {
  return languageOf(code)?.tag ?? 'en-US'
}

/** Narrow an arbitrary value (navigator language, stored value) to a supported code. */
export function toSupportedLocale(value: string | undefined | null): SupportedLocale | undefined {
  if (!value) return undefined
  const base = value.split('-')[0]
  return LANGUAGE_CODES.find((c) => c === base)
}
