export enum PlayerIds {
  Biden,
  TheRock,
  // Devito,
  // Snoop,
  // Labeouf,
  // Coolidge,
  // Hilton,
  // Swift,
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
    eyes: string
    hair: string
    children: string
    coat: string
  }
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
      eyes: 'BRO',
      hair: 'BLO',
      children: '2',
      coat: 'maryland.svg',
    },
  },
  [PlayerIds.TheRock]: {
    name: 'The Rock',
    fullName: 'Dwayne Douglas Johnson',
    fullNameAliases: ['Dwayne Douglas Johnson'],
    birthCity: 'hayward',
    zodiac: 'taurus-capricorn-libra',
    taxReturn: {
      lastName: 'Johnson',
      firstName: 'Dwayne D',
      dob: '1972/05/02',
    },
    imdb: [
      {
        type: 'Movie',
        date: '2010',
        creator: 'Adam McKay',
        genre: 'Comedy/Action',
        starring: 'Will Ferrell, Mark Wahlberg',
        synopsis: 'Desk-bound NYPD detectives Gamble and Hoitz work their day to day.',
        answer: 'The Other Guys',
      },
      {
        type: 'Movie',
        date: '2017',
        creator: 'Seth Gordon',
        genre: 'Comedy/Action',
        starring: 'Zach Efron, Kelly Rohrbach',
        synopsis:
          'When a dangerous crime wave hits the beach, Mitch Buchannon leads his squad of lifeguards.',
        answer: 'Baywatch',
      },
      {
        type: 'Movie',
        date: '2001',
        creator: 'Stephen Sommers',
        genre: 'Adventure/Action',
        starring: 'Brendan Fraser, Rachel Weisz',
        synopsis:
          'The evil mummy Imhotep returns to wreak havoc as he resumes his search for immortality.',
        answer: 'The Mummy Returns',
      },
    ],
    quotes: [
      {
        quote: 'Be humble, be hungry, and always be the hardest worker in the room.',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote:
          'WHAT ARE YOU LAUGHING AT? I WILL SLAP THE LIPS OFF YOUR FACE AND MAKE YOU KISS YOUR OWN ASS.',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote:
          'Losers whine about how they tried their "Best". Winners go home and fuck the prom queen.',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: "I'm the biggest thing to hit Canada because the Maple Leafs suck!",
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: 'The Undertaker with his Mickey Mouse tattoos and his 33 pound head.',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: 'You run around here looking like a big fat bowl of fruity pebbles!',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: 'Hold the mic up, jabroni, before I slap the taste out of your mouth!',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: 'Stone Cold has lack of testicle-itis!',
        isValid: true,
        origin: 'The Rock',
      },
      {
        quote: "Hard work pays off, dreams come true. Bad times don't last but bad guys do",
        isValid: false,
        origin: 'Scott Hall',
      },
      {
        quote: 'Your arms are just too short to box with God.',
        isValid: false,
        origin: 'CM Punk',
      },
      {
        quote:
          'Be more than motivated, be more than driven, become literally obsessed to the point where people think you’re fucking nuts.',
        isValid: false,
        origin: 'David Goggins',
      },
      {
        quote:
          'It ain’t about how hard ya hit. It’s about how hard you can get hit and keep moving forward.',
        isValid: false,
        origin: 'Rocky Balboa',
      },
      {
        quote: 'It’s hard to be humble when you’re as great as I am.',
        isValid: false,
        origin: 'Muhammad Ali',
      },
      {
        quote:
          'I love it when people say ‘I don’t like muscles.’ That’s like saying ‘I don’t like money.’',
        isValid: false,
        origin: 'Arnold Schwarzenegger',
      },
      {
        quote: "You're a boy in a man's world, and I'm a man who loves to play with boys.",
        isValid: false,
        origin: 'Kurt Angle',
      },
      {
        quote:
          'So you go ahead! You keep on kissing babies and hugging fat girls! I’m gonna be at a gym somewhere training and thinking about beating the hell out of you at WrestleMania!',
        isValid: false,
        origin: 'Dave Batista',
      },
    ],
    license: {
      location: 'California',
      headshot: 'therock.jpg',
      signature: 'rocksig.png',
      name: 'Dwayne Douglas Johnson',
      dob: '1972-May-02',
      height: '1.96 m',
      eyes: 'BRO',
      hair: 'BALD',
      children: '1',
      coat: 'california.png',
    },
    fakeLicense: {
      location: 'Nevada',
      headshot: 'kevin.jpg',
      signature: 'bush.svg',
      name: 'Dwayne Doug Johnson',
      dob: '1972-May-04',
      height: '1.85 m',
      eyes: 'BLU',
      hair: 'BLO',
      children: '3',
      coat: 'nevada.svg',
    },
  },
}
