import { MemeUrls } from './constants'
import { ShopItemIds } from '../side-panel/shop/constants'
import classNames from 'classnames'
import { Meme } from './Meme'

type MemeProps = {
  purchasedIds: Array<ShopItemIds>
}

export const Memes = ({ purchasedIds }: MemeProps) => {
  const memeCount = purchasedIds.filter((id) => id === ShopItemIds.memeRepeatable).length + 1
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)

  const getMemeSize = () => {
    if (memeCount < 9) return 300
    if (memeCount < 20) return 150
    if (memeCount < 32) return 100
    return 300
  }

  return (
    <div
      className={classNames('overflow-hidden mt-8 p-4 pb-16', {
        'flex flex-wrap': isGalleryActive,
      })}
    >
      {MemeUrls.slice(0, memeCount).map((url, idx) => (
        <Meme key={idx} url={url} purchasedIds={purchasedIds} size={getMemeSize()} />
      ))}
    </div>
  )
}
