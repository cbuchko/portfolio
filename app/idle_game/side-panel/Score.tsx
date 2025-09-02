import classNames from 'classnames'
import { ScoreIncrement } from './useScore'
import Image from 'next/image'
import { useState } from 'react'
import { ShopItemIds } from './shop/constants'
import { BlogViewProps } from '../view/useBlogViews'

type ScoreProps = {
  score: number
  passivePower: number
  viewPower: number
  scoreIncrements: ScoreIncrement[]
  purchasedIds: Array<ShopItemIds>
  blogViewProps: BlogViewProps
}

export const Score = ({
  score,
  passivePower,
  scoreIncrements,
  viewPower,
  purchasedIds,
  blogViewProps,
}: ScoreProps) => {
  const [blogHelpOpen, setBlogHelpOpen] = useState(false)
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
      <div className="mb-2">
        <h5 className={classNames('select-none', { 'opacity-0': passivePower === 0 })}>
          {passivePower} score per second
        </h5>
        {viewPower > 0 && (
          <div className="flex items-center gap-2">
            <h5 className={classNames('select-none')}>{viewPower} score per blog view</h5>
            <div className="relative" onMouseLeave={() => setBlogHelpOpen(false)}>
              <Image
                src="idle_game/help.svg"
                alt="help"
                height={16}
                width={16}
                className="cursor-pointer"
                onClick={() => setBlogHelpOpen(true)}
              />
              {blogHelpOpen && (
                <BlogHelp purchasedIds={purchasedIds} blogViewProps={blogViewProps} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const defaultMessage = 'Buy view bots to start gaining blog views'
const BlogHelp = ({
  purchasedIds,
  blogViewProps,
}: {
  purchasedIds: Array<ShopItemIds>
  blogViewProps: BlogViewProps
}) => {
  const { viewFrequencyInMs, viewOdds, viewScoreGain } = blogViewProps

  const message = purchasedIds.includes(ShopItemIds.blogViewBots)
    ? `Blogs have a 1/${viewOdds} chance of gaining ${viewScoreGain} view every ${viewFrequencyInMs / 1000} seconds.`
    : defaultMessage
  return (
    <div className="w-[150px] absolute -top-[60px] bg-white border border-black shadow-md px-2 py-1 rounded-md text-xs ">
      {message}
    </div>
  )
}
