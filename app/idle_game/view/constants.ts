export const MemeUrls = [
  '/idle_game/memes/zipline.jpg',
  '/idle_game/memes/cat.webp',
  '/idle_game/memes/pickle.png',
  '/idle_game/memes/dog.webp',
  '/idle_game/memes/cinema.jpg',
  '/idle_game/memes/mike.jpg',
]

type BlogPost = {
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
