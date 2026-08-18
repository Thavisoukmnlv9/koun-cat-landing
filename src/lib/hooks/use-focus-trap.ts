import { useEffect, type RefObject } from 'react'

/**
 * Everything that can hold focus, in document order. `:not([inert] *)` matters
 * on this page specifically: the postcards keep the face turned away in the DOM
 * and mark it `inert`, and a trap that ignored that would tab into the
 * handwriting on the back of a card nobody has turned over.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
]
  .map((selector) => `${selector}:not([inert]):not([inert] *)`)
  .join(',')

/**
 * Holds keyboard focus inside an open dialog, and gives it back on close.
 *
 * The page's one modal surface needs this and nothing else does, so it is a
 * hook rather than a dependency. Three obligations, in order of how badly they
 * are missed when absent:
 *
 *   - focus moves *into* the dialog on open, or a keyboard visitor opens a
 *     lightbox and their next Tab lands somewhere behind it;
 *   - Tab and Shift+Tab wrap at the ends rather than escaping;
 *   - focus returns to whatever opened it, so closing a lightbox puts the
 *     visitor back on the thumbnail they pressed rather than at the top of the
 *     document.
 *
 * The element that opened the dialog is captured on the way in, not passed in:
 * `document.activeElement` at the moment `active` flips is by definition the
 * thing that was pressed, and threading a ref through would only be another way
 * for the two to disagree.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return

    const container = ref.current
    if (!container) return

    const restoreTo = document.activeElement as HTMLElement | null

    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))

    // Prefer a real control over the dialog box itself, so a screen reader
    // announces the dialog and then the first thing you can do in it.
    const first = focusable()[0]
    ;(first ?? container).focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const items = focusable()
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const edge = event.shiftKey ? items[0] : items[items.length - 1]
      // Focus can also sit on the container itself, which is in neither
      // direction's list — treat that as being at the leading edge.
      if (document.activeElement !== edge && document.activeElement !== container) return

      event.preventDefault()
      ;(event.shiftKey ? items[items.length - 1] : items[0]).focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // `isConnected` guards the case where the opener itself was removed while
      // the dialog was open; focusing a detached node silently sends focus to
      // <body> and loses the visitor's place either way, but this says so.
      if (restoreTo?.isConnected) restoreTo.focus()
    }
  }, [ref, active])
}
