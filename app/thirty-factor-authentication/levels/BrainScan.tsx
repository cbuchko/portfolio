import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'
import Image from 'next/image'

export const BrainScanContent = ({ handleLevelAdvance, validateAdvance }: ContentProps) => {
  const startRef = useRef<HTMLImageElement>(null)
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>()
  const [health, setHealth] = useState(100)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const isDead = health <= 0
  useEffect(() => {
    if (isDead) {
      handleLevelAdvance()
      setIsStarted(false)
      setIsCompleted(false)
      setHealth(100)
    }
    if (isCompleted) validateAdvance()
  }, [isDead, isCompleted, handleLevelAdvance, validateAdvance])

  //start and time the game
  useEffect(() => {
    if (health !== 100) return
    const timeout = setTimeout(() => {
      setIsStarted(true)
      setInterval(() => {
        setIsCompleted(true)
      }, 1000 * 60)
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [health])

  useEffect(() => {
    if (startRef.current && !startPosition) {
      const rect = startRef.current.getBoundingClientRect()
      setStartPosition({ x: rect.left, y: rect.top + 300 })
    }
  }, [startPosition])

  return (
    <>
      <p className="text-lg">
        To finish Biometric Authentication, we need to retrieve your brain implant.
      </p>
      <p className="text-lg">{`This shouldn't hurt as long as you stay in the zone.`}</p>
      {startPosition && isStarted && !isCompleted && (
        <Scanner
          setHealth={setHealth}
          isProgressing={health > 0}
          startPosition={startPosition}
          isComplete={isDead}
        />
      )}
      <div className="flex gap-4 items-center mt-5">
        <Image
          ref={startRef}
          className="h-[50px] w-[50px]"
          src="/thirty-factor-authentication/icons/heart.png"
          alt="heart"
          width={50}
          height={50}
        />
        <div className="w-full h-8 border  justify-self-end rounded-md">
          <div
            className={classNames('bg-red-400 h-full rounded-md')}
            style={{ width: `${Math.min(health, 100)}%` }}
          />
        </div>
      </div>
      {isStarted && !isCompleted && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-red-500/40 " />
      )}
    </>
  )
}

const Scanner = ({
  startPosition,
  isProgressing,
  isComplete,
  isDead,
  setHealth,
}: {
  startPosition: { x: number; y: number }
  isProgressing?: boolean
  isComplete?: boolean
  isDead?: boolean
  setHealth: React.Dispatch<React.SetStateAction<number>>
}) => {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(startPosition)
  const [isOver, setIsOver] = useState(false)

  if (isComplete && position !== startPosition) {
    setPosition(startPosition)
  }

  useEffect(() => {
    if (isComplete || isDead) return

    const interval = setInterval(() => {
      const { innerWidth, innerHeight } = window
      const oldX = position.x
      const oldY = position.y

      // determine current quadrant
      const midX = innerWidth / 2
      const midY = innerHeight / 2

      let currentQuadrant = 1
      if (oldX >= midX && oldY < midY) currentQuadrant = 2
      else if (oldX < midX && oldY >= midY) currentQuadrant = 3
      else if (oldX >= midX && oldY >= midY) currentQuadrant = 4

      // choose a DIFFERENT quadrant
      const otherQuadrants = [1, 2, 3, 4].filter((q) => q !== currentQuadrant)
      const chosenQuadrant = otherQuadrants[Math.floor(Math.random() * otherQuadrants.length)]

      // pick a random point in that quadrant
      let newX, newY
      switch (chosenQuadrant) {
        case 1:
          newX = Math.random() * midX
          newY = Math.random() * midY
          break
        case 2:
          newX = midX + Math.random() * midX
          newY = Math.random() * midY
          break
        case 3:
          newX = Math.random() * midX
          newY = midY + Math.random() * midY
          break
        case 4:
        default:
          newX = midX + Math.random() * midX
          newY = midY + Math.random() * midY
          break
      }

      // apply padding (50x50 hitbox)
      const { newX: clampedX, newY: clampedY } = clampPositionsToScreen(newX, newY, 50, 50)

      setPosition({ x: clampedX, y: clampedY })
    }, 2000)

    return () => clearInterval(interval)
  }, [isComplete, isDead, position])

  //interval for health damage
  useEffect(() => {
    if (isOver || isComplete) {
      return
    }

    const interval = setInterval(() => {
      setHealth((prevHealth) => prevHealth - 0.4)
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [isOver, isComplete, position, setHealth])

  return (
    <div
      ref={scannerRef}
      className={classNames('fixed h-[50px] w-[50px] border-4 border-red-400 bg-white z-100', {
        '': !isOver,
      })}
      style={{
        left: position.x === 0 && !isProgressing ? 'auto' : position.x,
        top: position.y === 0 && !isProgressing ? 'auto' : position.y,
      }}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
    />
  )
}

export const BrainScanControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Continue
      </button>
    </>
  )
}
