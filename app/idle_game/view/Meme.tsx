import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { ShopItemIds } from '../side-panel/shop/constants'
import Image from 'next/image'

type MemeProps = {
  memeBank: string[]
  setMemeBank: React.Dispatch<React.SetStateAction<string[]>>
  size: number
  purchasedIds: Array<ShopItemIds>
}

export const Meme = ({ memeBank, setMemeBank, size, purchasedIds }: MemeProps) => {
  const [url, setUrl] = useState<string>()
  const isGalleryActive = purchasedIds.includes(ShopItemIds.memeGallery)
  const borderRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
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
  }, [purchasedIds])

  if (!url) return null
  return (
    <div
      ref={containerRef}
      className={classNames('w-[300px] h-[300px] relative', {
        'm-4': isGalleryActive,
        ' depth-container': purchasedIds.includes(ShopItemIds.memeRotation),
      })}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
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
          className={classNames('w-[300px] h-[300px] rounded-lg shimmer-border', {})}
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      )}
    </div>
  )
}
