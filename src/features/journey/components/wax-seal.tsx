import { motion } from 'motion/react'

import { SEAL_BREAK } from '@/lib/motion/springs'

/**
 * The two halves, and where each one ends up.
 *
 * Each half is a whole seal clipped down the middle rather than a semicircle,
 * so the impression pressed into the wax is cut by the break instead of being
 * drawn twice. The two do not fall symmetrically — matched arcs read as a
 * machine opening it.
 */
const HALVES = [
  { key: 'left', clip: 'inset(0 50% 0 0)', fallen: { rotate: -26, x: -17, y: 30, opacity: 0 } },
  { key: 'right', clip: 'inset(0 0 0 50%)', fallen: { rotate: 22, x: 16, y: 34, opacity: 0 } },
] as const

const INTACT = { rotate: 0, x: 0, y: 0, opacity: 1 }

/**
 * The wax seal holding the flap down, and the one moment on this page that does
 * not undo itself.
 *
 * `broken` is latched by the section above and never goes back to false. Wax
 * that reforms is a lie, and coming back to a letter that is still lying open
 * is the better of the two feelings anyway — the second visit should read as
 * "still here", not as "reset".
 *
 * Decorative throughout: the state it carries is already on the trigger's
 * `aria-expanded`, and a screen reader has no use for a description of stationery.
 *
 * The seal is this page's sixth use of the accent red, against a rule in
 * globals.css that rations it to five. It is allowed here because it is the same
 * object as the chips inside the letter — the wax and the stamp on the card are
 * one piece of stationery — rather than a new thing wanting attention.
 */
export function WaxSeal({ broken }: { broken: boolean }) {
  return (
    <div aria-hidden className="wax-seal z-[4]">
      {HALVES.map((half) => (
        <motion.span
          key={half.key}
          className="wax-seal-half"
          style={{ clipPath: half.clip }}
          initial={false}
          animate={broken ? half.fallen : INTACT}
          transition={SEAL_BREAK}
        />
      ))}
    </div>
  )
}
