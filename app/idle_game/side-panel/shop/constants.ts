import { WebsiteElements } from '../../types'

export enum ShopButtonIds {
  basicTitle,
  //   background,
  //   passive,
}

type ShopButtons = {
  id: ShopButtonIds
  title: string
  cost: number
  message: string
  cosmeticStyle?: {
    key: string
    value: string
  }
  clickIncrementPower?: number
  passiveIncrementPower?: number
  websiteElement?: WebsiteElements
}

export const ShopButtons: Record<ShopButtonIds, ShopButtons> = {
  [ShopButtonIds.basicTitle]: {
    id: ShopButtonIds.basicTitle,
    title: 'Title',
    cost: 5,
    message: "Let's start with a title so people know where they are",
    clickIncrementPower: 1,
    websiteElement: WebsiteElements.title,
  },
  //   { id: ShopButtonIds.passive, title: 'Passive Score', cost: 25, passiveIncrementPower: 1 },
  //   {
  //     id: ShopButtonIds.background,
  //     title: 'Red Background',
  //     cost: 1,
  //     cosmeticStyle: { key: 'background', value: 'red' },
  //   },
}

export const defaultMessage = "Making a website is hard... let's do it together!"
