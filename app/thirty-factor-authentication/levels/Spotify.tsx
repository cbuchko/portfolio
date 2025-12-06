import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clampPositionsToScreen } from '../utils'
import classNames from 'classnames'
import { useSound } from '@/app/utils/useSounds'
import { ContentProps, ControlProps } from './types'

type RythymPadType = {
  number: number
  delayInMs: number
  color: string
}

const colorHexArray = ['#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#9ca3af']
const fullTimeQuarter = 389.61
const halfTimeQuarter = 779.221

const greatScore = 200
const goodScore = 100
const okScore = 50

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
export const SpotifyContent = ({ handleLevelAdvance, validateAdvance }: ContentProps) => {
  const maxRythym = useMemo(() => cadences.reduce((acc, curr) => acc + curr.count, 0), [])
  const [rhythmPads, setRhythmPads] = useState<RythymPadType[]>([])
  const cadenceIndexRef = useRef(0)
  const [isStarted, setIsStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const [previousPosition, setPreviousPosition] = useState<Position | null>(null)
  const { playSound: playSoundtrack, stopSound: stopSoundtrack } = useSound(
    '/thirty-factor-authentication/sounds/open-the-sky.mp3',
    0.15,
    true
  )
  const [score, setScore] = useState(0)
  const padAmount = rhythmPads.length

  //must get the equivalent of 75% greats and 25% goods
  const scoreThreshold = useMemo(() => {
    return Math.floor(maxRythym * 0.75 * greatScore + maxRythym * 0.25 * goodScore)
  }, [maxRythym])

  const resetGame = useCallback(() => {
    setRhythmPads([])
    setIsStarted(false)
    stopSoundtrack()
    setPreviousPosition(null)
    cadenceIndexRef.current = 0
    if (intervalRef.current) clearInterval(intervalRef.current)
    const hasWon = score >= scoreThreshold
    if (!hasWon) handleLevelAdvance()
    else validateAdvance()
  }, [handleLevelAdvance, stopSoundtrack, score])

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

  useEffect(() => {
    if (padAmount >= maxRythym) {
      resetGame()
    }
  }, [padAmount, resetGame])

  return (
    <>
      <p className="text-lg">Please complete this Rhythm challenge.</p>
      <p className="text-lg">
        Click on the pads to score points. Score at least {scoreThreshold} points to win!
      </p>
      <p className="text-lg"></p>
      <p className="text-2xl mono mt-4">Score: {score}</p>
      <div className="w-full flex justify-center mt-4">
        <button
          className={classNames('border-2 py-1 px-3 rounded-md cursor-pointer auth-button', {
            'opacity-0': isStarted,
          })}
          onClick={() => {
            setIsStarted(true)
            playSoundtrack()
            setScore(0)
          }}
        >
          {score > 0 ? 'Restart' : 'Start'}
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
          setScore={setScore}
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

enum Score {
  miss = 'miss',
  ok = 'ok',
  good = 'good',
  great = 'great',
}

const padSize = 100
const RythymPad = ({
  number,
  delayInMs,
  previousPosition,
  color,
  setPreviousPosition,
  setScore,
  resetGame,
}: {
  number: number
  delayInMs: number
  previousPosition: Position | null
  color: string
  setPreviousPosition: (pos: Position | null) => void
  setScore: React.Dispatch<React.SetStateAction<number>>
  resetGame: () => void
  handleWin: () => void
}) => {
  const [isCleared, setIsCleared] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const { playSound: playClickSound } = useSound(
    'thirty-factor-authentication/sounds/osu-click.mp3',
    0.25
  )
  const [scoreDisplay, setScoreDisplay] = useState<Score | null>(null)
  const padLifeTimeRef = useRef(new Date().getTime())

  //setScore and clear the pad
  const handlePadCleanup = (scoreType: Score) => {
    setScoreDisplay(scoreType)
    setIsCleared(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (scoreType === Score.great) setScore((score) => score + greatScore)
    if (scoreType === Score.good) setScore((score) => score + goodScore)
    if (scoreType === Score.ok) setScore((score) => score + okScore)
  }

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
      handlePadCleanup(Score.miss)
    }, delayInMs + 50)

    timeoutRef.current = id

    return () => {
      clearTimeout(id)
      timeoutRef.current = null
    }
  }, [resetGame, delayInMs])

  const handleClick = () => {
    playClickSound()
    const padSpawnTime = padLifeTimeRef.current
    const currentTime = new Date().getTime()
    const elapsedTime = currentTime - padSpawnTime
    if (elapsedTime >= delayInMs - 20) {
      handlePadCleanup(Score.great)
    } else if (elapsedTime >= delayInMs / 1.5) {
      handlePadCleanup(Score.good)
    } else {
      handlePadCleanup(Score.ok)
    }
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
        <p
          className={classNames(
            'mono text-4xl text-white select-none pointer-events-none uppercase',
            { '!text-2xl font-bold': !!scoreDisplay, '!text-red-500': scoreDisplay === Score.miss }
          )}
        >
          {scoreDisplay || number}
        </p>
      </div>
    </>
  )
}

export const SpotifyControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
