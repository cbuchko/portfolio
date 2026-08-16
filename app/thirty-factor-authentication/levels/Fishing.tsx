import { useCallback, useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'
import { useSound } from '@/app/utils/useSounds'
import { interpolateThreeColors } from '../utils'

const playAreaHeight = 300
const rodHeight = 65
const fishHeight = 32
const fishWidth = 32

const rodRisePerSec = 110
const rodFallPerSec = 160
const progressGainPerSec = 9
const progressLosePerSec = 12

const fishMinY = 0
const fishMaxY = playAreaHeight - fishHeight

function rangesOverlap(a0: number, a1: number, b0: number, b1: number) {
  return a0 < b1 && a1 > b0
}

export const FishingContent = ({ handleLevelAdvance, isMobile }: ContentProps) => {
  const [progressDisplay, setProgressDisplay] = useState(40)
  const [progressColor, setProgressColor] = useState(() =>
    interpolateThreeColors('#FF0000', '#FFFF00', '#00FF00', 0.4)
  )
  const [isHoldingVisual, setIsHoldingVisual] = useState(false)

  const fishElRef = useRef<HTMLImageElement>(null)
  const rodElRef = useRef<HTMLDivElement>(null)
  const progressElRef = useRef<HTMLDivElement>(null)

  const fishYRef = useRef(100)
  const rodYRef = useRef(0)
  const progressRef = useRef(40)
  const fishVelRef = useRef(40)
  const fishRetargetAtRef = useRef(0)
  const fishDashUntilRef = useRef(0)
  const isHoldingSpaceRef = useRef(false)
  const finishedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const lastUiPushRef = useRef(0)

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

  const paint = useCallback((progress: number) => {
    if (fishElRef.current) {
      fishElRef.current.style.bottom = `${fishYRef.current}px`
    }
    if (rodElRef.current) {
      rodElRef.current.style.transform = `translateY(-${rodYRef.current}px)`
    }
    if (progressElRef.current) {
      progressElRef.current.style.height = `${Math.min(100, Math.max(0, progress))}%`
    }
  }, [])

  const resetRound = useCallback(() => {
    fishYRef.current = 100
    rodYRef.current = 0
    progressRef.current = 40
    fishVelRef.current = 40
    fishRetargetAtRef.current = 0
    fishDashUntilRef.current = 0
    isHoldingSpaceRef.current = false
    finishedRef.current = false
    lastTsRef.current = null
    setIsHoldingVisual(false)
    setProgressDisplay(40)
    const color = interpolateThreeColors('#FF0000', '#FFFF00', '#00FF00', 0.4)
    setProgressColor(color)
    paint(40)
    if (progressElRef.current) {
      progressElRef.current.style.backgroundColor = color
    }
  }, [paint])

  const endRoundRef = useRef<(won: boolean) => void>(() => {})
  const playReelRef = useRef(playReel)
  const stopSoundRef = useRef(stopSound)
  playReelRef.current = playReel
  stopSoundRef.current = stopSound

  const endRound = useCallback(
    (won: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      stopSoundRef.current()
      isHoldingSpaceRef.current = false
      setIsHoldingVisual(false)

      if (won) {
        handleLevelAdvance(true)
        return
      }

      // Strike, then hard-reset the minigame so the round starts fresh
      handleLevelAdvance()
      resetRound()
    },
    [handleLevelAdvance, resetRound]
  )
  endRoundRef.current = endRound

  // Single simulation + render loop
  useEffect(() => {
    const tick = (ts: number) => {
      if (finishedRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const last = lastTsRef.current ?? ts
      const dt = Math.min(0.05, (ts - last) / 1000)
      lastTsRef.current = ts

      // --- fish: erratic continuous motion (bursts + frequent flips, no teleports) ---
      if (ts >= fishRetargetAtRef.current) {
        const dir = Math.random() < 0.5 ? -1 : 1
        const roll = Math.random()

        if (roll < 0.28) {
          // Hard burst — covers a lot of distance quickly, but frame-by-frame
          fishVelRef.current = dir * (190 + Math.random() * 110)
          fishDashUntilRef.current = ts + 280 + Math.random() * 260
          fishRetargetAtRef.current = ts + 180 + Math.random() * 220
        } else if (roll < 0.58) {
          // Medium burst / juke
          fishVelRef.current = dir * (110 + Math.random() * 70)
          fishDashUntilRef.current = ts + 140 + Math.random() * 200
          fishRetargetAtRef.current = ts + 120 + Math.random() * 260
        } else {
          // Twitchy cruise — short segments so it never settles
          fishVelRef.current = dir * (55 + Math.random() * 65)
          fishDashUntilRef.current = 0
          fishRetargetAtRef.current = ts + 90 + Math.random() * 200
        }
      }

      // Random mid-path jukes while not already in a hard burst
      if (ts >= fishDashUntilRef.current && Math.random() < 0.018) {
        fishVelRef.current *= -1.15 - Math.random() * 0.4
        fishRetargetAtRef.current = Math.min(fishRetargetAtRef.current, ts + 80)
      }

      // During a dash, don't let edge soft-damping kill the burst
      const dashing = ts < fishDashUntilRef.current

      let fishY = fishYRef.current + fishVelRef.current * dt
      if (fishY <= fishMinY) {
        fishY = fishMinY
        fishVelRef.current = Math.abs(fishVelRef.current) * (dashing ? 1.05 : 1)
      } else if (fishY >= fishMaxY) {
        fishY = fishMaxY
        fishVelRef.current = -Math.abs(fishVelRef.current) * (dashing ? 1.05 : 1)
      }
      if (!dashing) {
        if (fishY < 40 && fishVelRef.current < 0) fishVelRef.current *= 0.85
        if (fishY > fishMaxY - 40 && fishVelRef.current > 0) fishVelRef.current *= 0.85
      }
      fishYRef.current = fishY

      // --- rod ---
      let rodY = rodYRef.current
      if (isHoldingSpaceRef.current) {
        rodY = Math.min(playAreaHeight - rodHeight, rodY + rodRisePerSec * dt)
      } else {
        rodY = Math.max(0, rodY - rodFallPerSec * dt)
      }
      rodYRef.current = rodY

      // Precise on-rod: fish sprite AABB vs rod bar (bottom-up coords)
      const onRod = rangesOverlap(fishY, fishY + fishHeight, rodY, rodY + rodHeight)

      let progress = progressRef.current
      if (onRod) {
        if (!isAudioPlayingRef.current) playReelRef.current()
        progress = Math.min(100, progress + progressGainPerSec * dt)
      } else {
        if (isAudioPlayingRef.current) stopSoundRef.current()
        progress = Math.max(0, progress - progressLosePerSec * dt)
      }
      progressRef.current = progress
      paint(progress)

      if (progress >= 100) {
        endRoundRef.current(true)
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (progress <= 0) {
        endRoundRef.current(false)
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (ts - lastUiPushRef.current > 100) {
        lastUiPushRef.current = ts
        setProgressDisplay(progress)
        const color = interpolateThreeColors('#FF0000', '#FFFF00', '#00FF00', progress / 100)
        setProgressColor(color)
        if (progressElRef.current) {
          progressElRef.current.style.backgroundColor = color
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [isAudioPlayingRef, paint])

  const startHold = useCallback(() => {
    if (!isSoundtrackPlayingRef.current) {
      playSoundtrack()
      isSoundtrackPlayingRef.current = true
    }
    if (isHoldingSpaceRef.current) return
    isHoldingSpaceRef.current = true
    setIsHoldingVisual(true)
  }, [isSoundtrackPlayingRef, playSoundtrack])

  const endHold = useCallback(() => {
    isHoldingSpaceRef.current = false
    setIsHoldingVisual(false)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return
      event.preventDefault()
      startHold()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      endHold()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [endHold, startHold])

  return (
    <div className="select-none">
      <p className="text-lg">Take a load off and catch a fish.</p>
      {!isMobile && <p className="text-lg">Hold SPACE to raise your lure.</p>}
      <p className="text-lg">Keep the lure on the fish to catch it.</p>
      <div className="mt-8 flex gap-2 justify-center">
        <div
          className="relative w-8 outline-6 outline-amber-800 rounded-md bg-blue-300"
          style={{ height: playAreaHeight }}
        >
          <div
            ref={rodElRef}
            className="absolute bottom-0 bg-green-500 w-full rounded-md will-change-transform"
            style={{
              height: rodHeight,
              transform: `translateY(-${rodYRef.current}px)`,
            }}
          />
          <Image
            ref={fishElRef}
            src={`/thirty-factor-authentication/fish/Anchovy.png`}
            alt="fish"
            height={fishHeight}
            width={fishWidth}
            className="absolute rotate-y-180 -rotate-z-45 will-change-[bottom] pointer-events-none"
            style={{ bottom: fishYRef.current }}
            draggable={false}
            priority
          />
        </div>
        <div className="relative w-3 border-2 rounded-lg" style={{ height: playAreaHeight }}>
          <div
            ref={progressElRef}
            className="absolute bottom-0 w-full rounded-lg origin-bottom will-change-[height]"
            style={{
              height: `${Math.min(100, progressDisplay)}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>
      {isMobile && (
        <button
          type="button"
          className={`w-full mx-auto mt-8 shadow-lg select-none border rounded-lg py-4 pointer-cursor hold-button ${
            isHoldingVisual ? 'bg-gray-200' : ''
          }`}
          onPointerDown={(e) => {
            e.preventDefault()
            startHold()
          }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
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
    </div>
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
