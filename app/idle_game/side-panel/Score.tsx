import classNames from 'classnames'
import { ScoreIncrement } from './useScore'

type ScoreProps = {
  score: number
  passivePower: number
  scoreIncrements: ScoreIncrement[]
}

export const Score = ({ score, passivePower, scoreIncrements }: ScoreProps) => {
  console.log({ scoreIncrements })
  return (
    <div className="relative">
      {scoreIncrements.map((inc) => (
        <div
          key={inc.id}
          className="absolute float-score select-none"
          style={{ left: `${inc.xPosition}px` }}
        >
          +{inc.amount}
        </div>
      ))}
      <h2 className="mt-2 text-3xl select-none">{score} Score</h2>
      <h5 className={classNames('mb-2 select-none', { 'opacity-0': passivePower === 0 })}>
        {passivePower} score per second
      </h5>
    </div>
  )
}
