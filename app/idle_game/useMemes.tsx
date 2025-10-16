import { useMemo, useState } from 'react'
import { AllMemes, CommonMemes, LegendaryMemes, Meme, RareMemes } from './view/constants'
import { ShopItemIds } from './side-panel/shop/constants'

export type MemeProps = {
  ownedMemes: Meme[]
  activeMemeId: number
  setActiveMemeId: (id?: number) => void
  addMemeById: (id: number) => void
  addRandomCommonMeme: () => void
  buyStandardPack: () => void
  buyUnusualPack: () => void
  buyLegendaryPack: () => void
  isCommonMaxed?: boolean
  isRareMaxed?: boolean
  isLegendaryMaxed?: boolean
}

export const useMemes = (purchasedIds: Array<ShopItemIds>) => {
  const [activeMemeId, setActiveMemeId] = useState<number>()
  const [ownedMemeIds, setOwnedMemeIds] = useState<number[]>([])

  const ownedMemes = useMemo(() => {
    return ownedMemeIds.map((id) => AllMemes.find((meme) => meme.id === id)!)
  }, [ownedMemeIds])

  const isCommonMaxed = useMemo(
    () => CommonMemes.every((meme) => ownedMemeIds.includes(meme.id)),
    [ownedMemeIds]
  )
  const isRareMaxed = useMemo(
    () => RareMemes.every((meme) => ownedMemeIds.includes(meme.id)),
    [ownedMemeIds]
  )
  const isLegendaryMaxed = useMemo(
    () => LegendaryMemes.every((meme) => ownedMemeIds.includes(meme.id)),
    [ownedMemeIds]
  )

  const addMemeById = (id: number) => {
    setOwnedMemeIds((prevIds) => [...prevIds, id])
    if (!purchasedIds.includes(ShopItemIds.blackMarket)) return
    setActiveMemeId(id)
    const audio = new Audio('/idle_game/purchase.mp3')
    audio.volume = 0.2
    audio.play()
  }

  const addRandomCommonMeme = () => {
    const unownedCommons = CommonMemes.filter((meme) => !ownedMemeIds.includes(meme.id))
    const randomIndex = Math.floor(Math.random() * unownedCommons.length)
    const newId = unownedCommons[randomIndex].id
    addMemeById(newId)
  }

  const addRandomRareMeme = () => {
    const unownedRares = RareMemes.filter((meme) => !ownedMemeIds.includes(meme.id))
    const randomIndex = Math.floor(Math.random() * unownedRares.length)
    const newId = unownedRares[randomIndex].id
    addMemeById(newId)
  }

  const addRandomLegendaryMeme = () => {
    const unownedLegendaries = LegendaryMemes.filter((meme) => !ownedMemeIds.includes(meme.id))
    const randomIndex = Math.floor(Math.random() * unownedLegendaries.length)
    const newId = unownedLegendaries[randomIndex].id
    addMemeById(newId)
  }

  //5% chance to get a rare
  const buyStandardPack = () => {
    const randomChance = Math.floor(Math.random() * 20)
    if (randomChance === 1) {
      addRandomRareMeme()
      return
    }
    addRandomCommonMeme()
  }

  //50% chance to get a rare
  const buyUnusualPack = () => {
    const randomChance = Math.floor(Math.random() * 20)
    if (randomChance <= 10) {
      addRandomRareMeme()
      return
    }
    try {
      addRandomCommonMeme()
    } catch {
      addRandomRareMeme()
    }
  }

  //triggers the end of the game
  const buyLegendaryPack = () => {
    addRandomLegendaryMeme()
  }

  return {
    ownedMemes,
    activeMemeId,
    setActiveMemeId,
    addMemeById,
    addRandomCommonMeme,
    buyStandardPack,
    buyUnusualPack,
    buyLegendaryPack,
    isCommonMaxed,
    isRareMaxed,
    isLegendaryMaxed,
  } as MemeProps
}
