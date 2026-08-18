import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { FLAP_FALL, RESEAL_LEAD, SPRING_LIFT } from '@/lib/motion/springs'

import { LETTER_LAYOUT_ID } from '../data/letter'
import { POSTCARDS } from '../data/postcards'

import { WaxSeal } from './wax-seal'

interface EnvelopeProps {
  /** True from the moment the seal breaks until the letter is put back. */
  open: boolean
  /** Latched by the section above; never returns to false. */
  sealBroken: boolean
  onOpen: () => void
  /** Fires whenever the flap finishes moving, in either direction. */
  onFlapSettled: () => void
  letterId: string
}

/**
 * The envelope: a wax seal, a flap, and the corner of the letter inside it.
 *
 * The flap is a CSS-border triangle sized off the envelope's own width — see
 * `.envelope-flap` in globals.css for why that has to be one shared custom
 * property. Its rotation, though, is Motion's rather than the stylesheet's, and
 * that is the change this file exists for: opening is a chain — the seal gives,
 * the flap falls, and only then does the paper leave — and a CSS transition has
 * no completion for the next link to hang off. The alternative was a setTimeout
 * carrying a duration that also appears in the stylesheet, which is two numbers
 * that must agree and one day will not.
 *
 * The letter is not hidden before opening: a strip of it is genuinely visible
 * under the flap, and hiding visible content from assistive technology would be
 * a lie. `aria-expanded` on the trigger carries the state instead. That strip is
 * also one half of a shared layout animation — the same element as the sheet on
 * the reading surface — so the paper the reader sees here is the paper they end
 * up reading, rather than a lookalike that fades in somewhere else.
 *
 * The card number is computed rather than hardcoded, so it stays right if an
 * eleventh postcard is ever added to the timeline.
 */
export function Envelope({ open, sealBroken, onOpen, onFlapSettled, letterId }: EnvelopeProps) {
  const { t } = useTranslation()
  const cardNumber = String(POSTCARDS.length + 1)

  return (
    <div
      data-open={open || undefined}
      className="envelope relative cursor-pointer"
      onClick={onOpen}
    >
      <div className="envelope-body shadow-envelope relative overflow-hidden p-[clamp(28px,5vw,44px)]">
        <motion.div
          id={letterId}
          layoutId={LETTER_LAYOUT_ID}
          transition={SPRING_LIFT}
          style={{ borderRadius: 2 }}
          className="bg-paper-card shadow-letter relative z-[2] p-[clamp(24px,4vw,38px)]"
        >
          <p className="font-label text-label tracking-label text-muted-label uppercase">
            {t('ask.cardNo', { n: cardNumber })}
          </p>
          <p className="font-hand text-ask text-ink-strong mt-4 text-pretty">{t('ask.greeting')}</p>
        </motion.div>

        {/* Closing waits for the sheet to get home before the flap comes down on
            it — the reverse order of opening, which is what resealing an
            envelope actually is. */}
        <motion.div
          aria-hidden
          className="envelope-flap z-[3]"
          initial={false}
          animate={{ rotateX: open ? -172 : 0 }}
          transition={open ? FLAP_FALL : { ...FLAP_FALL, delay: RESEAL_LEAD }}
          onAnimationComplete={onFlapSettled}
        />

        <WaxSeal broken={sealBroken} />
      </div>
    </div>
  )
}
