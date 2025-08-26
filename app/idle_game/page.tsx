'use client'

import { useCallback, useState } from 'react'
import './styles.css'
import { SidePanel } from './side-panel/SidePanel'
import { ShopItemIds } from './side-panel/shop/constants'
import classNames from 'classnames'
import { LoremIpsum } from './constants'
import { Memes } from './view/Memes'
import { Title } from './view/Title'
import { Blog } from './view/Blog'

export default function IdleGame() {
  const [purchasedShopItems, setPurchasedShopItems] = useState<Array<ShopItemIds>>([])

  const onPurchase = useCallback((id: ShopItemIds) => {
    setPurchasedShopItems((prevElements) => {
      return [...prevElements, id]
    })
  }, [])

  return (
    <div className="flex overflow-hidden">
      <div
        id="view"
        className={classNames('w-[80%] flex flex-col', {
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
            <Blog purchasedIds={purchasedShopItems} />
          )}
        </div>
      </div>
      <SidePanel purchasedIds={purchasedShopItems} onPurchase={onPurchase} />
    </div>
  )
}
