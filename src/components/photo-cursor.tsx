import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'

import { usePointerFine, usePrefersReducedMotion } from '@/lib/hooks'
import { CURSOR_LEAD, CURSOR_TRAIL } from '@/lib/motion/springs'

/**
 * The photograph the pointer is carrying.
 *
 * `src` is a basename under `/public/images` — the same shape `Picture` takes —
 * so a target declares `data-cursor-src="journey/m20"` and this resolves the
 * extensions. `label` becomes the print's caption.
 */
interface Carried {
  src: string
  label: string
}

/** Where the print hangs relative to the pointer, in px. Down and to the right,
 *  so it never covers what the pointer is aimed at. */
const OFFSET_X = 24
const OFFSET_Y = 20

/**
 * A photograph that follows the pointer.
 *
 * Two followers on two springs, and the whole effect is the distance between
 * them: an ink dot sits under the pointer on a stiff spring, and the print
 * swings after it on a slack, heavier one. One follower would be a cursor
 * replacement; two are a hand and the thing in it.
 *
 * Three deliberate refusals:
 *
 * The native cursor is **not** hidden. `cursor: none` is the usual way to do
 * this and it is wrong on this page, which has two range inputs, a pager, a
 * mute toggle and a language switcher — taking the OS pointer away from anyone
 * who tracks it is a real regression, and the print reads perfectly well as
 * something carried *beside* the arrow rather than instead of it.
 *
 * Nothing is constructed at all unless there is a fine pointer and the visitor
 * has not asked for less motion. Not mounted-then-hidden: not mounted. That is
 * the same rule `useReveal` follows when it declines to build an observer.
 *
 * And the pointer position never touches React state. One passive listener
 * writes into motion values, which write to the DOM — the same discipline
 * `use-media-transport` uses when its rAF loop sets `--played` on the node
 * directly. The only state here is *which* photograph is carried, which changes
 * on hover rather than sixty times a second.
 *
 * Nothing suppresses it while the lightbox is open, because nothing needs to:
 * the scrim covers every target, so `closest()` stops matching and the print
 * puts itself away.
 */
export function PhotoCursor() {
  const fine = usePointerFine()
  const reduced = usePrefersReducedMotion()

  if (!fine || reduced) return null
  return <Follower />
}

function Follower() {
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)

  const dotX = useSpring(x, CURSOR_LEAD)
  const dotY = useSpring(y, CURSOR_LEAD)
  // The offset is applied after the spring rather than before it so the print
  // hangs at a fixed distance from where it has actually arrived, not from
  // where the pointer is — otherwise it swings on a longer arm than it looks.
  const printX = useTransform(useSpring(x, CURSOR_TRAIL), (v) => v + OFFSET_X)
  const printY = useTransform(useSpring(y, CURSOR_TRAIL), (v) => v + OFFSET_Y)

  const [carried, setCarried] = useState<Carried | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)
    }

    // Delegation rather than per-component handlers: a target opts in by
    // declaring the attribute and nothing else, so adding one later is a
    // markup change in one file rather than a wiring change in two.
    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cursor-src]')
      const src = target?.dataset.cursorSrc
      setCarried(src ? { src, label: target?.dataset.cursorLabel ?? '' } : null)
    }

    // Leaving the window fires no pointerout for the element under it, so
    // without this the print hangs at the edge of the viewport until the
    // pointer comes back.
    const onLeave = () => {
      setVisible(false)
      setCarried(null)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [x, y])

  return (
    <div
      aria-hidden
      // pointer-events-none is load-bearing, not tidiness: this layer covers
      // the whole viewport, and without it nothing underneath is clickable.
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <motion.div
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        className="bg-ink-strong/70 absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      <AnimatePresence>
        {carried && (
          <motion.figure
            key={carried.src}
            style={{ x: printX, y: printY }}
            initial={{ opacity: 0, scale: 0.7, rotate: -9 }}
            animate={{ opacity: 1, scale: 1, rotate: -4.5 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -9 }}
            transition={{ duration: 0.24, ease: [0.2, 0.75, 0.2, 1] }}
            className="cursor-photo absolute top-0 left-0 m-0 w-[128px] origin-top-left px-1.5 pt-1.5 pb-2"
          >
            <picture className="contents">
              <source type="image/avif" srcSet={`/images/${carried.src}.avif`} />
              <img
                src={`/images/${carried.src}.jpg`}
                alt=""
                className="aspect-photo bg-photo-bed block w-full object-cover"
              />
            </picture>
            {carried.label && (
              <figcaption className="font-label text-label-sm tracking-label text-muted-label mt-1.5 truncate uppercase">
                {carried.label}
              </figcaption>
            )}
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  )
}
