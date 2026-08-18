/**
 * `journey` namespace — English. This is the source of truth: `lo.ts` mirrors
 * its key tree exactly, enforced at compile time by `TranslationShape<typeof en>`.
 *
 * All page copy lives here. Components render `t(...)` and hold no literal text,
 * so adding a language never means touching a component.
 *
 * Copy transcribed verbatim from the original hand-built page, where every
 * string was inline in the markup. Three values are the author's own
 * placeholders and are marked TODO below — they shipped that way and are
 * carried over rather than invented.
 *
 * Dates are translated, not formatted. `Intl.DateTimeFormat` cannot help here:
 * "Today" is not a date, nine cards are month-precision while one is
 * day-precision, and Lao month naming is an editorial choice rather than
 * something a formatter should guess.
 */
export const en = {
  meta: {
    title: 'Our Journey — a small archive, kept by hand',
    description:
      'Ten postcards, one album, and one letter that was never sent. A hand-made record of us.',
  },

  header: {
    kicker: 'a small archive, kept by hand',
    title: 'Our Journey',
    intro:
      "Ten stops, so far. Scroll slowly — and tap any postcard to read what's written on the back.",
    polaroidCaption: 'us, then',
    polaroidAlt: 'Us',
  },

  timeline: {
    /** Identical on all ten cards, so one key rather than ten. */
    flipHint: 'tap to read the back',
    /**
     * Interpolated so the phrase is translated once and a locale that wants the
     * number first is a translation change, not a code change. The no-break
     * space keeps "no." from orphaning off its number.
     */
    cardNumber: 'postcard no.\u00A0{{n}}',
  },

  cards: {
    c01: {
      date: 'March 2022',
      place: 'Coffee shop, downtown',
      title: 'Where it started',
      caption: 'You walked in late, apologising with that smile.',
      back: "I still remember the song playing when you walked in. I didn't know then that one coffee would turn into hundreds more with you.",
      shortDate: "Mar '22",
    },
    c02: {
      date: 'July 2022',
      place: 'Vang Vieng',
      title: 'First trip together',
      caption: 'Getting lost on the way there turned out to be the best part.',
      back: "Two wrong buses, one shared umbrella, and you laughing at me the whole way. I'd take every wrong turn again.",
      shortDate: "Jul '22",
    },
    c03: {
      date: 'October 2022',
      place: 'Your doorstep',
      title: 'The flowers',
      caption: 'You held them like they were the whole day.',
      // TODO: the author's placeholder — replace with the real note.
      back: 'Write the real one here — what the flowers were for, and what you said when you handed them over.',
      shortDate: "Oct '22",
    },
    c04: {
      date: 'February 2023',
      place: 'Tad waterfall',
      title: 'The waterfall detour',
      caption: 'Loud water, cold spray, and you kissing me anyway.',
      back: 'We drove further than we meant to and stayed longer than we planned. Best kind of mistake.',
      shortDate: "Feb '23",
    },
    c05: {
      date: 'April 2024',
      place: 'Songkran, in the street',
      title: 'Soaked, laughing',
      caption: 'Powder on my face, water everywhere, you unbothered.',
      back: "You wiped my face like it was your job. Half the street was watching. I didn't mind at all.",
      shortDate: "Apr '24",
    },
    c06: {
      date: 'November 2022',
      place: 'Our usual table',
      title: 'Our usual table',
      caption: 'Same restaurant, same order, never boring.',
      back: 'We have a table we keep going back to. One day someone will ask how long we have been coming, and the answer will be embarrassing.',
      shortDate: "Nov '22",
    },
    c07: {
      date: 'March 2024',
      place: 'Wherever you were',
      title: 'The month that was hard',
      caption: 'We got through it the way we get through things — together.',
      back: "I keep this one in because it's part of the story too. You stayed. So did I. That told me everything.",
      shortDate: "Mar '24",
    },
    c08: {
      date: 'January 2024',
      place: 'Vang Vieng',
      title: 'The mountains, again',
      caption: 'Cold morning, red hoodie, the same view we keep coming back for.',
      back: 'We stood on that balcony and said almost nothing for ten minutes. It was the best part of the trip.',
      shortDate: "Jan '24",
    },
    c09: {
      date: '15 November 2023',
      place: 'Home, with everyone',
      title: 'The day we said yes',
      caption: 'Gold, flowers, and money falling everywhere.',
      back: 'Everyone we love in one room, and the only person I was looking at was you.',
      shortDate: "Nov '23",
    },
    c10: {
      date: 'Today',
      place: 'Right here',
      title: 'Today',
      caption: 'Which is why I made you this.',
      back: "There's one more card after this one. Keep going.",
      shortDate: 'today',
    },
  },

  album: {
    kicker: 'and one album, image by image',
    title: 'The Album',
    index: {
      label: 'contact sheet',
      hint: 'tap a frame to hold it up to the light',
      prev: 'back',
      next: 'next',
      close: 'put it back',
    },
    endpaper: {
      label: 'endpaper',
      note: 'A photo on the right, and what I remember about it on the left. Turn the pages slowly.',
    },
    cover: {
      edition: 'private edition — one copy',
      title: 'Us, in six photographs',
      hint: 'tap the page to open',
    },
    plates: {
      p1: {
        label: 'plate one — keep childlike',
        title: 'Keep childlike',
        caption: 'You drew hearts all over this one. I never took the stickers off.',
        footer: 'plate one',
      },
      p2: {
        label: 'plate two — the lantern night',
        title: 'Under the lanterns',
        caption: 'A whole street of paper lanterns, and you still asked me to take one more photo.',
        footer: 'plate two',
      },
      p3: {
        label: 'plate three — the krathong',
        title: 'What we wished for',
        caption: 'You would not tell me what you wished for. I think I already know.',
        footer: 'plate three',
      },
      p4: {
        label: 'plate four — the festival',
        title: 'Lights, and you',
        caption: 'Half the town was out that night. I only remember the walk home with you.',
        footer: 'plate four',
      },
      p5: {
        label: 'plate five — the squish',
        title: 'Cheek to cheek',
        caption: 'No occasion. Just a bad photo we both love, taken in a car park.',
        footer: 'plate five',
      },
      p6: {
        label: 'plate six — 15 nov 2023',
        title: 'The day it was official',
        caption:
          'Titi and Noknoy, printed with flowers in the corners. The photo I show people first.',
        footer: 'plate six',
      },
    },
    controls: {
      prev: 'back',
      openAlbum: 'open the album',
      turnPage: 'turn the page',
      lastPlate: 'last plate',
      countCover: 'cover',
      countPlate: 'plate {{current}} of {{total}}',
    },
  },

  /**
   * The letter.
   *
   * `greeting` and the three `body` paragraphs are typed out as one string
   * joined by blank lines, and `question` lands on its own after a beat. The
   * body is three keys rather than one value with the newlines baked into it
   * because a translator should never have to preserve invisible whitespace —
   * joining them is the renderer's job.
   */
  ask: {
    kicker: 'one unsent letter',
    cardNo: 'postcard no.\u00A0{{n}} — blank on purpose',
    // TODO: drafted, not authored. Everything from `greeting` to `signature` is
    // a stand-in, written so there was something to read while the animation was
    // built — warm on purpose, unspecific on purpose. Replace all of it.
    greeting: 'Dear you,',
    body: {
      p1: 'Ten postcards, an album, and a reel that runs silent — and not one of them says the thing I actually meant.',
      p2: 'It was never really about the places. It was about who was standing next to me in every frame.',
      p3: 'So here is the part I kept leaving off the back of the cards.',
    },
    question: 'So — will you come with me for the next ten?',
    signature: '— always, me',
    yes: 'yes',
    obviouslyYes: 'obviously yes',
    hint: 'tap the envelope',
    hintAgain: 'read it again',
    skip: 'show it all',
    close: 'put it back',
    readAloud: 'read it to me',
    stopReading: 'stop reading',
    /**
     * The keys, while the letter types itself. Deliberately the same two words
     * the reel uses for the same gesture — one page should not have two
     * vocabularies for turning a sound off.
     */
    soundOn: 'sound',
    soundOff: 'silent',
  },

  /**
   * Super 8 was shot silent — you ran the projector and put a record on beside
   * it. That is why the reel defaults to muted and the sound is its own object
   * rather than a control on the video.
   */
  reel: {
    kicker: 'and one reel, at eighteen frames a second',
    title: 'The Reel',
    note: 'It runs silent unless you ask it not to.',
    slate: 'reel 01',
    run: 'run',
    stop: 'stop',
    soundOn: 'sound',
    soundOff: 'silent',
  },

  sound: {
    label: 'optical track',
    /** A song title, so it is not translated — only the labels around it are. */
    title: 'Summertime Sadness',
    play: 'bring the sound up',
    pause: 'take it down',
  },

  footer: {
    line: '— made by hand, for you',
  },

  language: {
    label: 'Language',
    switchTo: 'Switch to {{language}}',
  },

  /**
   * Names for controls whose visible text is either decorative or too long to
   * serve as an accessible name. The source had no keyboard path at all for the
   * card flip, the album's half-page click, or the envelope.
   */
  a11y: {
    flipToBack: 'Read the back of postcard {{n}}',
    flipToFront: 'Turn postcard {{n}} back over',
    albumLabel: 'The album',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    openLetter: 'Open the letter',
    letterLabel: 'The letter',
    closeLetter: 'Close the letter',
    skipTyping: 'Show the whole letter now',
    readLetterAloud: 'Read the letter aloud',
    stopReadingLetter: 'Stop reading the letter',
    muteTyping: 'Silence the typing',
    unmuteTyping: 'Turn the typing sound on',
    reelLabel: 'The reel',
    runReel: 'Run the reel',
    stopReel: 'Stop the reel',
    unmuteReel: "Turn on the reel's sound",
    muteReel: 'Run the reel silent',
    reelPosition: 'Reel position, {{current}} of {{total}}',
    soundLabel: 'The optical sound track',
    playSound: 'Play the sound',
    pauseSound: 'Pause the sound',
    soundPosition: 'Sound position, {{current}} of {{total}}',
    openPlate: 'Hold up {{title}}',
    closePlate: 'Put the plate back',
    plateLightboxLabel: 'The plate, held up',
    prevPlate: 'Previous plate',
    nextPlate: 'Next plate',
    platePosition: 'Plate {{current}} of {{total}}',
  },
} as const

export type JourneyBundle = typeof en
