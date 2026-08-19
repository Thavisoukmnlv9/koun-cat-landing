import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useReveal } from '@/features/journey/hooks/use-reveal'
import { usePrefersReducedMotion } from '@/lib/hooks'

import { AudioNote } from '../../components/audio-note'
import { MediaChip } from '../../components/media-chip'
import { FILM_SRC, type Memory } from '../../data/memories'

/** Roman numerals, as far as the archive goes. */
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

/** How far the background drifts against the page, in pixels across a screen. */
const PARALLAX = 40

/**
 * One full-height chapter: a photograph, a scrim, and the prose over it.
 *
 * Two scroll effects, and they are driven differently on purpose.
 *
 * The parallax is `useScroll` on this section mapped through `useTransform` —
 * a motion value written straight to the compositor, never through React. The
 * prototype ran one shared scroll listener that looped every chapter on every
 * frame and wrote `style.transform` by hand; this does the same arithmetic
 * without the loop, and Motion drops it entirely under `reducedMotion="user"`,
 * which is the correct behaviour for an effect that exists only to be pretty.
 *
 * The text reveal is `useReveal` — journey's own IntersectionObserver hook —
 * because it is a one-way state change rather than a continuous function of
 * scroll position, and because it already handles reduced motion by starting
 * revealed and never constructing an observer at all.
 *
 * `onEnter` reports upward for the chapter dots. It is deliberately not the
 * same signal as the reveal: the reveal happens once, the dots have to keep
 * following you back up the page.
 */
export function Chapter({
  memory,
  index,
  onEnter,
}: {
  memory: Memory
  index: number
  onEnter: (index: number) => void
}) {
  const { t } = useTranslation()
  const { t: td } = useTranslation('designs')
  const reduced = usePrefersReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reveal = useReveal<HTMLDivElement>({ threshold: 0.25 })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [PARALLAX, -PARALLAX])

  // The dot rail. A second, cheaper observer than the reveal's: it re-fires
  // both ways, and it wants the middle of the viewport rather than its edge.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onEnter(index)
      },
      { threshold: 0.5 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [index, onEnter])

  // The film plays itself once it is on screen, muted, as a moving backdrop —
  // and stops when it is not, so a page of six chapters is never decoding video
  // nobody is looking at.
  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section || typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const title = t(memory.keys.title)
  const shown = reveal.revealed

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`chapter-${memory.id}`}
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <motion.div style={{ y: reduced ? 0 : y }} className="absolute inset-x-0 -inset-y-[12%] z-0">
        {memory.kind === 'film' ? (
          <video
            ref={videoRef}
            src={FILM_SRC}
            poster={`/images/journey/${memory.image}.jpg`}
            muted
            loop
            playsInline
            preload="none"
            className="d-scene size-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={title}
            style={{ backgroundImage: `url(/images/journey/${memory.image}.jpg)` }}
            className="d-scene size-full bg-cover bg-center"
          />
        )}
      </motion.div>

      <span aria-hidden className="d-scrim absolute inset-0 z-[1]" />

      <div ref={reveal.ref} className="relative z-[2] w-full max-w-[600px] px-6.5 pt-10 pb-16">
        {/* Each line arrives a beat after the one above it. The delays are
            inline because they are per-line and sequential; everything else
            about the transition is in the class. */}
        <div className={`transition-opacity duration-700 ${shown ? 'opacity-100' : 'opacity-0'}`}>
          <MediaChip
            kind={memory.kind}
            variant="chapter"
            className="d-label mb-4 rounded-full bg-[var(--d-gold)] px-2.5 py-[5px] text-[10px] font-bold tracking-[0.14em] text-[var(--d-ink)] uppercase"
          />
        </div>

        {[
          {
            key: 'num',
            delay: 0,
            node: (
              <p className="d-display text-[15px] tracking-[0.06em] text-[var(--d-gold)] italic">
                {td('storybook.chapter', { numeral: NUMERALS[index] })}
              </p>
            ),
          },
          {
            key: 'date',
            delay: 100,
            node: (
              <p className="d-label mt-3.5 mb-1.5 text-[11px] font-bold tracking-[0.3em] text-[var(--d-rose)] uppercase">
                {t(memory.keys.date)}
              </p>
            ),
          },
          {
            key: 'title',
            delay: 180,
            node: (
              <h2
                id={`chapter-${memory.id}`}
                className="d-display mb-3.5 text-[clamp(38px,10vw,58px)] leading-none font-semibold tracking-[-0.01em] text-balance"
              >
                {title}
              </h2>
            ),
          },
          {
            key: 'story',
            delay: 300,
            node: (
              <p className="max-w-[42ch] text-[17.5px] leading-relaxed text-[#e6ddd0]">
                {t(memory.keys.back)}
              </p>
            ),
          },
        ].map(({ key, delay, node }) => (
          <div
            key={key}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-[var(--ease-reveal)] motion-reduce:transition-none ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
          >
            {node}
          </div>
        ))}

        {memory.kind === 'voice' && (
          <div
            style={{ transitionDelay: '400ms' }}
            className={`transition-all duration-700 ease-[var(--ease-reveal)] motion-reduce:transition-none ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
          >
            <AudioNote
              label={td('storybook.playSong')}
              className="mt-5 inline-flex rounded-[40px] border border-[var(--d-cream)]/30 bg-[var(--d-cream)]/10 py-2.5 pr-4 pl-2.5 text-[var(--d-cream)] backdrop-blur-[6px]"
              barClassName="bg-white/25"
            />
          </div>
        )}
      </div>
    </section>
  )
}
