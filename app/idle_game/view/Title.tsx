import classNames from 'classnames'
import { ShopItemIds } from '../side-panel/shop/constants'

type MemeProps = {
  purchasedIds: Array<ShopItemIds>
}

export const Title = ({ purchasedIds }: MemeProps) => {
  return (
    <>
      {purchasedIds.includes(ShopItemIds.basicTitle) &&
        !purchasedIds.includes(ShopItemIds.memeTitle) && (
          <h1
            className={classNames('text-5xl', {
              'text-center mt-4': purchasedIds.includes(ShopItemIds.centeredTitle),
            })}
          >
            Welcome to our Website!
          </h1>
        )}
      {purchasedIds.includes(ShopItemIds.memeTitle) && (
        <h1
          className={classNames({
            'text-center mt-4 text-5xl': purchasedIds.includes(ShopItemIds.centeredTitle),
            'blog-title': purchasedIds.includes(ShopItemIds.blogTitle),
          })}
        >
          THE MEME HALL OF FAME
        </h1>
      )}
    </>
  )
}
