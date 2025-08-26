'use client'

import { useCallback, useState } from 'react'
import './styles.css'
import { SidePanel } from './side-panel/SidePanel'
import { ShopItemIds } from './side-panel/shop/constants'
import classNames from 'classnames'
import { LoremIpsum } from './constants'
import { Memes } from './view/Memes'

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
        {purchasedShopItems.includes(ShopItemIds.basicTitle) &&
          !purchasedShopItems.includes(ShopItemIds.memeTitle) && (
            <h1
              className={classNames({
                'text-center mt-4': purchasedShopItems.includes(ShopItemIds.centeredTitle),
              })}
            >
              Welcome to our Website!
            </h1>
          )}
        {purchasedShopItems.includes(ShopItemIds.memeTitle) && (
          <h1
            className={classNames({
              'text-center mt-4 text-5xl': purchasedShopItems.includes(ShopItemIds.centeredTitle),
            })}
          >
            THE MEME HALL OF FAME
          </h1>
        )}
        {purchasedShopItems.includes(ShopItemIds.basicBody) &&
          !purchasedShopItems.includes(ShopItemIds.basicMeme) && (
            <div className="max-w-[500px] text-center mt-8">{LoremIpsum}</div>
          )}
        {purchasedShopItems.includes(ShopItemIds.basicMeme) && (
          <Memes purchasedIds={purchasedShopItems} />
        )}
      </div>
      <SidePanel purchasedIds={purchasedShopItems} onPurchase={onPurchase} />
    </div>
  )
}
