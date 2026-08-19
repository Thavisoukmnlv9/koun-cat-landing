/**
 * Copy for the ten design variants, in Lao — NOT YET TRANSLATED.
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
 * its `:lang(lo)` block, and `designs.css` extends to the display sizes these
 * ten introduce.
 *
 * Generated from `en.ts` rather than typed out, which is what guarantees the
 * key tree and the `{{placeholder}}` sets match it exactly.
 */

import type { TranslationShape } from '@/lib/i18n/types'

import type { DesignsBundle } from './en'

export const lo: TranslationShape<DesignsBundle> = {
  // TODO(lo): translate this group.
  meta: {
    title: 'Our Journey — ten ways to tell it',
    description:
      'The same archive, told ten ways: a filmstrip, postcards, a map, a wall, letters, a mixtape, an album, a constellation, a storybook and an exhibition.',
  },

  /** The header tab bar. */
  // TODO(lo): translate this group.
  tabs: {
    label: 'Design',
    home: 'Home',
    journey: 'Journey',
    filmstrip: 'Filmstrip',
    postcards: 'Postcards',
    map: 'The Map',
    gallery: 'The Wall',
    letters: 'Letters',
    mixtape: 'Mixtape',
    album: 'The Album',
    constellation: 'Constellation',
    storybook: 'Storybook',
    exhibition: 'Exhibition',
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
    /** The storybook announces each chapter's medium in a full phrase. */
    photoChapter: 'A photograph',
    soundChapter: 'With sound',
    filmChapter: 'Moving picture',
  },

  /** The specimen sheet — the way in. */
  // TODO(lo): translate this group.
  home: {
    eyebrow: 'Specimen sheet',
    title: 'Our Journey',
    script: 'one archive, eleven readings',
    lede: 'The same photographs, the same song, the same film — told eleven different ways. Open whichever one you like.',
    open: 'Open',
    featured: 'The finished page',
    note: 'Every photograph on this sheet is ours, and so are the song and the film. Nothing here is a placeholder — it is one archive, read eleven ways.',
    fin: 'for you',

    designs: {
      journey: {
        name: 'Our Journey',
        blurb:
          'The finished page. Ten postcards taped down a dashed timeline, each one turning over to the note on its back.',
      },
      filmstrip: {
        name: 'Filmstrip Reel',
        blurb:
          'Swipe the film right-to-left, or run the projector to roll it forward. Tap a frame to project it.',
      },
      postcards: {
        name: 'Flip Postcards',
        blurb:
          "Airmail postcards you tap to flip. The photo's on the front, the whole story's handwritten on the back.",
      },
      map: {
        name: 'The Map of Us',
        blurb:
          'Scroll down a vintage map and a golden trail draws itself, stop by stop, with a pin walking the path.',
      },
      gallery: {
        name: 'Pinned & Kept',
        blurb:
          'A wall of taped polaroids. Tap one and it lifts off, straightens, and slowly develops into the memory.',
      },
      letters: {
        name: 'Letters to You',
        blurb:
          'Sealed love letters. Tap one — the wax seal breaks, the flap lifts, and the letter unfolds itself.',
      },
      mixtape: {
        name: 'Our Mixtape',
        blurb:
          'A real turntable. The record spins, the tonearm drops, and side A plays straight through while you read the sleeve.',
      },
      album: {
        name: 'Keepsake Album',
        blurb:
          'A leather-bound book. Turn each page and it flips with a real curl, one memory pressed onto every leaf.',
      },
      constellation: {
        name: 'Constellation',
        blurb:
          'Every memory is a star. Tap them one by one and watch the lines draw our constellation into the night sky.',
      },
      storybook: {
        name: 'Storybook',
        blurb:
          'Full-screen chapters. Scroll and each scene glides in on parallax, the story rising over the photo like a film.',
      },
      exhibition: {
        name: 'The Exhibition',
        blurb:
          'A gallery you swipe through in 3D. Each memory hangs framed and spotlit, with its own museum placard below.',
      },
    },
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

  // TODO(lo): translate this group.
  mixtape: {
    eyebrow: 'Side A · for you',
    titleA: 'Our ',
    titleAccent: 'Mix',
    titleB: 'tape',
    sub: 'one song, and everything it reminds me of',
    nowPlaying: 'Now playing',
    tracklist: 'Tracklist · {{total}} memories',
    /**
     * The prototype gave each of its six tracks a different song and a made-up
     * running time. There is one song. Rather than invent five more or fake the
     * durations, side A plays straight through and the list says what each part
     * of it is about — which is what a real mixtape insert does.
     */
    tracklistNote: 'Side A runs straight through. Pick a memory and read along with it.',
    footer: '♪ THE B-SIDE IS STILL BEING WRITTEN ♪',
  },

  // TODO(lo): translate this group.
  album: {
    volume: 'Volume I',
    title: 'The Album of Us',
    coverTitle: 'Our Journey',
    coverSub: 'a keepsake of us',
    coverYears: '{{from}} — today',
    monogram: 'us',
    openCue: 'turn the page ›',
    back: 'Back',
    turn: 'Turn',
    cover: 'Cover',
    end: 'The End',
    leaf: 'Leaf {{current}} / {{total}}',
    finTitle: 'The story continues…',
    finSub: '— to be added to, always —',
    ourSong: 'our song',
  },

  // TODO(lo): translate this group.
  constellation: {
    coord: 'RA 17h 58m · Dec +17°58′',
    title: 'The Constellation of Us',
    lede: 'Every memory is a star. Tap them one by one and watch our constellation appear.',
    /** Derived: the year comes out of the memory's own date, the magnitude from its place in the sky. */
    catalogue: '★ HD-{{year}} · mag {{mag}}',
    progress: '{{lit}} of {{total}} stars lit',
    complete: '✦ our constellation is complete — and still growing ✦',
    nextStar: '✦ light the next star →',
    footer: 'CATALOGUED WITH LOVE · MAG 1.0',
    ourSong: 'our song',
  },

  // TODO(lo): translate this group.
  storybook: {
    eyebrow: 'A story in {{total}} chapters',
    titleA: 'Our ',
    titleAccent: 'Journey',
    sub: 'the whole of us, one scene at a time',
    scrollCue: 'Scroll to begin',
    chapter: 'Chapter {{numeral}}',
    playClip: 'Play the clip',
    pauseClip: 'Pause the clip',
    playSong: 'Play our song',
    pauseSong: 'Pause our song',
    closingA: 'and the best chapters are',
    closingAccent: 'still unwritten',
    closingSub: '— to be continued, with you —',
  },

  // TODO(lo): translate this group.
  exhibition: {
    eyebrow: 'Now showing · Gallery of Us',
    titleA: 'The ',
    titleAccent: 'Exhibition',
    curated: 'A permanent collection · Est. {{from}}',
    /** Derived, the way a real accession number is: year of acquisition, then the running number. */
    accession: 'No. {{year}}.{{number}}',
    counter: '{{current}} / {{total}}',
    hint: 'swipe the artwork ‹ ›',
    listening: 'listening post',
  },

  /**
   * Per-memory flavour, keyed by the journey postcard it decorates.
   *
   * `dist` is the map's line under each stop; `greet`/`postSign` are the
   * postcard's; `salut`/`sign`/`who` open and close a letter; `medium` is the
   * line of label prose beside an exhibited piece. A memory that no design
   * decorates still needs every key, because the shape is uniform.
   */
  // TODO(lo): translate this group.
  memories: {
    c01: {
      dist: '0 km — where it started',
      greet: 'Greetings from',
      medium: 'Coffee light, late afternoon · from the private collection',
      postSign: '— always, me',
      salut: 'My love,',
      sign: 'Yours from the start,',
      who: '— me',
    },
    c02: {
      dist: '153 km north — our first road together',
      greet: 'A postcard from',
      medium: 'Two wrong buses, one shared umbrella',
      postSign: '— your co-pilot',
      salut: 'Dearest you,',
      sign: 'Your co-pilot,',
      who: '— always',
    },
    c03: {
      dist: 'however far it was, worth the walk',
      greet: 'Hand-delivered to',
      medium: 'Doorstep, flowers held like the whole day',
      postSign: '— me, holding flowers',
      salut: 'To the one who opened the door,',
      sign: 'Still nervous, still yours,',
      who: '— me',
    },
    c04: {
      dist: 'a detour we never regretted',
      greet: 'Written from',
      medium: 'Loud water, cold spray, mixed weather',
      postSign: '— soaked, and glad',
      salut: 'My favourite detour,',
      sign: 'Wherever the road goes,',
      who: '— yours',
    },
    c05: {
      dist: '0 km — the whole street was ours',
      greet: 'Filmed at',
      medium: 'Moving image · water, powder, one street',
      postSign: '— sun-drunk, me',
      salut: 'My sunshine,',
      sign: 'Soaked and laughing,',
      who: '— always',
    },
    c06: {
      dist: 'the shortest walk, the best one',
      greet: 'Sounds like',
      medium: 'Sound piece · the table we keep going back to',
      postSign: '— yours, warmly',
      salut: 'To my favourite sound,',
      sign: 'Warmly, endlessly,',
      who: '— yours',
    },
    c07: {
      dist: 'however far — still together',
      greet: 'Just a note from',
      medium: 'The hard month, kept in the collection anyway',
      postSign: '— all my love',
      salut: 'My steady one,',
      sign: 'Through all of it,',
      who: '— me',
    },
    c08: {
      dist: '153 km, and the same mountains',
      greet: 'Greetings again from',
      medium: 'Cold balcony, red hoodie, the same view',
      postSign: '— us, again',
      salut: 'My whole ordinary world,',
      sign: 'All my love, all of it,',
      who: '— me',
    },
    c09: {
      dist: '0 km — the day the map got a centre',
      greet: 'With everyone, from',
      medium: 'Gold and flowers · one room, everyone in it',
      postSign: '— yours, officially',
      salut: 'My yes,',
      sign: 'Beginning again, with you,',
      who: '— me',
    },
    c10: {
      dist: '0 km — exactly where I want to be',
      greet: 'Still writing from',
      medium: 'Kitchen light, ordinary hour',
      postSign: '— all my love, still',
      salut: 'My every ordinary day,',
      sign: 'Today and the next ten,',
      who: '— me',
    },
  },

  // TODO(lo): translate this group.
  a11y: {
    tablist: 'Choose a design',
    openDesign: 'Open {{name}}',
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
    /** VI–X. */
    selectTrack: 'Show {{title}}',
    prevTrack: 'Previous memory',
    nextTrack: 'Next memory',
    turnPage: 'Turn to the next page',
    prevPage: 'Turn back',
    openStar: 'Open {{title}}',
    chapters: 'Chapters',
    goToChapter: 'Go to chapter {{numeral}}',
    prevPiece: 'Previous piece',
    nextPiece: 'Next piece',
    showPiece: 'Bring {{title}} to the centre',
  },
}
