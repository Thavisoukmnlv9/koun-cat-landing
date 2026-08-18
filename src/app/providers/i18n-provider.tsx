import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

// `@/app/i18n` is the composition root: importing it runs `initI18n` with every
// feature bundle before the provider mounts, so `t()` resolves on first paint.
import i18n from '@/app/i18n'

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
