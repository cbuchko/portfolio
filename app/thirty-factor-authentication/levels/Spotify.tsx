import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clampPositionsToScreen } from '../utils'
import classNames from 'classnames'
import { useSound } from '@/app/utils/useSounds'

type RythymPadType = {
  number: number
  delayInMs: number
  color: string
}

const colorHexArray = ['#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#9ca3af']
const fullTimeQuarter = 389.61
const halfTimeQuarter = 779.221
const cadences = [
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[1] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[2] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[3] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[4] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[5] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: halfTimeQuarter, color: colorHexArray[1] },
  { count: 7, delay: halfTimeQuarter, color: colorHexArray[2] },
  { count: 15, delay: fullTimeQuarter, color: colorHexArray[3] },
  { count: 17, delay: fullTimeQuarter, color: colorHexArray[4] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[5] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[0] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[1] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[2] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[3] },
  { count: 5, delay: fullTimeQuarter, color: colorHexArray[4] },
]

type Position = { x: number; y: number }
export const Spotify = ({
  handleLevelAdvance,
}: {
  handleLevelAdvance: (skipVerify?: boolean) => void
}) => {
  const maxRythym = useMemo(() => cadences.reduce((acc, curr) => acc + curr.count, 0), [])
  const [rhythmPads, setRhythmPads] = useState<RythymPadType[]>([])
  const cadenceIndexRef = useRef(0)
  const [isStarted, setIsStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const [previousPosition, setPreviousPosition] = useState<Position | null>(null)
  const { playSound: playSoundtrack } = useSound(
    '/thirty-factor-authentication/sounds/open-the-sky.mp3',
    0.15,
    true
  )

  const resetGame = useCallback(() => {
    setRhythmPads([])
    setIsStarted(false)
    handleLevelAdvance()
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [handleLevelAdvance])

  //takes the list of Cadences and smartly spawns them based on their delays
  useEffect(() => {
    if (!isStarted) return
    let cancelled = false

    let innerCadenceCount = 0
    const run = () => {
      if (cancelled) return
      const { delay, color, count } = cadences[cadenceIndexRef.current]

      if (innerCadenceCount === 0) {
        setPreviousPosition(null)
      }
      if (innerCadenceCount < count) {
        innerCadenceCount++
      }

      setRhythmPads((pads) => [
        ...pads,
        { delayInMs: delay, number: innerCadenceCount === 0 ? count : innerCadenceCount, color },
      ])

      if (innerCadenceCount === count) {
        cadenceIndexRef.current = cadenceIndexRef.current + 1
        innerCadenceCount = 0
      }

      setTimeout(run, delay)
    }
    run()

    return () => {
      cancelled = true
    }
  }, [isStarted])

  return (
    <>
      <p className="text-lg">
        To verify yourself as a Spotify user, please complete this Rhythm challenge.
      </p>
      <p className="text-lg">Click the pads as they appear to win.</p>
      <div className="w-full flex justify-center mt-4">
        <button
          className={classNames('border-2 py-1 px-3 rounded-md cursor-pointer auth-button', {
            'opacity-0': isStarted,
          })}
          onClick={() => {
            setIsStarted(true)
            playSoundtrack()
          }}
        >
          Start
        </button>
      </div>
      {rhythmPads.map((pad, idx) => (
        <RythymPad
          key={idx}
          number={pad.number}
          delayInMs={pad.delayInMs}
          resetGame={resetGame}
          previousPosition={previousPosition}
          setPreviousPosition={setPreviousPosition}
          color={pad.color}
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

const padSize = 100
const RythymPad = ({
  number,
  delayInMs,
  previousPosition,
  color,
  setPreviousPosition,
  resetGame,
}: {
  number: number
  delayInMs: number
  previousPosition: Position | null
  color: string
  setPreviousPosition: (pos: Position | null) => void
  resetGame: () => void
  handleWin: () => void
}) => {
  const [isCleared, setIsCleared] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const { playSound: playClickSound } = useSound(
    'thirty-factor-authentication/sounds/osu-click.mp3',
    0.25
  )

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
      //MISS
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsCleared(true)
    }, delayInMs + 200)

    timeoutRef.current = id

    return () => {
      clearTimeout(id)
      timeoutRef.current = null
    }
  }, [resetGame])

  const handleClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsCleared(true)
    // handleWin()
    playClickSound()
  }

  if (!position) return null
  return (
    <>
      <div
        onClick={handleClick}
        onPointerDown={handleClick}
        style={{
          left: position.x,
          top: position.y,
          backgroundColor: color,
          outlineColor: color + '33',
          width: padSize,
          height: padSize,
          animation: `osu-outline ${delayInMs}ms linear`,
        }}
        className={classNames(
          'fixed border-6 outline-8 border-black flex items-center justify-center rounded-full osu-outline cursor-pointer z-100',
          { 'opacity-0 transition-opacity duration-500 pointer-events-none': isCleared }
        )}
      >
        <p className="mono text-4xl text-white select-none pointer-events-none">{number}</p>
      </div>
    </>
  )
}
