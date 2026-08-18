import i18next from 'i18next'

import { languageOf, type SupportedLocale } from '@/config/languages'

/**
 * Maps each language to the font files its script needs. English rides the
 * Latin faces already preloaded from index.html, so it has nothing extra to
 * warm. `unicode-range` in fonts.css guarantees the Lao files *will* load once
 * a Lao glyph is painted — this preloader just skips the FOIT window at the
 * moment the user flips the switcher, before any Lao text has rendered.
 */
const FONTS_BY_LANG: Record<SupportedLocale, readonly string[]> = {
  en: [],
  lo: [
    '/fonts/noto-sans-lao-regular.woff2',
    '/fonts/noto-sans-lao-medium.woff2',
    '/fonts/noto-sans-lao-bold.woff2',
  ],
}

const preloaded = new Set<string>()

function preloadFont(href: string): void {
  if (preloaded.has(href)) return
  preloaded.add(href)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = 'font/woff2'
  link.href = href
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

function isSupportedLang(value: string): value is SupportedLocale {
  return value in FONTS_BY_LANG
}

/** Reflect the active language on `<html>` and warm the fonts its script needs. */
function applyLang(lang: string): void {
  const code = lang.split('-')[0]
  if (!isSupportedLang(code)) return
  document.documentElement.lang = code
  document.documentElement.dir = languageOf(code)?.dir ?? 'ltr'
  for (const href of FONTS_BY_LANG[code]) preloadFont(href)
}

let initialized = false

export function initFontPreloader(): void {
  if (initialized) return
  initialized = true
  applyLang(i18next.language ?? 'en')
  i18next.on('languageChanged', applyLang)
}
