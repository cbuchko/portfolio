import { Meme as MemeType } from './constants'
import { ShopItemIds } from '../side-panel/shop/constants'
import classNames from 'classnames'
import { Meme } from './Meme'
import { MemeProps } from '../useMemes'

type MemeGalleryProps = {
  purchasedIds: Array<ShopItemIds>
  ownedMemes: MemeType[]
  memeProps: MemeProps
}

export const Memes = ({ purchasedIds, ownedMemes, memeProps }: MemeGalleryProps) => {
  const { activeMemeId, setActiveMemeId } = memeProps
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
            setActiveMeme={() => setActiveMemeId(meme.id)}
            purchasedIds={purchasedIds}
            size={getMemeSize()}
            isActive={activeMemeId === meme.id}
          />
        ))}
      </div>
      {activeMemeId !== undefined && purchasedIds.includes(ShopItemIds.memeFocus) && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black/60 cursor-pointer z-50"
          onClick={() => setActiveMemeId(undefined)}
        />
      )}
    </>
  )
}
