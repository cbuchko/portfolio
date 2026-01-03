import { useRef, useState } from 'react'
import { ContentProps } from './types'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { arraysEqual } from '../utils'
import Image from 'next/image'
import { useSound } from '@/app/utils/useSounds'
import { ModalContainer } from '@/app/idle_game/menus/ModalContainer'

const answerLength = 4
const generateAnswer = () => {
  const answer = []
  const colorArray = Object.values(Colors)

  for (let i = 0; i < answerLength; i++) {
    answer[i] = colorArray[Math.floor(Math.random() * colorArray.length)]
  }
  return answer
}

const maxAttempts = 8
export const MastermindContent = ({ handleLevelAdvance }: ContentProps) => {
  const answerRef = useRef<Colors[]>([])
  const [attemptCount, setAttemptCount] = useState(1)
  const [selectedBall, setSelectedBall] = useState<Colors>()
  const [isGameOver, setIsGameOver] = useState(false)
  const [isShowingHelp, setIsShowingHelp] = useState(false)

  useEffectInitializer(() => {
    answerRef.current = generateAnswer()
  }, [])

  const resetGame = () => {
    answerRef.current = generateAnswer()
    setAttemptCount(1)
    setSelectedBall(undefined)
    setIsGameOver(false)
    handleLevelAdvance()
  }

  return (
    <>
      <p className="text-lg mb-4">
        Crack the code in {maxAttempts} attempts or less.
        <span
          className="underline cursor-pointer ml-3 text-sm"
          onClick={() => setIsShowingHelp(true)}
        >
          Help
        </span>
      </p>
      <div key={answerRef.current.join('')}>
        {Array.from({ length: attemptCount }).map((_, idx) => (
          <MasterMindRow
            key={idx}
            selectedBall={selectedBall}
            isCurrent={idx + 1 === attemptCount && !isGameOver}
            setAttemptCount={setAttemptCount}
            answer={answerRef.current}
            attemptCount={attemptCount}
            handleLevelAdvance={handleLevelAdvance}
            setIsGameOver={setIsGameOver}
          />
        ))}
      </div>
      <MasterMindBalls selectedBall={selectedBall} setSelectedBall={setSelectedBall} />
      {isGameOver && <Answer answer={answerRef.current} resetGame={resetGame} />}
      {isShowingHelp && <HelpModal setIsShowingHelp={setIsShowingHelp} />}
    </>
  )
}

type Hints = {
  correct: number
  close: number
  wrong: number
}

const MasterMindRow = ({
  selectedBall,
  isCurrent,
  answer,
  attemptCount,
  setAttemptCount,
  handleLevelAdvance,
  setIsGameOver,
}: {
  selectedBall?: Colors
  isCurrent?: boolean
  answer: Colors[]
  attemptCount: number
  setAttemptCount: React.Dispatch<React.SetStateAction<number>>
  handleLevelAdvance: (skipVerify?: boolean) => void
  setIsGameOver: (val: boolean) => void
}) => {
  const [currentGuess, setCurrentGuess] = useState<(Colors | undefined)[]>(
    Array.from({ length: 4 })
  )
  const [hints, setHints] = useState<Hints>()

  const isGuessReady =
    currentGuess.length === answerLength && currentGuess.every((guess) => !!guess)

  const submitGuess = () => {
    if (!isGuessReady) return
    if (arraysEqual(answer, currentGuess)) {
      handleLevelAdvance(true)
      return
    }
    if (attemptCount >= maxAttempts) {
      setIsGameOver(true)
    } else {
      setAttemptCount((c) => c + 1)
    }

    const localHints: Hints = { correct: 0, close: 0, wrong: 0 }
    const usedAnswer = Array(answer.length).fill(false)
    const usedGuess = Array(currentGuess.length).fill(false)

    // first pass for correct guesses
    for (let i = 0; i < answer.length; i++) {
      if (currentGuess[i] === answer[i]) {
        localHints.correct = localHints.correct + 1
        usedAnswer[i] = true
        usedGuess[i] = true
      }
    }

    // second pass for close guesses
    for (let i = 0; i < currentGuess.length; i++) {
      if (usedGuess[i]) continue

      const guess = currentGuess[i]
      const matchIndex = answer.findIndex((a, idx) => a === guess && !usedAnswer[idx])

      if (matchIndex !== -1) {
        localHints.close = localHints.close + 1
        usedAnswer[matchIndex] = true
        usedGuess[i] = true
      }
    }

    setHints(localHints)
  }

  const handleBallPlacement = (color: Colors, index: number) => {
    setCurrentGuess((guess) => {
      const newGuess = new Array(...guess)
      newGuess[index] = color
      return newGuess
    })
  }

  return (
    <div className={classNames('flex items-center gap-4')}>
      <div
        className={classNames('outline flex items-center  w-max py-2', {
          'pointer-events-none opacity-75': !isCurrent,
        })}
      >
        {Array.from({ length: answerLength }).map((_, idx) => (
          <MasterMindHole
            key={idx}
            selectedBall={selectedBall}
            handleBallPlacement={(color) => handleBallPlacement(color, idx)}
          />
        ))}
      </div>
      {hints && <MasterMindClue hints={hints} />}
      {isCurrent && (
        <div className="w-full flex justify-center">
          <button
            onClick={submitGuess}
            className={classNames('auth-button', {
              '!border-2 !border-amber-500': isGuessReady,
            })}
            disabled={!isGuessReady}
          >
            Guess
          </button>
        </div>
      )}
    </div>
  )
}

const MasterMindHole = ({
  defaultColor,
  selectedBall,
  handleBallPlacement,
}: {
  defaultColor?: Colors
  selectedBall?: Colors
  handleBallPlacement?: (color: Colors) => void
}) => {
  const { playSound } = useSound('/thirty-factor-authentication/sounds/place.mp3')
  const [color, setColor] = useState<Colors | undefined>(defaultColor)

  const onBallPlacement = () => {
    if (!selectedBall || !handleBallPlacement) return
    setColor(selectedBall)
    handleBallPlacement(selectedBall)
    playSound()
  }

  return (
    <div onClick={onBallPlacement} className={'h-16 w-16 flex items-center justify-center'}>
      <div
        className={classNames(
          'h-6 w-6 rounded-full',
          !!color ? balls[color].colorClass : 'bg-gray-700',
          {
            'cursor-pointer': !!selectedBall,
            'border-2': !!color,
            'border-2 border-amber-500': !!selectedBall && !color,
          }
        )}
      />
    </div>
  )
}

const MasterMindClue = ({ hints }: { hints: Hints }) => {
  return (
    <div className="flex flex-col gap-0.5 ml-4">
      <div className="flex items-center">
        <Image
          src="/thirty-factor-authentication/icons/green-checkmark.svg"
          alt="checkmark"
          height={12}
          width={12}
        />
        <h5 className="text-xs ml-2 mono">{hints.correct}</h5>
      </div>
      <div className="flex items-center">
        <div className="text-amber-500 w-3 h-3 flex items-center justify-center font-bold">?</div>
        <h5 className="text-xs ml-2 mono">{hints.close}</h5>
      </div>
      <div className="flex items-center">
        <Image
          src="/thirty-factor-authentication/icons/red-x.svg"
          alt="checkmark"
          height={12}
          width={12}
        />
        <h5 className="text-xs ml-2 mono">{answerLength - hints.close - hints.correct}</h5>
      </div>
    </div>
  )
}

const MasterMindBalls = ({
  selectedBall,
  setSelectedBall,
}: {
  selectedBall?: Colors
  setSelectedBall: (color?: Colors) => void
}) => {
  return (
    <div
      className={classNames('outline items-center w-full p-4 mt-4 flex flex-col gap-4', {
        'outline-amber-400 outline-2': !selectedBall,
      })}
    >
      <div className="flex items-center w-full justify-evenly">
        {Object.entries(balls).map(([key, ball]) => {
          return (
            <div
              key={key}
              onClick={() => setSelectedBall(key === selectedBall ? undefined : (key as Colors))}
              className={classNames(
                'h-6 w-6 rounded-full border shadow-lg cursor-pointer',
                { 'border-2': selectedBall === key },
                ball.colorClass
              )}
            />
          )
        })}
      </div>
      {!selectedBall && <div>Select a Color</div>}
      {selectedBall && <div className="capitalize">{selectedBall} Selected</div>}
    </div>
  )
}

const Answer = ({ answer, resetGame }: { answer: Colors[]; resetGame: () => void }) => {
  return (
    <>
      <h5 className="mt-4">No attempts remaining. The code was:</h5>
      <div className="flex items-center">
        {answer.map((color, idx) => (
          <MasterMindHole key={idx} defaultColor={color} />
        ))}
        <button className="auth-button ml-4" onClick={resetGame}>
          Reset
        </button>
      </div>
    </>
  )
}

const HelpModal = ({
  setIsShowingHelp,
}: {
  setIsShowingHelp: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <ModalContainer setActiveModal={() => setIsShowingHelp((val) => !val)}>
      <div className="text-2xl mt-2">How to Play</div>
      <ul className="list-disc ml-4 mt-2">
        <li>The computer has chosen a secret code of 4 colors</li>
        <li>You have 6 different colors to choose from</li>
        <li>Colors can repeat in the code</li>
        <li>Select a color from the palette, then click a position to place it</li>
        <li>After placing 4 colors, click Guess to see how close you are to the real code</li>
      </ul>
      <div className="mt-3">Guessing will give you feedback:</div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center">
          <Image
            src="/thirty-factor-authentication/icons/green-checkmark.svg"
            alt="checkmark"
            height={16}
            width={16}
          />
          <h5 className="text-sm ml-2">Number of colors in the correct position</h5>
        </div>
        <div className="flex items-center">
          <div className="text-amber-500 w-4 h-4 flex items-center justify-center font-bold">?</div>
          <h5 className="text-sm ml-2">Number of correct colors in the wrong position</h5>
        </div>
        <div className="flex items-center">
          <Image
            src="/thirty-factor-authentication/icons/red-x.svg"
            alt="checkmark"
            height={16}
            width={16}
          />
          <h5 className="text-sm ml-2">Number of colors that are not in the code</h5>
        </div>
        <div className="mt-3">Use the feedback to deduce the code</div>
      </div>
    </ModalContainer>
  )
}

enum Colors {
  red = 'red',
  yellow = 'yellow',
  orange = 'orange',
  blue = 'blue',
  green = 'green',
  purple = 'purple',
}

const balls: Record<Colors, { colorClass: string }> = {
  [Colors.red]: { colorClass: 'bg-red-500' },
  [Colors.orange]: { colorClass: 'bg-orange-500' },
  [Colors.yellow]: { colorClass: 'bg-yellow-500' },
  [Colors.green]: { colorClass: 'bg-green-500' },
  [Colors.blue]: { colorClass: 'bg-blue-500' },
  [Colors.purple]: { colorClass: 'bg-purple-500' },
}
