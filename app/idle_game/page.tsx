'use client'

import { useCallback, useRef, useState } from 'react'
import './styles.css'
import { SidePanel } from './side-panel/SidePanel'
import { ShopItemIds } from './side-panel/shop/constants'
import classNames from 'classnames'
import { LoremIpsum } from './constants'
import { Memes } from './view/MemeGallery'
import { Title } from './view/Title'
import { Blog } from './view/Blog'
import { Ads } from './view/Ads'
import { useScore } from './side-panel/useScore'
import { useBlogViews } from './view/useBlogViews'

export default function IdleGame() {
  const viewRef = useRef<HTMLDivElement | null>(null)

  const [purchasedShopItems, setPurchasedShopItems] = useState<Array<ShopItemIds>>([])

  const scoreProps = useScore(purchasedShopItems)
  const blogViewProps = useBlogViews()

  const onPurchase = useCallback((id: ShopItemIds) => {
    setPurchasedShopItems((prevElements) => {
      return [...prevElements, id]
    })
  }, [])

  return (
    <div className="flex">
      <div
        id="view"
        ref={viewRef}
        className={classNames('w-[80%] flex flex-col relative', {
          'items-center': purchasedShopItems.includes(ShopItemIds.centeredTitle),
          '!bg-red-50': purchasedShopItems.includes(ShopItemIds.lightenedColor),
          'bg-red-500': purchasedShopItems.includes(ShopItemIds.basicColor),
        })}
      >
        <Title purchasedIds={purchasedShopItems} />
        {purchasedShopItems.includes(ShopItemIds.basicBody) &&
          !purchasedShopItems.includes(ShopItemIds.basicMeme) && (
            <div className="max-w-[500px] text-center mt-8">{LoremIpsum}</div>
          )}
        <div
          className={classNames('', {
            'grid grid-cols-2 w-full px-8 mt-16': purchasedShopItems.includes(
              ShopItemIds.basicBlog
            ),
          })}
        >
          {purchasedShopItems.includes(ShopItemIds.basicMeme) && (
            <Memes purchasedIds={purchasedShopItems} />
          )}
          {purchasedShopItems.includes(ShopItemIds.basicBlog) && (
            <Blog
              purchasedIds={purchasedShopItems}
              handleBlogView={() => scoreProps.incrementScore(scoreProps.viewPower)}
              blogViewProps={blogViewProps}
            />
          )}
        </div>
        {purchasedShopItems.includes(ShopItemIds.basicAds) && (
          <Ads viewRef={viewRef} incrementScore={scoreProps.incrementScore} />
        )}
      </div>
      <SidePanel
        purchasedIds={purchasedShopItems}
        onPurchase={onPurchase}
        scoreProps={scoreProps}
        blogViewProps={blogViewProps}
      />
    </div>
  )
}
