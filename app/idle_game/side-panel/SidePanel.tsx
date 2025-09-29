import { useCallback, useState } from 'react'
import { ScoreProps, StatisticType } from './useScore'
import { defaultMessage, ShopItemIds, ShopItem, ShopItems } from './shop/constants'
import { Clicker } from './Clicker'
import classNames from 'classnames'
import { Score } from './Score'
import { BlogViewProps } from '../view/useBlogViews'
import { ModalNames } from '../menus/modalRegistry'
import Image from 'next/image'
import { MemeProps } from '../useMemes'
import { ShopContainer } from './shop/ShopContainer'
import { SpaceInvaders } from './SpaceInvaders'

type SidePanelProps = {
  purchasedIds: Array<ShopItemIds>
  onPurchase: (id: ShopItemIds) => void
  scoreProps: ScoreProps
  blogViewProps: BlogViewProps
  setUserName: (name: string) => void
  setActiveModal: (modal: ModalNames) => void
  memeProps: MemeProps
}

export const SidePanel = ({
  purchasedIds,
  scoreProps,
  blogViewProps,
  setUserName,
  setActiveModal,
  onPurchase,
  memeProps,
}: SidePanelProps) => {
  const { score, clickPower, incrementScore } = scoreProps
  const [hoveredShopId, setHoveredShopId] = useState<ShopItemIds | undefined>()

  const calculateCost = (item: ShopItem) => {
    if (!item.isRepeatble) return item.cost
    const purchasedAmount = purchasedIds.filter((id) => id === item.id).length
    if (!purchasedAmount) return item.cost
    if (purchasedAmount === 1) return item.cost * item.isRepeatble.costMultiplier
    return item.cost * purchasedAmount ** item.isRepeatble.costMultiplier
  }

  const handleNameChange = useCallback((name: string) => {
    if (name.length > 30) return
    setUserName(name)
  }, [])

  return (
    <div className="flex flex-col h-[100vh] max-w-[20%] min-w-[20%] border-l py-4 px-8 fade-in">
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
          {purchasedIds.includes(ShopItemIds.blackMarket) && (
            <button
              className="border p-2 rounded-md mb-4 cursor-pointer flex gap-1 items-center"
              onClick={() => setActiveModal(ModalNames.BlackMarket)}
            >
              <h5>Black Market</h5>
            </button>
          )}
        </div>
        <ShopContainer
          blogProps={blogViewProps}
          scoreProps={scoreProps}
          memeProps={memeProps}
          calculateCost={calculateCost}
          onPurchase={onPurchase}
          purchasedIds={purchasedIds}
          setHoveredShopId={setHoveredShopId}
        />
      </div>
      <div className="flex-grow" />
      <div className="relative">
        {purchasedIds.includes(ShopItemIds.spaceInvaders) && (
          <SpaceInvaders scoreProps={scoreProps} />
        )}
        <Score scoreProps={scoreProps} purchasedIds={purchasedIds} blogViewProps={blogViewProps} />
        <Clicker
          onClick={(isCritical) => {
            const power = isCritical ? clickPower * 10 : clickPower
            incrementScore(power, StatisticType.click, false, isCritical)
          }}
          purchasedIds={purchasedIds}
        />
        <TutorialBox
          score={score}
          purchasedIds={purchasedIds}
          hoveredShopId={hoveredShopId}
          calculateCost={calculateCost}
        />
      </div>
      <a
        className="text-xs text-center mt-2 select-none cursor-pointer"
        href="https://logo.dev"
        target="_blank"
      >
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
