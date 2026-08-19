import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { MemoryKind } from '../data/memories'

/**
 * The little badge that says what a memory is.
 *
 * Every prototype drew one and every prototype worded it differently — "✷ Photo"
 * on the filmstrip, "✦ Photo enclosed" on an envelope, a bare "♪" on the wall,
 * "✦ A photograph" over a storybook chapter. The glyph is the constant, so it
 * lives here; the wording is a `variant`, and the look is entirely the caller's
 * `className` against its own palette.
 */
const GLYPH: Record<MemoryKind, string> = {
  photo: '✦',
  voice: '♪',
  film: '▶',
}

const LABEL = {
  short: { photo: 'chips.photo', voice: 'chips.sound', film: 'chips.film' },
  enclosed: {
    photo: 'chips.photoEnclosed',
    voice: 'chips.voiceNote',
    film: 'chips.filmEnclosed',
  },
  /** The storybook, which announces a chapter's medium as a phrase. */
  chapter: {
    photo: 'chips.photoChapter',
    voice: 'chips.soundChapter',
    film: 'chips.filmChapter',
  },
} as const

export function MediaChip({
  kind,
  variant = 'short',
  glyph = GLYPH.photo,
  iconOnly = false,
  className,
}: {
  kind: MemoryKind
  variant?: 'short' | 'enclosed' | 'chapter'
  /** Override for the filmstrip, whose photo mark is a six-pointed ✷. */
  glyph?: string
  /**
   * Just the mark, for the wall — where eight of these tile down the page and
   * the word would read as clutter. The label is still announced.
   *
   * A prop rather than the caller hiding the text with a CSS child selector,
   * which is what this was first: `t()` returns a bare text node, so
   * `*:last-child` matched the glyph and hid the wrong half.
   */
  iconOnly?: boolean
  className?: string
}) {
  const { t } = useTranslation('designs')

  const label = t(LABEL[variant][kind])
  const mark = kind === 'photo' ? glyph : GLYPH[kind]

  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span aria-hidden>{mark}</span>
      {iconOnly ? <span className="sr-only">{label}</span> : label}
    </span>
  )
}
