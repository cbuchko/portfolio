import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { clampPositionsToScreen } from '../utils'

export const BiometricContent = ({ validateAdvance, layout }: ContentProps) => {
  const startRef = useRef<HTMLDivElement>(null)
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>()
  const [progress, setProgress] = useState(0)

  const isComplete = progress >= 100
  useEffect(() => {
    if (isComplete) validateAdvance()
  }, [isComplete, validateAdvance])

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
          setProgress={setProgress}
          isProgressing={progress > 0}
          startPosition={startPosition}
          isComplete={isComplete}
        />
      )}
      <div className="flex gap-4">
        <div id="starting-spot" className="h-[75px] w-[50px] rounded-full" ref={startRef} />
        <div className="w-full h-8 border mt-5 justify-self-end rounded-md">
          <div
            className={classNames('bg-blue-300 h-full rounded-md')}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </>
  )
}

const Scanner = ({
  startPosition,
  isProgressing,
  isComplete,
  setProgress,
}: {
  startPosition: { x: number; y: number }
  isProgressing?: boolean
  isComplete?: boolean
  setProgress: React.Dispatch<React.SetStateAction<number>>
}) => {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(startPosition)
  const [isOver, setIsOver] = useState(false)
  const activePointerId = useRef<number | null>(null)

  if (isComplete && position !== startPosition) {
    setPosition(startPosition)
  }

  useEffect(() => {
    if (!isOver || isComplete) return

    const interval = setInterval(() => {
      setProgress((p) => p + 1)

      const oldX = position.x
      const oldY = position.y
      const moveMagnitude = 100

      const newX = oldX + (Math.random() < 0.5 ? -moveMagnitude : moveMagnitude)
      const newY = oldY + (Math.random() < 0.5 ? -moveMagnitude : moveMagnitude)

      const clamped = clampPositionsToScreen(newX, newY, 50, 75)
      setPosition({ x: clamped.newX, y: clamped.newY })
    }, 100)

    return () => clearInterval(interval)
  }, [isOver, isComplete, position, setProgress])

  //these events are specifically for mobile touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return

    activePointerId.current = e.pointerId
    scannerRef.current?.setPointerCapture(e.pointerId)
    setIsOver(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return
    if (!scannerRef.current) return

    const elUnderFinger = document.elementFromPoint(e.clientX, e.clientY)

    setIsOver(scannerRef.current.contains(elUnderFinger))
  }

  const endPointer = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return

    activePointerId.current = null
    scannerRef.current?.releasePointerCapture(e.pointerId)
    setIsOver(false)
  }

  return (
    <div
      ref={scannerRef}
      className={classNames(
        'fixed h-[75px] w-[50px] rounded-full transition-all duration-750 select-none',
        {
          'bg-green-400': isOver,
          'bg-red-400': !isOver,
        }
      )}
      style={{
        left: position.x === 0 && !isProgressing ? 'auto' : position.x,
        top: position.y === 0 && !isProgressing ? 'auto' : position.y,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setIsOver(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setIsOver(false)
      }}
    />
  )
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
