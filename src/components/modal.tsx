import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useFocusTrap } from '@/lib/hooks'
import { cn } from '@/lib/utils'

/**
 * How long the overlay takes to fade out, in ms. It has to match the duration
 * on `.lightbox-overlay` in globals.css — the number is written twice because
 * the two things it controls genuinely are different: CSS decides how the fade
 * looks, and this decides how long the element stays in the DOM afterwards.
 */
const EXIT_MS = 240

interface ModalProps {
  open: boolean
  onClose: () => void
  /** id of the element naming the dialog. */
  labelledBy: string
  children: ReactNode
  className?: string
}

/**
 * The page's one modal surface.
 *
 * Written rather than installed: the site had no dialog, no portal and no focus
 * trap before this, and a dependency for one lightbox would be more code than
 * the lightbox. `<dialog>` was the other candidate and loses on one point that
 * matters here — its top-layer promotion sits outside the document's stacking
 * order, which is exactly where a shared-layout animation cannot follow it. The
 * photograph has to travel from a thumbnail in the page to the open plate, so
 * both ends have to live in the same tree.
 *
 * It portals to <body> so no ancestor's `overflow: hidden` or `transform` can
 * clip or re-root it — and the page root does have `overflow-x-hidden`.
 *
 * The fade is CSS rather than `AnimatePresence`, and that is a correctness
 * decision rather than a stylistic one. An exiting subtree that contains a
 * `layoutId` shared with an element still mounted on the page — which is
 * exactly what this modal is for — never finishes its exit: Motion animates it
 * back towards the thumbnail and never calls `safeToRemove`, leaving an
 * invisible dialog in the DOM holding the keyboard. Verified in the browser and
 * in jsdom, and only with a *shared* id; a lone `layoutId` or a plain `layout`
 * exits cleanly. So Motion owns the way in, where it is doing something CSS
 * cannot, and CSS owns the way out, where it cannot fail. `@starting-style`
 * gives the entry its first frame; `data-leaving` gives the exit its last.
 *
 * The cost is that the plate does not shrink back into its frame on close. It
 * fades with the overlay instead, which is the correct trade against a dialog
 * that might not go away.
 */
export function Modal({ open, onClose, labelledBy, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Stays true through the fade-out, so the overlay has something to fade.
  const [present, setPresent] = useState(open)

  // Adjusted during render rather than in an effect, and it has to be: an
  // effect would leave the panel unrendered for the commit in which `open`
  // became true, so the focus trap would find no element to move focus into and
  // would never look again. React re-runs this component before committing, so
  // the panel and its ref are in place by the time any effect fires.
  if (open && !present) setPresent(true)

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (open || !present) return
    const timer = setTimeout(() => setPresent(false), EXIT_MS)
    return () => clearTimeout(timer)
  }, [open, present])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // The scrollbar's width has to be given back as padding, or removing it
    // widens the viewport and every centred thing on the page — the title, the
    // spine, the book — jumps sideways at the moment the lightbox opens. It is
    // zero on overlay-scrollbar platforms, which is the correct answer there.
    const { documentElement } = document
    const gutter = window.innerWidth - documentElement.clientWidth
    const previous = {
      overflow: documentElement.style.overflow,
      paddingRight: documentElement.style.paddingRight,
    }
    documentElement.style.overflow = 'hidden'
    if (gutter > 0) documentElement.style.paddingRight = `${gutter}px`

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      documentElement.style.overflow = previous.overflow
      documentElement.style.paddingRight = previous.paddingRight
    }
  }, [open, onClose])

  if (!present) return null

  const leaving = !open

  return createPortal(
    <div data-leaving={leaving || undefined} className="lightbox-overlay fixed inset-0 z-[80]">
      {/* The scrim is not the close button: it is decoration that happens to be
          dismissable, so it stays out of the accessibility tree and the dialog
          carries a real labelled close control instead. */}
      <div aria-hidden onClick={onClose} className="lightbox-scrim absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-[90] grid place-items-center p-4 sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          // On the way out it is a picture of a dialog, not one: `inert` takes
          // it out of the accessibility tree and off the tab order for the two
          // hundred milliseconds it is still fading.
          inert={leaving}
          className={cn('pointer-events-auto outline-none', className)}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
