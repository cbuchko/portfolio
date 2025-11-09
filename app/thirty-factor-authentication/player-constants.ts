export enum PlayerIds {
  Biden,
  Mock,
}

export type Player = {
  name: string
  fullName: string
  birthCity: string
  zodiac: string
  taxReturn: {
    lastName: string
    firstName: string
    dob: string
  }
  imdb: string[]
  quotes: { quote: string; isValid: boolean }[]
  totalValidQuotes: number
}

export const PlayerInformation: Record<PlayerIds, Player> = {
  [PlayerIds.Biden]: {
    name: 'Joe Biden',
    fullName: 'Joseph Robinette Biden Jr.',
    birthCity: 'scranton',
    zodiac: 'scorpio-taurus-sagittarius',
    taxReturn: {
      lastName: 'Biden',
      firstName: 'Joseph R',
      dob: '1942/11/20',
    },
    imdb: ['parks', 'sesamestreet', 'jimmykimmel', 'lawandorder'],
    totalValidQuotes: 5,
    quotes: [
      {
        quote:
          "There's only 3 things Rudy Giuliani mentions in a sentence - a noun, a verb, and 9/11.",
        isValid: true,
      },
      {
        quote:
          'There will come a day, I promise you, when the thought of your son, or daughter, or your wife or your husband, brings a smile to your lips before it brings a tear to your eye.',
        isValid: true,
      },
      { quote: 'Setbacks are unavoidable, but giving up is unforgivable', isValid: true },
      { quote: 'Will you shut up, man?', isValid: true },
      {
        quote:
          'Speak softly, and carry a big stick, I promise you, the President has a big stick. I promise you.',
        isValid: true,
      },
      { quote: 'The only thing we have to fear is fear itself.', isValid: false },
      {
        quote:
          "If you're walking down the right path and you're willing to keep walking, eventually you'll make progress.",
        isValid: false,
      },
      { quote: 'Nothing in this world can take the place of persistence.', isValid: false },
      {
        quote:
          "I have left orders to be awakened at any time in case of national emergency, even if I'm in a cabinet meeting.",
        isValid: false,
      },
      {
        quote:
          'Being President is like running a cemetery; you’ve got a lot of people under you and nobody’s listening.',
        isValid: false,
      },
    ],
  },
  [PlayerIds.Mock]: {
    name: 'Connor Buchko',
    fullName: 'Connor Andrew Buchko',
    birthCity: 'winnipeg',
    zodiac: 'leo-leo-pisces',
    taxReturn: {
      lastName: 'Buchko',
      firstName: 'Connor A',
      dob: '1999/07/31',
    },
    imdb: [],
    quotes: [],
    totalValidQuotes: 0,
  },
}
