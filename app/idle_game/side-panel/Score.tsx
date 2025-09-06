import classNames from 'classnames'
import { ScoreProps } from './useScore'
import Image from 'next/image'
import { useState } from 'react'
import { ShopItemIds } from './shop/constants'
import { BlogViewProps } from '../view/useBlogViews'

type ScoreComponentProps = {
  scoreProps: ScoreProps
  purchasedIds: Array<ShopItemIds>
  blogViewProps: BlogViewProps
}

export const Score = ({ scoreProps, purchasedIds, blogViewProps }: ScoreComponentProps) => {
  const { displayScore, viewPower, passivePower, scoreIncrements } = scoreProps
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
      <div className="flex items-center gap-2 mt-2 text-3xl select-none">
        <span className="mono">{displayScore.toLocaleString('en-us')}</span>
        <h2 className="">Score</h2>
      </div>
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
  const { viewFrequencyInMs, viewOdds, viewGain } = blogViewProps

  const message = purchasedIds.includes(ShopItemIds.blogViewBots)
    ? `Blogs have a 1/${viewOdds} chance of gaining ${viewGain} view${viewGain > 1 ? 's' : ''} every ${viewFrequencyInMs / 1000} seconds.`
    : defaultMessage
  return (
    <div className="w-[155px] absolute -top-[60px] bg-white border border-black shadow-md px-2 py-1 rounded-md text-xs ">
      {message}
    </div>
  )
}
