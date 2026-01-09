import React, { useCallback, useEffect, useRef } from 'react'

import { useState } from 'react'
import { ContentProps } from './types'
import { PlayerInformation } from '../player-constants'
import Image from 'next/image'
import { useSound } from '@/app/utils/useSounds'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { useIsMobile } from '@/app/utils/useIsMobile'
import { mobileWidthBreakpoint } from '../constants'

const maxHealth = 100
export const UndertaleContent = ({ playerId, handleLevelAdvance }: ContentProps) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

  const characterName = PlayerInformation[playerId].name
  const [health, setHealth] = useState(maxHealth)
  const damageTimestampRef = useRef<number>(0)
  const { playSound: playDamageSound } = useSound(
    '/thirty-factor-authentication/sounds/undertale-damage.mp3',
    0.5
  )
  const handleHit = () => {
    const now = new Date().getTime()
    const elapsed = now - damageTimestampRef.current
    if (elapsed > 1000) {
      setHealth((health) => health - 5)
      damageTimestampRef.current = now
      playDamageSound()
    }
  }

  return (
    <>
      <p className="text-lg">{`Hold on... you aren't ${characterName}. You lied. You've been lying this whole time.`}</p>
      <p className="text-lg">{`You came so close, but this level will be your last.`}</p>
      <p className="text-lg">{`GUARDS!`}</p>
      <p className="italic text-sm mt-4">
        Knowing you are so close to finishing... it fills you with determination.
      </p>
      <div className="relative w-full flex items-center justify-center mt-8">
        <div>
          <BulletHell
            width={200}
            height={200}
            health={health}
            setHealth={setHealth}
            onPlayerHit={handleHit}
            handleLevelAdvance={handleLevelAdvance}
          />
          <div className="flex items-center gap-2 mt-2">
            <h5>HP</h5>
            <div className="h-5 w-full border">
              <div className="h-5 bg-red-500" style={{ width: `${(health / maxHealth) * 100}%` }} />
            </div>
            <h5 className="mono min-w-[50px]">{`${Math.max(0, health)}/${maxHealth}`}</h5>
          </div>
        </div>
        {!isMobile && (
          <div className="absolute right-[2%] top-[50%] -translate-y-[50%]">
            <Image
              src="/thirty-factor-authentication/wasd.png"
              width={150}
              height={150}
              alt="wasd-controls"
            />
          </div>
        )}
      </div>
    </>
  )
}

type Vec2 = { x: number; y: number }

type BulletType = 'standard' | 'spear' | 'laser'
interface Bullet {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  type: BulletType
}

type Laser = {
  orientation: 'vertical' | 'horizontal'
  position: number // x or y depending on orientation
  width: number // thickness of the laser
  chargeTime: number // ms before firing
  fireTime: number // ms duration of the damaging beam
  createdAt: number // timestamp
  hasFired: boolean
}

interface BulletHellProps {
  width: number
  height: number
  health: number
  setHealth: (health: number) => void
  onPlayerHit?: () => void
  handleLevelAdvance: (skipVerify?: boolean) => void
}

//game duration is timed based on death by glamors song duration (2:14)
//const gameDuration = 1000 * 60 * 2 + 1000 * 14
function BulletHell({
  width,
  height,
  health,
  setHealth,
  onPlayerHit,
  handleLevelAdvance,
}: BulletHellProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // --- Game State (kept in refs for performance) ---
  const bulletsRef = useRef<Bullet[]>([])
  const soulRef = useRef<Vec2>({ x: width / 2, y: height / 2 })
  const keys = useRef<Record<string, boolean>>({})
  const lastTime = useRef<number>(0)
  const [bulletTypes, setBulletTypes] = useState<Record<BulletType, boolean>>({
    standard: false,
    spear: false,
    laser: false,
  })
  const lasersRef = useRef<Laser[]>([])

  const resetGame = useCallback(() => {
    bulletsRef.current = []
    keys.current = {}
    lastTime.current = 0
    soulRef.current = { x: width + 5, y: height + 5 }

    setHealth(maxHealth)
    setGameStarted(false)
    setBulletTypes({ standard: false, spear: false, laser: false })
    handleLevelAdvance()
  }, [handleLevelAdvance, height, setHealth, width])

  useEffectInitializer(() => {
    if (health <= 0) resetGame()
  }, [health, resetGame])

  const spawnBullet = useCallback(
    (type: BulletType) => {
      const side = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left

      let x = 0
      let y = 0

      // Spawn position based on which side it comes from
      switch (side) {
        case 0: // top
          x = Math.random() * width
          y = -20
          break
        case 1: // right
          x = width + 20
          y = Math.random() * height
          break
        case 2: // bottom
          x = Math.random() * width
          y = height + 20
          break
        case 3: // left
          x = -20
          y = Math.random() * height
          break
      }

      let speed = 2 // adjust as you want
      if (type === 'spear') speed = 4
      const soul = soulRef.current // SOUL position at spawn time

      const dx = soul.x - x
      const dy = soul.y - y
      const len = Math.sqrt(dx * dx + dy * dy)

      bulletsRef.current.push({
        x,
        y,
        radius: 6,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        type: type,
      })
    },
    [height, width]
  )

  const spawnLaser = () => {
    const vertical = Math.random() < 0.5
    const soul = soulRef.current

    lasersRef.current.push({
      orientation: vertical ? 'vertical' : 'horizontal',
      position: vertical ? soul.x : soul.y,
      width: 30,
      chargeTime: 1500, // 1.5s warning
      fireTime: 500, // 0.5s active damage
      createdAt: performance.now(),
      hasFired: false,
    })
  }

  //controls when to start spawning certain bullet types after time thresholds
  useEffect(() => {
    if (!gameStarted) return
    const bulletTimeout = setTimeout(
      () => setBulletTypes((types) => ({ ...types, standard: true })),
      1000 * 6
    )
    const spearsTimeout = setTimeout(
      () => setBulletTypes((types) => ({ ...types, spear: true })),
      1000 * 24
    )
    const laserTimeout = setTimeout(
      () => setBulletTypes((types) => ({ ...types, laser: true })),
      1000 * 60
    )
    return () => {
      clearTimeout(bulletTimeout)
      clearTimeout(spearsTimeout)
      clearTimeout(laserTimeout)
    }
  }, [gameStarted])

  // Spawn bullets periodically
  useEffect(() => {
    if (!gameStarted) return
    let standardInterval: NodeJS.Timeout
    let spearInterval: NodeJS.Timeout
    let laserInterval: NodeJS.Timeout

    if (bulletTypes.standard)
      standardInterval = setInterval(() => {
        spawnBullet('standard')
      }, 700)
    if (bulletTypes.spear)
      spearInterval = setInterval(() => {
        spawnBullet('spear')
      }, 1500)
    if (bulletTypes.laser)
      laserInterval = setInterval(() => {
        spawnLaser()
      }, 5000)

    return () => {
      clearInterval(standardInterval)
      clearInterval(spearInterval)
      clearInterval(laserInterval)
    }
  }, [width, height, gameStarted, bulletTypes, spawnBullet])

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.key] = true)
    const up = (e: KeyboardEvent) => (keys.current[e.key] = false)

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !gameStarted) return

    const SOUL_SPEED = 2.4

    function frame(time: number) {
      const delta = (time - lastTime.current) / 16.67 // normalize to ~60fps
      lastTime.current = time

      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      // Update SOUL position
      const soul = soulRef.current
      if (keys.current['w'] || keys.current['W']) soul.y -= SOUL_SPEED * delta
      if (keys.current['s'] || keys.current['S']) soul.y += SOUL_SPEED * delta
      if (keys.current['a'] || keys.current['A']) soul.x -= SOUL_SPEED * delta
      if (keys.current['d'] || keys.current['D']) soul.x += SOUL_SPEED * delta

      // Clamp to box
      soul.x = Math.max(8, Math.min(width - 8, soul.x))
      soul.y = Math.max(8, Math.min(height - 8, soul.y))

      // Draw SOUL
      ctx.fillStyle = '#ff2020'
      ctx.fillRect(soul.x - 6, soul.y - 6, 12, 12)

      const now = performance.now()

      //draw lasers
      lasersRef.current = lasersRef.current.filter((l) => {
        const elapsed = now - l.createdAt

        // --- 1. CHARGING PHASE ---
        if (elapsed < l.chargeTime) {
          // draw faint warning area
          ctx.fillStyle = 'rgba(254, 231, 71, 0.5)'

          if (l.orientation === 'vertical') {
            ctx.fillRect(l.position, 0, l.width, height)
          } else {
            ctx.fillRect(0, l.position, width, l.width)
          }

          return true
        }

        // --- 2. FIRING PHASE ---
        if (elapsed < l.chargeTime + l.fireTime) {
          l.hasFired = true

          // draw strong laser beam
          ctx.fillStyle = 'rgba(254, 231, 71, 1)'

          if (l.orientation === 'vertical') {
            ctx.fillRect(l.position, 0, l.width, height)
          } else {
            ctx.fillRect(0, l.position, width, l.width)
          }

          const soul = soulRef.current
          const half = 6 // soul size

          const inside =
            l.orientation === 'vertical'
              ? soul.x + half > l.position && soul.x - half < l.position + l.width
              : soul.y + half > l.position && soul.y - half < l.position + l.width

          if (inside) {
            onPlayerHit?.()
          }

          return true
        }

        return false
      })

      // Update + draw bullets
      bulletsRef.current.forEach((b) => {
        b.x += b.vx * delta
        b.y += b.vy * delta

        ctx.beginPath()
        if (b.type === 'standard') {
          ctx.fillStyle = 'black'
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        }
        if (b.type === 'spear') {
          ctx.fillStyle = 'blue'
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        }

        ctx.fill()
      })

      // Remove offscreen bullets
      bulletsRef.current = bulletsRef.current.filter(
        (b) => b.x > -20 && b.x < width + 20 && b.y > -20 && b.y < height + 20
      )

      // Collision detection
      bulletsRef.current = bulletsRef.current.filter((b) => {
        const dx = b.x - soul.x
        const dy = b.y - soul.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const hit = dist < b.radius + 6
        if (hit) {
          onPlayerHit?.()
        }
        return !hit
      })

      requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)
  }, [width, height, onPlayerHit, gameStarted])

  useEffect(() => {
    if (audioRef.current && gameStarted) {
      audioRef.current.volume = 0.5
    }
  }, [gameStarted])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={width} height={height} style={{ border: '2px solid black' }} />
      {!gameStarted && (
        <button
          className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] border-2 py-1 px-3 rounded-md cursor-pointer"
          onClick={() => {
            setGameStarted(true)
            soulRef.current = { x: width / 2, y: height / 2 }
          }}
        >
          Start
        </button>
      )}
      {gameStarted && (
        <audio
          src="/thirty-factor-authentication/sounds/death-by-glamor.flac"
          autoPlay
          onEnded={() => handleLevelAdvance(true)}
          ref={audioRef}
        />
      )}
    </div>
  )
}
