import type { designsI18n } from '@/features/designs/i18n'
import type { journeyI18n } from '@/features/journey/i18n'

/**
 * Type-safe i18n. `t('key')` calls, namespace names, and `{{interpolation}}`
 * params are checked at compile time against the English source of each bundle,
 * so a typo or a missing key is a build error rather than a blank string.
 *
 * Add one line to `resources` for each bundle registered in `@/app/i18n`.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'journey'
    resources: {
      journey: (typeof journeyI18n)['resources']['en']
      designs: (typeof designsI18n)['resources']['en']
    }
  }
}
