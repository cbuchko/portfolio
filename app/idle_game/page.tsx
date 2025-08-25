'use client'

import { useCallback, useState } from 'react'
import './styles.css'
import { SidePanel } from './side-panel/SidePanel'
import { ShopItemIds } from './side-panel/shop/constants'
import classNames from 'classnames'
import { LoremIpsum } from './constants'

export default function IdleGame() {
  const [purchasedShopItems, setPurchasedShopItems] = useState<Set<ShopItemIds>>(new Set())

  const onPurchase = useCallback((id: ShopItemIds) => {
    setPurchasedShopItems((prevElements) => {
      const newSet = new Set(prevElements)
      newSet.add(id)
      return newSet
    })
  }, [])

  return (
    <div className="flex">
      <div
        id="view"
        className={classNames('w-[80%] flex flex-col', {
          'items-center': purchasedShopItems.has(ShopItemIds.centeredTitle),
          '!bg-red-50': purchasedShopItems.has(ShopItemIds.lightenedColor),
          'bg-red-500': purchasedShopItems.has(ShopItemIds.basicColor),
        })}
      >
        {purchasedShopItems.has(ShopItemIds.basicTitle) && (
          <h5
            className={classNames({
              'text-center mt-4': purchasedShopItems.has(ShopItemIds.centeredTitle),
            })}
          >
            Welcome to our Website!
          </h5>
        )}
        {purchasedShopItems.has(ShopItemIds.basicBody) && (
          <div className="max-w-[500px] text-center mt-8">{LoremIpsum}</div>
        )}
      </div>
      <SidePanel purchasedIds={purchasedShopItems} onPurchase={onPurchase} />
    </div>
  )
}
