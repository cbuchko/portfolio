import { useCallback, useMemo } from 'react'
import { BlogViewProps } from '../../view/useBlogViews'
import { ScoreProps } from '../useScore'
import { ShopButton } from './ShopButton'
import { ShopItem, ShopItemIds, ShopItems } from './constants'
import { MemeProps } from '../../useMemes'

export const ShopContainer = ({
  purchasedIds,
  scoreProps,
  blogProps,
  memeProps,
  calculateCost,
  setHoveredShopId,
  onPurchase,
}: {
  purchasedIds: Array<ShopItemIds>
  scoreProps: ScoreProps
  blogProps: BlogViewProps
  memeProps: MemeProps
  calculateCost: (item: ShopItem) => number
  setHoveredShopId: (id?: ShopItemIds) => void
  onPurchase: (id: ShopItemIds) => void
}) => {
  const { score, incrementClicks, incrementPassive, incrementView, incrementAdPower, spendScore } =
    scoreProps
  const { addRandomCommonMeme } = memeProps
  const { setViewFrequency, setViewGain, setViewOdds } = blogProps

  //spend the score with the appropriate callback
  const handlePurchase = (button: ShopItem) => {
    spendScore(calculateCost(button), () => {
      if (button.clickIncrementPower) incrementClicks(button.clickIncrementPower)
      if (button.passiveIncrementPower) incrementPassive(button.passiveIncrementPower)
      if (button.viewIncrementPower) incrementView(button.viewIncrementPower)
      if (button.adIncrementPower) incrementAdPower(button.adIncrementPower)
      if (button.blogViewModifier?.frequencyInMs)
        setViewFrequency(button.blogViewModifier.frequencyInMs)
      if (button.blogViewModifier?.gain) setViewGain(button.blogViewModifier.gain)
      if (button.blogViewModifier?.odds) setViewOdds(button.blogViewModifier.odds)
      if (button.isMeme) addRandomCommonMeme()
      onPurchase(button.id)
      setHoveredShopId(undefined)
    })
  }

  const [filteredShopItems, filteredRepeatableItems] = useMemo(() => {
    const items = Object.values(ShopItems).filter((item) => {
      if (item.isMeme && memeProps.isCommonMaxed) return false
      const hasPreqrequisite =
        item.prerequsiteId !== undefined ? purchasedIds.includes(item.prerequsiteId) : true
      if (item.isRepeatble) {
        if (
          purchasedIds.filter((id) => id === item.id).length < item.isRepeatble.limit - 1 &&
          hasPreqrequisite
        )
          return true
        return false
      }
      return !purchasedIds.includes(item.id) && hasPreqrequisite
    })

    const normalItems = items
      .filter((item) => !item.isRepeatble)
      .sort((a, b) => calculateCost(a) - calculateCost(b))
    const repeatableItems = items.filter((item) => item.isRepeatble)
    return [normalItems, repeatableItems]
  }, [purchasedIds, memeProps.isCommonMaxed, calculateCost])

  return (
    <>
      <h5 className="text-2xl font-medium mb-2">Shop</h5>
      <div className="flex gap-4 flex-wrap">
        {filteredShopItems.map((button) => (
          <ShopButton
            key={button.id}
            id={button.id}
            title={button.title}
            setHoveredId={setHoveredShopId}
            spendScore={() => handlePurchase(button)}
            isDisabled={calculateCost(button) > score}
          />
        ))}
      </div>
      {filteredRepeatableItems.length > 0 && (
        <>
          <h5 className="text-lg font-medium mb-2 mt-8">Repeatables</h5>
          <div className="flex gap-4 flex-wrap">
            {filteredRepeatableItems.map((button) => (
              <ShopButton
                key={button.id}
                id={button.id}
                title={button.title}
                setHoveredId={setHoveredShopId}
                spendScore={() => handlePurchase(button)}
                isDisabled={calculateCost(button) > score}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
