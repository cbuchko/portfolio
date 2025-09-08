import { MemeUrls } from './constants'
import { ShopItemIds } from '../side-panel/shop/constants'
import classNames from 'classnames'
import { Meme } from './Meme'
import { act, useState } from 'react'

type MemeProps = {
  purchasedIds: Array<ShopItemIds>
}

export const Memes = ({ purchasedIds }: MemeProps) => {
  const [activeMeme, setActiveMeme] = useState<number>()
  const [memeBank, setMemeBank] = useState(MemeUrls)

  const memeCount = purchasedIds.filter((id) => id === ShopItemIds.memeRepeatable).length + 1
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)

  const getMemeSize = () => {
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
        {Array.from({ length: memeCount }, (_, i) => (
          <Meme
            key={i}
            memeBank={memeBank}
            setMemeBank={setMemeBank}
            setActiveMeme={() => setActiveMeme(i)}
            purchasedIds={purchasedIds}
            size={getMemeSize()}
            isActive={activeMeme === i}
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
