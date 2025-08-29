import { useCallback, useMemo, useState } from 'react'
import { ShopButton } from './shop/ShopButton'
import { ScoreProps } from './useScore'
import { defaultMessage, ShopItemIds, ShopItem, ShopItems } from './shop/constants'
import { Clicker } from './Clicker'
import classNames from 'classnames'
import { Score } from './Score'

type SidePanelProps = {
  purchasedIds: Array<ShopItemIds>
  onPurchase: (id: ShopItemIds) => void
  scoreProps: ScoreProps
}

export const SidePanel = ({ purchasedIds, scoreProps, onPurchase }: SidePanelProps) => {
  const {
    score,
    clickPower,
    passivePower,
    scoreIncrements,
    incrementClicks,
    incrementPassive,
    incrementScore,
    spendScore,
  } = scoreProps

  const [hoveredShopId, setHoveredShopId] = useState<ShopItemIds | undefined>()

  const calculateCost = (item: ShopItem) => {
    if (!item.isRepeatble) return item.cost
    const purchasedAmount = purchasedIds.filter((id) => id === item.id).length
    if (!purchasedAmount) return item.cost
    return item.cost * purchasedAmount * item.isRepeatble.costMultiplier
  }

  //spend the score with the appropriate callback
  const handlePurchase = useCallback(
    (button: ShopItem) => {
      spendScore(calculateCost(button), () => {
        if (button.clickIncrementPower) incrementClicks(button.clickIncrementPower)
        if (button.passiveIncrementPower) incrementPassive(button.passiveIncrementPower)
        onPurchase(button.id)
        setHoveredShopId(undefined)
      })
    },
    [spendScore]
  )

  const filteredShopItems = useMemo(() => {
    return Object.values(ShopItems)
      .filter((item) => {
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
      .sort((a, b) => calculateCost(a) - calculateCost(b))
  }, [purchasedIds])

  const hoveredButton =
    hoveredShopId !== undefined
      ? ShopItems[hoveredShopId]
      : ({ message: defaultMessage } as ShopItem)
  return (
    <div className="flex flex-col h-[100vh] w-[20%] border-l py-4 px-8">
      <div>
        <h5 className="text-xl mb-2">Shop</h5>
        <div className="flex gap-4 flex-wrap">
          {filteredShopItems.slice(0, 5).map((button) => (
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
      </div>
      <div className="flex-grow" />
      <Score score={score} passivePower={passivePower} scoreIncrements={scoreIncrements} />
      <Clicker onClick={() => incrementScore(clickPower)} purchasedIds={purchasedIds} />
      <div className="flex flex-col p-2 border rounded-md h-[200px] mt-2 select-none">
        <div className="font-medium">{hoveredButton.title}</div>
        <div className="mt-2">{hoveredButton.message}</div>
        <div className="mt-2">
          {hoveredButton.clickIncrementPower && (
            <div>{`+${hoveredButton.clickIncrementPower} score per click`}</div>
          )}
          {hoveredButton.passiveIncrementPower && (
            <div>{`+${hoveredButton.passiveIncrementPower} score per second`}</div>
          )}
        </div>
        <div className="flex-grow" />
        {hoveredButton.cost && (
          <div className={classNames({ 'text-red-400': calculateCost(hoveredButton) > score })}>
            Costs: {calculateCost(hoveredButton)} Score
          </div>
        )}
      </div>
    </div>
  )
}
