import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Picture } from '@/features/journey/components/picture'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/**
 * One leaf of the book: a front face, a decorative back, and the rotation
 * between them.
 *
 * The prototype's structure is kept exactly, because it is the right one — each
 * leaf carries a memory on its *front* and blank paper on its back, rather than
 * a spread of two memories. A spread means two pages have to be legible at
 * 360px, and it means the turn reveals content that was already half-visible.
 * One memory per leaf turns cleanly on a phone.
 *
 * The turn is CSS rather than Motion for the reason journey's postcard gives:
 * `rotateY` through Motion is dropped entirely under `reducedMotion="user"`, so
 * a reader who asked for less motion would be left with pages that never turn.
 * As a CSS transition it degrades to an instant cut instead — the book still
 * works, it just stops being a performance. `--ease-turn` is journey's own
 * curve, written for exactly this ("a page in a book snaps").
 *
 * z-index is the whole trick: unturned leaves stack in reverse so the earliest
 * is on top, and a turned leaf drops behind everything still to come.
 */
export function AlbumLeaf({
  turned,
  z,
  children,
}: {
  turned: boolean
  z: number
  children: ReactNode
}) {
  return (
    <div
      style={{
        zIndex: z,
        transform: turned ? 'rotateY(-178deg)' : undefined,
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
      }}
      className="absolute inset-0 rounded-[3px_7px_7px_3px] shadow-[0_14px_34px_rgb(0_0_0_/_0.45)] transition-transform duration-1000 ease-[var(--ease-turn)] motion-reduce:duration-200"
    >
      {children}

      {/* The blank reverse. Every leaf has one, and it is what you see for the
          instant a page is edge-on. */}
      <div
        aria-hidden
        style={{ transform: 'rotateY(180deg)' }}
        className="d-leaf absolute inset-0 grid place-items-center overflow-hidden rounded-[3px_7px_7px_3px] backface-hidden"
      >
        <span className="d-page-curl pointer-events-none absolute inset-0" />
        <svg
          viewBox="0 0 66 66"
          className="size-[54px] fill-none stroke-[var(--d-sepia)] stroke-[1.2] opacity-50"
        >
          <circle cx="33" cy="33" r="28" />
          <path d="M22 40c0-8 5-14 11-14s11 6 11 14" />
        </svg>
      </div>
    </div>
  )
}

/** The front face of a memory's leaf. */
export function MemoryLeaf({ memory, page }: { memory: Memory; page: number }) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const title = t(memory.keys.title)
  const body = t(memory.keys.back)

  return (
    <div className="d-leaf absolute inset-0 flex flex-col overflow-hidden rounded-[3px_7px_7px_3px] px-[22px] pt-[22px] pb-8 backface-hidden">
      <span className="d-page-curl pointer-events-none absolute inset-0" />

      <p className="d-body text-center text-[11px] tracking-[0.24em] text-[var(--d-gold)] uppercase">
        {t(memory.keys.date)}
      </p>
      <h2 className="d-display mt-1 mb-3 text-center text-[30px] leading-none font-semibold text-balance text-[var(--d-ink)] italic">
        {title}
      </h2>

      {/* Two boxes, not one: the print is mounted in a white border, and only
          the print itself clips. The prototype hung the tape at `top: -8px`
          inside the very element carrying `overflow: hidden`, so the strip it
          was meant to be held up by was invisible in the original too.

          4:3 by preference, but capped at a share of the leaf. A page has a
          fixed height, and on a 375px phone a full-width 4:3 print plus four
          lines of a real note plus a player plus a sign-off does not fit —
          something has to yield, and it should be the photograph rather than
          the words. The cap crops rather than shrinks, because the print is
          `object-cover`. */}
      <div className="relative mb-3.5 aspect-[4/3] max-h-[38%] shrink-0 rounded-[3px] border-[5px] border-white shadow-[0_8px_18px_rgb(58_47_34_/_0.28)]">
        {/* Absolutely filled rather than `size-full`: `aspect-ratio` only
            *suggests* a height, and a portrait poster inside a 4/3 box was
            enough to push the box taller and shove the prose off the leaf.
            Taking the media out of flow makes the frame's shape final. */}
        <div className="absolute inset-0 overflow-hidden">
          {memory.kind === 'film' ? (
            <video
              src={FILM_SRC}
              poster={`/images/journey/${memory.image}.jpg`}
              controls
              playsInline
              preload="none"
              className="size-full object-cover"
            />
          ) : (
            <Picture
              name={`journey/${memory.image}`}
              alt={title}
              className="size-full object-cover [filter:sepia(0.14)_contrast(1.03)]"
            />
          )}
        </div>

        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-[18px] w-[60px] -translate-x-1/2 -rotate-3 bg-[var(--d-gold)]/35 shadow-[0_1px_2px_rgb(0_0_0_/_0.15)]"
        />
        <MediaChip
          kind={memory.kind}
          className="d-body absolute top-2.5 right-2.5 rounded-full bg-[var(--d-ink)]/80 px-[7px] py-[3px] text-[9px] tracking-[0.12em] text-[var(--d-page)] uppercase"
        />
      </div>

      {/* The drop cap is a `::first-letter` rule rather than the prototype's
          split-the-string-in-JavaScript, which produced a floated <span> that
          screen readers announced as a separate word.

          Faded at the foot rather than cut at it: some of these notes are
          longer than the page, so the overflow scrolls — and a hard edge
          through the middle of a line of type reads as broken text, where a
          fade reads as "there is more". */}
      <p className="d-body min-h-0 flex-1 overflow-y-auto [mask-image:linear-gradient(180deg,#000_calc(100%-1.5rem),transparent)] text-[15.5px] leading-relaxed text-[#4a3d2b] first-letter:float-left first-letter:pt-1.5 first-letter:pr-2 first-letter:[font-family:var(--d-display)] first-letter:text-[52px] first-letter:leading-[0.7] first-letter:text-[var(--d-leather)]">
        {body}
      </p>

      {memory.kind === 'voice' && (
        <AudioNote
          label={td('album.ourSong')}
          className="mt-3 shrink-0 rounded-full border border-[var(--d-sepia)]/40 bg-[#efe4cd] px-2 py-1.5 text-[var(--d-sepia)]"
          barClassName="bg-[#ddd0b3]"
        />
      )}

      <p className="d-display mt-3 shrink-0 text-right text-[17px] text-[var(--d-sepia)] italic">
        {td(memory.flavour.sign)}
      </p>

      {/* Centred at the foot, where a book puts it — and, less romantically,
          the one place it cannot land on the signature. Both were bottom-right
          in the prototype, whose sign-offs were short enough to miss it. */}
      <span
        aria-hidden
        className="d-body absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[11px] text-[var(--d-sepia)] italic"
      >
        {page}
      </span>
    </div>
  )
}
