import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrefersReducedMotion } from '@/lib/hooks'

import { useTypewriter } from '../hooks/use-typewriter'

import { Polaroid } from './polaroid'

/**
 * The opening screen: what this is, what it is called, and how to read it.
 *
 * The instruction line matters more than it looks — a postcard that turns over
 * on tap is not a convention anyone expects on a web page, so the header says
 * so in plain words before the reader meets the first one. It is typed out
 * rather than simply printed for the same reason: a line that arrives at a
 * human pace gets read, where one that is already there when the page paints
 * is scenery. It is also the one piece of copy on the page that is an
 * instruction, and the typewriter voice is already in the design tokens.
 *
 * Everything in the header drifts apart slightly as the reader leaves it. Small
 * amounts on purpose — this is the first thing anyone sees, and a title that
 * visibly comes loose reads as a broken layout rather than as depth.
 */
export function JourneyHeader() {
  const { t, i18n } = useTranslation()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Three depths, drifting at three rates. The title leaves slowest because it
  // is the largest thing on the page; the photograph, being nearer, leaves
  // fastest and turns a little as it goes, the way a taped print would.
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -34])
  const titleRotate = useTransform(scrollYProgress, [0, 1], [0, -1.1])
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -68])
  const photoRotate = useTransform(scrollYProgress, [0, 1], [0, 2.4])

  const drift = reduced ? undefined : { y: titleY, rotate: titleRotate }
  const photoDrift = reduced ? undefined : { y: photoY, rotate: photoRotate }

  return (
    <header
      ref={ref}
      className="max-w-page mx-auto grid grid-cols-[minmax(0,1fr)] justify-items-center gap-[clamp(22px,5vw,34px)] px-[clamp(14px,4vw,24px)] pt-[clamp(56px,9vw,120px)] pb-[clamp(30px,5vw,64px)] text-center"
    >
      <p className="font-label text-kicker tracking-kicker text-muted uppercase">
        {t('header.kicker')}
      </p>

      <motion.h1 style={drift} className="font-hand text-display text-ink-strong font-semibold">
        {t('header.title')}
      </motion.h1>

      <TypedIntro key={i18n.resolvedLanguage} text={t('header.intro')} />

      <motion.div style={photoDrift}>
        <Polaroid />
      </motion.div>

      {/* A thread dropping out of the header into the timeline's dashed spine. */}
      <div aria-hidden className="hairline h-[clamp(44px,9vw,70px)] w-px" />
    </header>
  )
}

/**
 * The intro line, typed.
 *
 * Three copies of the same sentence, and each is load-bearing:
 *
 *   - a full copy, `invisible`, holds the paragraph at its final height from
 *     the first paint. Without it the line would grow from one row to three as
 *     the words land and shove the photograph down the page twice — a layout
 *     shift caused by decoration, which is the worst kind. `visibility: hidden`
 *     also takes it out of the accessibility tree, so it is not read;
 *   - an `sr-only` copy, which *is* read: a screen reader should get the
 *     sentence at once, not one grapheme at a time as it is written;
 *   - the typed copy itself, laid over the first, `aria-hidden` because it is
 *     the same words being animated.
 *
 * The caret goes away once the line is finished. A cursor that blinks forever
 * under a title is a distraction rather than a detail.
 */
function TypedIntro({ text }: { text: string }) {
  const { i18n } = useTranslation()
  const { ref, done } = useTypewriter(text, i18n.resolvedLanguage ?? 'en')

  return (
    <p className="text-lead text-ink grid max-w-[30ch] text-pretty italic">
      <span aria-hidden className="invisible [grid-area:1/1]">
        {text}
      </span>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="[grid-area:1/1]">
        <span ref={ref} />
        {!done && (
          <span className="animate-caret text-accent not-italic" aria-hidden>
            |
          </span>
        )}
      </span>
    </p>
  )
}
