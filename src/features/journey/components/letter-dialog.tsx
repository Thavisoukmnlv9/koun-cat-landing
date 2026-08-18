import { motion } from 'motion/react'
import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/modal'
import { SPRING_LIFT, SPRING_SETTLE } from '@/lib/motion/springs'

import { LETTER_BODY_KEYS, LETTER_LAYOUT_ID, PARAGRAPH_BREAK } from '../data/letter'
import { POSTCARDS } from '../data/postcards'
import { useLetterSpeech } from '../hooks/use-letter-speech'
import type { TypingSound } from '../hooks/use-typing-sound'
import { useTypewriter } from '../hooks/use-typewriter'

import { LetterBody } from './letter-body'

interface LetterDialogProps {
  open: boolean
  onClose: () => void
  /** Owned by the section, because the element has to predate this component. */
  sound: TypingSound
}

/**
 * The letter, out of its envelope and held open.
 *
 * The sheet is the same element as the strip peeking out of the envelope —
 * `LETTER_LAYOUT_ID` walks it from there to here — which is what makes this
 * reading a letter rather than opening a dialog that happens to contain one.
 * Same idiom as the album's lightbox, and the same reason: a shared layout
 * animation answers "where did this come from" without the reader having to
 * remember.
 *
 * The contents live in a child component so that every hook in them — the
 * typewriter, the speech engine — mounts when the letter opens and unmounts
 * when it closes. `Modal` renders its children only while open, so putting them
 * here would leave the typewriter running against a node that does not exist,
 * and the letter would be finished before it was ever seen.
 */
export function LetterDialog({ open, onClose, sound }: LetterDialogProps) {
  const titleId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="max-h-[88dvh] w-[min(94vw,620px)] overflow-y-auto"
    >
      <LetterSheet titleId={titleId} onClose={onClose} sound={sound} />
    </Modal>
  )
}

function LetterSheet({
  titleId,
  onClose,
  sound,
}: {
  titleId: string
  onClose: () => void
  sound: TypingSound
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'en'
  const cardNumber = String(POSTCARDS.length + 1)

  /**
   * The whole letter as one string, in reading order, ending on the ask.
   *
   * One string rather than a list of paragraphs because all three things that
   * consume it want it that way: the typewriter writes a single node, the
   * synthesiser takes a single utterance, and the invisible copy that holds the
   * sheet's height has to match both exactly. Two copies of this text would be
   * one edit away from the page showing one letter and reading out another.
   *
   * The blank lines are load-bearing three times over — the speech library
   * chunks long text at newlines before anywhere else, `highlightMode` looks for
   * them, and the typewriter gives the character after one its longest pause.
   * `whitespace-pre-line` turns them back into paragraphs on screen.
   *
   * The question is the last paragraph rather than a heading beside the letter.
   * It has to be inside the text to be read aloud with it, and a letter that
   * stops just before the thing it was written to ask is not a letter.
   */
  const letterText = useMemo(
    () =>
      [t('ask.greeting'), ...LETTER_BODY_KEYS.map((key) => t(key)), t('ask.question')].join(
        PARAGRAPH_BREAK,
      ),
    [t],
  )

  // The keystrokes are reported straight to the sound, so the clatter is driven
  // by the one clock that knows where the pauses are rather than by a second
  // one trying to guess.
  const { ref, done, finish } = useTypewriter(letterText, locale, sound.onType)
  const speech = useLetterSpeech(letterText, locale)

  return (
    <motion.div
      layoutId={LETTER_LAYOUT_ID}
      transition={SPRING_LIFT}
      style={{ borderRadius: 2 }}
      className="bg-paper-card shadow-letter p-[clamp(26px,4.4vw,44px)]"
    >
      {/* The dialog's name, and the first use of a key that has been sitting in
          both locale files unreferenced. Not the question: naming the dialog
          with it would announce the ask the instant the letter opens, ahead of
          the letter that builds to it, and then read it again in place. */}
      <h2 id={titleId} className="sr-only">
        {t('a11y.letterLabel')}
      </h2>

      <p className="font-label text-label tracking-label text-muted-label uppercase">
        {t('ask.cardNo', { n: cardNumber })}
      </p>

      <LetterBody typeRef={ref} done={done} Text={speech.Text} />

      {/* Kept in the layout at all times and only faded in, rather than mounted
          on `done`. The sheet is a shared-layout element: anything that changes
          its height afterwards animates as a layout change and distorts the text
          it is holding. Reserving the space costs nothing and moves nothing. */}
      <motion.div
        animate={{ opacity: done ? 1 : 0 }}
        transition={SPRING_SETTLE}
        aria-hidden={!done || undefined}
        className="mt-7"
      >
        {/* Decorative: the answer was never going to be typed into a form. */}
        <div aria-hidden className="flex flex-wrap gap-3">
          <span className="font-label text-label tracking-chip text-paper-card bg-accent px-4.5 py-3 whitespace-nowrap uppercase">
            {t('ask.yes')}
          </span>
          <span className="font-label text-label tracking-chip text-accent border-accent/45 border px-4.5 py-3 whitespace-nowrap uppercase">
            {t('ask.obviouslyYes')}
          </span>
        </div>

        <p className="font-hand text-ask-sub text-ink-caption mt-6">{t('ask.signature')}</p>
      </motion.div>

      <div className="border-rule mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-dashed pt-4">
        {/* Whichever of these comes first is the first focusable thing in the
            panel, which is where the focus trap puts the visitor — so it is the
            one they are most likely to want, not the one that closes the letter
            and not the one that adjusts the volume. The group stays in the
            layout even when empty, so close keeps its side of the rule. */}
        <div className="flex flex-wrap items-center gap-3">
          {!done ? (
            <>
              <button
                type="button"
                onClick={finish}
                aria-label={t('a11y.skipTyping')}
                className="font-label text-label-sm tracking-label text-muted-label hover:text-ink active:text-ink border-rule cursor-pointer border px-3 py-3 uppercase"
              >
                {t('ask.skip')}
              </button>

              {/* Only while the letter is typing — afterwards there is nothing
                  left to silence, and the slot is wanted for read-aloud. */}
              {sound.available && (
                <button
                  type="button"
                  onClick={sound.toggleSound}
                  aria-pressed={sound.soundOn}
                  aria-label={t(sound.soundOn ? 'a11y.muteTyping' : 'a11y.unmuteTyping')}
                  className="font-label text-label-sm tracking-label text-muted-label hover:text-ink active:text-ink border-rule cursor-pointer border px-3 py-3 uppercase"
                >
                  {t(sound.soundOn ? 'ask.soundOn' : 'ask.soundOff')}
                </button>
              )}
            </>
          ) : speech.available ? (
            <button
              type="button"
              onClick={speech.speaking ? speech.stop : speech.start}
              aria-label={t(speech.speaking ? 'a11y.stopReadingLetter' : 'a11y.readLetterAloud')}
              className="font-label text-label-sm tracking-label text-paper-card bg-accent border-accent cursor-pointer border px-4 py-2.5 uppercase"
            >
              {t(speech.speaking ? 'ask.stopReading' : 'ask.readAloud')}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('a11y.closeLetter')}
          className="font-label text-label-sm tracking-label text-muted-label hover:text-ink active:text-ink border-rule cursor-pointer border px-3 py-3 uppercase"
        >
          {t('ask.close')}
        </button>
      </div>
    </motion.div>
  )
}
