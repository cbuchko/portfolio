import { useState } from 'react'
import { ContentProps } from './types'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

const selectInitialPuzzleIndex = () => {
  return Math.floor(Math.random() * Statements.length)
}
export const ParlorRoomContent = ({ handleLevelAdvance, setIsLoading, isMobile }: ContentProps) => {
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
      <div className="text-lg my-8">
        <p className="mono font-bold mb-4">RULES:</p>
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
        className={classNames('flex justify-between px-4', { 'flex-col items-center': isMobile })}
      >
        <ParlorBox
          color="bg-blue-300"
          statements={puzzle.blueStatements}
          title={'Select Blue'}
          onClick={() => onCorrectSelect('blue')}
        />
        <ParlorBox
          color="bg-black"
          statements={puzzle.blackStatements}
          title={'Select Black'}
          onClick={() => onCorrectSelect('black')}
        />
        <ParlorBox
          color="bg-red-300"
          statements={puzzle.redStatements}
          title={'Select Red'}
          onClick={() => onCorrectSelect('red')}
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
}: {
  title: string
  color: string
  statements: string[]
  onClick: () => void
}) => {
  return (
    <div className="flex flex-col justify-center">
      <div
        className={classNames(
          'h-[200px] w-[200px] flex items-center justify-center border-3 border-[#673400]',
          color
        )}
      >
        <div className="flex flex-col justify-around bg-white h-[150px] w-[175px] border-6 border-[#673400] text-center text-sm uppercase px-1 py-2 select-none">
          {statements.map((statement, idx) => (
            <p key={idx}>{statement}</p>
          ))}
        </div>
      </div>
      <button className="my-4 border py-2 cursor-pointer" onClick={onClick}>
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
