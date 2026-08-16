export enum PlayerIds {
  Biden,
  TheRock,
  Devito,
  Conan,
  Snoop,
  Coolidge,
}

export type EasyTriviaQuestion = {
  prompt: string
  options: string[]
  answer: string
}

export type Player = {
  name: string
  fullName: string
  fullNameAliases: string[]
  birthCity: string
  zodiac: string
  email: string
  easyTrivia: EasyTriviaQuestion[]
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
    email: 'potus46@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'Who was your vice president?',
        options: ['Kamala Harris', 'Barack Obama', 'George Santos', 'Hillary Clinton'],
        answer: 'Kamala Harris',
      },
      {
        prompt: 'Which party are you a member of?',
        options: ['Libertarian', 'Democratic', 'Republican', 'Socialist'],
        answer: 'Democratic',
      },
      {
        prompt: 'Who was president while you were vice president?',    
        options: ['Barack Obama', 'George W. Bush', 'Bill Clinton', 'Donald Trump'],
        answer: 'Barack Obama',
      },
    ],
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
    email: 'discipline@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'What facial expression are you famous for?',
        options: ['The raised eyebrow', 'The sad trombone face', 'The wink', 'The eye roll'],
        answer: 'The raised eyebrow',
      },
      {
        prompt: 'Before Hollywood, what were you best known as?',
        options: ['A pro wrestler', 'A Nascar driver', 'A magician', 'A weather man'],
        answer: 'A pro wrestler',
      },
      {
        prompt: 'Finish your catchphrase: “Can you __ what The Rock is cooking?”',
        options: ['smell', 'see', 'taste', 'feel'],
        answer: 'smell',
      },
    ],
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
    email: 'email@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'Which TV show are you currently most associated with?',
        options: [
          "It's Always Sunny in Philadelphia",
          'The Office',
          'Breaking Bad',
          'Friends',
        ],
        answer: "It's Always Sunny in Philadelphia",
      },
      {
        prompt: 'Who is your famous real-life partner?',
        options: ['Rhea Perlman', 'Bonnie Bartlett', 'Carol Kane', 'Kaitlin Olson'],
        answer: 'Rhea Perlman',
      },
      {
        prompt: 'Which Batman villain did you play?',
        options: ['The Penguin', 'Two-Face', 'The Riddler', 'Mr. Freeze'],
        answer: 'The Penguin',
      },
    ],
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
  [PlayerIds.Conan]: {
    name: "Conan O'Brien",
    fullName: "Conan Christopher O'Brien",
    fullNameAliases: ["Conan Christopher O'Brien"],
    birthCity: 'brookline',
    zodiac: 'aries-aquarius-virgo',
    email: 'teamcoco@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'What are you best known as?',
        options: ['Talk show host', 'Olympic skier', 'Federal judge', 'Chef'],
        answer: 'Talk show host',
      },
      {
        prompt: 'What is the name of your podcast?',
        options: ['Conan O\'Brien Needs a Friend', 'Conan O\'Brien Must Go', 'Conan and Friends', 'Conan Without Borders'],
        answer: 'Conan O\'Brien Needs a Friend',
      },
      {
        prompt: 'Which late night host famously replaced you?',    
        options: ['Jay Leno', 'David Letterman', 'Jimmy Fallon', 'Stephen Colbert'],
        answer: 'Jay Leno',
      },  
    ],
    taxReturn: {
      lastName: "O'Brien",
      firstName: 'Conan C',
      dob: '1963/04/18',
    },
    imdb: [
      {
        type: 'TV Show',
        date: '1993',
        creator: 'Conan O\'Brien, Robert Smigel',
        genre: 'Late Night Comedy',
        starring: 'Conan O\'Brien, Andy Richter, Max Weinberg',
        synopsis:
          'A gangly Harvard-educated comedian hosts a late-night talk show filled with absurd sketches and remote segments.',
        answer: 'Late Night with Conan O\'Brien',
      },
      {
        type: 'TV Show',
        date: '2010',
        creator: 'Conan O\'Brien, Mike Sweeney',
        genre: 'Late Night Comedy',
        starring: 'Conan O\'Brien, Andy Richter, The Band',
        synopsis:
          'After leaving network television, the host moves to cable and continues his brand of surreal celebrity interviews.',
        answer: 'Conan',
      },
      {
        type: 'TV Show',
        date: '2011',
        creator: 'Greg Daniels',
        genre: 'Sitcom',
        starring: 'Steve Carell, Ed Helms, Rainn Wilson',
        synopsis:
          'Andy Bernard\'s older brother arrives at Dunder Mifflin and immediately dominates every conversation with loud piano playing.',
        answer: 'The Office',
      },
    ],
    quotes: [
      {
        quote:
          'I like to stand near ATM machines, and when people type in their pin number, I just stand there and go, "Got it. Got it. Got it."',
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "I'd like a streaker. And you know what I'd really like? A streaker to slap me. That would just satisfy so many of my dormant Catholic hangups.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "In a prime-time slot, the show would be more erotic and bloodier. That's what America wants.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          'I reached into his pocket, we had a little tug of war, and I pulled out a condom. He said, "Safe sex everybody."',
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "I used to daydream about being a writer on my own show, because the writers got to hang out in the hallway while I put out fires.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "Am I an athlete? No. Do the girls go crazy for me? No. Am I a math whiz? No, you are not.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "I now realize I will never understand the times I live in. Every time I think I have a handle on it, the handle falls off.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "Then I said, I'll probably end up dead in the East River. Why are we rekindling this? We'll be shot by snipers.",
        isValid: true,
        origin: "Conan O'Brien",
      },
      {
        quote:
          "I don't like country music, but I don't mean to denigrate those who do. And for the people who like country music, denigrate means 'put down.'",
        isValid: false,
        origin: 'Bob Newhart',
      },
      {
        quote:
          "I was on the subway the other day, and there was this guy sitting across from me, and he was reading a book. And I thought, 'Wow. I wonder what that feels like.'",
        isValid: false,
        origin: 'John Mulaney',
      },
      {
        quote:
          "I'm not a vegetarian because I love animals. I'm a vegetarian because I hate plants.",
        isValid: false,
        origin: 'A. Whitney Brown',
      },
      {
        quote:
          "I used to think that the brain was the most wonderful organ in my body. Then I realized who was telling me this.",
        isValid: false,
        origin: 'Emo Philips',
      },
      {
        quote:
          "I went to a restaurant that serves breakfast at any time. So I ordered French toast during the Renaissance.",
        isValid: false,
        origin: 'Steven Wright',
      },
      {
        quote:
          "My therapist told me the way to achieve true inner peace is to finish what I start. So far today, I have finished two bags of M&Ms and a chocolate cake. I feel better already.",
        isValid: false,
        origin: 'Dave Barry',
      },
      {
        quote:
          "I haven't spoken to my wife in years. I didn't want to interrupt her.",
        isValid: false,
        origin: 'Rodney Dangerfield',
      },
      {
        quote:
          "I told my doctor I broke my leg in two places. He told me to quit going to those places.",
        isValid: false,
        origin: 'Henny Youngman',
      },
    ],
    license: {
      location: 'Massachusetts',
      headshot: 'conan.jpg',
      signature: 'conan.webp',
      name: "Conan Christopher O'Brien",
      dob: '1963-Apr-18',
      height: '1.93 m',
      eyes: 'BLU',
      hair: 'RED',
      children: '2',
      coat: 'mass.webp',
    },
    fakeLicense: {
      location: 'Connecticut',
      headshot: 'leno.jpg',
      signature: 'bush.svg',
      name: "Conan Christopher O'Brian",
      dob: '1963-Apr-08',
      height: '1.80 m',
      eyes: 'BRO',
      hair: 'BRO',
      children: '0',
      coat: 'new_york.svg',
    },
  },
  [PlayerIds.Snoop]: {
    name: 'Snoop Dogg',
    fullName: 'Calvin Cordozar Broadus Jr.',
    fullNameAliases: [
      'Calvin Cordozar Broadus Jr.',
      'Calvin Cordozar Broadus Jr',
      'Calvin Cordozar Broadus Junior',
      'Calvin Cordozar Broadus, Jr.',
      'Calvin Cordozar Broadus, Jr',
      'Calvin Cordozar Broadus, Junior',
    ],
    birthCity: 'longbeach',
    zodiac: 'libra-scorpio-unknown',
    email: 'snoop@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'Which song are you most famously tied to?',
        options: ["Gin and Juice", "Sweet Child O' Mine", 'Mr. Brightside', 'Despacito'],
        answer: 'Gin and Juice',
      },
      {
        prompt: 'In which genre did you originally rise to fame?',
        options: ['Hip-hop', 'Opera', 'Country', 'K-pop'],
        answer: 'Hip-hop',
      },
      {
        prompt: 'Which best describes your classic persona?',
        options: [
          'Laid-back and chill',
          'Silent assassin',
          'Medieval knight',
          'Weatherman',
        ],
        answer: 'Laid-back and chill',
      },
    ],
    taxReturn: {
      lastName: 'Broadus',
      firstName: 'Calvin C',
      dob: '1971/10/20',
    },
    imdb: [
      {
        type: 'Movie',
        date: '2001',
        creator: 'Antoine Fuqua',
        genre: 'Crime/Thriller',
        starring: 'Denzel Washington, Ethan Hawke',
        synopsis:
          'A veteran LAPD narcotics officer takes a rookie under his wing during a brutal 24-hour training evaluation.',
        answer: 'Training Day',
      },
      {
        type: 'Movie',
        date: '2004',
        creator: 'Todd Phillips',
        genre: 'Comedy/Action',
        starring: 'Ben Stiller, Owen Wilson',
        synopsis:
          'Two mismatched detectives go undercover as street racers to bust a drug kingpin in 1970s Bay City.',
        answer: 'Starsky & Hutch',
      },
      {
        type: 'Movie',
        date: '1998',
        creator: 'Tamra Davis',
        genre: 'Comedy',
        starring: 'Dave Chappelle, Guillermo Díaz',
        synopsis:
          'Three friends try to bail their buddy out of jail by selling marijuana, but their plan goes up in smoke.',
        answer: 'Half Baked',
      },
    ],
    quotes: [
      {
        quote: 'I was raised on fried chicken. My pacifier was a drumstick.',
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "Snakes are straight assholes, you could tell, the way they lookin' at him.",
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "Are we in a fucking movie right now, or what? Shit, what the fuck? I'm lost, I don't know.",
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "I know it's supposed to be ladies first, but when it comes to chicken, there's no rules.",
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "Can somebody explain to me how you can get a billion streams and not get a million dollars? That shit don't make sense to me.",
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "How the fuck do you think I feel? I don't feel like shit right now. Stop asking me these dumbass questions!",
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          'It was African Americans who took that bland ass chicken and made that thang do what it do.',
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote: 'Pie in the horse.',
        isValid: true,
        origin: 'Snoop Dogg',
      },
      {
        quote:
          "I don't trust water. Because fish fuck in it.",
        isValid: false,
        origin: 'W.C. Fields',
      },
      {
        quote:
          "I smoke because I'm hoping for an early death, and it's not coming quick enough.",
        isValid: false,
        origin: 'Bette Davis',
      },
      {
        quote:
          "You can't trust nobody. Not even yourself. Especially not yourself.",
        isValid: false,
        origin: 'Ice Cube',
      },
      {
        quote:
          "I don't know karate, but I know ka-razy.",
        isValid: false,
        origin: 'James Brown',
      },
      {
        quote:
          "Never let your left hand know what your right hand is smoking.",
        isValid: false,
        origin: 'Redman',
      },
      {
        quote:
          "I'm not saying I'm gonna change the world, but I guarantee that I will spark the brain that will change the world.",
        isValid: false,
        origin: 'Tupac Shakur',
      },
      {
        quote:
          "I don't even know how to use a computer, but I know how to use people.",
        isValid: false,
        origin: 'Dr. Dre',
      },
      {
        quote:
          "I'd rather have a bottle in front of me than a frontal lobotomy.",
        isValid: false,
        origin: 'Tom Waits',
      },
    ],
    license: {
      location: 'California',
      headshot: 'snoop.webp',
      signature: 'snoop.png',
      name: 'Calvin Cordozar Broadus Jr.',
      dob: '1971-Oct-20',
      height: '1.93 m',
      eyes: 'BRO',
      hair: 'BRO',
      children: '4',
      coat: 'california.png',
    },
    fakeLicense: {
      location: 'Nevada',
      headshot: 'wiz.jpg',
      signature: 'bush.svg',
      name: 'Calvin Cordozar Broadus Jr',
      dob: '1971-Oct-02',
      height: '1.85 m',
      eyes: 'BLU',
      hair: 'BLO',
      children: '2',
      coat: 'nevada.svg',
    },
  },
  [PlayerIds.Coolidge]: {
    name: 'Jennifer Coolidge',
    fullName: 'Jennifer Audrey Coolidge',
    fullNameAliases: ['Jennifer Audrey Coolidge'],
    birthCity: 'boston',
    zodiac: 'virgo-aries-scorpio',
    email: 'muffin.hemingway@thirtyfactor.gov',
    easyTrivia: [
      {
        prompt: 'Your breakout comedy role is often remembered as…',
        options: ["A mom", 'A Bond girl', 'A news anchor', 'A superhero sidekick'],
        answer: "A mom",
      },
      {
        prompt: 'Which recent hit series won you an Emmy?',
        options: ['The White Lotus', 'The Marvelous Mrs. Maisel', 'The Mandalorian', 'Succession'],
        answer: 'The White Lotus',
      },
    ],
    taxReturn: {
      lastName: 'Coolidge',
      firstName: 'Jennifer A',
      dob: '1961/08/28',
    },
    imdb: [
      {
        type: 'Movie',
        date: '2001',
        creator: 'Robert Luketic',
        genre: 'Comedy/Romance',
        starring: 'Reese Witherspoon, Luke Wilson',
        synopsis:
          'A fashion merchandising major follows her ex to Harvard Law and discovers she has a knack for legal arguments and pink outfits.',
        answer: 'Legally Blonde',
      },
      {
        type: 'Movie',
        date: '1999',
        creator: 'Paul Weitz, Chris Weitz',
        genre: 'Comedy',
        starring: 'Jason Biggs, Alyson Hannigan',
        synopsis:
          'Four high school friends make a pact to lose their virginity before graduation, leading to awkward encounters with each other\'s parents.',
        answer: 'American Pie',
      },
      {
        type: 'TV Show',
        date: '2021',
        creator: 'Mike White',
        genre: 'Comedy/Drama',
        starring: 'Murray Bartlett, Sydney Sweeney',
        synopsis:
          'Wealthy guests and employees at a luxury Hawaiian resort navigate privilege, secrets, and murder over the course of a week.',
        answer: 'The White Lotus',
      },
    ],
    quotes: [
      {
        quote:
          'I\'d turn up to New York clubs and tell them I was Muffin Hemingway, the granddaughter who wasn\'t Mariel or Margaux.',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          'One time I got thrown out of a club because I was behaving badly, and they said, "Don\'t ever come back here, Muffin!"',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          'I thought I was going to be queen of Monaco even though someone else did it.',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote: 'My dream role would be playing a dolphin.',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          'I took a lavender bath before the Emmys and it made me swell up inside my dress.',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          "I'm the only person I know that has become less intelligent as they've gotten older.",
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          'I used to call in sick by saying someone put a cigarette out in my eye. I went to the hospital and got them to bandage my head.',
        isValid: true,
        origin: 'Jennifer Coolidge',
      },
      {
        quote:
          'You look like the Fourth of July! Makes me want a hot dog real bad.',
        isValid: true,
        origin: "Jennifer Coolidge as Paulette Bonafonté",
      },
      {
        quote:
          "I have a lot of growing up to do. I realized that the other day when I was sitting in my office having a water balloon fight with myself.",
        isValid: false,
        origin: 'Deep Thoughts by Jack Handey',
      },
      {
        quote:
          "I don't exercise. If God had wanted me to bend over, he would have put diamonds on the floor.",
        isValid: false,
        origin: 'Joan Rivers',
      },
      {
        quote:
          "My mother always said, 'If you want to get married, marry a man who loves you more than you love him.'",
        isValid: false,
        origin: 'Joan Rivers',
      },
      {
        quote:
          "I always wanted to be somebody, but now I realize I should have been more specific.",
        isValid: false,
        origin: 'Lily Tomlin',
      },
      {
        quote:
          "I don't know how I do it. I just do it. It's like I have a gift for being wrong.",
        isValid: false,
        origin: "Catherine O'Hara as Moira Rose",
      },
      {
        quote:
          "I don't want any more of those weird little cookies. They're making me feel funny.",
        isValid: false,
        origin: 'Eugene Levy as Gerry Fleck',
      },
      {
        quote:
          "I used to be Snow White, but I drifted.",
        isValid: false,
        origin: 'Mae West',
      },
      {
        quote:
          "I finally got a fur coat for Christmas. I've always wanted one. My husband said, 'What do you need a coat for? You've got a fur.'",
        isValid: false,
        origin: 'Phyllis Diller',
      },
    ],
    license: {
      location: 'Massachusetts',
      headshot: 'jennifer.webp',
      signature: 'coolidge.svg',
      name: 'Jennifer Audrey Coolidge',
      dob: '1961-Aug-28',
      height: '1.78 m',
      eyes: 'BLU',
      hair: 'BLO',
      children: '0',
      coat: 'mass.webp',
    },
    fakeLicense: {
      location: 'New York',
      headshot: 'goldie.webp',
      signature: 'bush.svg',
      name: 'Jennifer Audrey Coolidge',
      dob: '1961-Aug-08',
      height: '1.70 m',
      eyes: 'BRO',
      hair: 'GRA',
      children: '2',
      coat: 'new_york.svg',
    },
  },
}
