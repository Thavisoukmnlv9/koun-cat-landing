import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { MemoryKind } from '../data/memories'

/**
 * The little badge that says what a memory is.
 *
 * Every prototype drew one and every prototype worded it differently — "✷ Photo"
 * on the filmstrip, "✦ Photo enclosed" on an envelope, a bare "♪" on the wall.
 * The glyph is the constant, so it lives here; the wording is a `variant`, and
 * the look is entirely the caller's `className` against its own palette.
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
} as const

export function MediaChip({
  kind,
  variant = 'short',
  glyph = GLYPH.photo,
  className,
}: {
  kind: MemoryKind
  variant?: 'short' | 'enclosed'
  /** Override for the filmstrip, whose photo mark is a six-pointed ✷. */
  glyph?: string
  className?: string
}) {
  const { t } = useTranslation('designs')

  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      <span aria-hidden>{kind === 'photo' ? glyph : GLYPH[kind]}</span>
      {t(LABEL[variant][kind])}
    </span>
  )
}
