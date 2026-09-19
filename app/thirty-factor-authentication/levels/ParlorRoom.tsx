import { useState } from 'react'
import { ContentProps } from './types'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const selectInitialPuzzleIndex = () => {
  return Math.floor(Math.random() * Statements.length)
}
export const ParlorRoomContent = ({ handleLevelAdvance, setIsLoading, layout }: ContentProps) => {
  const { isNarrow, isCompact, fit } = layout
  const [puzzleIndex, setPuzzleIndex] = useState<number | null>(null)

  useEffectInitializer(() => {
    setPuzzleIndex(selectInitialPuzzleIndex())
    setIsLoading(false)
  }, [])

  const puzzle = Statements[puzzleIndex || 0]
  const onCorrectSelect = (type: 'blue' | 'black' | 'red') => {
    const isSuccess = type === puzzle.solution
    handleLevelAdvance(isSuccess)
    if (!isSuccess) setPuzzleIndex((prevIndex) => ((prevIndex || 0) + 1) % Statements.length)
  }
  return (
    <>
      <p className="text-lg">
        In front of you sits three boxes. Select the box that contains the prize.
      </p>
      <div
        className={classNames('font-bold', {
          'my-4 text-sm': isCompact,
          'my-8 text-lg': !isCompact,
        })}
      >
        <p className={classNames('mono', { 'mb-2': isCompact, 'mb-4': !isCompact })}>RULES:</p>
        <p className="font-bold">
          1. THERE WILL ALWAYS BE AT LEAST ONE BOX WHICH DISPLAYS ONLY TRUE STATEMENTS.
        </p>
        <p className={classNames('font-bold', { 'my-2': isCompact, 'my-4': !isCompact })}>
          2. THERE WILL ALWAYS BE AT LEAST ONE BOX WHICH DISPLAYS ONLY FALSE STATEMENTS.
        </p>
        <p className="font-bold">
          3. ONLY ONE BOX HAS A PRIZE WITHIN. THE OTHER 2 ARE ALWAYS EMPTY.
        </p>
      </div>
      <div
        className={classNames({
          'grid w-full grid-cols-2 gap-2': isNarrow,
          'flex w-full justify-between gap-4 px-4': !isNarrow,
        })}
      >
        <ParlorBox
          color="bg-blue-300"
          statements={puzzle.blueStatements}
          title={'Select Blue'}
          onClick={() => onCorrectSelect('blue')}
          isNarrow={isNarrow}
          fit={fit}
        />
        <ParlorBox
          color="bg-black"
          statements={puzzle.blackStatements}
          title={'Select Black'}
          onClick={() => onCorrectSelect('black')}
          isNarrow={isNarrow}
          fit={fit}
        />
        <ParlorBox
          color="bg-red-300"
          statements={puzzle.redStatements}
          title={'Select Red'}
          onClick={() => onCorrectSelect('red')}
          isNarrow={isNarrow}
          fit={fit}
          className={isNarrow ? 'col-span-2' : undefined}
        />
      </div>
    </>
  )
}

const ParlorBox = ({
  title,
  color,
  statements,
  onClick,
  isNarrow,
  fit,
  className,
}: {
  title: string
  color: string
  statements: string[]
  onClick: () => void
  isNarrow: boolean
  fit: number
  className?: string
}) => {
  const referenceSize = 200
  const boxScale = isNarrow ? 1 : fit
  const boxSize = Math.round(referenceSize * boxScale)
  return (
    <div
      className={classNames(
        'flex flex-col items-stretch',
        {
          'min-w-0 w-full max-w-[150px] justify-self-center': isNarrow,
        },
        className
      )}
      style={isNarrow ? undefined : { width: boxSize }}
    >
      <div className="w-full overflow-hidden" style={isNarrow ? undefined : { height: boxSize }}>
        <div
          className={classNames(
            'flex items-center justify-center border-[#673400] border-3 aspect-square',
            { 'w-full': isNarrow, 'origin-top-left': !isNarrow },
            color
          )}
          style={
            isNarrow
              ? undefined
              : { width: referenceSize, height: referenceSize, transform: `scale(${boxScale})` }
          }
        >
          <div
            className={classNames(
              'flex min-h-0 min-w-0 flex-col justify-center gap-1 overflow-hidden bg-white border-[#673400] text-center uppercase select-none',
              {
                'h-[78%] w-[88%] border-4 px-1 py-1 text-[10px] leading-snug': isNarrow,
                'h-[75%] w-[87.5%] border-6 px-1 py-2 text-sm leading-tight': !isNarrow,
              }
            )}
          >
            {statements.map((statement, idx) => (
              <p key={idx} className="break-words">
                {statement}
              </p>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className={classNames('relative z-10 mt-2 w-full border py-2 cursor-pointer', {
          'min-h-11 text-xs': isNarrow,
        })}
        onClick={onClick}
      >
        {title}
      </button>
    </div>
  )
}

type Statement = {
  blueStatements: string[]
  redStatements: string[]
  blackStatements: string[]
  solution: 'red' | 'blue' | 'black'
}

const Statements: Statement[] = [
  {
    blueStatements: ['The prize is not in this box', 'The prize is not in the red box'],
    redStatements: ['The prize is not in this box', 'The prize is in the blue box'],
    blackStatements: ['The prize is not in this box', 'The prize is in the blue box'],
    solution: 'black',
  },
  {
    blueStatements: ['This box is empty'],
    redStatements: ['This box is empty', 'The blue box is empty'],
    blackStatements: ['This box is empty', 'Every statement with the word empty is false'],
    solution: 'black',
  },
  {
    blueStatements: ['The prize is in this box', 'The above statement is true'],
    redStatements: ['The prize is not in this box', 'The above statement is false'],
    blackStatements: ['The top statement of each box is true', 'The above statement is true'],
    solution: 'blue',
  },
  {
    blueStatements: ['Both of these statements are true', 'The prize is in this box'],
    redStatements: ['The prize is not in the blue box', 'The prize is not in the black box'],
    blackStatements: [
      'The prize is in a box with a false statement',
      'Both statements on the blue box are true',
    ],
    solution: 'red',
  },
]
