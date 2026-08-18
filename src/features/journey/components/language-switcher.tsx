import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES } from '@/config/languages'
import { cn } from '@/lib/utils'

/**
 * The EN | ລາວ toggle.
 *
 * i18next persists the choice to localStorage and the font preloader reacts to
 * `languageChanged`, so switching also updates `<html lang>` and warms the Lao
 * faces — nothing else needs wiring here.
 *
 * Set in the typewriter face at label size, so it reads as something stamped in
 * the corner of the page rather than site chrome. It is the only interface
 * element on a page that is otherwise entirely content.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const active = i18n.resolvedLanguage ?? i18n.language

  return (
    <div
      className={cn('flex items-center', className)}
      role="group"
      aria-label={t('language.label')}
    >
      {LANGUAGES.map((language, index) => {
        const isActive = language.code === active
        return (
          <Fragment key={language.code}>
            {index > 0 && <span aria-hidden className="bg-rule h-3.5 w-px" />}
            <button
              type="button"
              lang={language.code}
              aria-current={isActive ? 'true' : undefined}
              aria-label={t('language.switchTo', { language: language.label })}
              onClick={() => void i18n.changeLanguage(language.code)}
              className={cn(
                'font-label text-label-sm tracking-label -my-2 cursor-pointer px-3 py-3.5 uppercase transition-colors duration-200',
                isActive ? 'text-accent' : 'text-muted-label hover:text-ink active:text-ink',
              )}
            >
              {language.label}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
