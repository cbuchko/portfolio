import { Meme as MemeType } from './constants'
import { ShopItemIds } from '../side-panel/shop/constants'
import classNames from 'classnames'
import { Meme } from './Meme'
import { useState } from 'react'

type MemeProps = {
  purchasedIds: Array<ShopItemIds>
  ownedMemes: MemeType[]
}

export const Memes = ({ purchasedIds, ownedMemes }: MemeProps) => {
  const [activeMeme, setActiveMeme] = useState<number>()

  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)

  const getMemeSize = () => {
    const memeCount = ownedMemes.length
    if (memeCount < 5) return 300
    if (memeCount < 10) return 200
    if (memeCount < 17) return 150
    if (memeCount < 33) return 100
    return 100
  }

  return (
    <>
      <div
        className={classNames('mt-8 p-4 pb-16 h-max', {
          'flex flex-wrap': isGalleryActive,
        })}
      >
        {ownedMemes.map((meme) => (
          <Meme
            key={meme.id}
            meme={meme}
            setActiveMeme={() => setActiveMeme(meme.id)}
            purchasedIds={purchasedIds}
            size={getMemeSize()}
            isActive={activeMeme === meme.id}
          />
        ))}
      </div>
      {activeMeme !== undefined && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black/60 cursor-pointer z-50"
          onClick={() => setActiveMeme(undefined)}
        />
      )}
    </>
  )
}
