export enum ShopItemIds {
  basicTitle,
  centeredTitle,
  basicBody,
  basicColor,
  lightenedColor,
  basicButton,
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
}

export const ShopItems: Record<ShopItemIds, ShopItem> = {
  [ShopItemIds.basicTitle]: {
    id: ShopItemIds.basicTitle,
    title: 'Title',
    cost: 1,
    message: "Let's start with a title so people know where they are",
    clickIncrementPower: 1,
  },
  [ShopItemIds.centeredTitle]: {
    id: ShopItemIds.centeredTitle,
    title: 'Center Title',
    cost: 1,
    message: 'Oh you wanted it centered? You should have said that.',
    passiveIncrementPower: 1,
    prerequsiteId: ShopItemIds.basicTitle,
  },
  [ShopItemIds.basicBody]: {
    id: ShopItemIds.basicBody,
    title: 'Body Text',
    cost: 1,
    message: "A bit empty isn't it? I've got just the thing",
    clickIncrementPower: 1,
    prerequsiteId: ShopItemIds.basicTitle,
  },
  [ShopItemIds.basicColor]: {
    id: ShopItemIds.basicColor,
    title: 'Make It Pop',
    cost: 1,
    message: "I'm worried we're not gonna standout. Let's try something BOLD",
    passiveIncrementPower: 2,
    prerequsiteId: ShopItemIds.centeredTitle,
  },
  [ShopItemIds.lightenedColor]: {
    id: ShopItemIds.lightenedColor,
    title: 'Make It Pop Less',
    cost: 1,
    message: 'OK MY BAD.',
    passiveIncrementPower: 2,
    prerequsiteId: ShopItemIds.basicColor,
  },
  [ShopItemIds.basicButton]: {
    id: ShopItemIds.basicButton,
    title: 'Clicker Upgrade',
    cost: 1,
    message: 'If upgrading the button will help you click better, then sure, go for it',
    clickIncrementPower: 1,
    prerequsiteId: ShopItemIds.basicTitle,
  },
  // { id: ShopButtonIds.passive, title: 'Passive Score', cost: 25, passiveIncrementPower: 1 },
  // {
  //   id: ShopButtonIds.background,
  //   title: 'Red Background',
  //   cost: 1,
  //   cosmeticStyle: { key: 'background', value: 'red' },
  // },
}

export const defaultMessage = "Making a website is hard... let's do it together!"
