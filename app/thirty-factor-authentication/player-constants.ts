export enum PlayerIds {
  Biden,
}

export type Player = {
  name: string
  fullName: string
  fullNameAliases: string[]
  birthCity: string
  zodiac: string
  taxReturn: {
    lastName: string
    firstName: string
    dob: string
  }
  imdb: IMDB[]
  quotes: { quote: string; isValid: boolean; origin: string }[]
  license: {
    location: string
    headshot: string
    signature: string
    name: string
    dob: string
    height: string
    weight: string
    eyes: string
    hair: string
    children: string
    coat: string
  }
  fakeLicense: {
    location: string
    headshot: string
    signature: string
    name: string
    dob: string
    height: string
    weight: string
    eyes: string
    hair: string
    children: string
    coat: string
  }
  portrait: string
}

export type IMDB = {
  type: string
  date: string
  genre: string
  creator: string
  starring: string
  synopsis: string
  answer: string
}

export const PlayerInformation: Record<PlayerIds, Player> = {
  [PlayerIds.Biden]: {
    name: 'Joe Biden',
    fullName: 'Joseph Robinette Biden Jr.',
    fullNameAliases: [
      'Joseph Robinette Biden Jr.',
      'Joseph Robinette Biden Jr',
      'Joseph Robinette Biden Junior',
      'Joseph Robinette Biden, Jr.',
      'Joseph Robinette Biden, Jr',
      'Joseph Robinette Biden, Junior',
    ],
    birthCity: 'scranton',
    zodiac: 'scorpio-taurus-sagittarius',
    taxReturn: {
      lastName: 'Biden',
      firstName: 'Joseph R',
      dob: '1942/11/20',
    },
    imdb: [
      {
        type: 'TV Show',
        date: '2009',
        creator: 'Michael Schur, Greg Daniels',
        genre: 'Sitcom',
        starring: 'Amy Poehler, Chris Pratt',
        synopsis:
          'Leslie Knope, a midlevel bureaucrat in an Indiana Parks and Recreation Department, hopes to beautify her town.',
        answer: 'Parks and Recreation',
      },
      {
        type: 'TV Show',
        date: '1969',
        creator: 'Joan Ganz Cooney, Lloyd Morrisett',
        genre: 'Educational',
        starring: 'Jim Henson, Frank Oz',
        synopsis:
          'An educational series uses puppets to teach children basic academic and social skills.',
        answer: 'Sesame Street',
      },
      {
        type: 'TV Show',
        date: '1999',
        creator: 'Dick Wolf',
        genre: 'Crime Drama',
        starring: 'Mariska Hargitay, Ice-T',
        synopsis:
          'Detectives in New York City investigate crimes while navigating the emotional toll of their work.',
        answer: 'Law & Order: Special Victims Unit',
      },
    ],
    quotes: [
      {
        quote:
          "There's only 3 things Rudy Giuliani mentions in a sentence - a noun, a verb, and 9/11.",
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote:
          'There will come a day, I promise you, when the thought of your son, or daughter, or your wife or your husband, brings a smile to your lips before it brings a tear to your eye.',
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote: 'Setbacks are unavoidable, but giving up is unforgivable',
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote:
          'We do not scare easily, we never bow, we never bend, we never break, we endure, we overcome, we are america, second to none, and we own the finish line.',
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote: 'We should bomb Serbia to the ground.',
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote:
          'Don’t tell me what you value. Show me your budget, and I’ll tell you what you value!',
        isValid: true,
        origin: 'Joe Biden',
      },
      { quote: 'Will you shut up, man?', isValid: true, origin: 'Joe Biden' },
      {
        quote:
          'Speak softly, and carry a big stick, I promise you, the President has a big stick. I promise you.',
        isValid: true,
        origin: 'Joe Biden',
      },
      {
        quote: 'The only thing we have to fear is fear itself.',
        isValid: false,
        origin: 'Franklin Roosevelt',
      },
      {
        quote:
          "If you're walking down the right path and you're willing to keep walking, eventually you'll make progress.",
        isValid: false,
        origin: 'Barack Obama',
      },
      {
        quote: 'Nothing in this world can take the place of persistence.',
        isValid: false,
        origin: 'Calvin Coolidge',
      },
      {
        quote:
          "I have left orders to be awakened at any time in case of national emergency, even if I'm in a cabinet meeting.",
        isValid: false,
        origin: 'Ronald Reagan',
      },
      {
        quote:
          'Being President is like running a cemetery; you’ve got a lot of people under you and nobody’s listening.',
        isValid: false,
        origin: 'Bill Clinton',
      },
      {
        quote: "People say I'm indecisive. Well, I don't know about that.",
        isValid: false,
        origin: 'George W. Bush',
      },
      {
        quote:
          'I have a lot more material prepared, but I have to get the Secret Service home in time for their new curfew.',
        isValid: false,
        origin: 'Barack Obama',
      },
      {
        quote:
          'My esteem in this country has gone up substantially. It is very nice now when people wave at me, they use all their fingers.',
        isValid: false,
        origin: 'Jimmy Carter',
      },
    ],
    license: {
      location: 'Pennsylvania',
      headshot: 'joe.avif',
      signature: 'biden.png',
      name: 'Joseph Robinette Biden Jr.',
      dob: '1942-Nov-20',
      height: '1.83 m',
      weight: '81 kg',
      eyes: 'BLU',
      hair: 'GRA',
      children: '4',
      coat: 'penn.svg',
    },
    fakeLicense: {
      location: 'Kentucky',
      headshot: 'bush.webp',
      signature: 'bush.svg',
      name: 'Joseph Robin Biden Jr.',
      dob: '1952-Nov-20',
      height: '1.73 m',
      weight: '71 kg',
      eyes: 'BRO',
      hair: 'BLO',
      children: '2',
      coat: 'maryland.svg',
    },
    portrait: 'joe.avif',
  },
}
