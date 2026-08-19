import { useTranslation } from 'react-i18next'

import { memoriesFor } from '../data/memories'

import { FlipPostcard } from './components/flip-postcard'

const COUNT = 6

/**
 * II · Flip Postcards — airmail cards you turn over to read.
 *
 * The lightest of the five to port: the whole idea is one CSS transform, and
 * the prototype's own JavaScript did nothing but toggle a class. What it did
 * need was the photographs, which were `picsum.photos` seeds, and the words,
 * which were written for six memories that are not these ones.
 */
export function PostcardsDesign() {
  const { t } = useTranslation('designs')
  const memories = memoriesFor(COUNT)

  return (
    <div className="d-postcards d-body min-h-screen bg-[var(--d-bg)] pb-24 text-[var(--d-ink)]">
      <header className="mx-auto max-w-[560px] px-5 pt-12 text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--d-red)] uppercase">
          {t('postcards.kicker')}
        </p>

        <h1 className="d-display mt-3 text-[clamp(44px,13vw,64px)] leading-[0.98] font-semibold">
          {t('postcards.titleA')}{' '}
          <em className="text-[var(--d-red)] italic not-italic">{t('postcards.titleAccent')}</em>{' '}
          {t('postcards.titleB')}
        </h1>

        <p className="d-hand mx-auto mt-4 max-w-[30ch] -rotate-[1.5deg] text-[21px] leading-snug text-[var(--d-ink)]/75">
          {t('postcards.sub')}
        </p>
      </header>

      {/* The airmail border: the only place the flag's red and blue meet. */}
      <div aria-hidden className="d-airmail mt-8 h-3.5 w-full" />

      <div className="mx-auto mt-10 flex max-w-[560px] flex-col gap-7 px-5">
        {memories.map((memory) => (
          <FlipPostcard key={memory.id} memory={memory} />
        ))}
      </div>

      <footer className="mt-12 text-center">
        <p className="d-hand text-[22px] text-[var(--d-ink)]/70">{t('postcards.footer')}</p>
        <p className="mt-1 text-[10px] tracking-[0.18em] text-[var(--d-ink)]/45 uppercase">
          {t('postcards.count', { total: String(COUNT).padStart(2, '0') })}
        </p>
      </footer>
    </div>
  )
}
