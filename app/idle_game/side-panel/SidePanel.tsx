import { useCallback, useMemo, useState } from 'react'
import { ShopButton } from './shop/ShopButton'
import { ScoreProps, StatisticType } from './useScore'
import { defaultMessage, ShopItemIds, ShopItem, ShopItems } from './shop/constants'
import { Clicker } from './Clicker'
import classNames from 'classnames'
import { Score } from './Score'
import { BlogViewProps } from '../view/useBlogViews'
import { ModalNames } from '../menus/modalRegistry'
import Image from 'next/image'

type SidePanelProps = {
  purchasedIds: Array<ShopItemIds>
  onPurchase: (id: ShopItemIds) => void
  scoreProps: ScoreProps
  blogViewProps: BlogViewProps
  setUserName: (name: string) => void
  setActiveModal: (modal: ModalNames) => void
}

export const SidePanel = ({
  purchasedIds,
  scoreProps,
  blogViewProps,
  onPurchase,
  setUserName,
  setActiveModal,
}: SidePanelProps) => {
  const {
    score,
    clickPower,
    incrementClicks,
    incrementPassive,
    incrementScore,
    incrementView,
    incrementAdPower,
    spendScore,
  } = scoreProps

  const { setViewFrequency, setViewGain, setViewOdds } = blogViewProps

  const [hoveredShopId, setHoveredShopId] = useState<ShopItemIds | undefined>()

  const calculateCost = (item: ShopItem) => {
    if (!item.isRepeatble) return item.cost
    const purchasedAmount = purchasedIds.filter((id) => id === item.id).length
    if (!purchasedAmount) return item.cost
    if (purchasedAmount === 1) return item.cost * item.isRepeatble.costMultiplier
    return item.cost * purchasedAmount ** item.isRepeatble.costMultiplier
  }

  //spend the score with the appropriate callback
  const handlePurchase = useCallback(
    (button: ShopItem) => {
      spendScore(calculateCost(button), () => {
        if (button.clickIncrementPower) incrementClicks(button.clickIncrementPower)
        if (button.passiveIncrementPower) incrementPassive(button.passiveIncrementPower)
        if (button.viewIncrementPower) incrementView(button.viewIncrementPower)
        if (button.adIncrementPower) incrementAdPower(button.adIncrementPower)
        if (button.blogViewModifier?.frequencyInMs)
          setViewFrequency(button.blogViewModifier.frequencyInMs)
        if (button.blogViewModifier?.gain) setViewGain(button.blogViewModifier.gain)
        if (button.blogViewModifier?.odds) setViewOdds(button.blogViewModifier.odds)
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

  const handleNameChange = useCallback((name: string) => {
    if (name.length > 30) return
    setUserName(name)
  }, [])

  return (
    <div className="flex flex-col h-[100vh] w-[20%] border-l py-4 px-8 fade-in">
      <div>
        {purchasedIds.includes(ShopItemIds.blogCustomAuthor) && (
          <input
            className="border rounded-lg p-2 mb-4 w-full"
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Your Name Here"
          />
        )}
        <div className="buttons flex items-center gap-2">
          {purchasedIds.includes(ShopItemIds.statistics) && (
            <button
              className="border p-2 rounded-md mb-4 cursor-pointer flex gap-1 items-center"
              onClick={() => setActiveModal(ModalNames.Statistics)}
            >
              <Image src="/idle_game/stat.svg" height={20} width={20} alt="Stat" />
              <h5>Statistics</h5>
            </button>
          )}
          <button
            className="border p-2 rounded-md mb-4 cursor-pointer flex gap-1 items-center"
            onClick={() => setActiveModal(ModalNames.BlackMarket)}
          >
            <Image src="/idle_game/stat.svg" height={20} width={20} alt="Stat" />
            <h5>Black Market</h5>
          </button>
        </div>
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
      </div>
      <div className="flex-grow" />
      <Score scoreProps={scoreProps} purchasedIds={purchasedIds} blogViewProps={blogViewProps} />
      <Clicker
        onClick={() => incrementScore(clickPower, StatisticType.click)}
        purchasedIds={purchasedIds}
      />
      <TutorialBox
        score={score}
        purchasedIds={purchasedIds}
        hoveredShopId={hoveredShopId}
        calculateCost={calculateCost}
      />
      <a className="text-xs text-center mt-2" href="https://logo.dev" target="_blank">
        Logos provided by Logo.dev
      </a>
    </div>
  )
}

const TutorialBox = ({
  score,
  purchasedIds,
  hoveredShopId,
  calculateCost,
}: {
  score: number
  purchasedIds: Array<ShopItemIds>
  hoveredShopId?: ShopItemIds
  calculateCost: (item: ShopItem) => number
}) => {
  const hoveredButton = hoveredShopId !== undefined ? ShopItems[hoveredShopId] : undefined
  const showInitialMessage = hoveredButton === undefined && purchasedIds.length === 0
  return (
    <div className="flex flex-col p-2 border rounded-md h-[200px] mt-2 select-none fade-in">
      {hoveredButton && (
        <>
          <div className="font-medium">{hoveredButton.title}</div>
          <div className="mt-2">{hoveredButton.message}</div>
          <div className="mt-2">
            {hoveredButton.clickIncrementPower && (
              <div>{`+${hoveredButton.clickIncrementPower} score per click`}</div>
            )}
            {hoveredButton.passiveIncrementPower && (
              <div>{`+${hoveredButton.passiveIncrementPower} score per second`}</div>
            )}
            {hoveredButton.adIncrementPower && (
              <div>{`+${hoveredButton.adIncrementPower} score when claiming ads`}</div>
            )}
            {(hoveredButton.blogViewModifier || hoveredButton.viewIncrementPower) && (
              <div>Enhances blog post view generation</div>
            )}
          </div>
          <div className="flex-grow" />
          {hoveredButton.cost && (
            <div className={classNames({ 'text-red-400': calculateCost(hoveredButton) > score })}>
              Costs: {calculateCost(hoveredButton)} Score
            </div>
          )}
        </>
      )}
      {showInitialMessage && defaultMessage}
    </div>
  )
}
