import { useCallback, useEffect, useRef, useState } from 'react'
import { ShopItemIds } from './shop/constants'

const devMode = true

export type ScoreProps = {
  score: number
  displayScore: number
  clickPower: number
  passivePower: number
  viewPower: number
  adPower: number
  scoreIncrements: ScoreIncrement[]
  statistics: Statistics
  incrementClicks: (increase: number) => void
  incrementPassive: (increase: number) => void
  incrementView: (increase: number) => void
  incrementScore: (increase: number, statisticType: StatisticType, skipAnimation?: boolean) => void
  incrementAdPower: (increase: number) => void
  spendScore: (cost: number, purchaseCallback: () => void) => void
}

export type ScoreIncrement = {
  id: string
  amount: number
  xPosition: number
}

export type Statistics = {
  totalClickScore: number
  totalPassiveScore: number
  totalAdScore: number
  totalBlogScore: number
}

export enum StatisticType {
  click = 'totalClickScore',
  passive = 'totalPassiveScore',
  ad = 'totalAdScore',
  blog = 'totalBlogScore',
}

export const useScore = (purchasedIds: ShopItemIds[]) => {
  const [score, setScore] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const intervalReference = useRef<NodeJS.Timeout>(null)
  const displayReference = useRef<NodeJS.Timeout>(null)
  const [passivePower, setPassivePower] = useState(0)
  const [viewPower, setViewPower] = useState(0)
  const [adPower, setAdPower] = useState(1000)
  const [scoreIncrements, setScoreIncrements] = useState<ScoreIncrement[]>([])

  const [statistics, setStatistics] = useState<Statistics>({
    totalAdScore: 0,
    totalBlogScore: 0,
    totalClickScore: 0,
    totalPassiveScore: 0,
  })

  //basic functions for adjusting the core state values
  const incrementClicks = useCallback((increase: number) => {
    setClickPower((prevPower) => prevPower + increase)
  }, [])
  const incrementPassive = useCallback((increase: number) => {
    setPassivePower((prevPower) => prevPower + increase)
  }, [])
  const incrementView = useCallback((increase: number) => {
    setViewPower((prevPower) => prevPower + increase)
  }, [])
  const incrementAdPower = useCallback((increase: number) => {
    setAdPower((prevPower) => prevPower + increase)
  }, [])

  const incrementScore = useCallback(
    (amount: number, statisticType: StatisticType, skipAnimation?: boolean) => {
      if (!(amount > 0)) return
      setScore((prevScore) => prevScore + amount)

      //update total stats
      setStatistics((prevStats) => {
        return {
          ...prevStats,
          [statisticType]: prevStats[statisticType] + amount,
        }
      })

      if (!purchasedIds.includes(ShopItemIds.scoreIncrementer) || skipAnimation === true) return

      // add the score to the animation
      const scoreId = crypto.randomUUID()
      setScoreIncrements((prevIncrements) => [
        ...prevIncrements,
        { id: scoreId, amount, xPosition: Math.random() * 80 },
      ])
      //remove the score after a delay
      setTimeout(
        () =>
          setScoreIncrements((prevIncrements) =>
            prevIncrements.filter((inc) => inc.id !== scoreId)
          ),
        950
      )
    },
    [purchasedIds]
  )

  //spend score + call a modifier
  const spendScore = useCallback(
    (cost: number, purchaseCallback: () => void) => {
      if (score - cost < 0 && !devMode) return
      setScore((prevScore) => prevScore - cost)
      setDisplayScore((prevScore) => prevScore - cost)
      purchaseCallback()
    },
    [score]
  )

  //sets up the passive score interval
  useEffect(() => {
    if (!!intervalReference.current) {
      clearInterval(intervalReference.current)
    }

    const interval = setInterval(() => {
      incrementScore(passivePower, StatisticType.passive, true)
    }, 1000)
    intervalReference.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [passivePower, incrementScore])

  //adjusts the display of the score so that it appears to always be ticking up due to the passive increment
  useEffect(() => {
    if (displayScore === score) return
    if (!!displayReference.current) {
      clearInterval(displayReference.current)
    }
    displayReference.current = setInterval(() => {
      setDisplayScore((prevDisplay) => {
        if (prevDisplay === score) {
          if (displayReference.current) clearInterval(displayReference.current)
          return prevDisplay
        }
        const diff = score - prevDisplay
        const step = Math.ceil(diff / 10)
        return prevDisplay + step
      })
    }, 200)
    return () => {
      if (displayReference.current) clearInterval(displayReference.current)
    }
  }, [score, displayScore])

  return {
    score,
    displayScore,
    clickPower,
    passivePower,
    viewPower,
    adPower,
    scoreIncrements,
    statistics,
    incrementClicks,
    incrementPassive,
    incrementScore,
    incrementView,
    spendScore,
    incrementAdPower,
  } as ScoreProps
}
