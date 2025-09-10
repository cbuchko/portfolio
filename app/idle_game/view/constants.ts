export enum Rarity {
  common = 'common',
  rare = 'rare',
  legendary = 'legendary',
  mythic = 'mythic',
}

export const RarityColors: Record<Rarity, string> = {
  [Rarity.common]: '#fff47a',
  [Rarity.rare]: '#8596ff',
  [Rarity.legendary]: '#fd9595',
  [Rarity.mythic]: '#de85ff',
}

export type Meme = {
  id: number
  url: string
  title: string
  flavorText: string
  rarity: Rarity
}

export const CommonMemes: Meme[] = [
  {
    id: 0,
    url: '/idle_game/memes/zipline.jpg',
    title: 'Dating Show Contestant',
    flavorText: 'Just here for the zipline.',
    rarity: Rarity.mythic,
  },
  {
    id: 1,
    url: '/idle_game/memes/cat.webp',
    title: 'Cat',
    flavorText: 'The internet’s favorite creature.',
    rarity: Rarity.legendary,
  },

  {
    id: 3,
    url: '/idle_game/memes/dog.webp',
    title: 'Sideye Dog',
    flavorText: 'What da dog doin?',
    rarity: Rarity.common,
  },
  {
    id: 4,
    url: '/idle_game/memes/cinema.jpg',
    title: 'Cinema',
    flavorText: 'A hollywood treasure.',
    rarity: Rarity.common,
  },
  {
    id: 5,
    url: '/idle_game/memes/mike.jpg',
    title: 'Mike Ehrmantruat',
    flavorText: 'Waltuh.',
    rarity: Rarity.common,
  },
  {
    id: 6,
    url: '/idle_game/memes/brian.webp',
    title: 'Bad Luck Brian',
    flavorText: "Poor guy can't catch a break.",
    rarity: Rarity.common,
  },
  {
    id: 7,
    url: '/idle_game/memes/doge.jpg',
    title: 'Doge',
    flavorText: 'Much wow. Such meme.',
    rarity: Rarity.common,
  },
  {
    id: 8,
    url: '/idle_game/memes/ericandre.jpg',
    title: 'Eric Andre',
    flavorText: 'Let’s break the set.',
    rarity: Rarity.common,
  },
  {
    id: 9,
    url: '/idle_game/memes/karlhavoc.jpg',
    title: 'Karl Havoc',
    flavorText: 'What does this do for the greater good?',
    rarity: Rarity.common,
  },
  {
    id: 10,
    url: '/idle_game/memes/leogatbsy.webp',
    title: 'Leo Gatsby',
    flavorText: "Any idea's a good idea if you follow it with this meme.",
    rarity: Rarity.common,
  },
  {
    id: 11,
    url: '/idle_game/memes/leopoint.jpg',
    title: 'Leo Pointing',
    flavorText: '<- Leo if he ever played this game probably.',
    rarity: Rarity.common,
  },
  {
    id: 12,
    url: '/idle_game/memes/nyancat.png',
    title: 'Nyan Cat',
    flavorText: 'A younger me would have watched this for 10 hours straight.',
    rarity: Rarity.common,
  },
  {
    id: 13,
    url: '/idle_game/memes/pikachu.png',
    title: 'Surprised Pikachu',
    flavorText: 'Shock and awe.',
    rarity: Rarity.common,
  },
  {
    id: 14,
    url: '/idle_game/memes/rage.png',
    title: 'Rage Face',
    flavorText: 'A relic of the old internet.',
    rarity: Rarity.common,
  },
  {
    id: 15,
    url: '/idle_game/memes/sponge2.jpg',
    title: 'Mocking SpongeBob',
    flavorText: "MaKiNg  A wEbSiTe iS hArD... LeT's dO It tOgEtHer!",
    rarity: Rarity.common,
  },
  {
    id: 16,
    url: '/idle_game/memes/sponge1.webp',
    title: 'Imagination',
    flavorText: "What's in the box?",
    rarity: Rarity.common,
  },
  {
    id: 17,
    url: '/idle_game/memes/steveharvey.jpg',
    title: 'Steve Harvey',
    flavorText: 'GOOD ANSWER GOOD ANSWER.',
    rarity: Rarity.common,
  },
  {
    id: 18,
    url: '/idle_game/memes/successkid.webp',
    title: 'Success Kid',
    flavorText: 'Once a meme always a meme.',
    rarity: Rarity.common,
  },
  {
    id: 19,
    url: '/idle_game/memes/timhotdog.jpg',
    title: 'Hotdog Car Crash',
    flavorText: 'We’re all trying to find the guy who did this...',
    rarity: Rarity.common,
  },
  {
    id: 20,
    url: '/idle_game/memes/trollface.jpg',
    title: 'Troll Face',
    flavorText: 'Problem?',
    rarity: Rarity.common,
  },
  {
    id: 21,
    url: '/idle_game/memes/walterwhite.jpg',
    title: 'Walter White',
    flavorText: 'HANK NOOOOOOOOOOOOOOOOO',
    rarity: Rarity.common,
  },
]

export const RareMemes = [
  {
    id: 2,
    url: '/idle_game/memes/pickle.png',
    title: 'Pickle Rick',
    flavorText: "He turned himself into a pickle. Funniest thing I've ever seen.",
    rarity: Rarity.rare,
  },
]

export const LegendaryMemes = []

export const MythicMemes = []

export const AllMemes = [...CommonMemes, ...RareMemes, ...LegendaryMemes, ...MythicMemes]

export type BlogPost = {
  title: string
  type: string
  duration: string
}

export const BlogPosts: BlogPost[] = [
  { title: 'Brian: Bad Luck or Just Desserts?', type: 'case study', duration: '90 min' },
  {
    title: 'Overly Attached Girlfriend Elopes at 35',
    type: 'where are they now',
    duration: '30 sec',
  },
  {
    title: 'This Pepe Collector just found his Golden Goose',
    type: 'breaking news',
    duration: '5 min',
  },
  {
    title: 'Imagine Dragons contracts Ligma while perfoming concert to Sugondese crowd',
    type: 'breaking news',
    duration: '5 sec',
  },
  {
    title: `Pickle Rick: The Nuance behind the Genius `,
    type: 'case study',
    duration: '1200 min',
  },
]

export const AdContent = [
  "Congraluations! You've won our sweepstakes!",
  'Tired of Ads? Try our Ad Block Service!',
  'Subscribe to SpywareVPN and get the first 48 months free!',
  'Warning! Virus detected! Download our Virus to clean your computer!',
  'ANNOYING POP-UP ANNOYING POP-UP ANNOYING POP-UP',
  'Special offer just for you and definitely not for anyone else!',
  'Become an overnight instagram influencer with this 10-week course',
  'You are the 100,000,000th person to breathe air today. Collect your reward',
]

export const brands = [
  // Tech & Software
  'google.com',
  'apple.com',
  'microsoft.com',
  'amazon.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'tiktok.com',
  'snapchat.com',
  'netflix.com',
  'spotify.com',
  'discord.com',
  'reddit.com',
  'linkedin.com',
  'zoom.us',
  'slack.com',
  'dropbox.com',
  'adobe.com',
  'salesforce.com',
  'nvidia.com',
  'intel.com',
  'amd.com',
  'dell.com',
  'hp.com',
  'lenovo.com',
  'samsung.com',
  'sony.com',
  'huawei.com',
  'xiaomi.com',
  'tesla.com',

  // Retail & E-Commerce
  'walmart.com',
  'target.com',
  'costco.com',
  'ikea.com',
  'homedepot.com',
  'lowes.com',
  'bestbuy.com',
  'alibaba.com',
  'aliexpress.com',
  'ebay.com',
  'etsy.com',
  'shopify.com',
  'zara.com',
  'uniqlo.com',
  'hm.com',
  'shein.com',
  'nike.com',
  'adidas.com',
  'puma.com',
  'underarmour.com',
  'newbalance.com',
  'patagonia.com',
  'northface.com',

  // Food & Beverage
  'mcdonalds.com',
  'burgerking.com',
  'wendys.com',
  'kfc.com',
  'subway.com',
  'dominos.com',
  'pizzahut.com',
  'starbucks.com',
  'dunkindonuts.com',
  'timhortons.com',
  'coca-cola.com',
  'pepsi.com',
  'drpepper.com',
  'redbull.com',
  'monsterenergy.com',
  'heineken.com',
  'budweiser.com',
  'nestle.com',
  'kelloggs.com',
  'pringles.com',
  'oreo.com',
  'lays.com',
  'doritos.com',
  'chipotle.com',
  'panerabread.com',
  'fiveguys.com',

  // Automotive
  'bmw.com',
  'mercedes-benz.com',
  'audi.com',
  'porsche.com',
  'ferrari.com',
  'lamborghini.com',
  'toyota.com',
  'honda.com',
  'ford.com',
  'chevrolet.com',
  'nissan.com',
  'volkswagen.com',
  'volvo.com',
  'hyundai.com',
  'kia.com',
  'mazda.com',
  'subaru.com',
]
