import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'

export interface TrailGeometry {
  /** The `d` attribute for all three stroked paths. Empty until measured. */
  d: string
  /** The trail's own pixel box, which becomes the SVG's viewBox. */
  width: number
  height: number
}

/**
 * Measures where the stops actually landed and draws a curve through them.
 *
 * The trail cannot be authored, because it joins points whose positions are
 * decided by how tall each card turned out at this viewport in this language —
 * and Lao runs longer than English, so even the same six stops sit differently.
 * So it is measured, exactly as the prototype did, and the curve is the same
 * cubic through each pair: control points level with the midpoint between two
 * stops, which is what gives the trail its lazy S rather than a zig-zag of arcs.
 *
 * What changes is when it re-measures. The prototype fired `drawPath()` on load,
 * on resize, and then twice more on 300ms and 400ms timers, hoping the fonts and
 * images had settled by then — and once more 320ms after a card expanded. A
 * `ResizeObserver` watching the trail replaces all five: a late-loading
 * photograph, an expanding card, a font swap and a rotated phone are all just
 * the box changing size, which is the thing actually being waited for.
 *
 * The measure is idempotent and reads nothing it has written, so StrictMode
 * running the effect twice in development produces the same path twice.
 */
export function useTrailPath(
  trailRef: RefObject<HTMLElement | null>,
  count: number,
): {
  geometry: TrailGeometry
  registerDot: (index: number) => (node: SVGCircleElement | HTMLElement | null) => void
} {
  const dots = useRef<(Element | null)[]>([])
  const [geometry, setGeometry] = useState<TrailGeometry>({ d: '', width: 0, height: 0 })

  const registerDot = useCallback(
    (index: number) => (node: SVGCircleElement | HTMLElement | null) => {
      dots.current[index] = node
    },
    [],
  )

  useLayoutEffect(() => {
    const trail = trailRef.current
    if (!trail) return

    const measure = () => {
      const box = trail.getBoundingClientRect()
      const points = dots.current
        .slice(0, count)
        .filter((node): node is Element => node !== null)
        .map((node) => {
          const r = node.getBoundingClientRect()
          return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
        })

      if (points.length < 2 || box.height === 0) return

      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
      for (let i = 1; i < points.length; i += 1) {
        const from = points[i - 1]
        const to = points[i]
        const mid = (from.y + to.y) / 2
        d += ` C ${from.x.toFixed(1)} ${mid.toFixed(1)}, ${to.x.toFixed(1)} ${mid.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
      }

      setGeometry((previous) =>
        previous.d === d && previous.height === box.height
          ? previous
          : { d, width: box.width, height: box.height },
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(trail)
    for (const dot of dots.current) if (dot) observer.observe(dot)

    return () => observer.disconnect()
  }, [trailRef, count])

  return { geometry, registerDot }
}
