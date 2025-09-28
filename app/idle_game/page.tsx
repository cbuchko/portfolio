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
import { Ads } from './view/AdScore/Ads'
import { StatisticType, useScore } from './side-panel/useScore'
import { useBlogViews } from './view/useBlogViews'
import { Sponsorships } from './view/AdScore/Sponsor'
import { ModalNames } from './menus/modalRegistry'
import { StatisticsModal } from './menus/StatisticsModal'
import { BlackMarketModal } from './menus/BlackMarketModal'
import { useMemes } from './useMemes'
import AudioPlayer from './view/AudioPlayer'
import { VideoPlayer } from './view/AdScore/VideoPlayer'

export default function IdleGame() {
  const startDateRef = useRef(new Date())
  const viewRef = useRef<HTMLDivElement | null>(null)

  const [purchasedShopItems, setPurchasedShopItems] = useState<Array<ShopItemIds>>([])
  const [activeModal, setActiveModal] = useState<ModalNames>()
  const [userName, setUserName] = useState('Unknown')
  const name = userName || 'Unknown'

  const scoreProps = useScore(purchasedShopItems)
  const blogViewProps = useBlogViews()
  const memeProps = useMemes(purchasedShopItems)

  const onPurchase = useCallback((id: ShopItemIds) => {
    setPurchasedShopItems((prevElements) => {
      return [...prevElements, id]
    })
  }, [])

  return (
    <div
      className={classNames('flex', {
        'cursor-upgraded': purchasedShopItems.includes(ShopItemIds.cursorUpgrade),
      })}
    >
      <div
        id="view"
        ref={viewRef}
        className={classNames('w-[80%] flex flex-col fade-in overflow-hidden h-screen', {
          'items-center': purchasedShopItems.includes(ShopItemIds.centeredTitle),
          '!bg-red-50': purchasedShopItems.includes(ShopItemIds.lightenedColor),
          'bg-red-500': purchasedShopItems.includes(ShopItemIds.basicColor),
        })}
      >
        <Title purchasedIds={purchasedShopItems} />
        {purchasedShopItems.includes(ShopItemIds.adSponsor) && (
          <Sponsorships purchasedIds={purchasedShopItems} />
        )}
        {purchasedShopItems.includes(ShopItemIds.basicBody) &&
          !purchasedShopItems.includes(ShopItemIds.basicMeme) && (
            <div className="max-w-[500px] text-center mt-8">{LoremIpsum}</div>
          )}
        <div
          className={classNames('mt-24', {
            'grid grid-cols-2 w-full px-8': purchasedShopItems.includes(ShopItemIds.basicBlog),
          })}
        >
          {purchasedShopItems.includes(ShopItemIds.basicMeme) && (
            <Memes
              purchasedIds={purchasedShopItems}
              ownedMemes={memeProps.ownedMemes}
              memeProps={memeProps}
            />
          )}
          {purchasedShopItems.includes(ShopItemIds.basicBlog) && (
            <Blog
              purchasedIds={purchasedShopItems}
              handleBlogView={(viewGain) =>
                scoreProps.incrementScore(scoreProps.viewPower * viewGain, StatisticType.blog)
              }
              blogViewProps={blogViewProps}
              userName={name}
            />
          )}
        </div>
      </div>
      <SidePanel
        purchasedIds={purchasedShopItems}
        onPurchase={onPurchase}
        scoreProps={scoreProps}
        blogViewProps={blogViewProps}
        setUserName={setUserName}
        setActiveModal={setActiveModal}
        memeProps={memeProps}
      />
      {activeModal === ModalNames.Statistics && (
        <StatisticsModal
          setActiveModal={setActiveModal}
          statistic={scoreProps.statistics}
          date={startDateRef}
        />
      )}
      {activeModal === ModalNames.BlackMarket && (
        <BlackMarketModal
          setActiveModal={setActiveModal}
          memeProps={memeProps}
          scoreProps={scoreProps}
        />
      )}
      {purchasedShopItems.includes(ShopItemIds.basicAds) && (
        <Ads
          scoreProps={scoreProps}
          viewRef={viewRef}
          incrementScore={scoreProps.incrementScore}
          purchasedIds={purchasedShopItems}
        />
      )}
      <div className="fixed bottom-2 right-2 text-xs">Alpha v0.5</div>
      {purchasedShopItems.includes(ShopItemIds.backgroundMusic) && <AudioPlayer />}
      {purchasedShopItems.includes(ShopItemIds.videoAds) && (
        <VideoPlayer viewRef={viewRef} scoreProps={scoreProps} />
      )}
    </div>
  )
}
