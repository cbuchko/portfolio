import React, { useEffect, useRef } from 'react'

import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import Image from 'next/image'

const maxHealth = 60
export const UndertaleContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
}: ContentProps) => {
  const characterName = PlayerInformation[playerId].name
  const [health, setHealth] = useState(maxHealth)

  return (
    <>
      <h3>{`Hold on... you aren't ${characterName}. You lied. You've been lying this whole time.`}</h3>
      <h3>{`You came so close, but this level will be your last.`}</h3>
      <h3>{`GUARDS!`}</h3>
      <h3 className="italic text-sm mt-4">
        Knowing you are so close to finishing... it fills you with deterimination.
      </h3>
      <div className="relative w-full flex items-center justify-center mt-8">
        <div>
          <BulletHell
            width={200}
            height={200}
            health={health}
            setHealth={setHealth}
            onPlayerHit={() => {
              setHealth((health) => health - 5)
            }}
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
        <div className="absolute right-[2%] top-[50%] -translate-y-[50%]">
          <Image
            src="/thirty-factor-authentication/wasd.png"
            width={150}
            height={150}
            alt="wasd-controls"
          />
        </div>
      </div>
    </>
  )
}

type Vec2 = { x: number; y: number }

interface Bullet {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
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

  // --- Game State (kept in refs for performance) ---
  const bulletsRef = useRef<Bullet[]>([])
  const soulRef = useRef<Vec2>({ x: width / 2, y: height / 2 })
  const keys = useRef<Record<string, boolean>>({})
  const lastTime = useRef<number>(0)
  const [bulletTypes, setBulletTypes] = useState<{ standard: boolean }>({ standard: false })

  const resetGame = () => {
    bulletsRef.current = []
    keys.current = {}
    lastTime.current = 0
    soulRef.current = { x: width + 5, y: height + 5 }

    setHealth(maxHealth)
    setGameStarted(false)
    setBulletTypes({ standard: false })
    handleLevelAdvance()
  }

  useEffect(() => {
    if (health <= 0) resetGame()
  }, [health])

  //controls when to start spawning certain bullet types after time thresholds
  useEffect(() => {
    if (!gameStarted) return
    const timeout = setTimeout(
      () => setBulletTypes((types) => ({ ...types, standard: true })),
      6400
    )
    return () => clearTimeout(timeout)
  }, [gameStarted])

  // Spawn bullets periodically
  useEffect(() => {
    if (!gameStarted || !bulletTypes.standard) return
    const spawnInterval = setInterval(() => {
      spawnBullet()
    }, 700)

    return () => clearInterval(spawnInterval)
  }, [width, height, gameStarted, bulletTypes])

  const spawnBullet = () => {
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

    const speed = 2 // adjust as you want
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
    })
  }

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
      let soul = soulRef.current
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

      // Update + draw bullets
      bulletsRef.current.forEach((b) => {
        b.x += b.vx * delta
        b.y += b.vy * delta

        ctx.beginPath()
        ctx.fillStyle = 'black'
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
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
        />
      )}
    </div>
  )
}
