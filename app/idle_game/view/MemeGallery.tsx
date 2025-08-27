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

  return (
    <div
      className={classNames('overflow-hidden mt-8 p-4 pb-16', {
        'flex flex-wrap': isGalleryActive,
      })}
    >
      {MemeUrls.slice(0, memeCount).map((url, idx) => (
        <Meme key={idx} url={url} purchasedIds={purchasedIds} />
      ))}
    </div>
  )
}
