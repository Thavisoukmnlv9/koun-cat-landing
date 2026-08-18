import { POSTCARDS } from '../data/postcards'

import { Postcard } from './postcard'

/**
 * The ten postcards, alternating either side of a dashed spine.
 *
 * The spine stops short of the bottom so it reads as a thread the cards hang
 * from rather than a border. Below roughly 490px the cards fill the column and
 * the alternation all but disappears — that is the original's behaviour, and
 * preserving it keeps the page honest at phone width rather than inventing a
 * layout the author never saw.
 */
export function TimelineSection() {
  return (
    <section className="max-w-page relative mx-auto px-6 pb-10">
      <div
        aria-hidden
        className="border-rule absolute top-0 bottom-[120px] left-1/2 w-0 border-l border-dashed"
      />

      <div className="relative flex flex-col gap-[clamp(64px,9vw,132px)]">
        {POSTCARDS.map((card) => (
          <Postcard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
