'use client'

import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import './styles.css'
import { ShopButton } from './components/ShopButton'

export default function IdleGame() {
  const [score, setScore] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [passivePower, setPassivePower] = useState(0)
  const [cosmetics, setCosmetics] = useState<CSSProperties>({})

  const intervalReference = useRef<NodeJS.Timeout>(null)

  const incrementScore = useCallback((amount: number) => {
    setScore((prevScore) => prevScore + amount)
  }, [])

  const improveClicks = useCallback((increase: number) => {
    setClickPower((prevPower) => prevPower + increase)
  }, [])

  const improvePassive = useCallback((increase: number) => {
    setPassivePower((prevPower) => prevPower + increase)
  }, [])

  const spendScore = useCallback(
    (cost: number, purchaseCallback: () => void) => {
      if (score - cost < 0) return
      setScore((prevScore) => prevScore - cost)
      purchaseCallback()
    },
    [score]
  )

  const purchaseCosmeticStyle = useCallback((styleKey: string, styleValue: string) => {
    setCosmetics((prevCosmetics) => ({ ...prevCosmetics, [styleKey]: styleValue }))
  }, [])

  //sets up the passive score interval
  useEffect(() => {
    if (!!intervalReference.current) {
      clearInterval(intervalReference.current)
    }

    const interval = setInterval(() => {
      incrementScore(passivePower)
    }, 1000)
    intervalReference.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [passivePower, incrementScore])

  return (
    <div style={cosmetics}>
      <button className="click-button" onClick={() => incrementScore(clickPower)}>
        Click Me!
      </button>
      <h5>Current Score: {score}</h5>
      <h5 className="mt-8">Current Passive Score: {passivePower}</h5>
      <div className="mt-8">
        <h5>Shop</h5>
        <div className="flex gap-4">
          <ShopButton
            title="+1 Click Power"
            cost={5}
            spendScore={() => spendScore(5, () => improveClicks(1))}
          />
          <ShopButton
            title="+1 Passive Score"
            cost={25}
            spendScore={() => spendScore(25, () => improvePassive(1))}
          />
          <ShopButton
            title="Red Background"
            cost={1}
            spendScore={() => spendScore(1, () => purchaseCosmeticStyle('background', 'red'))}
          />
        </div>
      </div>
    </div>
  )
}
