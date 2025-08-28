import Image from 'next/image'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { AdContent } from './constants'
import { ScoreProps } from '../side-panel/useScore'

type AdsProps = {
  viewRef: RefObject<HTMLDivElement | null>
  incrementScore: ScoreProps['incrementScore']
}

const timeoutDurationInMs = 5000
const addFrequencyInMs = 30000
const adScore = 1000

export const Ads = ({ viewRef, incrementScore }: AdsProps) => {
  const adRef = useRef<HTMLDivElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const [progress, setProgress] = useState(timeoutDurationInMs)

  const spawnAd = () => {
    const view = viewRef.current
    const ad = adRef.current

    if (!view || !ad) return

    //randomizes where the ad spawns
    const bounds = view.getBoundingClientRect()
    const { right, bottom } = bounds
    const x = Math.random() * right * 0.75
    const y = Math.random() * bottom * 0.75

    const contentContainer = ad.querySelector('h5')
    if (!contentContainer) return

    //set the content
    const contentIndex = Math.floor(Math.random() * AdContent.length)
    contentContainer.textContent = AdContent[contentIndex]

    //show the ad
    ad.style.top = y + 'px'
    ad.style.left = x + 'px'
    ad.style.opacity = '100'
    ad.style.pointerEvents = 'all'

    //play sfx
    const audio = new Audio('/idle_game/pop-up.mp3')
    audio.volume = 0.2
    audio.play()

    //sets up the progress bar
    const start = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const percentage = Math.min((elapsed / timeoutDurationInMs) * 100, 100)
      setProgress(percentage)

      if (elapsed >= timeoutDurationInMs) {
        clearInterval(interval)
        ad.style.opacity = '0'
        ad.style.pointerEvents = 'none'
      }
    }, 50)
    intervalRef.current = interval
  }

  useEffect(() => {
    spawnAd()
    setInterval(() => {
      spawnAd()
    }, addFrequencyInMs)

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [])

  const onClose = useCallback(() => {
    const interval = intervalRef.current
    const ad = adRef.current
    if (!interval || !ad) return
    clearInterval(interval)
    ad.style.opacity = '0'
    ad.style.pointerEvents = 'none'
    incrementScore(adScore)
  }, [])

  return (
    <div
      ref={adRef}
      className="opacity-0 pointer-events-none absolute bg-white border-2 border-red-500 w-max h-max p-4 rounded-md shadow-xl pr-8 transition-opacity 5000ms ease-out"
    >
      <Image
        onClick={onClose}
        className="absolute top-2 right-2 cursor-pointer"
        src="/idle_game/close.svg"
        alt="close"
        height={16}
        width={16}
      />
      <h5 className="text-yellow-600" />
      <div
        className="absolute bottom-0 z-10 left-0 h-1 bg-blue-500 rounded-bl-md"
        style={{ width: `${100 - progress}%` }}
      ></div>
    </div>
  )
}
