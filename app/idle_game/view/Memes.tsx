import Image from 'next/image'
import { MemeUrls } from './constants'
import { ShopItemIds } from '../side-panel/shop/constants'
import classNames from 'classnames'

type MemeProps = {
  purchasedIds: Array<ShopItemIds>
}

export const Memes = ({ purchasedIds }: MemeProps) => {
  const memeCount = purchasedIds.filter((id) => id === ShopItemIds.memeRepeatable).length + 1
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)
  return (
    <div
      className={classNames('overflow-hidden mt-8', {
        'grid grid-cols-3 gap-4': isGalleryActive,
      })}
    >
      {MemeUrls.slice(0, memeCount).map((url, idx) => (
        <div
          key={idx}
          className={classNames('w-[300px] h-[300px] relative', {
            '!w-[200px] !h-[200px]': purchasedIds.includes(ShopItemIds.basicBlog),
          })}
        >
          <Image
            src={url}
            alt={'meme'}
            fill
            className={classNames('object-cover', { 'rounded-lg': isGalleryActive })}
          />
        </div>
      ))}
    </div>
  )
}
