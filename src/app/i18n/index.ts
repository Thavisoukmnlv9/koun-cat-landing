import { designsI18n } from '@/features/designs/i18n'
import { journeyI18n } from '@/features/journey/i18n'
import { initI18n } from '@/lib/i18n'
import { initFontPreloader } from '@/lib/i18n/font-preloader'

/**
 * Composition root for i18n. The app layer is the one place allowed to import
 * feature bundles; it composes them and initializes the shared i18next instance
 * once, synchronously, at module load.
 *
 * The first bundle supplies the default namespace — `journey` here, so page
 * components call `t('header.title')` unqualified.
 */
export const featureBundles = [journeyI18n, designsI18n] as const

export const i18n = initI18n(featureBundles)

// Keep <html lang>/<dir> in sync with the language and warm its script's fonts.
initFontPreloader()

export default i18n
