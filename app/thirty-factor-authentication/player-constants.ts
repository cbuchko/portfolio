export enum PlayerIds {
  Biden,
  TheRock,
  Devito,
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
  [PlayerIds.Devito]: {
    name: 'Danny DeVito',
    fullName: 'Daniel Michael DeVito Jr. ',
    fullNameAliases: [
      'Daniel Michael DeVito Jr.',
      'Daniel Michael DeVito Jr',
      'Daniel Michael DeVito Junior',
      'Daniel Michael DeVito, Jr.',
      'Daniel Michael DeVito, Jr',
      'Daniel Michael DeVito, Junior',
    ],
    birthCity: 'neptune',
    zodiac: 'scorpio-sagittarius-sagittarius',
    taxReturn: {
      lastName: 'DeVito',
      firstName: 'Danny M',
      dob: '1944/11/17',
    },
    imdb: [
      {
        type: 'Movie',
        date: '1992',
        creator: 'Tim Burton',
        genre: 'Action/Sci-fi',
        starring: 'Michael Keaton, Michelle Pfeiffer',
        synopsis:
          'The monstrous Penguin, who lives in the sewers beneath Gotham, tries to topple the Batman.',
        answer: 'Batman Returns',
      },
      {
        type: 'Movie',
        date: '1996',
        creator: 'Danny DeVito',
        genre: 'Family/Comedy',
        starring: 'Mara Wilson, Rhea Perlman',
        synopsis: 'A gifted girl is forced to put up with a crude father and mother',
        answer: 'Matilda',
      },
      {
        type: 'Movie',
        date: '1997',
        creator: 'Ron Clements, John Musker',
        genre: 'Family/Musical',
        starring: 'James Woods, Tate Donovan',
        synopsis:
          'The son of a god was snatched as a baby and forced to live among mortals as a half-man, half-god.',
        answer: 'Hercules',
      },
    ],
    quotes: [
      {
        quote:
          "I don't know how how many years on this Earth I got left. I'm gonna get real weird with it.",
        isValid: true,
        origin: 'Danny Devito as Frank Reynolds',
      },
      {
        quote:
          "I've been to the Leaning Tower of Pisa. It's a tower, and it's leaning. You look at it, but nothing happens, so then you look for someplace to get a sandwich.",
        isValid: true,
        origin: 'Danny DeVito',
      },
      {
        quote: 'Can I offer you a nice egg in this trying time?',
        isValid: true,
        origin: 'Danny Devito as Frank Reynolds',
      },
      {
        quote:
          "We're just air conditioners, walking around this planet, screwing eachothers brains out.",
        isValid: true,
        origin: 'Danny DeVito as Frank Reynolds',
      },
      {
        quote: 'You gotta pay the troll toll if you wanna get into this boy’s hole.',
        isValid: true,
        origin: 'Danny DeVito as Frank Reynolds',
      },
      {
        quote: "When I'm dead, just throw me in the trash.",
        isValid: true,
        origin: 'Danny DeVito as Frank Reynolds',
      },
      {
        quote: 'I am self‑centred. I just adore myself.',
        isValid: true,
        origin: 'Danny DeVito',
      },
      {
        quote:
          "It's fun to be on the edge. I think you do your best work when you take chances, when you're not safe, when you're not in the middle of the road, at least for me, anyway.",
        isValid: true,
        origin: 'Danny DeVito',
      },
      {
        quote: 'Oh, look at me! The millionaire who goes to see doctors!',
        isValid: false,
        origin: 'Charlie Kelly',
      },
      {
        quote: 'First of all, through God, all things are possible. So jot that down.',
        isValid: false,
        origin: 'Mac',
      },
      {
        quote: 'I’m playing both sides so I always come out on top.',
        isValid: false,
        origin: 'Mac',
      },
      {
        quote:
          'If you don’t like me, that’s fine. I don’t need you to like me. But don’t tell me I’m wrong for being who I am. I’m not hurting anybody. I’m just being me.',
        isValid: false,
        origin: 'Larry David',
      },
      {
        quote:
          'It’s not a lie if you believe it. Because if you believe it, then it’s true to you, and if it’s true to you, then how can anyone say it’s a lie?',
        isValid: false,
        origin: 'George Costanza',
      },
      {
        quote: "Well, I don't want to blame it all on 9/11, but it certainly didn't help.",
        isValid: false,
        origin: 'Tobias Funke',
      },
      {
        quote:
          'I’m afraid that I prematurely shot my wad on what was supposed to be a dry run, if you will. Now I’m afraid that I have a mess on my hands.',
        isValid: false,
        origin: 'Tobias Funke',
      },
      {
        quote: 'Cat in the wall, eh! Ok, now you’re talking my language. I know this game.',
        isValid: false,
        origin: 'Charlie Kelly',
      },
    ],
    license: {
      location: 'New Jeresey',
      headshot: 'danny.webp',
      signature: 'danny.svg',
      name: 'Daniel Michael DeVito Jr.',
      dob: '1944-Nov-17',
      height: '1.52 m',
      eyes: 'BRO',
      hair: 'BRO',
      children: '3',
      coat: 'new_jersey.png',
    },
    fakeLicense: {
      location: 'New York',
      headshot: 'oldguy.jpg',
      signature: 'bush.svg',
      name: 'Daniel Mitchell DeVito Jr.',
      dob: '1944-Nov-04',
      height: '1.60 m',
      eyes: 'BLU',
      hair: 'GRA',
      children: '1',
      coat: 'new_york.svg',
    },
  },
}
