import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { audioEngine } from '@/app/utils/audio'

const OVAL_W = 50
const OVAL_H = 75
/** Contact needed before the scanner starts moving. About two seconds. */
const FLEE_AT = 20
/** Progress gained since the last hop before a jump is forced. */
const HOP_GAP = 10
/** Contact needed before the chase speeds up. Letting go only pauses the bar. */
const CHASE_AT = 55
/** Past this the scanner is out of breath: slower, shorter hops. */
const TIRED_AT = 80
const FILL_MS = 100
/** Speed lines stop this far short of the landing point. */
const STREAK_TRIM = 14
const STREAK_TAIL_MS = 300

type Phase = 'still' | 'flee' | 'chase'
type Point = { x: number; y: number }
type Puff = { dx: number; dy: number; size: number; delay: number }
type Fx = {
  id: number
  kind: 'dust' | 'streak'
  x: number
  y: number
  angle: number
  length?: number
  ms?: number
  puffs?: Puff[]
}

/** Dust kicked up behind a hop that heads off at `angle`. */
const makePuffs = (angle: number, count = 7): Puff[] =>
  Array.from({ length: count }, (_, i) => {
    const spread = angle + Math.PI + (Math.random() - 0.5) * 2
    const reach = 22 + Math.random() * 30
    return {
      dx: Math.cos(spread) * reach,
      dy: Math.sin(spread) * reach - 10,
      size: 18 + Math.random() * 18,
      delay: i * 25,
    }
  })

const phaseFor = (progress: number, current: Phase): Phase => {
  if (current === 'chase' || progress >= CHASE_AT) return 'chase'
  if (progress >= FLEE_AT) return 'flee'
  return 'still'
}

const scanFrequency = (progress: number) => 480 + (Math.min(progress, 100) / 100) * 420

/**
 * A short upward chirp. Independent of the held tone, so it survives the hop.
 * Tired, it sags back down into a weary "hup".
 */
const playJumpYelp = (progress: number, tired: boolean) => {
  const ctx = audioEngine.getContext()
  if (!ctx || ctx.state !== 'running') return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const base = Math.max(80, scanFrequency(progress))
  const end = tired ? 0.22 : 0.12
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base, now)
  if (tired) {
    osc.frequency.exponentialRampToValueAtTime(base * 1.25, now + 0.06)
    osc.frequency.exponentialRampToValueAtTime(base * 0.7, now + 0.2)
  } else {
    osc.frequency.exponentialRampToValueAtTime(Math.min(1400, base * 1.8), now + 0.08)
  }
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(tired ? 0.05 : 0.07, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + end)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + end + 0.01)
  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }
}

/** Cartoon brake screech: a short burst of band-passed noise sliding down. */
const playSkid = () => {
  const ctx = audioEngine.getContext()
  if (!ctx || ctx.state !== 'running') return
  const length = Math.floor(ctx.sampleRate * 0.16)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 6
  const gain = ctx.createGain()
  const now = ctx.currentTime
  filter.frequency.setValueAtTime(3200, now)
  filter.frequency.exponentialRampToValueAtTime(1400, now + 0.15)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(now)
  source.stop(now + 0.16)
  source.onended = () => {
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }
}

/** Viewport box the oval is allowed to land in. Anything inside is fair game. */
const screenBox = () => {
  const viewport = window.visualViewport
  const width = viewport?.width ?? window.innerWidth
  const height = viewport?.height ?? window.innerHeight
  const offsetLeft = viewport?.offsetLeft ?? 0
  const offsetTop = viewport?.offsetTop ?? 0
  const minX = 8 - offsetLeft
  const minY = 8 - offsetTop
  return {
    minX,
    minY,
    maxX: Math.max(minX, width - OVAL_W - 8),
    maxY: Math.max(minY, height - OVAL_H - 8),
  }
}

/**
 * A random spot on screen. Farther landings are a bit more likely, so a hop
 * that starts on the edge tends to leave it instead of shuffling along it.
 * `maxDistance` pulls landings in along the same line (a tired hop).
 */
const randomHop = (pos: Point, maxDistance = Infinity): Point => {
  const box = screenBox()
  const spanX = Math.max(0, box.maxX - box.minX)
  const spanY = Math.max(0, box.maxY - box.minY)
  const candidates = Array.from({ length: 12 }, () => {
    const x = box.minX + Math.random() * spanX
    const y = box.minY + Math.random() * spanY
    const distance = Math.hypot(x - pos.x, y - pos.y)
    if (distance <= maxDistance) return { x, y }
    const k = maxDistance / distance
    return { x: pos.x + (x - pos.x) * k, y: pos.y + (y - pos.y) * k }
  })

  let total = 0
  const weights = candidates.map((point) => {
    const weight = Math.hypot(point.x - pos.x, point.y - pos.y)
    total += weight
    return weight
  })
  if (total <= 0) return candidates[0]

  let roll = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

export const BiometricContent = ({ validateAdvance, layout }: ContentProps) => {
  const startRef = useRef<HTMLDivElement>(null)
  const [startPosition, setStartPosition] = useState<Point>()
  const [scan, setScan] = useState<{ progress: number; phase: Phase }>({
    progress: 0,
    phase: 'still',
  })
  const progress = scan.progress
  const phase = scan.phase
  const contactRef = useRef(false)
  const progressRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => {
    progressRef.current = progress
  })

  const isComplete = progress >= 100
  useEffect(() => {
    if (!isComplete || doneRef.current) return
    doneRef.current = true
    validateAdvance()
  }, [isComplete, validateAdvance])

  useEffect(() => {
    let tone: { osc: OscillatorNode; gain: GainNode } | null = null

    const release = (fall: boolean) => {
      if (!tone) return
      const { osc, gain } = tone
      tone = null
      const now = osc.context.currentTime
      gain.gain.cancelScheduledValues(now)
      osc.frequency.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
      if (fall) {
        osc.frequency.setValueAtTime(Math.max(osc.frequency.value, 40), now)
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.6)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
        osc.stop(now + 0.72)
      } else {
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
        osc.stop(now + 0.09)
      }
      osc.onended = () => {
        osc.disconnect()
        gain.disconnect()
      }
    }

    const id = window.setInterval(() => {
      const ctx = audioEngine.getContext()
      if (progressRef.current >= 100) {
        release(true)
        return
      }
      const holding = contactRef.current
      if (!holding || !ctx || ctx.state !== 'running') {
        release(false)
        return
      }
      const target = scanFrequency(progressRef.current)
      if (!tone) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const now = ctx.currentTime
        osc.type = 'sine'
        osc.frequency.value = target
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.03, now + 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        tone = { osc, gain }
        return
      }
      tone.osc.frequency.setTargetAtTime(target, ctx.currentTime, 0.08)
    }, 50)

    return () => {
      window.clearInterval(id)
      release(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (doneRef.current) return
      setScan((current) => {
        if (current.progress >= 100) return current
        const progress = contactRef.current ? current.progress + 1 : current.progress
        const phase = phaseFor(progress, current.phase)
        if (progress === current.progress && phase === current.phase) return current
        return { progress, phase }
      })
    }, FILL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    // The first paint can still be the desktop layout. Wait until the viewport
    // is known, and keep matching the placeholder until the player touches it.
    if (layout.viewportWidth <= 0 || progress > 0) return

    const measure = () => {
      const spot = startRef.current
      if (!spot) return
      const rect = spot.getBoundingClientRect()
      const viewport = window.visualViewport
      setStartPosition({
        x: rect.left - (viewport?.offsetLeft ?? 0),
        y: rect.top - (viewport?.offsetTop ?? 0),
      })
    }

    measure()
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', measure)
    viewport?.addEventListener('scroll', measure)
    window.addEventListener('resize', measure)
    return () => {
      viewport?.removeEventListener('resize', measure)
      viewport?.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [layout.viewportWidth, layout.viewportHeight, layout.isNarrow, progress])

  return (
    <>
      <p className="text-lg">
        Keep your finger on the scanner to complete Biometric Authentication.
      </p>
      {startPosition && (
        <Scanner
          key={`${Math.round(startPosition.x)},${Math.round(startPosition.y)}`}
          startPosition={startPosition}
          phase={phase}
          progress={progress}
          isComplete={isComplete}
          isTouch={layout.isTouch}
          onContact={(over) => {
            contactRef.current = over
          }}
          onTakeoff={(tired) => {
            playJumpYelp(progressRef.current, tired)
          }}
        />
      )}
      <div className="mt-3 flex gap-4">
        <div id="starting-spot" className="h-[75px] w-[50px] rounded-full" ref={startRef} />
        <div className="mt-5 h-8 w-full justify-self-end rounded-md border">
          <div
            className="h-full rounded-md bg-blue-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </>
  )
}

const Scanner = ({
  startPosition,
  phase,
  progress,
  isComplete,
  isTouch,
  onContact,
  onTakeoff,
}: {
  startPosition: Point
  phase: Phase
  progress: number
  isComplete: boolean
  isTouch: boolean
  onContact: (contact: boolean) => void
  onTakeoff: (tired: boolean) => void
}) => {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(startPosition)
  const [isOver, setIsOver] = useState(false)
  const [wind, setWind] = useState<Point | null>(null)
  const [fx, setFx] = useState<Fx[]>([])
  const [landCount, setLandCount] = useState(0)
  const [flopped, setFlopped] = useState(false)
  const fxIdRef = useRef(0)
  const fxTimersRef = useRef(new Set<number>())
  const positionRef = useRef(startPosition)
  const progressRef = useRef(progress)
  const hoppedAtRef = useRef<number | null>(null)
  const hopPendingRef = useRef(false)
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null)
  const activePointerId = useRef<number | null>(null)
  const onContactRef = useRef(onContact)
  const onTakeoffRef = useRef(onTakeoff)
  const completeRef = useRef(isComplete)
  const tired = progress >= TIRED_AT && !isComplete
  const hopMs = tired ? 850 : phase === 'chase' ? 420 : 700
  const windMs = tired ? 340 : phase === 'chase' ? 170 : 220
  const travelMs = tired ? 560 : phase === 'chase' ? 260 : 480

  const later = useCallback((ms: number, run: () => void) => {
    const timers = fxTimersRef.current
    const id = window.setTimeout(() => {
      timers.delete(id)
      run()
    }, ms)
    timers.add(id)
  }, [])

  const spawn = useCallback(
    (item: Omit<Fx, 'id'>, life: number) => {
      const id = ++fxIdRef.current
      setFx((list) => [...list, { ...item, id }])
      later(life, () => setFx((list) => list.filter((entry) => entry.id !== id)))
    },
    [later]
  )

  useEffect(() => {
    const timers = fxTimersRef.current
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [])

  // Worn out: it trudges back to its mark and flops.
  useEffect(() => {
    if (!isComplete) return
    const home = startPosition
    const id = window.setTimeout(() => {
      setFlopped(true)
      spawn(
        {
          kind: 'dust',
          x: home.x + OVAL_W / 2,
          y: home.y + OVAL_H * 0.85,
          angle: 0,
          puffs: [...makePuffs(0, 5), ...makePuffs(Math.PI, 5)],
        },
        1100
      )
    }, 650)
    return () => window.clearTimeout(id)
  }, [isComplete, startPosition, spawn])

  useEffect(() => {
    positionRef.current = position
    progressRef.current = progress
    completeRef.current = isComplete
    onContactRef.current = onContact
    onTakeoffRef.current = onTakeoff
  })

  const setOver = (over: boolean) => {
    setIsOver(over)
    onContactRef.current(over)
  }

  useEffect(() => {
    if (phase === 'still' || isComplete || !isOver) return
    if (hoppedAtRef.current === null) hoppedAtRef.current = progressRef.current

    let hopTimer = 0
    let committed = false

    const beginHop = (commit: boolean) => {
      if (hopPendingRef.current) {
        if (commit) committed = true
        return
      }
      hopPendingRef.current = true
      committed = commit
      const from = positionRef.current
      const next = randomHop(from, tired ? 180 : Infinity)
      const dx = next.x - from.x
      const dy = next.y - from.y
      const len = Math.hypot(dx, dy) || 1
      setWind({ x: (dx / len) * 8, y: (dy / len) * 8 })
      hopTimer = window.setTimeout(() => {
        hopPendingRef.current = false
        setWind(null)
        if (completeRef.current) return
        setPosition(next)
        hoppedAtRef.current = progressRef.current
        onTakeoffRef.current(tired)

        const angle = Math.atan2(dy, dx)
        spawn(
          {
            kind: 'dust',
            x: from.x + OVAL_W / 2,
            y: from.y + OVAL_H * 0.85,
            angle,
            puffs: makePuffs(angle),
          },
          1100
        )
        if (len > 40) {
          spawn(
            {
              kind: 'streak',
              x: from.x + OVAL_W / 2,
              y: from.y + OVAL_H / 2,
              angle,
              length: len - STREAK_TRIM,
              ms: travelMs,
            },
            travelMs + STREAK_TAIL_MS + 40
          )
        }
        later(travelMs * 0.85, () => {
          if (completeRef.current) return
          setLandCount((count) => count + 1)
          playSkid()
        })
      }, windMs)
    }

    const sinceLastHop = () => progressRef.current - (hoppedAtRef.current ?? progressRef.current)
    if (sinceLastHop() >= HOP_GAP) beginHop(true)

    const id = window.setInterval(() => beginHop(false), hopMs)
    const watch = window.setInterval(() => {
      if (sinceLastHop() >= HOP_GAP) beginHop(true)
    }, FILL_MS)

    return () => {
      window.clearInterval(id)
      window.clearInterval(watch)
      if (committed) return
      window.clearTimeout(hopTimer)
      hopPendingRef.current = false
      setWind(null)
    }
  }, [phase, isComplete, isOver, hopMs, windMs, travelMs, tired, spawn, later])

  useEffect(() => {
    if (!isOver) return
    const id = window.setInterval(() => {
      const pointer = pointerRef.current
      const scanner = scannerRef.current
      if (!pointer || !scanner) return
      const under = document.elementFromPoint(pointer.clientX, pointer.clientY)
      if (!under || !scanner.contains(under)) setOver(false)
    }, 80)
    return () => window.clearInterval(id)
  }, [isOver])

  const rememberPointer = (event: React.PointerEvent) => {
    pointerRef.current = { clientX: event.clientX, clientY: event.clientY }
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch') return
    rememberPointer(event)
    activePointerId.current = event.pointerId
    scannerRef.current?.setPointerCapture(event.pointerId)
    setOver(true)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    rememberPointer(event)
    if (activePointerId.current !== event.pointerId) return
    if (!scannerRef.current) return
    const under = document.elementFromPoint(event.clientX, event.clientY)
    setOver(Boolean(under && scannerRef.current.contains(under)))
  }

  const endPointer = (event: React.PointerEvent) => {
    if (activePointerId.current !== event.pointerId) return
    activePointerId.current = null
    scannerRef.current?.releasePointerCapture(event.pointerId)
    setOver(false)
  }

  const visualWidth = phase === 'chase' && !isComplete ? 36 : OVAL_W
  const visualHeight = phase === 'chase' && !isComplete ? 54 : OVAL_H
  const pose = !isComplete ? wind : null
  // Anticipation: rear back away from the dash and lean the top the other way.
  const lean = pose ? -(pose.x / 8) * 18 : 0

  return (
    <>
      {fx.map((item) => (
        <FxSprite key={item.id} fx={item} />
      ))}
      <div
        ref={scannerRef}
        className="fixed z-30 select-none"
        style={{
          left: isComplete ? startPosition.x : position.x,
          top: isComplete ? startPosition.y : position.y,
          width: isTouch ? Math.max(OVAL_W, 44) : OVAL_W,
          height: OVAL_H,
          touchAction: 'none',
          transition: isComplete
            ? 'left 650ms ease-in, top 650ms ease-in'
            : `left ${travelMs}ms ease-out, top ${travelMs}ms ease-out`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'mouse') return
          rememberPointer(event)
          setOver(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setOver(false)
        }}
      >
        <div
          className={classNames('pointer-events-none absolute inset-0', {
            'bio-pant': tired && !pose,
            'bio-flop': flopped,
          })}
        >
          <div
            key={landCount}
            className={classNames('pointer-events-none absolute inset-0', {
              'bio-land': landCount > 0,
            })}
          >
            <div
              className={classNames('pointer-events-none absolute inset-0', {
                'bio-rev': Boolean(pose),
              })}
            >
              <div
                className={classNames(
                  'pointer-events-none absolute left-1/2 top-1/2 rounded-full',
                  isOver || isComplete ? 'bg-green-400' : 'bg-red-400'
                )}
                style={{
                  width: visualWidth,
                  height: visualHeight,
                  transformOrigin: '50% 85%',
                  transform: pose
                    ? `translate(-50%, -50%) translate(${-pose.x * 1.5}px, ${-pose.y * 1.5}px) rotate(${lean}deg) scale(1.3, 0.66)`
                    : 'translate(-50%, -50%) scale(1, 1)',
                  transition: pose
                    ? 'transform 0.16s cubic-bezier(0.2, 0.9, 0.3, 1.4), width 0.35s ease, height 0.35s ease'
                    : 'transform 0.08s ease-in, width 0.35s ease, height 0.35s ease',
                }}
              />
            </div>
          </div>
        </div>
        {tired && (
          <>
            <span
              className="bio-sweat"
              style={{ left: -4, top: 4, '--sx': '-10px' } as CSSProperties}
            />
            <span
              className="bio-sweat"
              style={
                { right: -4, top: 0, '--sx': '10px', animationDelay: '0.45s' } as CSSProperties
              }
            />
          </>
        )}
      </div>
    </>
  )
}

const FxSprite = ({ fx }: { fx: Fx }) => {
  if (fx.kind === 'dust') {
    return (
      <div className="bio-fx pointer-events-none fixed z-20" style={{ left: fx.x, top: fx.y }}>
        {fx.puffs?.map((puff, i) => (
          <span
            key={i}
            className="bio-puff"
            style={
              {
                width: puff.size,
                height: puff.size,
                animationDelay: `${puff.delay}ms`,
                '--dx': `${puff.dx}px`,
                '--dy': `${puff.dy}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    )
  }

  if (fx.kind === 'streak') {
    return (
      <div
        className="bio-fx pointer-events-none fixed z-20"
        style={{
          left: fx.x,
          top: fx.y,
          width: fx.length,
          transform: `rotate(${fx.angle}rad)`,
          transformOrigin: '0 0',
        }}
      >
        {[-12, 0, 12].map((offset) => (
          <span
            key={offset}
            className="bio-streak"
            style={{
              top: offset === 0 ? -2 : offset - 1,
              height: offset === 0 ? 4 : 2,
              // Same curve and duration as the scanner's left/top transition,
              // so the head of the line stays under the oval.
              animation: `bio-streak-grow ${fx.ms}ms ease-out forwards, bio-streak-tail ${STREAK_TAIL_MS}ms ease-in ${fx.ms}ms forwards`,
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

export const BiometricControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Continue
      </button>
    </>
  )
}
