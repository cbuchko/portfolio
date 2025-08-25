import { useCallback, useMemo, useState } from 'react'
import { ShopButton } from './shop/ShopButton'
import { useScore } from './useScore'
import { defaultMessage, ShopItemIds, ShopItem, ShopItems } from './shop/constants'
import { Clicker } from './Clicker'

type SidePanelProps = {
  purchasedIds: Set<ShopItemIds>
  onPurchase: (id: ShopItemIds) => void
}

export const SidePanel = ({ purchasedIds, onPurchase }: SidePanelProps) => {
  const {
    score,
    clickPower,
    passivePower,
    incrementClicks,
    incrementPassive,
    incrementScore,
    spendScore,
  } = useScore()

  const [hoveredShopId, setHoveredShopId] = useState<ShopItemIds | undefined>()

  //spend the score with the appropriate callback
  const handlePurchase = useCallback(
    (button: ShopItem) => {
      spendScore(button.cost, () => {
        if (button.clickIncrementPower) incrementClicks(button.clickIncrementPower)
        if (button.passiveIncrementPower) incrementPassive(button.passiveIncrementPower)
        onPurchase(button.id)
        setHoveredShopId(undefined)
      })
    },
    [spendScore]
  )

  const filteredShopItems = useMemo(() => {
    return Object.values(ShopItems).filter(
      (item) =>
        !purchasedIds.has(item.id) &&
        (item.prerequsiteId !== undefined ? purchasedIds.has(item.prerequsiteId) : true)
    )
  }, [purchasedIds])

  const hoveredButton =
    hoveredShopId !== undefined
      ? ShopItems[hoveredShopId]
      : ({ message: defaultMessage } as ShopItem)
  return (
    <div className="flex flex-col h-[100vh] w-[20%] border-l py-4 px-8">
      <h5 className="mt-2">Current Score: {score}</h5>
      <h5 className="mt-2">Current Passive Score: {passivePower}</h5>
      <div className="mt-8">
        <h5>Shop</h5>
        <div className="flex gap-4">
          {filteredShopItems.map((button) => (
            <ShopButton
              key={button.id}
              id={button.id}
              title={button.title}
              setHoveredId={setHoveredShopId}
              spendScore={() => handlePurchase(button)}
            />
          ))}
        </div>
      </div>
      <div className="flex-grow" />
      <Clicker onClick={() => incrementScore(clickPower)} purchasedIds={purchasedIds} />
      <div className="flex flex-col p-2 border rounded-md h-[200px] mt-2">
        <div>{hoveredButton.message}</div>
        <div className="mt-2">
          {hoveredButton.clickIncrementPower && (
            <div>{`+${hoveredButton.clickIncrementPower} Click Power`}</div>
          )}
          {hoveredButton.passiveIncrementPower && (
            <div>{`+${hoveredButton.passiveIncrementPower} Passive Power`}</div>
          )}
        </div>
        <div className="flex-grow" />
        {hoveredButton.cost && <div>Costs: {hoveredButton.cost}</div>}
      </div>
    </div>
  )
}
