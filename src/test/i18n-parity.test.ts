import { describe, expect, it } from 'vitest'

import { featureBundles } from '@/app/i18n'
import { DEFAULT_LOCALE, LANGUAGE_CODES } from '@/config/languages'

/**
 * Cross-language i18n guard. `TranslationShape<typeof en>` already enforces key
 * parity at compile time; this adds the runtime checks types can't express:
 *   - every translation has the same key tree as the English source,
 *   - each key's `{{placeholder}}` set matches English (a mistranslated or
 *     dropped interpolation token breaks a screen silently otherwise),
 *   - no value is an empty string.
 * Run via `npm run check:i18n` or as part of `npm test`.
 */

interface Leaf {
  path: string
  value: string
}

function leaves(obj: unknown, prefix = ''): Leaf[] {
  const out: Leaf[] = []
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string') out.push({ path, value })
      else out.push(...leaves(value, path))
    }
  }
  return out
}

function placeholders(value: string): string[] {
  return (value.match(/\{\{\s*[^}]+\s*\}\}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort()
}

const OTHER_LOCALES = LANGUAGE_CODES.filter((l) => l !== DEFAULT_LOCALE)

describe('i18n bundle parity', () => {
  for (const bundle of featureBundles) {
    const enMap = new Map(leaves(bundle.resources[DEFAULT_LOCALE]).map((l) => [l.path, l.value]))

    describe(bundle.namespace, () => {
      for (const lng of OTHER_LOCALES) {
        const lngLeaves = leaves(bundle.resources[lng])
        const lngMap = new Map(lngLeaves.map((l) => [l.path, l.value]))

        it(`${lng}: has the same keys as ${DEFAULT_LOCALE}`, () => {
          expect([...lngMap.keys()].sort()).toEqual([...enMap.keys()].sort())
        })

        it(`${lng}: preserves {{placeholders}} for every key`, () => {
          for (const [path, enValue] of enMap) {
            const lngValue = lngMap.get(path)
            if (lngValue === undefined) continue
            expect(placeholders(lngValue), `${bundle.namespace}.${path}`).toEqual(
              placeholders(enValue),
            )
          }
        })

        it(`${lng}: has no empty values`, () => {
          expect(lngLeaves.filter((l) => l.value.trim() === '').map((l) => l.path)).toEqual([])
        })
      }
    })
  }
})
