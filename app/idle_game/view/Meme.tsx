import classNames from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ShopItemIds } from '../side-panel/shop/constants'
import Image from 'next/image'

type MemeProps = {
  memeBank: string[]
  setMemeBank: React.Dispatch<React.SetStateAction<string[]>>
  setActiveMeme: () => void
  size: number
  purchasedIds: Array<ShopItemIds>
  isActive: boolean
}

export const Meme = ({
  memeBank,
  setMemeBank,
  setActiveMeme,
  size,
  purchasedIds,
  isActive,
}: MemeProps) => {
  const [url, setUrl] = useState<string>()
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef<{ x: number; y: number } | undefined>(undefined)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!!url || initializedRef.current === true) return
    //select a random meme to be
    const idx = Math.floor(Math.random() * memeBank.length)
    setUrl(memeBank[idx])

    //remove the meme from the bank so it doesn't get selected again
    setMemeBank((prev) => prev.filter((_, i) => i !== idx))
    initializedRef.current = true
  }, [url])

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
            className={classNames('w-[300px] h-[300px] rounded-lg shimmer-border')}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              transition:
                'left 1s, top 1s, width 1s, height 1s, transform 0.5s ease, box-shadow 0.5s ease',
            }}
          />
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
