import { useEffect, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { clampPositionsToScreen } from '../utils'
import Image from 'next/image'
import classNames from 'classnames'
import { TextInput } from '../components/TextInput'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const generateMaxFish = () => Math.floor(Math.random() * (55 - 40) + 40)
export const AquariumContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const [maxFish, setMaxFish] = useState(generateMaxFish())
  const [fishCount, setFishCount] = useState(0)
  const [numberInput, setNumberInput] = useState('')

  const handleInputChange = (input: string) => {
    setNumberInput(input)
    if (fishCount === parseInt(input)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="text-lg">Oh no! Our aquarium broke and the fish are loose!</p>
      <p className="text-lg">Please count how many fish swim by!</p>
      <div className="w-full flex justify-end">
        <button
          className="underline text-sm cursor-pointer"
          onClick={() => {
            setMaxFish(generateMaxFish())
            setFishCount(0)
          }}
        >
          Reset
        </button>
      </div>
      <TextInput
        value={numberInput}
        placeholder="Enter number of fish..."
        onChange={handleInputChange}
        onSubmit={handleLevelAdvance}
      />
      {typeof window !== 'undefined' && (
        <FishTank maxFish={maxFish} fishCount={fishCount} setFishCount={setFishCount} />
      )}
      <div className="fixed top-0 left-0 h-screen w-screen bg-blue-500/30 pointer-events-none" />
    </>
  )
}

const FishTank = ({
  fishCount,
  setFishCount,
  maxFish,
}: {
  fishCount: number
  setFishCount: React.Dispatch<React.SetStateAction<number>>
  maxFish: number
}) => {
  const intervalRef = useRef<NodeJS.Timeout>(null)

  //resets the game
  useEffect(() => {
    if (fishCount === 0 && intervalRef.current) clearInterval(intervalRef.current)
  }, [fishCount])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const increase = Math.random() < 0.2 ? 2 : 1
      setFishCount((count) => count + increase)
    }, 500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fishCount, setFishCount])

  useEffect(() => {
    if (maxFish <= fishCount && intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [fishCount, maxFish])

  return Array.from({ length: fishCount }).map((_, idx) => <Fish key={idx} />)
}

const FishOptions = [
  'Anchovy',
  'Angelfish',
  'Bass',
  'Catfish',
  'Clownfish',
  'Pufferfish',
  'Surgeonfish',
]
const Fish = () => {
  const { initialPosition, isLeft } = useMemo(() => getInitialPosition(), [])
  const [position, setPosition] = useState<{ x: number; y: number }>(initialPosition)
  const [fishType, setFishType] = useState<string>()

  useEffectInitializer(() => {
    setFishType(FishOptions[Math.floor(Math.random() * FishOptions.length)])
  }, [])

  useEffect(() => {
    if (isLeft === undefined) return
    const interval = setInterval(() => {
      const oldX = position.x
      const oldY = position.y

      const upOrDown = Math.random()

      let newX
      let newY
      const moveMagnitude = Math.random() * (600 - 200) + 200
      if (!isLeft) {
        newX = oldX - moveMagnitude
      } else newX = oldX + moveMagnitude

      if (upOrDown < 0.5) {
        newY = oldY - moveMagnitude
      } else newY = oldY + moveMagnitude
      const clamped = clampPositionsToScreen(newX, newY, 20, 20)
      setPosition({ x: newX, y: clamped.newY })
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [isLeft, position])

  if (!fishType) return
  return (
    <Image
      src={`/thirty-factor-authentication/fish/${fishType}.png`}
      alt={fishType || 'fish'}
      height={48}
      width={48}
      className={classNames('fixed transition-all duration-1000', { 'rotate-y-180': !isLeft })}
      style={{ top: position.y, left: position.x }}
    />
  )
}

const getInitialPosition = () => {
  let x: number
  const isLeft = Math.random() > 0.5
  if (isLeft) {
    x = -50
  } else {
    x = window.innerWidth
  }
  const y = Math.random() * window.innerHeight
  return { initialPosition: { x, y }, isLeft }
}

export const AquariumControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
