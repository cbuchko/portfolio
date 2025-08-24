import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ShopButton } from './shop/ShopButton'
import { WebsiteElements } from '../types'
import { useScore } from './useScore'
import { defaultMessage, ShopButtonIds, ShopButtons } from './shop/constants'

type SidePanelProps = {
  setCosmetics: Dispatch<SetStateAction<CSSProperties>>
  onEnableElement: (element: WebsiteElements) => void
}

export const SidePanel = ({ setCosmetics, onEnableElement }: SidePanelProps) => {
  const {
    score,
    clickPower,
    passivePower,
    incrementClicks,
    incrementPassive,
    incrementScore,
    spendScore,
  } = useScore()

  const [hoveredShopId, setHoveredShopId] = useState<ShopButtonIds | undefined>()

  const purchaseCosmeticStyle = useCallback((styleKey: string, styleValue: string) => {
    setCosmetics((prevCosmetics) => ({ ...prevCosmetics, [styleKey]: styleValue }))
  }, [])

  const hoveredButton =
    hoveredShopId !== undefined ? ShopButtons[hoveredShopId] : { message: defaultMessage }
  return (
    <div className="flex flex-col h-[100vh] w-[20%] border-l p-4">
      <button className="click-button w-full" onClick={() => incrementScore(clickPower)}>
        Click Me!
      </button>
      <h5>Current Score: {score}</h5>
      <h5 className="mt-8">Current Passive Score: {passivePower}</h5>
      <div className="mt-8">
        <h5>Shop</h5>
        <div className="flex gap-4">
          {Object.values(ShopButtons).map((button) => (
            <ShopButton
              key={button.id}
              id={button.id}
              title={button.title}
              cost={button.cost}
              setHoveredId={setHoveredShopId}
              spendScore={() =>
                spendScore(button.cost, () => {
                  if (button.clickIncrementPower) incrementClicks(button.clickIncrementPower)
                  if (button.passiveIncrementPower) incrementPassive(button.passiveIncrementPower)
                  if (button.cosmeticStyle)
                    purchaseCosmeticStyle(button.cosmeticStyle.key, button.cosmeticStyle.value)
                  if (button.websiteElement) onEnableElement(button.websiteElement)
                })
              }
            />
          ))}
        </div>
      </div>
      <div className="flex-grow" />
      <div className="flex flex-col p-2 border rounded-md h-[200px]">
        <div>{hoveredButton.message}</div>
        <div className="flex-grow" />
        {hoveredButton.cost && <div>Costs: {hoveredButton.cost}</div>}
      </div>
    </div>
  )
}
