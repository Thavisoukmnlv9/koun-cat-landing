/**
 * The letter's body, in reading order.
 *
 * Only the order lives here; the words are in `../i18n/en.ts`, reached through
 * these key paths. Same split as `postcards.ts`, and for the same reason: a
 * stored `as const` string is a literal type that i18next's typed `t()` takes
 * directly, where a path built at the call site widens into a union.
 *
 * Adding a fourth paragraph is one line here plus a key in both locale files —
 * and `lo.ts` is typed against `en.ts`, so forgetting the second is a compile
 * error rather than a blank line in the middle of the letter.
 */
export const LETTER_BODY_KEYS = ['ask.body.p1', 'ask.body.p2', 'ask.body.p3'] as const

/**
 * What separates two paragraphs once they are one string.
 *
 * The body is typed, spoken and measured as a single string rather than as
 * three elements, because all three of those things want it that way: the
 * typewriter writes one node's textContent, the speech synthesiser takes one
 * utterance, and a blank line is the only thing the two have to agree on. A
 * `whitespace-pre-line` on the container turns it back into paragraphs.
 */
export const PARAGRAPH_BREAK = '\n\n'

/**
 * Ties the paper peeking out of the envelope to the paper on the reading
 * surface, so Motion walks one between the other instead of dissolving them.
 * Shared by `envelope.tsx` and `letter-dialog.tsx`; it is a constant because
 * two string literals that must match are a bug waiting for a typo.
 */
export const LETTER_LAYOUT_ID = 'letter-paper'
