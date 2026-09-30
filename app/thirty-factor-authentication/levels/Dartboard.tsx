import { useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import Image from 'next/image'
import { useSfx } from '@/app/utils/audio'
import classNames from 'classnames'

type Position = { x: number; y: number }
type StuckDart = Position & { id: number }

// Board geometry is in units of the playing radius (outer edge of the doubles ring = 1).
const numberRingRadius = 1.25
const bullHitRadius = 0.1
const soberAfterSeconds = 120

// 1 at the start of the level, 0 once sober. The curve keeps the first ~25s near hopeless,
// makes ~55s a fair shot, and has the sway inside the bull by ~90s.
const drunkennessAt = (seconds: number) => Math.max(0, 1 - seconds / soberAfterSeconds)
const swayAmplitude = (drunk: number) => 0.05 + 1.35 * Math.pow(drunk, 2.2)
const swaySpeed = (drunk: number) => 0.7 + 1.3 * drunk

// Converts board units to a percentage offset within the square board frame.
const toFramePercent = (value: number) => 50 + (value / numberRingRadius) * 50

export const DartboardContent = ({ handleLevelAdvance, layout }: ContentProps) => {
  const { isShort, isNarrow, fit } = layout
  const [darts, setDarts] = useState<StuckDart[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const playDartThrow = useSfx('dartThrow')
  const playNiceThrow = useSfx('niceThrow')
  const playMiss = useSfx('miss')

  const aimRef = useRef<Position>({ x: 0, y: 0 })
  const frameRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLImageElement>(null)
  const timeouts = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const start = performance.now()
    let last = start
    let phase = 0
    let rafId = 0

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const drunk = drunkennessAt((now - start) / 1000)
      phase += dt * swaySpeed(drunk)
      const amplitude = swayAmplitude(drunk)
      const x = amplitude * (0.72 * Math.sin(1.3 * phase + 0.4) + 0.28 * Math.sin(3.1 * phase))
      const y = amplitude * (0.72 * Math.sin(1.05 * phase) + 0.28 * Math.sin(2.4 * phase + 1.2))
      aimRef.current = { x, y }

      const reticle = reticleRef.current
      if (reticle) {
        reticle.style.left = `${toFramePercent(x)}%`
        reticle.style.top = `${toFramePercent(y)}%`
      }

      const ghost = ghostRef.current
      if (ghost) {
        const offset = drunk * 7
        ghost.style.transform = `translate(${offset * Math.sin(0.6 * phase)}%, ${offset * 0.6 * Math.cos(0.45 * phase)}%)`
        ghost.style.opacity = `${Math.min(0.4, drunk * 0.6)}`
      }

      const blur = blurRef.current
      if (blur) {
        blur.style.filter = `blur(${drunk * 1.6}px) sepia(${drunk * 0.45}) saturate(${1 + drunk * 0.3})`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    const pending = timeouts.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const wobbleBoard = () => {
    const frame = frameRef.current
    if (!frame) return
    frame.classList.remove('dart-board-frame--wobble')
    void frame.offsetWidth
    frame.classList.add('dart-board-frame--wobble')
  }

  const handleDartFire = () => {
    if (!isPlaying) return
    playDartThrow()
    const landing = { ...aimRef.current }
    const isBullseye = Math.hypot(landing.x, landing.y) <= bullHitRadius
    setDarts((prev) => [...prev, { ...landing, id: Date.now() }])
    setIsPlaying(false)
    wobbleBoard()

    timeouts.current.push(
      setTimeout(() => {
        if (isBullseye) {
          playNiceThrow()
        } else {
          playMiss()
        }
      }, 500),
      setTimeout(() => {
        setIsPlaying(true)
        handleLevelAdvance(isBullseye)
      }, 2500)
    )
  }

  return (
    <>
      <p className="text-lg">Hey!</p>
      <p className="text-lg">I'm drunk and can't hit this bullseye.</p>
      <p className="text-lg">
        {`Tell me when to throw! `}
      </p>
      <p className="text-lg">
        {`Please! I want to win...`}
      </p>
      <div className="dart-pub-backdrop" />
      <div
        className={classNames('dart-wall tfa-gap', {
          'dart-wall--short': isShort,
        })}
      >
        <div
          ref={frameRef}
          className="dart-board-frame"
          style={{ width: `min(${Math.round(290 * fit)}px, ${isNarrow ? 78 : 64}%)` }}
        >
          <div ref={blurRef} className="dart-board-blur">
            <DartboardSvg />
            <div ref={ghostRef} className="dart-board-ghost">
              <DartboardSvg />
            </div>
            {darts.map((dart) => (
              <Dart key={dart.id} position={dart} />
            ))}
          </div>
          <Image
            ref={reticleRef}
            src="/thirty-factor-authentication/icons/crosshair3.png"
            alt=""
            height={reticleSize}
            width={reticleSize}
            className={classNames('dart-reticle', { 'opacity-0': !isPlaying })}
          />
        </div>
      </div>
      <button
        className={classNames(
          'w-full mx-auto tfa-gap shadow-lg select-none border rounded-lg cursor-pointer hold-button active:bg-gray-200 disabled:bg-gray-300 disabled:pointer-events-none',
          { 'py-4': !isNarrow, 'py-5 text-lg font-semibold': isNarrow }
        )}
        onClick={handleDartFire}
        onContextMenu={(e) => e.preventDefault()}
        disabled={!isPlaying}
      >
        THROW
      </button>
    </>
  )
}

const reticleSize = 48

const SEGMENT_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
const RING = {
  innerBull: 0.037,
  outerBull: 0.094,
  trebleInner: 0.582,
  trebleOuter: 0.629,
  doubleInner: 0.953,
  doubleOuter: 1,
}

const polar = (radius: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180
  return `${(radius * Math.cos(radians)).toFixed(4)} ${(radius * Math.sin(radians)).toFixed(4)}`
}

const sectorPath = (innerRadius: number, outerRadius: number, from: number, to: number) =>
  [
    `M ${polar(outerRadius, from)}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${polar(outerRadius, to)}`,
    `L ${polar(innerRadius, to)}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${polar(innerRadius, from)}`,
    'Z',
  ].join(' ')

const BOARD_SEGMENTS = SEGMENT_ORDER.map((number, idx) => {
  const center = -90 + idx * 18
  const from = center - 9
  const to = center + 9
  const isDark = idx % 2 === 0
  return {
    number,
    center,
    single: isDark ? '#1b1a17' : '#efe0bd',
    scoring: isDark ? '#c42a22' : '#1f7a3e',
    rings: [
      { d: sectorPath(RING.outerBull, RING.trebleInner, from, to), kind: 'single' },
      { d: sectorPath(RING.trebleInner, RING.trebleOuter, from, to), kind: 'scoring' },
      { d: sectorPath(RING.trebleOuter, RING.doubleInner, from, to), kind: 'single' },
      { d: sectorPath(RING.doubleInner, RING.doubleOuter, from, to), kind: 'scoring' },
    ] as const,
  }
})

const DartboardSvg = () => (
  <svg
    className="dart-board-svg"
    viewBox={`${-numberRingRadius} ${-numberRingRadius} ${numberRingRadius * 2} ${numberRingRadius * 2}`}
    aria-hidden
  >
    <circle r={numberRingRadius} fill="#141210" />
    <circle r={numberRingRadius - 0.015} fill="none" stroke="#3a3530" strokeWidth={0.02} />
    {BOARD_SEGMENTS.map((segment) => (
      <g key={segment.number}>
        {segment.rings.map((ring, idx) => (
          <path
            key={idx}
            d={ring.d}
            fill={ring.kind === 'single' ? segment.single : segment.scoring}
            stroke="#b8b8b8"
            strokeWidth={0.006}
          />
        ))}
        <text
          x={1.125 * Math.cos((segment.center * Math.PI) / 180)}
          y={1.125 * Math.sin((segment.center * Math.PI) / 180)}
          fill="#f2ede2"
          fontSize={0.13}
          fontWeight={700}
          fontFamily="Georgia, serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {segment.number}
        </text>
      </g>
    ))}
    <circle r={RING.outerBull} fill="#1f7a3e" stroke="#b8b8b8" strokeWidth={0.006} />
    <circle r={RING.innerBull} fill="#c42a22" stroke="#b8b8b8" strokeWidth={0.006} />
  </svg>
)

const Dart = ({ position }: { position: Position }) => (
  <svg
    className="dart-stuck"
    style={{ left: `${toFramePercent(position.x)}%`, top: `${toFramePercent(position.y)}%` }}
    viewBox="0 0 40 40"
    aria-hidden
  >
    <circle cx="4" cy="36" r="2.2" fill="#111" />
    <line x1="4" y1="36" x2="14" y2="26" stroke="#c9c9c9" strokeWidth="2.4" strokeLinecap="round" />
    <line x1="14" y1="26" x2="24" y2="16" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
    <path d="M22 18 L30 4 L34 12 Z" fill="#d23a2a" />
    <path d="M22 18 L36 10 L28 6 Z" fill="#f2c230" opacity="0.9" />
  </svg>
)
