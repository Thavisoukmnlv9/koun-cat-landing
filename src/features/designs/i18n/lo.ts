/**
 * Copy for the five design variants, in Lao — NOT YET TRANSLATED.
 *
 * Every value below is still the English string. That is deliberate and it is
 * temporary: `TranslationShape<DesignsBundle>` and `i18n-parity.test.ts`
 * between them require this file to carry the same key tree, the same
 * `{{placeholder}}` sets and no empty values, so a half-filled file would fail
 * the build and block the designs from shipping at all. English placeholders
 * satisfy all three checks while leaving the gap in plain sight.
 *
 * To find the remaining work:  rg 'TODO\(lo\)' src/features/designs/i18n/lo.ts
 *
 * Translate a group, delete its TODO marker, and the file needs nothing else.
 * The journey bundle next door is fully translated and is the reference for
 * tone — note that Lao takes looser line-height, which `globals.css` handles in
 * its `:lang(lo)` block.
 */

import type { TranslationShape } from '@/lib/i18n/types'

import type { DesignsBundle } from './en'

export const lo: TranslationShape<DesignsBundle> = {
  // TODO(lo): translate this group.
  meta: {
    title: 'Our Journey — five ways to tell it',
    description:
      'The same archive, told five ways: a filmstrip, postcards, a map, a wall, and letters.',
  },

  /** The header tab bar. */
  // TODO(lo): translate this group.
  tabs: {
    label: 'Design',
    journey: 'Journey',
    filmstrip: 'Filmstrip',
    postcards: 'Postcards',
    map: 'The Map',
    gallery: 'The Wall',
    letters: 'Letters',
  },

  /** Media badges. Each design words them slightly differently. */
  // TODO(lo): translate this group.
  chips: {
    photo: 'Photo',
    sound: 'Sound',
    film: 'Film',
    photoEnclosed: 'Photo enclosed',
    voiceNote: 'Voice note',
    filmEnclosed: 'Film enclosed',
  },

  // TODO(lo): translate this group.
  filmstrip: {
    leader: 'Reel No. 1 · 8mm',
    titleA: 'Our',
    titleAmp: '&',
    titleB: 'Story',
    tagline: 'a little film of us — press play, or roll it yourself',
    run: 'Run projector',
    pause: 'Pause',
    frame: 'frame {{current}} / {{total}}',
    hint: 'swipe the film ← · tap a frame to project',
    fin: 'Fin.',
    continued: '…to be continued',
    prev: '◄ Prev',
    next: 'Next ►',
    count: '{{current}} / {{total}}',
  },

  // TODO(lo): translate this group.
  postcards: {
    kicker: 'Postmarked with love · Par Avion',
    titleA: 'Wish You',
    titleAccent: 'Were',
    titleB: 'Here',
    sub: '…every day, actually. — tap a card to read the back',
    stamp: 'us',
    flipHint: 'turn over ⟳',
    addrTo: 'To the one I love',
    addrName: 'You. Always you.',
    footer: 'to be continued…',
    count: 'Postcards № 01–{{total}}',
  },

  // TODO(lo): translate this group.
  map: {
    coord: '17°58′ N · 102°36′ E — somewhere with you',
    title: 'The Map of Us',
    lede: "Every place we've been leaves a mark. Follow the trail — tap a stop to stay a while.",
    stop: 'Stop {{n}}',
    open: 'tap to open ▾',
    close: 'tap to close ▴',
    here: '✕ marks right here',
    footer: '— to be continued —',
    north: 'N',
  },

  // TODO(lo): translate this group.
  gallery: {
    eyebrow: 'A wall of us',
    titleA: 'Pinned &',
    titleAccent: 'Kept',
    scribble: 'all my favourite little moments',
    instr: 'tap a photo to lift it off the wall',
    footer: '…more to pin',
    count: 'Wall № 01',
  },

  // TODO(lo): translate this group.
  letters: {
    eyebrow: 'Sealed with love',
    title: 'Letters',
    script: 'to you, from me',
    lede: "Letters I never sent — because I'd rather give them to you here. Tap one to open it.",
    seal: 'us',
    tapCue: 'tap to break the seal',
    addrTo: 'To the one I love',
    addrName: 'You',
    footer: 'more to come, always',
    count: 'Letters № 01–{{total}}',
  },

  /**
   * Per-memory flavour, keyed by the journey postcard it decorates.
   *
   * `dist` is the map's line under each stop; `greet`/`postSign` are the
   * postcard's; `salut`/`sign`/`who` open and close a letter. A memory that no
   * design decorates still needs every key, because the shape is uniform.
   */
  // TODO(lo): translate this group.
  memories: {
    c01: {
      dist: '0 km — where it started',
      greet: 'Greetings from',
      postSign: '— always, me',
      salut: 'My love,',
      sign: 'Yours from the start,',
      who: '— me',
    },
    c02: {
      dist: '153 km north — our first road together',
      greet: 'A postcard from',
      postSign: '— your co-pilot',
      salut: 'Dearest you,',
      sign: 'Your co-pilot,',
      who: '— always',
    },
    c03: {
      dist: 'however far it was, worth the walk',
      greet: 'Hand-delivered to',
      postSign: '— me, holding flowers',
      salut: 'To the one who opened the door,',
      sign: 'Still nervous, still yours,',
      who: '— me',
    },
    c04: {
      dist: 'a detour we never regretted',
      greet: 'Written from',
      postSign: '— soaked, and glad',
      salut: 'My favourite detour,',
      sign: 'Wherever the road goes,',
      who: '— yours',
    },
    c05: {
      dist: '0 km — the whole street was ours',
      greet: 'Filmed at',
      postSign: '— sun-drunk, me',
      salut: 'My sunshine,',
      sign: 'Soaked and laughing,',
      who: '— always',
    },
    c06: {
      dist: 'the shortest walk, the best one',
      greet: 'Sounds like',
      postSign: '— yours, warmly',
      salut: 'To my favourite sound,',
      sign: 'Warmly, endlessly,',
      who: '— yours',
    },
    c07: {
      dist: 'however far — still together',
      greet: 'Just a note from',
      postSign: '— all my love',
      salut: 'My steady one,',
      sign: 'Through all of it,',
      who: '— me',
    },
    c08: {
      dist: '153 km, and the same mountains',
      greet: 'Greetings again from',
      postSign: '— us, again',
      salut: 'My whole ordinary world,',
      sign: 'All my love, all of it,',
      who: '— me',
    },
    c09: {
      dist: '0 km — the day the map got a centre',
      greet: 'With everyone, from',
      postSign: '— yours, officially',
      salut: 'My yes,',
      sign: 'Beginning again, with you,',
      who: '— me',
    },
    c10: {
      dist: '0 km — exactly where I want to be',
      greet: 'Still writing from',
      postSign: '— all my love, still',
      salut: 'My every ordinary day,',
      sign: 'Today and the next ten,',
      who: '— me',
    },
  },

  a11y: {
    tablist: 'Choose a design',
    openFrame: 'Open {{title}}',
    closeFrame: 'Close',
    flipCard: 'Turn over the postcard for {{title}}',
    openStop: 'Open {{place}}',
    liftPhoto: 'Lift {{title}} off the wall',
    openLetter: 'Break the seal on the letter from {{place}}',
    playSound: 'Play',
    pauseSound: 'Pause',
    seek: 'Seek',
    projector: 'Run the projector',
  },
}
