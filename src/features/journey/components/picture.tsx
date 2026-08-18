import { cn } from '@/lib/utils'

interface PictureProps {
  /** Basename under `/public/images`, with no extension or size suffix. */
  name: string
  alt: string
  className?: string
  /**
   * Available widths, largest first. The largest is the unsuffixed file
   * (`journey/m20.avif`); the rest would carry a `-<width>` suffix
   * (`journey/m20-960.avif`). Omit for images that ship at a single size —
   * which is every photograph on this page, since the biggest render is the
   * album leaf at roughly 440 CSS px.
   */
  widths?: readonly number[]
  sizes?: string
  /**
   * Set on the one image above the fold on load (hero slide 1). Loads it
   * eagerly at high priority; everything else defers.
   */
  priority?: boolean
}

/**
 * An `<img>` with an AVIF source and a JPEG fallback.
 *
 * AVIF runs roughly a third the size of the equivalent JPEG on these renders,
 * and every browser in support today reads it; the JPEG covers anything older.
 */
export function Picture({ name, alt, className, widths, sizes, priority = false }: PictureProps) {
  const base = `/images/${name}`

  const srcSetFor = (ext: string) =>
    widths?.length
      ? widths.map((w, i) => `${base}${i === 0 ? '' : `-${w}`}.${ext} ${w}w`).join(', ')
      : undefined

  return (
    // `display: contents` dissolves the <picture> box so the <img> lays out as a
    // direct child of whatever contains it. Without it the wrapper is an inline
    // element of no height and `size-full` on the image resolves to nothing.
    <picture className="contents">
      <source type="image/avif" srcSet={srcSetFor('avif') ?? `${base}.avif`} sizes={sizes} />
      <img
        src={`${base}.jpg`}
        srcSet={srcSetFor('jpg')}
        sizes={sizes}
        alt={alt}
        className={cn('block', className)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  )
}
