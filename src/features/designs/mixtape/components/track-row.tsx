import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { MediaChip } from '../../components/media-chip'
import type { Memory } from '../../data/memories'

/**
 * One line of the tracklist.
 *
 * The prototype put a running time in the right-hand column for all six of its
 * invented tracks. Only two memories here have any running time at all, so the
 * column carries the memory's short date instead — a real fact about it, in the
 * same monospace, occupying the same width. Inventing "3:48" for a photograph
 * would have been the easier port and a small lie printed six times.
 *
 * The level meter replaces that column on the selected row while the song is
 * playing. Three bars, one keyframe, staggered by `animation-delay` — and it is
 * `aria-hidden`, because "the music is playing" is already announced by the
 * transport button's own label.
 */
export function TrackRow({
  memory,
  selected,
  playing,
  onSelect,
}: {
  memory: Memory
  selected: boolean
  playing: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')

  const title = t(memory.keys.title)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected || undefined}
      aria-label={td('a11y.selectTrack', { title })}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors',
        selected ? 'bg-[var(--d-coral)]/12' : 'hover:bg-white/5',
      )}
    >
      <span
        className={cn(
          'd-label w-5 shrink-0 text-[12px]',
          selected ? 'text-[var(--d-coral)]' : 'text-[var(--d-muted)]',
        )}
      >
        {memory.number}
      </span>

      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px] leading-tight font-semibold">{title}</b>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--d-muted)]">
          {t(memory.keys.place)}
          <span aria-hidden>·</span>
          <MediaChip kind={memory.kind} className="text-[11px]" />
        </span>
      </span>

      {selected && playing ? (
        <span aria-hidden className="flex h-3.5 w-4 shrink-0 items-end gap-px">
          {[0, 0.2, 0.4].map((delay) => (
            <i
              key={delay}
              style={{ animationDelay: `${delay}s` }}
              className="h-1/5 w-[3px] bg-[var(--d-coral)] motion-safe:animate-[d-eq_0.8s_ease-in-out_infinite] motion-reduce:h-[60%]"
            />
          ))}
        </span>
      ) : (
        <span className="d-label shrink-0 text-[11px] text-[var(--d-muted)] tabular-nums">
          {t(memory.keys.shortDate)}
        </span>
      )}
    </button>
  )
}
