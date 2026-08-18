import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'
import { FLAP_FALL_MS } from '@/lib/motion/springs'

import { useReveal } from '../hooks/use-reveal'
import { useTypingSound } from '../hooks/use-typing-sound'

import { Envelope } from './envelope'
import { LetterDialog } from './letter-dialog'

/** Sealed, the flap on its way down, or open on the reading surface. */
type LetterPhase = 'sealed' | 'opening' | 'open'

/**
 * The sound of the letter being written. Vite serves `public/` verbatim, so
 * this is a plain path, the same way `reel-section.tsx` references its own
 * media and `Picture` references `/images/...`.
 */
const TYPING_SRC = '/sound-effects/virtualzero-keyboard-typing-fast-371229.mp3'

/**
 * The last screen: one unsent letter.
 *
 * Opening it is a chain rather than three things starting at once — the seal
 * gives, the flap falls, and the paper only leaves once the flap is out of its
 * way. `phase` is what sequences that, advanced by the flap reporting itself
 * finished rather than by a timer, so there is nothing to tear down and the
 * chain unwinds correctly if the letter is closed halfway through.
 *
 * The sound of the typing hangs off the same chain, and off the same tap. It is
 * started here rather than inside the letter because the tap is the only user
 * gesture in the sequence and WebKit will not let a page make a sound without
 * one — see `use-typing-sound.ts`. It stops when `phase` returns to `sealed`,
 * which is the press itself rather than the end of the fade, so the letter goes
 * quiet the instant it is put back.
 *
 * The broken seal is latched separately and never resets. Wax that reforms is a
 * lie, and coming back to a letter that is still lying open is the better of
 * the two feelings — the second visit should read as "still here", not as
 * "reset". The hint says so too.
 *
 * The hint line is the real control. The original put `role="button"` and a
 * hand-rolled Enter/Space handler on the envelope div; making the envelope
 * itself the button is no better, because its accessible name would swallow the
 * letter's whole first paragraph.
 *
 * That hint is deliberately *not* disabled while the letter is open, which it
 * used to be. `useFocusTrap` returns focus by calling `restoreTo.focus()`, and
 * focusing a disabled button silently does nothing — so closing the letter from
 * the keyboard would have dropped the visitor at the top of the document, at
 * the very end of the page. It does not need hiding either: the letter now
 * opens over a scrim with focus trapped inside it, so the hint is unreachable
 * on its own.
 */
export function AskSection() {
  const { t } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const { ref, revealed } = useReveal<HTMLElement>()
  const letterId = useId()

  const [phase, setPhase] = useState<LetterPhase>('sealed')
  const [sealBroken, setSealBroken] = useState(false)

  // Kept here rather than in the letter for two reasons: the element has to
  // exist at the moment of the tap, which is a second before the dialog does,
  // and the mute preference has to outlive the letter being put back.
  const sound = useTypingSound(phase !== 'sealed')

  const openLetter = () => {
    if (phase !== 'sealed') return
    // First, and with nothing awaited in front of it. This is the only user
    // gesture in the whole sequence, and on WebKit it is the only moment the
    // typing sound can be granted permission to be heard at all.
    sound.prime()
    setSealBroken(true)
    // Under reduced motion the flap never travels, so there is nothing to
    // report itself finished and nothing to wait for. Belt as well as braces:
    // Motion should still call back when it collapses the animation, but a
    // present that fails to open for the one visitor who asked for less
    // movement is not worth risking on an assumption.
    setPhase(reduced ? 'open' : 'opening')
  }

  /**
   * The floor under the flap's own report.
   *
   * Sequencing off `onAnimationComplete` is the right mechanism and stays the
   * fast path, but it is not a guarantee: a browser throttles rAF to nothing in
   * a background tab, and Motion will decline a transform animation outright
   * under conditions this component cannot see from here. Either way the
   * callback never arrives, and the failure is the worst one this page has —
   * the letter simply never opens, on the screen the whole thing was built for.
   *
   * So the timer is a floor rather than the mechanism, and it reads the flap's
   * own duration rather than restating it, because two numbers that must agree
   * eventually will not. Whichever arrives first wins; the updater ignores the
   * second.
   */
  useEffect(() => {
    if (phase !== 'opening') return

    const timer = setTimeout(
      () => setPhase((current) => (current === 'opening' ? 'open' : current)),
      FLAP_FALL_MS + 120,
    )
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <section
      ref={ref}
      data-revealed={revealed || undefined}
      className="reveal max-w-page mx-auto flex flex-col items-center gap-6.5 px-[clamp(14px,4vw,24px)] pt-[clamp(30px,6vw,80px)]"
    >
      <p className="font-label text-label tracking-section text-muted uppercase">
        {t('ask.kicker')}
      </p>

      <Envelope
        open={phase !== 'sealed'}
        sealBroken={sealBroken}
        onOpen={openLetter}
        onFlapSettled={() => setPhase((current) => (current === 'opening' ? 'open' : current))}
        letterId={letterId}
      />

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={phase !== 'sealed'}
        aria-controls={letterId}
        aria-label={t('a11y.openLetter')}
        onClick={openLetter}
        className="font-label text-label-sm tracking-count text-muted-hint hover:text-ink active:text-ink -my-4 cursor-pointer px-3 py-4 uppercase"
      >
        {sealBroken ? t('ask.hintAgain') : t('ask.hint')}
      </button>

      {/* No `controls`, so the user-agent stylesheet hides it and it stays out
          of the accessibility tree — the same way the optical track renders its
          own element. `preload="none"` for the same reason the reel loads
          nothing until it is run: a visitor who never opens the letter should
          not pay for the sound of it. `prime()` is what starts the fetch, and
          it has the whole fall of the flap to arrive. */}
      <audio ref={sound.ref} src={TYPING_SRC} loop preload="none" />

      <LetterDialog open={phase === 'open'} onClose={() => setPhase('sealed')} sound={sound} />
    </section>
  )
}
