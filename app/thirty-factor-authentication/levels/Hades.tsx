import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'

export const HadesContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  return (
    <>
      <div className="italic text-lg">
        <p>You enter a clearing that's outside the authentication process.</p>
        <p>It's quiet. You feel a calm wash over you.</p>
        <p>There are three offerings, in which you may choose one.</p>
        <p>It seems someone is watching out for you.</p>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {Boons.map((boon, idx) => (
          <BoonContainer key={idx} boon={boon} />
        ))}
      </div>
    </>
  )
}

const BoonContainer = ({ boon }: { boon: Boon }) => {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <div
      className={classNames(
        'w-full max-w-[600px] min-h-[140px] bg-black text-white rounded-lg px-6 py-4 pb-12 boon border border-black select-none cursor-pointer',
        { 'outline-3 outline-blue-500': isHovering }
      )}
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <h3 className="font-bold uppercase">{boon.title}</h3>
      <p>{boon.description}</p>
    </div>
  )
}

export const HadesControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Confirm Choice
      </button>
    </>
  )
}

enum BoonIds {
  SaveState = 'save-state',
  BossFight = 'boss-fight',
  Resilience = 'resilience',
  Skip = 'skip',
}

type Boon = {
  title: string
  description: string
}
const Boons: Boon[] = [
  {
    title: 'Save State',
    description:
      'If you were to Game Over at any point, restart from level 16 with this ability, instead of starting over.',
  },
  {
    title: 'Call Your Shot',
    description: 'Upon reaching the final level, gain an advantage that will aid you greatly.',
  },
  {
    title: 'Resilience',
    description: 'For the rest of the game, it takes Four Mistakes to Game Over instead of Three.',
  },
  {
    title: 'Eject Button',
    description:
      'Gain One Skip, which allows you to completely bypass any level (except for the final level).',
  },
]

/**
 * Boon ideas
 *
 * Increase your max X's to 4
 * Set a Save State at level 15 so that if you fail, you dont have to start over
 * Gain ONE skip. Can't skip the final boss.
 * Make the boss significantly easier. (double HP?)
 *
 */
