export enum ShopItemIds {
  basicTitle,
  centeredTitle,
  memeTitle,
  basicBody,
  basicColor,
  lightenedColor,
  basicButton,
  buttonSFX,
  scoreIncrementer,
  basicMeme,
  memeRepeatable,
  memeGallery,
  memeTrim,
  memeRotation,
  basicBlog,
  firstPost,
  postRepeatable,
  blogDetails,
  blogViewCount,
  blogViewBots,
  blogTitle,
  blogAuthor,
  blogCustomAuthor,
  blogBio,
  blogImage,
  basicAds,
  repeatableAdAmount,
  adSponsor,
  statistics,
}

export type ShopItem = {
  id: ShopItemIds
  title: string
  cost: number
  message: string
  cosmeticStyle?: {
    key: string
    value: string
  }
  clickIncrementPower?: number
  passiveIncrementPower?: number
  viewIncrementPower?: number
  adIncrementPower?: number
  blogViewModifier?: {
    frequencyInMs?: number
    odds?: number
    gain?: number
  }
  prerequsiteId?: ShopItemIds
  isRepeatble?: {
    limit: number
    costMultiplier: number
    powerMultiplier: number
  }
}

export const ShopItems: Record<ShopItemIds, ShopItem> = {
  //TITLE
  [ShopItemIds.basicTitle]: {
    id: ShopItemIds.basicTitle,
    title: 'Title',
    cost: 5,
    message: "Let's start with a title so people know where they are.",
    clickIncrementPower: 1,
  },
  [ShopItemIds.centeredTitle]: {
    id: ShopItemIds.centeredTitle,
    title: 'Center Align',
    cost: 25,
    message: 'Oh you wanted it centered? You should have said that.',
    passiveIncrementPower: 1,
    prerequsiteId: ShopItemIds.basicTitle,
  },
  [ShopItemIds.memeTitle]: {
    id: ShopItemIds.memeTitle,
    title: 'Update Title',
    cost: 500,
    message: 'These memes are looking really good, but our title could be more relevent.',
    clickIncrementPower: 5,
    prerequsiteId: ShopItemIds.memeGallery,
  },
  //BODY TEXT
  [ShopItemIds.basicBody]: {
    id: ShopItemIds.basicBody,
    title: 'Body Text',
    cost: 100,
    message: "A bit empty isn't it? I've got just the thing.",
    clickIncrementPower: 3,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  //COLORS
  [ShopItemIds.basicColor]: {
    id: ShopItemIds.basicColor,
    title: 'Make It Pop',
    cost: 50,
    message: "I'm worried we're not gonna standout. Let's try something BOLD.",
    passiveIncrementPower: 3,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  [ShopItemIds.lightenedColor]: {
    id: ShopItemIds.lightenedColor,
    title: 'Make It Pop Less',
    cost: 50,
    message: 'OK MY BAD.',
    passiveIncrementPower: 3,
    prerequsiteId: ShopItemIds.basicColor,
  },
  //CLICKER
  [ShopItemIds.basicButton]: {
    id: ShopItemIds.basicButton,
    title: 'Clicker Upgrade',
    cost: 100,
    message: 'If upgrading the button will help you click better, go for it.',
    clickIncrementPower: 2,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  [ShopItemIds.buttonSFX]: {
    id: ShopItemIds.buttonSFX,
    title: 'Clicker SFX',
    cost: 500,
    message: 'It is a bit quiet in here.',
    clickIncrementPower: 5,
    prerequsiteId: ShopItemIds.basicButton,
  },
  [ShopItemIds.scoreIncrementer]: {
    id: ShopItemIds.scoreIncrementer,
    title: 'Score Animation',
    cost: 3000,
    message: "See exactly what you're earning.",
    clickIncrementPower: 20,
    prerequsiteId: ShopItemIds.buttonSFX,
  },
  //MEMES
  [ShopItemIds.basicMeme]: {
    id: ShopItemIds.basicMeme,
    title: 'Imagery',
    cost: 250,
    message: 'This body text is great, but they say a picture is worth a thousand words...',
    passiveIncrementPower: 3,
    prerequsiteId: ShopItemIds.basicBody,
  },
  [ShopItemIds.memeRepeatable]: {
    id: ShopItemIds.memeRepeatable,
    title: 'More memes',
    cost: 300,
    message: 'Give the people what they want.',
    passiveIncrementPower: 3,
    prerequsiteId: ShopItemIds.basicMeme,
    isRepeatble: {
      limit: 29,
      costMultiplier: 2,
      powerMultiplier: 1,
    },
  },
  [ShopItemIds.memeGallery]: {
    id: ShopItemIds.memeGallery,
    title: 'Meme Gallery',
    cost: 1000,
    message: 'We need a better way to showcase these.',
    passiveIncrementPower: 5,
    prerequsiteId: ShopItemIds.memeRepeatable,
  },
  [ShopItemIds.memeTrim]: {
    id: ShopItemIds.memeTrim,
    title: 'Meme Trim',
    cost: 2500,
    message: 'Give these memes the spotlight they deserve.',
    passiveIncrementPower: 15,
    prerequsiteId: ShopItemIds.memeTitle,
  },
  [ShopItemIds.memeRotation]: {
    id: ShopItemIds.memeRotation,
    title: '3D Memes',
    cost: 10000,
    message: 'Take these puppies for a spin.',
    passiveIncrementPower: 50,
    prerequsiteId: ShopItemIds.memeTrim,
  },
  //BLOG
  [ShopItemIds.basicBlog]: {
    id: ShopItemIds.basicBlog,
    title: 'Blog',
    cost: 1500,
    message: 'Every website needs a blog right? ...right?',
    clickIncrementPower: 15,
    prerequsiteId: ShopItemIds.memeGallery,
  },
  [ShopItemIds.firstPost]: {
    id: ShopItemIds.firstPost,
    title: 'Blog Post',
    cost: 1500,
    message: "The blog needs a blog post. Just don't expect any real content inside.",
    passiveIncrementPower: 10,
    prerequsiteId: ShopItemIds.basicBlog,
  },
  [ShopItemIds.postRepeatable]: {
    id: ShopItemIds.postRepeatable,
    title: 'More Posts',
    cost: 2000,
    message: 'Keep the posts coming, someone will read them eventually.',
    passiveIncrementPower: 10,
    prerequsiteId: ShopItemIds.firstPost,
    isRepeatble: {
      limit: 5,
      costMultiplier: 2,
      powerMultiplier: 1,
    },
  },
  [ShopItemIds.blogDetails]: {
    id: ShopItemIds.blogDetails,
    title: 'Blog Details',
    cost: 5000,
    message: "They look a little pathetic with just the title don't they?",
    passiveIncrementPower: 20,
    prerequsiteId: ShopItemIds.firstPost,
  },
  [ShopItemIds.blogViewCount]: {
    id: ShopItemIds.blogViewCount,
    title: 'Blog View Count',
    cost: 5000,
    message: 'Might be a nice morale boost to see how many people are viewing these.',
    viewIncrementPower: 1,
    prerequsiteId: ShopItemIds.firstPost,
  },
  [ShopItemIds.blogViewBots]: {
    id: ShopItemIds.blogViewBots,
    title: 'Blog View Bots',
    cost: 10000,
    message:
      "I guess seeing the view count doesn't magically give us views... we gotta grease the wheels first.",
    viewIncrementPower: 99,
    prerequsiteId: ShopItemIds.blogViewCount,
  },
  [ShopItemIds.blogAuthor]: {
    id: ShopItemIds.blogAuthor,
    title: 'Blog Author',
    cost: 30000,
    message: 'Time to take some credit for all of our hard work.',
    blogViewModifier: {
      gain: 2,
    },
    prerequsiteId: ShopItemIds.blogViewBots,
  },
  [ShopItemIds.blogCustomAuthor]: {
    id: ShopItemIds.blogCustomAuthor,
    title: 'Custom Author',
    cost: 17500,
    message: 'This is awkward, we never introduced ourselves. What a hilarious misunderstanding.',
    blogViewModifier: {
      gain: 4,
    },
    prerequsiteId: ShopItemIds.blogAuthor,
  },
  [ShopItemIds.blogBio]: {
    id: ShopItemIds.blogBio,
    title: 'About the Author',
    cost: 50000,
    message: 'I think some backstory is what the people really need to connect to our writing.',
    blogViewModifier: {
      gain: 8,
    },
    prerequsiteId: ShopItemIds.blogCustomAuthor,
  },
  [ShopItemIds.blogImage]: {
    id: ShopItemIds.blogImage,
    title: 'Blog Image',
    cost: 40000,
    message: 'I have some stock photos lying around.',
    blogViewModifier: {
      odds: 8,
    },
    prerequsiteId: ShopItemIds.blogViewBots,
  },
  [ShopItemIds.blogTitle]: {
    id: ShopItemIds.blogTitle,
    title: 'Stylish Title',
    cost: 17500,
    message: 'You know what our website needs? Character. Gumption. Chutzpah.',
    blogViewModifier: {
      frequencyInMs: 4000,
    },
    prerequsiteId: ShopItemIds.blogViewBots,
  },
  //ADS
  [ShopItemIds.basicAds]: {
    id: ShopItemIds.basicAds,
    title: 'Ads',
    cost: 5000,
    message: "There's got to be a way to make money off this. It's simply too good.",
    passiveIncrementPower: 50,
    prerequsiteId: ShopItemIds.memeGallery,
  },
  [ShopItemIds.repeatableAdAmount]: {
    id: ShopItemIds.repeatableAdAmount,
    title: 'More Ads',
    cost: 20000,
    message: "I'm warning you, once you go down this road there is no turning back.",
    passiveIncrementPower: 50,
    prerequsiteId: ShopItemIds.basicAds,
    isRepeatble: {
      limit: 20,
      costMultiplier: 2,
      powerMultiplier: 1,
    },
  },
  [ShopItemIds.adSponsor]: {
    id: ShopItemIds.adSponsor,
    title: 'Sponsor Deals',
    cost: 15000,
    adIncrementPower: 2000,
    message: 'For legal reasons this site is not actually affiliated with any organization.',
    prerequsiteId: ShopItemIds.basicAds,
  },
  //MISC
  [ShopItemIds.statistics]: {
    id: ShopItemIds.statistics,
    title: 'Statistics',
    cost: 30000,
    clickIncrementPower: 100,
    message: 'Number go up = happy.',
    prerequsiteId: ShopItemIds.blogViewBots,
  },
}

export const defaultMessage =
  "Making a website is hard... let's do it together!\n Start by purchasing a Title from the Shop."
