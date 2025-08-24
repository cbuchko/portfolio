import { useCallback, useEffect, useRef, useState } from 'react'

export const useScore = () => {
  const [score, setScore] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const intervalReference = useRef<NodeJS.Timeout>(null)
  const [passivePower, setPassivePower] = useState(0)

  //basic functions for adjusting the core state values
  const incrementClicks = useCallback((increase: number) => {
    setClickPower((prevPower) => prevPower + increase)
  }, [])
  const incrementPassive = useCallback((increase: number) => {
    setPassivePower((prevPower) => prevPower + increase)
  }, [])
  const incrementScore = useCallback((amount: number) => {
    setScore((prevScore) => prevScore + amount)
  }, [])

  //spend score + call a modifier
  const spendScore = useCallback(
    (cost: number, purchaseCallback: () => void) => {
      if (score - cost < 0) return
      setScore((prevScore) => prevScore - cost)
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
      incrementScore(passivePower)
    }, 1000)
    intervalReference.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [passivePower, incrementScore])

  return {
    score,
    clickPower,
    passivePower,
    incrementClicks,
    incrementPassive,
    incrementScore,
    spendScore,
  }
}
