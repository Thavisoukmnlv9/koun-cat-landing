import type { I18nFeatureBundle } from '@/lib/i18n/types'

import { en } from './en'
import { lo } from './lo'

/** All page copy, in every supported language. The default namespace. */
export const journeyI18n = {
  namespace: 'journey',
  resources: { en, lo },
} as const satisfies I18nFeatureBundle
