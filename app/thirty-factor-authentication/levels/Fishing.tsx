import { useCallback, useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

const playAreaHeight = 300
const rodHeight = 75
export const FishingContent = ({ handleLevelAdvance }: ContentProps) => {
  const [fishPosition, setFishPosition] = useState(0)
  const [rodPosition, setRodPosition] = useState(0)
  const [progress, setProgress] = useState(40)
  const ticksSinceLastSpace = useRef(2)

  useEffect(() => {
    const interval = setInterval(() => {
      const oldY = fishPosition

      let newY
      const upOrDown = Math.random()
      const shouldSpikeMovement = Math.random()
      const moveMagnitude = shouldSpikeMovement < 0.05 ? 10 * Math.random() * (25 - 15) + 15 : 10

      if ((upOrDown < 0.5 || oldY > playAreaHeight - 50) && oldY > 50) {
        newY = oldY - moveMagnitude //move up
      } else newY = oldY + moveMagnitude //move down

      if (newY < 0) newY = 0
      if (newY > playAreaHeight - 25) newY = playAreaHeight - 25
      setFishPosition(newY)
      if (ticksSinceLastSpace.current === 0)
        setRodPosition((position) => {
          const newPosition = position - 15
          if (newPosition < 0) return 0
          return newPosition
        })
      else ticksSinceLastSpace.current = ticksSinceLastSpace.current - 1

      if (fishPosition > rodPosition && fishPosition < rodPosition + rodHeight) {
        setProgress((progress) => progress + 0.5)
      } else if (progress > 0) {
        setProgress((progress) => progress - 0.5)
      }
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [fishPosition, progress, rodPosition])

  useEffect(() => {
    if (progress >= 100) handleLevelAdvance(true)
    if (progress <= 0) {
      setFishPosition(0)
      setRodPosition(0)
      setProgress(40)
      handleLevelAdvance()
    }
  }, [progress, handleLevelAdvance])

  const handleRodMove = useCallback((event: KeyboardEvent) => {
    if (event.code.toLocaleLowerCase() !== 'space') return
    ticksSinceLastSpace.current = 2
    setRodPosition((position) => {
      const newPosition = position + 10
      if (newPosition > playAreaHeight - rodHeight) return playAreaHeight - rodHeight
      return newPosition
    })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleRodMove)
    return () => {
      window.removeEventListener('keydown', handleRodMove)
    }
  }, [handleRodMove])

  return (
    <>
      <p className="text-lg">Take a load off and catch a Fish.</p>
      <p className="text-lg">Hold SPACE to raise your lure.</p>
      <p className="text-lg">Keep the lure on the fish to catch it.</p>
      <div className="mt-8 flex gap-2 justify-center">
        <div
          className="relative w-8 outline-6 outline-amber-800 rounded-md bg-blue-300"
          style={{ height: playAreaHeight }}
        >
          <div
            className="absolute bg-green-500 w-full rounded-lg transition-all bottom-0"
            style={{ transform: `translateY(-${rodPosition}px)`, height: rodHeight }}
          />
          <Image
            src={`/thirty-factor-authentication/fish/Anchovy.png`}
            alt={'fish'}
            height={32}
            width={32}
            className="absolute rotate-y-180 -rotate-z-45 transition-all"
            style={{ bottom: fishPosition }}
          />
        </div>
        <div className="relative w-3 border-2 rounded-lg" style={{ height: playAreaHeight }}>
          <div
            className="absolute bottom-0 w-full bg-yellow-300 rounded-lg origin-bottom transition-all"
            style={{ height: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </>
  )
}

export const FishingControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
