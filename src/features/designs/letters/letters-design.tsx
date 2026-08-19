import { useTranslation } from 'react-i18next'

import { memoriesFor } from '../data/memories'

import { SealedLetter } from './components/sealed-letter'

const COUNT = 6

/**
 * V · Letters — wax-sealed envelopes that open into letters.
 *
 * The most intricate CSS of the five and the simplest JavaScript: the prototype
 * did nothing but toggle a class, and everything else was clip-paths, a 3D flap
 * and an adjacent-sibling selector. Two of those three survive the port intact.
 */
export function LettersDesign() {
  const { t } = useTranslation('designs')
  const memories = memoriesFor(COUNT)

  return (
    <div className="d-letters d-display min-h-screen bg-[var(--d-bg)] pb-24 text-[var(--d-plum)]">
      <header className="mx-auto max-w-[560px] px-5 pt-12 text-center">
        <p className="d-body text-[11px] tracking-[0.34em] text-[var(--d-mauve)] uppercase">
          {t('letters.eyebrow')}
        </p>

        <h1 className="mt-3 text-[clamp(48px,15vw,72px)] leading-none font-semibold">
          {t('letters.title')}
        </h1>

        <p className="d-script mt-1 text-[32px] leading-tight text-[var(--d-mauve)]">
          {t('letters.script')}
        </p>

        <span
          aria-hidden
          className="d-flourish mx-auto mt-5 flex items-center justify-center gap-3.5 text-[var(--d-gold)]"
        >
          <em className="text-[15px] not-italic">♥</em>
        </span>

        <p className="mx-auto mt-4 max-w-[34ch] text-[16px] leading-relaxed text-[var(--d-plum-soft)] italic">
          {t('letters.lede')}
        </p>
      </header>

      <div className="mx-auto mt-10 flex max-w-[560px] flex-col gap-7 px-5">
        {memories.map((memory) => (
          <SealedLetter key={memory.id} memory={memory} />
        ))}
      </div>

      <footer className="mt-12 text-center">
        <p className="d-script text-[28px] text-[var(--d-mauve)]">{t('letters.footer')}</p>
        <p className="d-body mt-1 text-[10px] tracking-[0.18em] text-[var(--d-plum)]/45 uppercase">
          {t('letters.count', { total: String(COUNT).padStart(2, '0') })}
        </p>
      </footer>
    </div>
  )
}
