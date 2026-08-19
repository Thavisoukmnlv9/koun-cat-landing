/**
 * Where each memory hangs in the sky, as a percentage of the skybox.
 *
 * Authored, not generated. A real constellation is a shape someone decided they
 * could see — the whole point is that the line between two stars means
 * something — so scattering these at random would produce a diagram rather than
 * a constellation. The first six are the prototype's own positions, which trace
 * a rising zig-zag from the lower left; the last two extend it upward so the
 * figure still reads if `memoryCount` is raised to eight.
 *
 * The order matters as much as the positions: the trail is drawn between
 * consecutive *lit* stars in archive order, so this sequence is the shape.
 */
export interface SkyPosition {
  /** % from the left edge of the skybox. */
  x: number
  /** % from the top. */
  y: number
}

export const SKY: readonly SkyPosition[] = [
  { x: 16, y: 74 },
  { x: 34, y: 44 },
  { x: 52, y: 66 },
  { x: 66, y: 34 },
  { x: 82, y: 58 },
  { x: 60, y: 20 },
  { x: 30, y: 22 },
  { x: 88, y: 16 },
]

/**
 * Ninety specks of background starfield.
 *
 * Deterministic rather than `Math.random()`, which is what the prototype used.
 * Random positions would be re-rolled on every render — and this component
 * re-renders every time a star is lit — so the whole sky would silently
 * rearrange itself each time you opened a memory. A tiny integer hash over the
 * index gives a scatter that looks random and never moves.
 */
export interface Speck {
  x: number
  y: number
  size: number
  delay: number
}

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export const SPECKS: readonly Speck[] = Array.from({ length: 90 }, (_, i) => ({
  x: hash(i + 1) * 100,
  y: hash(i + 51) * 100,
  size: hash(i + 101) * 2 + 1,
  delay: hash(i + 151) * 3,
}))
