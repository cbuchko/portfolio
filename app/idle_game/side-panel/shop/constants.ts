export enum ShopItemIds {
  basicTitle,
  centeredTitle,
  memeTitle,
  basicBody,
  basicColor,
  lightenedColor,
  basicButton,
  buttonSFX,
  basicMeme,
  memeRepeatable,
  memeGallery,
  memeTrim,
  memeRotation,
  basicBlog,
  firstPost,
  postRepeatable,
  basicAds,
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
    message: "Let's start with a title so people know where they are",
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
    message: 'These memes are looking really good, but our title could be more relevent',
    clickIncrementPower: 5,
    prerequsiteId: ShopItemIds.memeRepeatable,
  },
  //BODY TEXT
  [ShopItemIds.basicBody]: {
    id: ShopItemIds.basicBody,
    title: 'Body Text',
    cost: 100,
    message: "A bit empty isn't it? I've got just the thing",
    clickIncrementPower: 3,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  //COLORS
  [ShopItemIds.basicColor]: {
    id: ShopItemIds.basicColor,
    title: 'Make It Pop',
    cost: 50,
    message: "I'm worried we're not gonna standout. Let's try something BOLD",
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
    message: 'If upgrading the button will help you click better, then sure, go for it',
    clickIncrementPower: 2,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  [ShopItemIds.buttonSFX]: {
    id: ShopItemIds.buttonSFX,
    title: 'Clicker SFX',
    cost: 500,
    message: 'Sounds as well? Is that really necessary?',
    clickIncrementPower: 5,
    prerequsiteId: ShopItemIds.basicButton,
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
    message: 'Give the people what they want',
    passiveIncrementPower: 3,
    prerequsiteId: ShopItemIds.basicMeme,
    isRepeatble: {
      limit: 6,
      costMultiplier: 1.25,
      powerMultiplier: 1,
    },
  },
  [ShopItemIds.memeGallery]: {
    id: ShopItemIds.memeGallery,
    title: 'Meme Gallery',
    cost: 1000,
    message: 'We need a better way to showcase these',
    passiveIncrementPower: 5,
    prerequsiteId: ShopItemIds.memeRepeatable,
  },
  [ShopItemIds.memeTrim]: {
    id: ShopItemIds.memeTrim,
    title: 'Meme Trim',
    cost: 2500,
    message: 'Give these memes the spotlight they deserve',
    passiveIncrementPower: 15,
    prerequsiteId: ShopItemIds.memeGallery,
  },
  [ShopItemIds.memeRotation]: {
    id: ShopItemIds.memeRotation,
    title: '3D Memes',
    cost: 10000,
    message: 'Take these puppies for a spin',
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
    prerequsiteId: ShopItemIds.basicMeme,
  },
  [ShopItemIds.firstPost]: {
    id: ShopItemIds.firstPost,
    title: 'Blog Post',
    cost: 1500,
    message: "The blog needs a blog post. Just don't expect any real content inside",
    passiveIncrementPower: 10,
    prerequsiteId: ShopItemIds.basicBlog,
  },
  [ShopItemIds.postRepeatable]: {
    id: ShopItemIds.postRepeatable,
    title: 'More Posts',
    cost: 2000,
    message: 'Keep the posts coming, someone will read them eventually',
    passiveIncrementPower: 10,
    prerequsiteId: ShopItemIds.firstPost,
    isRepeatble: {
      limit: 5,
      costMultiplier: 1.25,
      powerMultiplier: 1,
    },
  },
  [ShopItemIds.basicAds]: {
    id: ShopItemIds.basicAds,
    title: 'Ads',
    cost: 5000,
    message: "There's got to be a way to make money off this. It's simply too good.",
    passiveIncrementPower: 50,
    prerequsiteId: ShopItemIds.firstPost,
  },
}

export const defaultMessage =
  "Making a website is hard... let's do it together!\n Start by adding a Title."
