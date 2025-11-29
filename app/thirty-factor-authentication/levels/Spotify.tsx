import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clampPositionsToScreen } from '../utils'
import classNames from 'classnames'

const cadences = [
  { count: 5, delay: 750 },
  { count: 5, delay: 500 },
  { count: 10, delay: 750 },
  { count: 10, delay: 500 },
  { count: 5, delay: 600 },
  { count: 5, delay: 500 },
]

type Position = { x: number; y: number }
export const Spotify = ({
  handleLevelAdvance,
}: {
  handleLevelAdvance: (skipVerify?: boolean) => void
}) => {
  const maxRythym = useMemo(() => cadences.reduce((acc, curr) => acc + curr.count, 0), [])
  const [rythymCount, setRhythymCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const [previousPosition, setPreviousPosition] = useState<Position | null>(null)
  const [colorIndex, setColorIndex] = useState(0)

  const resetGame = useCallback(() => {
    setRhythymCount(0)
    setIsStarted(false)
    handleLevelAdvance()
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [handleLevelAdvance])

  //takes the list of Cadences and smartly spawns them based on their delays
  useEffect(() => {
    if (!isStarted) return
    let cancelled = false
    let totalCount = 0

    let workingDelay: number | null = null
    const run = () => {
      if (cancelled) return

      setRhythymCount((c) => c + 1)
      totalCount++

      let delay = cadences[cadences.length - 1].delay

      let remaining = totalCount

      for (const step of cadences) {
        if (remaining <= step.count) {
          delay = step.delay
          //the cadence has changed
          if (delay !== workingDelay) {
            setPreviousPosition(null)
            setColorIndex((idx) => idx + 1)
          }
          workingDelay = delay
          break
        }
        remaining -= step.count
      }
      setTimeout(run, delay)
    }
    run()

    return () => {
      cancelled = true
    }
  }, [isStarted])

  useEffect(() => {
    if (maxRythym == rythymCount && intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [rythymCount, maxRythym])

  const color = colorHexArray[colorIndex % colorHexArray.length]
  return (
    <>
      <p className="text-lg">
        To verify yourself as a Spotify user, please complete this Rhythm challenge.
      </p>
      <p className="italic">
        *Playtesting Note:* Soundtrack for this level is still in development.
      </p>
      <div className="w-full flex justify-center mt-4">
        <button
          className={classNames('border-2 py-1 px-3 rounded-md cursor-pointer auth-button', {
            'opacity-0': isStarted,
          })}
          onClick={() => setIsStarted(true)}
        >
          Start
        </button>
      </div>
      {Array.from({ length: rythymCount }).map((_, idx) => (
        <RythymPad
          key={idx}
          number={idx + 1}
          resetGame={resetGame}
          previousPosition={previousPosition}
          setPreviousPosition={setPreviousPosition}
          color={color}
          handleWin={() => {
            if (idx + 1 === maxRythym) {
              handleLevelAdvance(true)
              if (intervalRef.current) clearInterval(intervalRef.current)
            }
          }}
        />
      ))}
    </>
  )
}

const getRandomPosition = () => {
  const halfwayDown = window.innerHeight / 2
  const height = window.innerHeight
  const y = Math.random() * (height - halfwayDown - 200) + halfwayDown - 200
  const maxX = window.innerWidth / 2 + 200
  const minxX = window.innerWidth / 2 - 200
  const x = Math.random() * (maxX - minxX) + minxX
  const { newX, newY } = clampPositionsToScreen(x, y, 200, 200)
  return { x: newX, y: newY }
}

const getRelativePosition = (position: Position) => {
  const magnitude = 75
  const y = Math.random() > 0.5 ? position.y + magnitude : position.y - magnitude
  const x = Math.random() > 0.5 ? position.x + magnitude : position.x - magnitude
  const { newX, newY } = clampPositionsToScreen(x, y, 200, 200)
  return { x: newX, y: newY }
}

const RythymPad = ({
  number,
  previousPosition,
  color,
  setPreviousPosition,
  resetGame,
  handleWin,
}: {
  number: number
  previousPosition: Position | null
  color: string
  setPreviousPosition: (pos: Position | null) => void
  resetGame: () => void
  handleWin: () => void
}) => {
  const [isCleared, setIsCleared] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)

  useEffect(() => {
    //makes its position a random position
    if (!previousPosition) {
      const position = getRandomPosition()
      setPreviousPosition(position)
      setPosition(position)
    } else {
      //makes its position relative to the previous position
      const relativePosition = getRelativePosition(previousPosition)
      setPreviousPosition(relativePosition)
      setPosition(relativePosition)
    }
  }, [])

  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (timeoutRef.current) return
    const id = setTimeout(() => {
      resetGame()
    }, 1000)

    timeoutRef.current = id

    return () => {
      clearTimeout(id)
      timeoutRef.current = null
    }
  }, [resetGame])

  const handleClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsCleared(true)
    handleWin()
    const audio = new Audio('thirty-factor-authentication/sounds/osu-click.mp3')
    audio.play()
  }

  if (!position) return null
  return (
    <>
      <div
        onClick={handleClick}
        style={{ left: position.x, top: position.y, backgroundColor: color, outlineColor: color }}
        className={classNames(
          'fixed  h-20 w-20 border-6 outline-2 border-black flex items-center justify-center rounded-full osu-outline cursor-pointer',
          { 'opacity-0 transition-opacity duration-500 pointer-events-none': isCleared }
        )}
      >
        <p className="mono text-3xl text-white select-none">{number}</p>
      </div>
    </>
  )
}

const colorHexArray = ['#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#9ca3af']
