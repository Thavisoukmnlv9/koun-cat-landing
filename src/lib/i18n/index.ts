import i18n, { type Resource } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, LANGUAGE_CODES } from '@/config/languages'

import type { I18nFeatureBundle } from './types'

/**
 * Configure the shared i18next instance from a set of feature bundles.
 *
 * Resources are inlined at call time — no async backend, no `addResourceBundle`
 * race — so `t()` resolves synchronously on first paint with zero missing-key
 * flashes. This module stays feature-agnostic: composition of the concrete
 * bundles happens in the app layer (`@/app/i18n`), keeping `app → features → lib`
 * dependency direction intact.
 *
 * The first bundle supplies the default namespace, so an unqualified `t('hero.title')`
 * resolves against it.
 */
export function initI18n(bundles: readonly [I18nFeatureBundle, ...I18nFeatureBundle[]]) {
  const defaultNS = bundles[0].namespace

  const resources: Record<string, Record<string, unknown>> = {}
  for (const lng of LANGUAGE_CODES) {
    resources[lng] = {}
    for (const bundle of bundles) {
      resources[lng][bundle.namespace] = bundle.resources[lng]
    }
  }

  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Cast at the i18next boundary: bundles are validated per-language by
      // `TranslationShape`, but the generic accumulator widens leaves to unknown.
      resources: resources as Resource,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...LANGUAGE_CODES],
      // Collapse regional detector values ('en-US' → 'en') so navigator/localStorage
      // hits still match `supportedLngs` instead of falling through to the fallback.
      load: 'languageOnly',
      defaultNS,
      ns: bundles.map((b) => b.namespace),
      interpolation: { escapeValue: false },
      returnNull: false,
      detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    })

  return i18n
}

/**
 * The shared i18next singleton. Import this (or the `i18next` package — same
 * instance) from non-React modules that need `i18n.t(...)`. It is configured by
 * `initI18n`, called once at app startup from `@/app/i18n`.
 */
export default i18n
