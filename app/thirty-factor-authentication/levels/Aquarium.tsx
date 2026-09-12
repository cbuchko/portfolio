import { useEffect, useMemo, useRef, useState } from 'react'
import { useMusic } from '@/app/utils/audio'
import { ContentProps, ControlProps } from './types'

const aquariumMotion = {
  desktop: {
    spawnMs: 500,
    moveMs: 200,
    minJump: 200,
    maxJump: 600,
    glideMs: 1500,
  },
  mobile: {
    spawnMs: 500,
    moveMs: 150,
    minJump: 200,
    maxJump: 300,
    glideMs: 1500,
  },
} as const

const generateMaxFish = () => Math.floor(Math.random() * (55 - 40) + 40)

const swimOffMs = (isMobile: boolean) => {
  const { moveMs, minJump, glideMs } = isMobile ? aquariumMotion.mobile : aquariumMotion.desktop
  const distance = window.innerWidth + 100
  const hops = Math.ceil(distance / minJump)
  return hops * moveMs + glideMs
}

const FISH_SIZE = 48

type YBounds = { minY: number; maxY: number }

const snapshotYBounds = (isMobile: boolean): YBounds => {
  const visual = window.visualViewport?.height ?? window.innerHeight
  const height = Math.min(window.innerHeight, visual)
  const pad = isMobile ? 12 : 0
  const minY = pad
  return { minY, maxY: Math.max(minY, height - FISH_SIZE - pad) }
}

const clampFishY = (y: number, bounds: YBounds) =>
  Math.min(bounds.maxY, Math.max(bounds.minY, y))

const FishOptions = [
  'Anchovy',
  'Angelfish',
  'Bass',
  'Catfish',
  'Clownfish',
  'Pufferfish',
  'Surgeonfish',
]

const fishSrc = (type: string) => `/thirty-factor-authentication/fish/${type}.png`

const preloadFishSprites = () => {
  FishOptions.forEach((type) => {
    const img = new window.Image()
    img.src = fishSrc(type)
  })
}

export const AquariumContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  layout,
}: ContentProps) => {
  const { isMobile } = layout
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [maxFish, setMaxFish] = useState(0)
  const [fishCount, setFishCount] = useState(0)
  const [waveId, setWaveId] = useState(0)
  const [numberInput, setNumberInput] = useState('')
  const { play: playSoundtrack, isPlaying: isSoundtrackPlaying } = useMusic('aquariumTheme')

  const startWave = () => {
    cancelAdvance()
    setNumberInput('')
    preloadFishSprites()
    setMaxFish(generateMaxFish())
    setFishCount(0)
    setWaveId((id) => id + 1)
    setPhase('running')
    if (!isSoundtrackPlaying()) playSoundtrack()
  }

  const setCountValue = (next: string) => {
    setNumberInput(next)
    if (next !== '' && fishCount === parseInt(next)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const handleInputChange = (input: string) => {
    setCountValue(input.replace(/\D/g, ''))
  }

  const bumpCount = (delta: number) => {
    const current = numberInput === '' ? 0 : parseInt(numberInput)
    setCountValue(String(Math.max(0, current + delta)))
  }

  useEffect(() => {
    if (phase !== 'running' || maxFish <= 0 || fishCount < maxFish) return
    const timeout = window.setTimeout(() => setPhase('done'), swimOffMs(isMobile))
    return () => window.clearTimeout(timeout)
  }, [phase, fishCount, maxFish, isMobile])

  useEffect(() => {
    if (phase === 'done' && numberInput !== '' && fishCount === parseInt(numberInput)) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [phase, fishCount, numberInput, validateAdvance, cancelAdvance])

  return (
    <>
      <p className="text-lg">Oh no! Our aquarium broke and the fish are loose!</p>
      <p className="text-lg">Please count the number of fish that swim by!</p>
      <div className="mt-4 mx-auto w-44">
        {phase === 'idle' && (
          <button
            type="button"
            className="min-h-11 w-full px-6 py-2 border-2 border-black rounded-md cursor-pointer bg-white"
            onClick={startWave}
          >
            Start
          </button>
        )}
        {phase === 'running' && (
          <div className="min-h-11 w-full px-6 py-2 border-2 border-black rounded-md bg-white flex items-center justify-center">
            <span className="animate-pulse">In progress...</span>
          </div>
        )}
        {phase === 'done' && (
          <>
            <button
              type="button"
              className="min-h-11 w-full px-6 py-2 border-2 border-black rounded-md cursor-pointer bg-white"
              onClick={startWave}
            >
              Count Again
            </button>
            <div className="mt-2 flex min-h-11 w-full border-2 border-black rounded-md overflow-hidden bg-white">
              <button
                type="button"
                className="w-11 shrink-0 border-r-2 border-black cursor-pointer disabled:opacity-40"
                disabled={numberInput === '' || numberInput === '0'}
                onClick={() => bumpCount(-1)}
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numberInput}
                placeholder="0"
                className="min-w-0 flex-1 px-1 text-center outline-none"
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (!numberInput) return
                  if (e.key === 'Enter') handleLevelAdvance()
                }}
              />
              <button
                type="button"
                className="w-11 shrink-0 border-l-2 border-black cursor-pointer"
                onClick={() => bumpCount(1)}
              >
                +
              </button>
            </div>
          </>
        )}
      </div>
      {typeof window !== 'undefined' && phase === 'running' && (
        <FishTank
          maxFish={maxFish}
          fishCount={fishCount}
          setFishCount={setFishCount}
          waveId={waveId}
          isMobile={isMobile}
        />
      )}
      <div className="fixed top-0 left-0 h-screen w-screen bg-blue-500/30 pointer-events-none" />
    </>
  )
}

const FishTank = ({
  fishCount,
  setFishCount,
  maxFish,
  waveId,
  isMobile,
}: {
  fishCount: number
  setFishCount: React.Dispatch<React.SetStateAction<number>>
  maxFish: number
  waveId: number
  isMobile: boolean
}) => {
  const spawnMs = isMobile ? aquariumMotion.mobile.spawnMs : aquariumMotion.desktop.spawnMs
  const yBounds = useMemo(() => snapshotYBounds(isMobile), [waveId, isMobile])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFishCount((count) => {
        if (count >= maxFish) return count
        const increase = Math.random() < 0.2 ? 2 : 1
        return Math.min(maxFish, count + increase)
      })
    }, spawnMs)

    return () => window.clearInterval(interval)
  }, [waveId, maxFish, spawnMs, setFishCount])

  return Array.from({ length: fishCount }).map((_, idx) => (
    <Fish key={`${waveId}-${idx}`} isMobile={isMobile} yBounds={yBounds} />
  ))
}

const Fish = ({ isMobile, yBounds }: { isMobile: boolean; yBounds: YBounds }) => {
  const motion = isMobile ? aquariumMotion.mobile : aquariumMotion.desktop
  const { initialPosition, isLeft } = useMemo(
    () => getInitialPosition(yBounds),
    [yBounds]
  )
  const positionRef = useRef(initialPosition)
  const nodeRef = useRef<HTMLDivElement>(null)
  const [fishType] = useState(
    () => FishOptions[Math.floor(Math.random() * FishOptions.length)]
  )
  const [painted, setPainted] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const yDirRef = useRef<1 | -1>(Math.random() < 0.5 ? 1 : -1)
  const hopMs = useRef(motion.moveMs + Math.floor(Math.random() * 40) - 16).current
  const swim = useMemo(
    () => ({
      bobPx: -(6 + Math.random() * 8),
      bobMs: 620 + Math.random() * 520,
      bobDelay: -(Math.random() * 900),
    }),
    []
  )
  // Phone: finish each hop before the next. A 1500ms ease cut every 150ms
  // on a 390px screen is the vibrate.
  const tweenMs = isMobile ? hopMs : motion.glideMs

  useEffect(() => {
    if (imgRef.current?.complete) setPainted(true)
  }, [fishType])

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    node.style.transform = `translate3d(${initialPosition.x}px, ${initialPosition.y}px, 0)`
    node.style.transition = painted
      ? `transform ${tweenMs}ms ${isMobile ? 'ease-in-out' : 'linear'}`
      : 'none'
  }, [initialPosition, painted, tweenMs, isMobile])

  useEffect(() => {
    if (!painted || isLeft === undefined) return
    const { minJump, maxJump } = motion
    const vw = window.visualViewport?.width ?? window.innerWidth
    const interval = setInterval(() => {
      const { x: oldX, y: oldY } = positionRef.current
      const moveMagnitude = Math.random() * (maxJump - minJump) + minJump
      const xStep = isMobile ? Math.min(moveMagnitude, Math.max(56, vw * 0.2)) : moveMagnitude
      const newX = isLeft ? oldX + xStep : oldX - xStep
      // Phone: small random weave each hop (not a locked diagonal).
      // Desktop keeps the bigger committed dart.
      let yStep = isMobile
        ? (Math.random() < 0.5 ? 1 : -1) * (12 + Math.random() * 26)
        : yDirRef.current * moveMagnitude
      let newY = oldY + yStep
      if (newY <= yBounds.minY || newY >= yBounds.maxY) {
        yDirRef.current = yDirRef.current === 1 ? -1 : 1
        yStep = isMobile ? -yStep : yDirRef.current * Math.abs(yStep)
        newY = oldY + yStep
      }
      const next = { x: newX, y: clampFishY(newY, yBounds) }
      positionRef.current = next
      const node = nodeRef.current
      if (node) node.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`
    }, hopMs)

    return () => {
      clearInterval(interval)
    }
  }, [painted, isLeft, isMobile, motion, yBounds, hopMs])

  return (
    <div
      ref={nodeRef}
      className="fixed top-0 left-0 pointer-events-none will-change-transform"
      style={{
        opacity: painted ? 1 : 0,
        transform: `translate3d(${initialPosition.x}px, ${initialPosition.y}px, 0)`,
      }}
    >
      <div
        className="aquarium-fish-bob"
        style={
          {
            '--aquarium-bob': `${swim.bobPx}px`,
            '--aquarium-bob-ms': `${swim.bobMs}ms`,
            '--aquarium-bob-delay': `${swim.bobDelay}ms`,
          } as React.CSSProperties
        }
      >
        <img
          ref={imgRef}
          src={fishSrc(fishType)}
          alt=""
          height={FISH_SIZE}
          width={FISH_SIZE}
          draggable={false}
          className={isLeft ? undefined : 'rotate-y-180'}
          onLoad={() => setPainted(true)}
        />
      </div>
    </div>
  )
}

const getInitialPosition = (yBounds: YBounds) => {
  let x: number
  const isLeft = Math.random() > 0.5
  if (isLeft) {
    x = -50
  } else {
    x = window.innerWidth
  }
  const { minY, maxY } = yBounds
  const y = minY + Math.random() * Math.max(0, maxY - minY)
  return { initialPosition: { x, y }, isLeft }
}

export const AquariumControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
