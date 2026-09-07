import { useState } from 'react'
import { ContentProps } from './types'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const selectInitialPuzzleIndex = () => {
  return Math.floor(Math.random() * Statements.length)
}
export const ParlorRoomContent = ({ handleLevelAdvance, setIsLoading, layout }: ContentProps) => {
  const { isMobile } = layout
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
          'my-4 text-sm': isMobile,
          'my-8 text-lg': !isMobile,
        })}
      >
        <p className={classNames('mono', { 'mb-2': isMobile, 'mb-4': !isMobile })}>RULES:</p>
        <p className="font-bold">
          1. THERE WILL ALWAYS BE AT LEAST ONE BOX WHICH DISPLAYS ONLY TRUE STATEMENTS.
        </p>
        <p className="font-bold my-4">
          2. THERE WILL ALWAYS BE AT LEAST ONE BOX WHICH DISPLAYS ONLY FALSE STATEMENTS.
        </p>
        <p className="font-bold">
          3. ONLY ONE BOX HAS A PRIZE WITHIN. THE OTHER 2 ARE ALWAYS EMPTY.
        </p>
      </div>
      <div
        className={classNames({
          'grid w-full grid-cols-2 gap-2': isMobile,
          'flex w-full justify-between px-4': !isMobile,
        })}
      >
        <ParlorBox
          color="bg-blue-300"
          statements={puzzle.blueStatements}
          title={'Select Blue'}
          onClick={() => onCorrectSelect('blue')}
          isMobile={isMobile}
        />
        <ParlorBox
          color="bg-black"
          statements={puzzle.blackStatements}
          title={'Select Black'}
          onClick={() => onCorrectSelect('black')}
          isMobile={isMobile}
        />
        <ParlorBox
          color="bg-red-300"
          statements={puzzle.redStatements}
          title={'Select Red'}
          onClick={() => onCorrectSelect('red')}
          isMobile={isMobile}
          className={isMobile ? 'col-span-2' : undefined}
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
  isMobile,
  className,
}: {
  title: string
  color: string
  statements: string[]
  onClick: () => void
  isMobile?: boolean
  className?: string
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col items-stretch',
        { 'min-w-0 w-full max-w-[150px] justify-self-center': isMobile, 'w-[200px]': !isMobile },
        className
      )}
    >
      <div
        className={classNames('flex items-center justify-center border-[#673400]', color, {
          'aspect-square w-full border-3': isMobile,
          'h-[200px] w-[200px] border-3': !isMobile,
        })}
      >
        <div
          className={classNames(
            'flex flex-col justify-around bg-white border-[#673400] text-center uppercase select-none',
            {
              'h-[74%] w-[86%] border-4 px-0.5 py-1 text-xs leading-tight': isMobile,
              'h-[150px] w-[175px] border-6 px-1 py-2 text-sm': !isMobile,
            }
          )}
        >
          {statements.map((statement, idx) => (
            <p key={idx}>{statement}</p>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={classNames('relative z-10 border cursor-pointer', {
          'mt-2 min-h-11 w-full py-2 text-xs': isMobile,
          'my-4 w-full py-2': !isMobile,
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
