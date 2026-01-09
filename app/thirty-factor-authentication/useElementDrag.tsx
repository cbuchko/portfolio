import { RefObject, useState } from 'react'
import { clampPositionsToScreen } from './utils'
import { useIsMobile } from '../utils/useIsMobile'
import { mobileWidthBreakpoint } from './constants'

const DRAG_THRESHOLD = 6

export const useElementDrag = (
  ref: RefObject<HTMLDivElement | null>,
  initialPosition?: { x: number; y: number },
  scale?: number
) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | undefined>(initialPosition)

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element || !position) return

    const pointerId = event.pointerId
    const startPosition = { x: event.clientX, y: event.clientY }

    let dragging = false
    const handleMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return

      const dx = moveEvent.clientX - startPosition.x
      const dy = moveEvent.clientY - startPosition.y

      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return

        dragging = true
        setIsDragging(true)
        element.setPointerCapture(pointerId)
      }

      moveEvent.preventDefault()

      const newX = position.x + dx
      const newY = position.y + dy

      const clamped = clampPositionsToScreen(
        newX,
        newY,
        element.clientWidth,
        element.clientHeight,
        scale,
        isMobile
      )

      setPosition({ x: clamped.newX, y: clamped.newY })
    }

    const handleUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return
      if (dragging) {
        upEvent.preventDefault()
        element.releasePointerCapture(pointerId)
        setIsDragging(false)
      }
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return { position, setPosition, handlePointerDown, isDragging }
}
