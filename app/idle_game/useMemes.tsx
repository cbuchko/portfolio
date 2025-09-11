import { useMemo, useState } from 'react'
import { AllMemes, CommonMemes, Meme, RareMemes } from './view/constants'

export type MemeProps = {
  ownedMemes: Meme[]
  addMemeById: (id: number) => void
  addRandomCommonMeme: () => void
  buyStandardPack: () => void
  buyUnusualPack: () => void
  isCommonMaxed?: boolean
  isRareMaxed?: boolean
}

export const useMemes = () => {
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

  const addMemeById = (id: number) => {
    setOwnedMemeIds((prevIds) => [...prevIds, id])
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

  return {
    ownedMemes,
    addMemeById,
    addRandomCommonMeme,
    buyStandardPack,
    buyUnusualPack,
    isCommonMaxed,
    isRareMaxed,
  } as MemeProps
}
