import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'
import { useSound } from '@/app/utils/useSounds'
import { interpolateThreeColors } from '../utils'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useIsMobile } from '@/app/utils/useIsMobile'
import { mobileWidthBreakpoint } from '../constants'

const playAreaHeight = 300
const rodHeight = 75
export const FishingContent = ({ handleLevelAdvance }: ContentProps) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)
  const [fishPosition, setFishPosition] = useState(100)
  const [rodPosition, setRodPosition] = useState(0)
  const [progress, setProgress] = useState(40)
  const fishRef = useRef(fishPosition)
  const rodRef = useRef(rodPosition)
  const progressRef = useRef(progress)

  const ticksSinceLastSpace = useRef(1)
  const isHoldingSpace = useRef(false)
  const rodIntervalRef = useRef<NodeJS.Timeout>(null)
  const { playSound: playSoundtrack, isAudioPlayingRef: isSoundtrackPlayingRef } = useSound(
    '/thirty-factor-authentication/sounds/stardew.mp3',
    0.25,
    true
  )
  const {
    playSound: playReel,
    stopSound,
    isAudioPlayingRef,
  } = useSound('/thirty-factor-authentication/sounds/reel.mp3', 0.05)

  //keep track of state values in refs so they dont affect the gameplay loop
  useEffect(() => {
    fishRef.current = fishPosition
  }, [fishPosition])

  useEffect(() => {
    rodRef.current = rodPosition
  }, [rodPosition])

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const handleReel = useCallback(() => {
    if (!isSoundtrackPlayingRef.current) {
      playSoundtrack()
      isSoundtrackPlayingRef.current = true
    }
    ticksSinceLastSpace.current = 1
    isHoldingSpace.current = true

    const loopHold = () => {
      if (!isHoldingSpace.current) return
      setRodPosition((position) => {
        const newPosition = position + 5
        if (newPosition > playAreaHeight - rodHeight) return playAreaHeight - rodHeight
        return newPosition
      })
    }
    rodIntervalRef.current = setInterval(loopHold, 50)
  }, [isSoundtrackPlayingRef, playSoundtrack])

  const gameUpdateLoop = useCallback(() => {
    const oldY = fishRef.current

    /** fish movement */
    let newY
    const upOrDown = Math.random()
    const shouldSpikeMovement = Math.random()
    const moveMagnitude = shouldSpikeMovement < 0.05 ? 10 * Math.random() * (25 - 15) + 15 : 10

    if ((upOrDown < 0.5 || oldY > playAreaHeight - 50) && oldY > 50) {
      newY = oldY - moveMagnitude //move up
    } else newY = oldY + moveMagnitude //move down

    if (newY < 0) newY = 0
    if (newY > playAreaHeight - 25) newY = playAreaHeight - 25
    setFishPosition(newY)

    /** rod falling */
    if (ticksSinceLastSpace.current === 0 && !isHoldingSpace.current) {
      setRodPosition((position) => {
        const newPosition = position - 15
        if (newPosition < 0) return 0
        return newPosition
      })
    } else ticksSinceLastSpace.current = Math.max(ticksSinceLastSpace.current - 1, 0)

    /** progress bar */
    if (fishRef.current > rodRef.current && fishRef.current < rodRef.current + rodHeight) {
      if (!isAudioPlayingRef.current) playReel()
      setProgress((progress) => progress + 0.5)
    } else if (progressRef.current > 0) {
      stopSound()
      setProgress((progress) => progress - 0.5)
    }
  }, [isAudioPlayingRef, playReel, stopSound])

  useEffect(() => {
    const interval = setInterval(() => {
      gameUpdateLoop()
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [playReel, isAudioPlayingRef, stopSound, gameUpdateLoop])

  useEffectInitializer(() => {
    if (progress >= 100) handleLevelAdvance(true)
    if (progress <= 0) {
      setFishPosition(0)
      setRodPosition(0)
      setProgress(40)
      handleLevelAdvance()
    }
  }, [progress, handleLevelAdvance])

  const handleRodMove = useCallback(
    (event: KeyboardEvent) => {
      if (event.code.toLocaleLowerCase() !== 'space' || isHoldingSpace.current) return
      handleReel()
    },
    [handleReel]
  )

  const handleRodRelease = useCallback((event: KeyboardEvent) => {
    if (event.code.toLocaleLowerCase() !== 'space') return
    isHoldingSpace.current = false
    if (rodIntervalRef.current) clearInterval(rodIntervalRef.current)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleRodMove)
    window.addEventListener('keyup', handleRodRelease)

    return () => {
      window.removeEventListener('keydown', handleRodMove)
      window.removeEventListener('keyup', handleRodRelease)
    }
  }, [handleRodMove, handleRodRelease])

  const progressColor = useMemo(() => {
    return interpolateThreeColors('#FF0000', '#FFFF00', '#00FF00', progress / 100)
  }, [progress])

  const handleMobileRodReel = () => {
    handleReel()
  }

  const handleMobileRodRelease = () => {
    isHoldingSpace.current = false
    if (rodIntervalRef.current) clearInterval(rodIntervalRef.current)
  }

  return (
    <>
      <p className="text-lg">Take a load off and catch a fish.</p>
      {!isMobile && <p className="text-lg">Hold SPACE to raise your lure.</p>}
      <p className="text-lg">Keep the lure on the fish to catch it.</p>
      <div className="mt-8 flex gap-2 justify-center">
        <div
          className="relative w-8 outline-6 outline-amber-800 rounded-md bg-blue-300"
          style={{ height: playAreaHeight }}
        >
          <div
            className="absolute bg-green-500 w-full rounded-md transition-all bottom-0"
            style={{ transform: `translateY(-${rodPosition}px)`, height: rodHeight }}
          />
          <Image
            src={`/thirty-factor-authentication/fish/Anchovy.png`}
            alt={'fish'}
            height={32}
            width={32}
            className="absolute rotate-y-180 -rotate-z-45 transition-all"
            style={{ bottom: fishPosition }}
          />
        </div>
        <div className="relative w-3 border-2 rounded-lg" style={{ height: playAreaHeight }}>
          <div
            className="absolute bottom-0 w-full  rounded-lg origin-bottom transition-all"
            style={{ height: `${Math.min(100, progress)}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>
      {isMobile && (
        <button
          className="w-full mx-auto mt-8 shadow-lg select-none border rounded-lg py-4 pointer-cursor hold-button active:bg-gray-200"
          onPointerDown={handleMobileRodReel}
          onPointerUp={handleMobileRodRelease}
        >
          REEL
        </button>
      )}
      {!isMobile && (
        <>
          <Image
            className="leaf leaf-1 select-none"
            src="https://cdn3.iconfinder.com/data/icons/spring-23/32/leaf-spring-plant-ecology-green-512.png"
            alt="leaf"
            width={32}
            height={32}
          />
          <Image
            className="leaf leaf-2 select-none"
            src="https://cdn3.iconfinder.com/data/icons/spring-23/32/leaf-spring-plant-ecology-green-512.png"
            alt="leaf"
            width={32}
            height={32}
          />
          <Image
            className="leaf leaf-3 select-none"
            src="https://cdn3.iconfinder.com/data/icons/spring-23/32/leaf-spring-plant-ecology-green-512.png"
            alt="leaf"
            width={32}
            height={32}
          />
          <div className="fixed left-0 top-0 w-screen h-screen sunset-gradient -z-10" />
          <SeaSvg className="fixed left-0 -bottom-10 -z-1" />
        </>
      )}
    </>
  )
}

export const FishingControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

/** Credit to Nicholas Gratton from this codepen: https://codepen.io/ngratton/pen/MZKJvr*/
function SeaSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className={`sea ${props.className ?? ''}`}
      viewBox="0 0 800 350"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky */}
      <defs>
        <radialGradient id="SVGID_1_" cx="400" cy="202.5" r="317.3423">
          <stop offset="0" stopColor="#E6DBFA" />
          <stop offset="0.03659654" stopColor="#E5DCFA" />
          <stop offset="0.5708" stopColor="#D5EBFE" />
          <stop offset="1" stopColor="#D0F0FF" />
        </radialGradient>

        <linearGradient id="SVGID_2_" x1="400.0005" y1="602" x2="400.0005" y2="202.3545">
          <stop offset="0" stopColor="#0000FF" />
          <stop offset="0.1789" stopColor="#0020EC" />
          <stop offset="0.4149" stopColor="#0043D7" />
          <stop offset="0.6374" stopColor="#005CC8" />
          <stop offset="0.8386" stopColor="#006CBF" />
          <stop offset="1" stopColor="#0071BC" />
        </linearGradient>

        <linearGradient id="SVGID_3_" x1="400.0005" y1="600" x2="400.0005" y2="214.3545">
          <stop offset="0" stopColor="#0000FF" />
          <stop offset="0.1643" stopColor="#0B2CF7" />
          <stop offset="0.3574" stopColor="#1559F0" />
          <stop offset="0.5431" stopColor="#1E7DEA" />
          <stop offset="0.7168" stopColor="#2496E6" />
          <stop offset="0.874" stopColor="#28A6E3" />
          <stop offset="1" stopColor="#29ABE2" />
        </linearGradient>
      </defs>

      <g id="DarkWaves" className="DarkWaves">
        <path
          fill="url(#SVGID_2_)"
          d="M761.8,202.4c-24.7,0-36.7,7.2-49.5,14.7c-13.2,7.8-26.8,15.9-53.8,15.9c-27,0-40.6-8.1-53.8-15.9
          c-12.8-7.6-24.9-14.7-49.6-14.7c-24.7,0-36.8,7.2-49.6,14.7c-13.2,7.8-26.8,15.9-53.8,15.9c-27,0-40.7-8.1-53.8-15.9
          c-12.8-7.6-24.9-14.7-49.6-14.7c-24.7,0-36.8,7.2-49.6,14.7c-13.2,7.8-26.8,15.9-53.8,15.9c-27,0-40.7-8.1-53.8-15.9
          c-12.8-7.6-24.9-14.7-49.6-14.7c-24.7,0-36.8,7.2-49.6,14.7C78.7,224.9,65,232.9,38,232.9c-27,0-40.4-8.1-53.6-15.9
          c-12.1-7.1-24.3-13.9-45.4-14.6V602h922V232.9c-22.6-0.8-37.2-8.4-49.7-15.8C798.5,209.5,786.5,202.4,761.8,202.4z"
        />
      </g>

      <g id="LightWaves" className="LightWaves">
        <path
          fill="url(#SVGID_3_)"
          d="M750.9,229.8c-14.8-7.9-28.7-15.4-57.2-15.4c-28.5,0-42.4,7.5-57.2,15.4c-15.2,8.2-30.9,16.6-62.1,16.6
          s-46.9-8.4-62.1-16.6c-14.8-7.9-28.7-15.4-57.2-15.4c-28.5,0-42.4,7.5-57.2,15.4c-15.2,8.2-30.9,16.6-62.1,16.6
          c-31.2,0-46.9-8.4-62.1-16.6c-14.8-7.9-28.7-15.4-57.2-15.4c-28.5,0-42.4,7.5-57.2,15.4c-15.2,8.2-30.9,16.6-62.1,16.6
          c-31.2,0-46.9-8.4-62.1-16.6c-14.8-7.9-28.9-15.4-57.3-15.4c-16.9,0-28.8,2.6-38.8,6.4V600h922V237c-12,5.3-26,9.4-47.8,9.4
          C782.1,246.4,766.1,237.9,750.9,229.8z"
        />
      </g>

      <g id="WhiteWaves" opacity="0.76" className="WhiteWaves">
        <path
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeMiterlimit="10"
          d="M-71,220c94.2,0,94.2,18,188.4,18c94.2,0,94.2-18,188.4-18
          c94.2,0,94.2,18,188.4,18c94.2,0,94.2-18,188.4-18s94.2,18,188.4,18"
        />
      </g>
    </svg>
  )
}
