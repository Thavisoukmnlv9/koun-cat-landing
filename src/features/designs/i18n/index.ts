import type { I18nFeatureBundle } from '@/lib/i18n/types'

import { en } from './en'
import { lo } from './lo'

/**
 * Copy the five design variants add on top of the journey archive.
 *
 * Registered *after* `journeyI18n` in `@/app/i18n`, which matters: the first
 * bundle supplies the default namespace, and every journey component calls
 * `t('header.title')` unqualified. Design components reach this one explicitly
 * with `useTranslation('designs')`.
 */
export const designsI18n = {
  namespace: 'designs',
  resources: { en, lo },
} as const satisfies I18nFeatureBundle
