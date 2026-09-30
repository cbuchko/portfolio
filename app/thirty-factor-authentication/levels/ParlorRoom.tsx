import { CSSProperties, useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { PlayerInformation } from '../player-constants'
import { useSfx } from '@/app/utils/audio'
import { ExtrasPortal } from '../components/ExtrasPortal'

type ChestColor = 'blue' | 'black' | 'red'
type Reveal = { color: ChestColor; outcome: 'prize' | 'empty'; slammed: boolean }

const winRevealMs = 1100
const emptySlamMs = 1350
const emptySettleMs = 1600

const selectInitialPuzzleIndex = () => {
  return Math.floor(Math.random() * Statements.length)
}
export const ParlorRoomContent = ({
  playerId,
  handleLevelAdvance,
  setIsLoading,
  layout,
}: ContentProps) => {
  const { isNarrow, isCompact, fit } = layout
  const firstName = PlayerInformation[playerId].name.split(' ')[0]
  const [puzzleIndex, setPuzzleIndex] = useState<number | null>(null)
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const timeouts = useRef<NodeJS.Timeout[]>([])
  const playUnlock = useSfx('chestUnlock')
  const playPrize = useSfx('chestPrize')

  useEffectInitializer(() => {
    setPuzzleIndex(selectInitialPuzzleIndex())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const pending = timeouts.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const puzzle = Statements[puzzleIndex || 0]
  const onCorrectSelect = (type: ChestColor) => {
    if (reveal) return
    const isSuccess = type === puzzle.solution
    if (isSuccess) {
      playPrize()
    } else {
      playUnlock()
    }
    setReveal({ color: type, outcome: isSuccess ? 'prize' : 'empty', slammed: false })
    if (isSuccess) {
      timeouts.current.push(setTimeout(() => handleLevelAdvance(true), winRevealMs))
      return
    }
    timeouts.current.push(
      setTimeout(() => setReveal((prev) => prev && { ...prev, slammed: true }), emptySlamMs),
      setTimeout(() => {
        handleLevelAdvance(false)
        setPuzzleIndex((prevIndex) => ((prevIndex || 0) + 1) % Statements.length)
        setReveal(null)
      }, emptySettleMs)
    )
  }

  const chestWidth = isNarrow ? undefined : Math.round(190 * Math.max(fit, 0.8))

  const letter = (
    <div
      className={classNames('parlor-letter', {
        'parlor-letter--compact': isCompact && !isNarrow,
        'parlor-letter--narrow': isNarrow,
      })}
    >
      <p>Dear {firstName},</p>
      <p>
        Do you remember this game? We used to play it in the parlor when you were little. You would
        sit there for ages.
      </p>
      <p>In case it has been a while, the rules never changed:</p>
      <ol className="parlor-letter-rules">
        <li>There will always be at least one box which displays only true statements.</li>
        <li>There will always be at least one box which displays only false statements.</li>
        <li>Only one box has a prize within. The other 2 are always empty.</li>
      </ol>
      <p>Take your time.</p>
      <p className="parlor-letter-signoff">With love,</p>
      <p className="parlor-letter-signature">Mom</p>
    </div>
  )

  return (
    <>
      <p className="text-lg">We contacted your family and asked them to set up a game for you.</p>
      <p className="text-lg">Select the box that contains the prize.</p>
      {isNarrow ? letter : <ExtrasPortal>{letter}</ExtrasPortal>}
      <div className={classNames('parlor-room !mt-8', { 'parlor-room--narrow': isNarrow })}>
        <div className="parlor-floor">
          {CHESTS.map(({ color, title, idleDelay }) => (
            <ParlorChest
              key={color}
              color={color}
              title={title}
              statements={puzzle[`${color}Statements`]}
              puzzleKey={puzzleIndex ?? 0}
              reveal={reveal?.color === color ? reveal : null}
              isLocked={!!reveal}
              onClick={() => onCorrectSelect(color)}
              width={chestWidth}
              idleDelay={idleDelay}
            />
          ))}
        </div>
      </div>
    </>
  )
}

const CHESTS: { color: ChestColor; title: string; idleDelay: number }[] = [
  { color: 'blue', title: 'Select Blue', idleDelay: 3.5 },
  { color: 'black', title: 'Select Black', idleDelay: 9 },
  { color: 'red', title: 'Select Red', idleDelay: 6 },
]

const ParlorChest = ({
  color,
  title,
  statements,
  puzzleKey,
  reveal,
  isLocked,
  onClick,
  width,
  idleDelay,
}: {
  color: ChestColor
  title: string
  statements: string[]
  puzzleKey: number
  reveal: Reveal | null
  isLocked: boolean
  onClick: () => void
  width?: number
  idleDelay: number
}) => {
  const isOpen = !!reveal && !reveal.slammed
  return (
    <button
      type="button"
      className={classNames('parlor-chest', `parlor-chest--${color}`, {
        'parlor-chest--open': isOpen,
        'parlor-chest--prize': reveal?.outcome === 'prize',
        'parlor-chest--empty': reveal?.outcome === 'empty',
        'parlor-chest--slammed': reveal?.slammed,
        'parlor-chest--locked': isLocked,
      })}
      style={{ width, '--parlor-idle-delay': `${idleDelay}s` } as CSSProperties}
      onClick={onClick}
      disabled={isLocked}
    >
      <span className="sr-only">{title}.</span>
      <span className="parlor-chest-mouth" />
      <span className="parlor-chest-lid">
        <span className="parlor-chest-latch" />
      </span>
      {reveal?.outcome === 'empty' && <span className="parlor-chest-dust" />}
      <span className="parlor-chest-body">
        <span key={puzzleKey} className="parlor-plaque">
          {statements.map((statement, idx) => (
            <span key={idx} className="parlor-plaque-line">
              {statement}
            </span>
          ))}
        </span>
      </span>
    </button>
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
