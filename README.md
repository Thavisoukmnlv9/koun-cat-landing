# Our Journey

A bilingual (English / Lao) memory page: ten flip-over postcards down a dashed
timeline, an album you turn page by page, and one unsent letter in an envelope.

Fully static — no backend, no API, no authentication.

Ported from a single hand-built HTML file in which every style was an inline
attribute and every behaviour was imperative DOM code. The words, the colours,
the tape angles and the easing curves are the original's; the structure,
the types, the accessibility and the second language are new.

## Stack

React 19 · Vite · Tailwind v4 · react-i18next · Vitest + Testing Library.
ESLint · Prettier · Husky · Docker.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. There is nothing to configure — the project
has no environment variables.

The toolchain is on **Node 26** (`.nvmrc`, `engines`, and both Docker stages).
jsdom 30 is the reason the floor is that high — it requires
`^22.22.2 || ^24.15.0 || >=26.0.0`.

### Two TypeScripts, on purpose

`devDependencies` carries TypeScript twice. This is the arrangement Microsoft
documents for adopting 7.0 before the ecosystem has caught up:

| Entry                | Resolves to               | Provides                                                            |
| -------------------- | ------------------------- | ------------------------------------------------------------------- |
| `@typescript/native` | real `typescript@7.0.2`   | the `tsc` binary — what `npm run typecheck` and `npm run build` run |
| `typescript`         | `@typescript/typescript6` | the JavaScript compiler API, plus `tsc6` and `tsserver`             |

TypeScript 7 is the Go port. It typechecks this project with no `tsconfig`
changes at all — every option here was already 7-compatible. What it no longer
ships is the JavaScript compiler API; its package exports only a version string
and an `unstable/*` surface. `typescript-eslint` reads that API, so pointing the
bare name `typescript` at 7 makes ESLint refuse to start outright:
`typescript-eslint does not support TS 7.0.`

Hence the split. The bare name keeps resolving to the 6.0 API for ESLint's sake,
and `tsc` comes from the alias. The binaries do not collide — 7 owns `tsc`, 6
owns `tsc6` — and an editor pointed at `node_modules/typescript/lib` still finds
a working `tsserver`.

`.ncurc.json` rejects `typescript` so that `ncu` cannot quietly rewrite that
alias back into a plain version and break linting. `@typescript/native` is left
free to move. Collapse the two entries back into one once typescript-eslint
supports TS >=7.1 ([typescript-eslint#10940][tseslint-ts7]).

[tseslint-ts7]: https://github.com/typescript-eslint/typescript-eslint/issues/10940

## Scripts

| Script                            | What it does                                      |
| --------------------------------- | ------------------------------------------------- |
| `npm run dev`                     | Vite dev server on port 3000                      |
| `npm run build`                   | Typecheck, then build to `dist/`                  |
| `npm run preview`                 | Serve the built `dist/`                           |
| `npm run typecheck`               | `tsc -b` — also the main guard on i18n key parity |
| `npm run lint` / `lint:fix`       | ESLint                                            |
| `npm run format` / `format:check` | Prettier                                          |
| `npm test`                        | Vitest                                            |
| `npm run check:i18n`              | English/Lao key + placeholder parity only         |

## How it is put together

```
src/
  main.tsx, App.tsx           entry — I18nProvider wrapped around the page
  app/i18n/                   i18next composition root + typed resources
  app/providers/              I18nProvider
  config/languages.ts         the languages the site ships (en, lo)
  lib/i18n/                   i18next factory, types, per-script font preloader
  lib/hooks/                  usePrefersReducedMotion
  lib/utils/cn.ts             class-name merge
  styles/                     globals.css (design tokens) + fonts.css
  features/journey/
    journey-page.tsx          composes header, timeline, album, letter
    components/               postcard, album (book/cover/plate/controls),
                              envelope, polaroid, washi tape, switcher, picture
    data/                     the ten cards and six plates: geometry + key paths
    hooks/                    scroll reveal, album pager
    i18n/                     en.ts (source of truth) + lo.ts
```

### Content and translation

Every string lives in `src/features/journey/i18n/`. Components call `t(...)` and
contain no literal copy, so a new language is a locale file plus one line in
`src/config/languages.ts`.

`en.ts` is the source of truth. `lo.ts` is typed as `TranslationShape<typeof en>`,
so a missing or misspelled key fails `npm run typecheck`. `npm run check:i18n`
adds the runtime checks types cannot express — matching `{{placeholder}}` sets
and no empty values — across all ~125 strings.

Dates are translated, not formatted. `Intl.DateTimeFormat` cannot help: "Today"
is not a date, nine cards are month-precision while one is day-precision, and
Lao month naming is an editorial choice rather than something a formatter should
guess. `date`, `shortDate` and the spelled-out plate ordinals are all literals
per language.

### Design tokens

`src/styles/globals.css` is the single source of colour, type, shadow, easing
and geometry, expressed as a Tailwind v4 `@theme` block. Layered gradients — the
paper ground, the card faces, the book boards, the envelope — have no `@theme`
namespace in v4 and live as named materials in `@layer components` instead.

Per-card geometry (tilt, tape position, tape opacity) is **data**, not CSS. It
is authored content rather than a shared token, it has to stay stable across a
re-render or a card would jump to a new angle the moment it was flipped, and
Tailwind compiles from source text so it could not express a runtime value
anyway. The numbers live in `data/postcards.ts` and reach CSS as custom
properties; every colour and duration stays in the theme.

### Fonts

Caveat (the hand), Courier Prime (labels and dates) and EB Garamond (reading
copy) are self-hosted for Latin; Lao falls through to Noto Sans Lao. Each face
is gated by `unicode-range`, so switching to Lao reaches the right font with no
per-language logic in any component — see the note at the top of
`src/styles/fonts.css`.

The trade-off is named there and worth repeating: **Caveat has no Lao coverage**,
so Lao readers get Noto Sans Lao's clean upright strokes where English readers
get handwriting. Nothing on Google Fonts draws Lao in a convincingly handwritten
voice. Lao also needs vertical room that Caveat's tight leading does not give —
stacked vowels and tone marks would clip — so a short, deliberately unlayered
`:lang(lo)` block at the foot of `globals.css` loosens the display scales.

### Images

`public/images/journey/` holds an `.avif` (primary) and `.jpg` (fallback) per
photograph, served through a `<picture>` by `components/picture.tsx`. One size
each, long edge capped at 1200px — the largest render on the page is the album
leaf at roughly 440 CSS px.

Note that `picture.tsx` hardcodes an AVIF `<source>`: a `.jpg` with no matching
`.avif` will 404 and show a broken image rather than falling back. To re-encode
after replacing a photograph, use `sharp` (installed temporarily, then removed);
macOS `sips` writes AVIF files whose pixel data decodes as fully transparent and
cannot be used.

### Sound

Three recordings, all served straight out of `public/`: the reel's own audio,
the optical track beside it, and `sound-effects/` — the keys the letter is
typed with.

The reel and the track are objects you switch on. The letter's typing is not:
it starts with the tap that breaks the seal and stops when the letter is put
back, and there is a mute control inside the letter for the rest of the time.
That is a deliberate departure from the reel's "runs silent unless you ask it
not to", and the reason is that the sound _is_ the animation there — it is not
accompanying the letter, it is the letter being written.

`use-typing-sound.ts` holds two decisions worth knowing before changing it:

- **`play()` is called from the click handler, not from an effect.** WebKit only
  grants an element the right to make a sound if `play()` happened inside a user
  gesture, and it pauses a muted element that started without one the instant
  script unmutes it. The letter opens about a second after the tap, in a
  different task — so the element is started, silently, from the tap itself and
  simply rolls until the letter is closed. Move that call into an effect and the
  page goes quiet on iPhone with nothing in the console to say why.
- **The gate is `muted`, not `pause()`.** It is synchronous, so it cannot clip
  the first click of a burst the way resuming a decode can; rapid play/pause
  pairs produce _"The play() request was interrupted"_ noise; letting the tape
  run underneath means each burst resumes somewhere else in the recording, so a
  long letter never repeats the same clatter; and on iOS Safari `muted` is the
  only volume control that works at all, since `volume` is read-only there.

## Deployment

The build output in `dist/` is static and can be served by anything. A container
image is included:

```bash
docker build -f docker/Dockerfile -t our-journey .
docker run -p 8080:80 our-journey
```

The image builds with Node 26 and serves `dist/` with `serve`. It sets no
security headers and no CSP; putting a reverse proxy in front is the place to
add them.

`public/robots.txt` is set to `Disallow: /`. This page has real names and
private photographs in it, so staying out of search indexes is the safe default
— change it if the page is ever meant to be found.

## Outstanding

- **The letter is drafted, not written.** `ask.greeting`, `ask.body.p1`–`p3`,
  `ask.question` and `ask.signature` in `src/features/journey/i18n/en.ts` are
  marked `TODO` and are deliberately unspecific — they exist so there was
  something to read while the opening was built. Rewrite all of them, and their
  Lao counterparts. `cards.c03.back` (what the flowers were for) is still the
  original's placeholder for the same reason: inventing it was not this port's
  job.
- **The typing sound plays at full level on iPhone.**
  `HTMLMediaElement.volume` is read-only on iOS Safari, so the `LEVEL` constant
  in `use-typing-sound.ts` is ignored there and the recording plays at whatever
  level it was mastered at. The mute control inside the letter does work, and is
  the remedy. The proper fix is to re-encode
  `public/sound-effects/virtualzero-keyboard-typing-fast-371229.mp3` about 8 dB
  quieter — which fixes every platform at once and needs no code. It is 256 kbps
  stereo at 257 KB; mono at 96 kbps would be a third of that with no audible
  difference.
- **Reading the letter aloud is English-only in practice.** The control is
  rendered only where the device actually has a voice for the active language
  (`use-letter-speech.ts`), and no mainstream platform ships a `lo-LA` voice —
  so in Lao it is simply absent rather than silent or mispronounced. It will
  appear on its own, already translated, the day a device ships one.
- **The Lao copy is a draft.** `lo.ts` says so at the top. It is faithful and
  idiomatic, but the English side is somebody's love letter and the Lao side
  should be their own words.
- **Photograph alt text reuses each card's title**, as the original did. The
  titles do work as short descriptions, but 17 dedicated `alt` strings would
  describe the images properly — at the cost of 34 more strings to translate.
- **`jw-sway`** — the original declared a gentle rocking keyframe and never used
  it. It was not ported. Its natural home would be the header polaroid, under
  `motion-safe:`.
- **Favicons** are still the stock boilerplate marks from the starter.

---

Built from the [reactjs-boilerplate](https://github.com/Thavisoukmnlv9/reactjs-boilerplate)
starter by **Thavisouk MNLV**. Released under the [MIT License](./LICENSE-MIT).
