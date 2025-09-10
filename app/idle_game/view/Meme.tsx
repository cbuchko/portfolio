import classNames from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ShopItemIds } from '../side-panel/shop/constants'
import Image from 'next/image'
import { Meme as MemeType, Rarity, RarityColors } from './constants'
import StarIcon from '@/public/idle_game/star.svg'

type MemeProps = {
  meme: MemeType
  setActiveMeme: () => void
  size: number
  purchasedIds: Array<ShopItemIds>
  isActive: boolean
}

export const Meme = ({ meme, setActiveMeme, size, purchasedIds, isActive }: MemeProps) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef<{ x: number; y: number } | undefined>(undefined)

  const url = meme?.url

  //sets up mouse tracking for meme rotation on hover
  useEffect(() => {
    if (!purchasedIds.includes(ShopItemIds.memeRotation)) return
    const container = containerRef.current
    if (!container) return
    const image = container.querySelector('img')
    if (!image) return

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Normalize values between -1 and 1
      const rotateY = (x / rect.width - 0.5) * 45 // max 30deg
      const rotateX = (y / rect.height - 0.5) * -45 // max 30deg (invert Y)
      const translateZ = 50 // pop out a bit

      image.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`
      const border = borderRef.current
      if (!border) return
      border.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`
    })

    container.addEventListener('mouseleave', () => {
      image.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)'
      const border = borderRef.current
      if (!border) return
      border.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)'
    })
  }, [purchasedIds, url])

  //animate the meme into the center of the screen
  const handleMemeClick = useCallback(() => {
    if (!purchasedIds.includes(ShopItemIds.memeFocus)) return
    const container = containerRef.current
    if (!container) return

    const position = container.getBoundingClientRect()
    const { x, y } = position

    //switch it to absolute positioning so we can animate inbetween the new position
    container.style.position = 'absolute'
    container.style.left = `${x}px`
    container.style.top = `${y}px`
    container.style.margin = `0`
    container.style.zIndex = '100'

    positionRef.current = { x, y }
    setShowPlaceholder(true)

    setTimeout(() => {
      container?.classList.add('active-meme')
    })

    setActiveMeme()
  }, [purchasedIds])

  //listen for when the meme becomes inactive, and transition it back to its original spot
  useEffect(() => {
    if (!isActive) {
      const container = containerRef.current
      if (!container) return
      container.classList.remove('active-meme')
      container.style.left = `${positionRef.current?.x}px`
      container.style.top = `${positionRef.current?.y}px`

      //after its done animating turn it back into a static element
      setTimeout(() => {
        container.style.position = 'relative'
        container.style.left = ``
        container.style.top = ``
        container.style.margin = '16px'
        container.style.zIndex = '0'
        positionRef.current = undefined
        setShowPlaceholder(false)
      }, 1000)
    }
  }, [isActive])

  if (!url) return null
  return (
    <>
      <div
        ref={containerRef}
        className={classNames('w-[300px] h-[300px] relative', {
          'm-4': isGalleryActive,
          'depth-container': purchasedIds.includes(ShopItemIds.memeRotation),
          'cursor-pointer': purchasedIds.includes(ShopItemIds.memeFocus),
        })}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transition: 'left 1s, top 1s, width 1s, height 1s',
        }}
        onClick={handleMemeClick}
      >
        <Image
          src={url}
          alt={'meme'}
          fill
          className={classNames('object-cover shadow-lg', {
            'rounded-2xl': purchasedIds.includes(ShopItemIds.memeTrim),
          })}
        />
        {purchasedIds.includes(ShopItemIds.memeTrim) && (
          <div
            ref={borderRef}
            className={classNames('w-[300px] h-[300px] rounded-lg shimmer-border', {
              'shimmer-border-common': meme.rarity === Rarity.common,
              'shimmer-border-rare': meme.rarity === Rarity.rare,
              'shimmer-border-legendary': meme.rarity === Rarity.legendary,
              'shimmer-border-mythic': meme.rarity === Rarity.mythic,
            })}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transition:
                'left 1s, top 1s, width 1s, height 1s, transform 0.5s ease, box-shadow 0.5s ease',
            }}
          />
        )}
        {isActive && purchasedIds.includes(ShopItemIds.memeFlavor) && (
          <MemeContext meme={meme} purchasedIds={purchasedIds} />
        )}
      </div>
      {showPlaceholder && (
        <div
          className="meme-spotholder m-4"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      )}
    </>
  )
}

const MemeContext = ({
  meme,
  purchasedIds,
}: {
  meme: MemeType
  purchasedIds: Array<ShopItemIds>
}) => {
  return (
    <div className="absolute top-0 left-[100%] flex flex-col justify-between h-full ml-10 z-100 text-white bg-black/20 p-4 rounded-lg backdrop-blur !w-[400px] pop-in pointer-events-none">
      <div>
        <h5 className="text-3xl mb-2">{meme.title}</h5>
        <h5 className="tracking-wide">{meme.flavorText}</h5>
      </div>
      {purchasedIds.includes(ShopItemIds.memeRarity) && (
        <div className="flex gap-2 items-center" style={{ color: RarityColors[meme.rarity] }}>
          <StarIcon className="w-6 h-6" />
          <h5 className="text-xl tracking-widest uppercase font-semibold">{meme.rarity}</h5>
        </div>
      )}
    </div>
  )
}
