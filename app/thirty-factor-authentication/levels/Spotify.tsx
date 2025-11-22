import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clampPositionsToScreen } from '../utils'
import classNames from 'classnames'

const maxRythym = 40
export const Spotify = ({
  handleLevelAdvance,
}: {
  handleLevelAdvance: (skipVerify?: boolean) => void
}) => {
  const [rythymCount, setRhythymCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const resetGame = useCallback(() => {
    setRhythymCount(0)
    setIsStarted(false)
    handleLevelAdvance()
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!isStarted) return
    intervalRef.current = setInterval(() => {
      setRhythymCount((count) => count + 1)
    }, 750)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [maxRythym, isStarted])

  useEffect(() => {
    if (maxRythym == rythymCount && intervalRef.current) {
      clearInterval(intervalRef.current)
      handleLevelAdvance(true)
    }
  }, [rythymCount, maxRythym])

  return (
    <>
      <div>To verify yourself as a Spotify user, please complete this Rhythym challenge.</div>
      <div className="w-full flex justify-center mt-4">
        <button
          className="border-2 py-1 px-3 rounded-md cursor-pointer"
          onClick={() => setIsStarted(true)}
        >
          Start
        </button>
      </div>
      {Array.from({ length: rythymCount }).map((_, idx) => (
        <RythymPad key={idx} number={idx + 1} resetGame={resetGame} />
      ))}
    </>
  )
}

const getRandomPosition = () => {
  const halfwayDown = window.innerHeight / 2
  const height = window.innerHeight
  const y = Math.random() * (height - halfwayDown) + halfwayDown - 200
  const x = Math.random() * (window.innerWidth - 200 - 200) + 200
  const { newX, newY } = clampPositionsToScreen(x, y, 200, 200)
  return { x: newX, y: newY }
}

const RythymPad = ({ number, resetGame }: { number: number; resetGame: () => void }) => {
  const [isCleared, setIsCleared] = useState(false)
  const position = useMemo(() => getRandomPosition(), [])
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (timeoutRef.current) return
    const id = setTimeout(() => {
      resetGame()
    }, 2000)

    timeoutRef.current = id

    return () => {
      clearTimeout(id)
      timeoutRef.current = null
    }
  }, [resetGame])

  const handleClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsCleared(true)
  }

  const backgroundColor = `bg-${colorOptions[number % colorOptions.length]}`
  const outlineColor = `outline-${colorOptions[number % colorOptions.length]}`
  return (
    <>
      <div
        onClick={handleClick}
        style={{ left: position.x, top: position.y }}
        className={classNames(
          'fixed top-20 left-20 h-20 w-20 border-6 outline-2 border-black flex items-center justify-center rounded-full osu-outline cursor-pointer',
          { 'opacity-0 transition-opacity duration-500 pointer-events-none': isCleared },
          backgroundColor,
          outlineColor
        )}
      >
        <p className="mono text-3xl text-white select-none">{number}</p>
      </div>
    </>
  )
}

const colorOptions = ['orange-400', 'yellow-400', 'green-400', 'blue-400', 'purple-400', 'gray-400']
