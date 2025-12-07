import { MouseEvent as ReactMouseEvent, RefObject, useState } from 'react'
import { clampPositionsToScreen } from './utils'

export const useElementDrag = (
  ref: RefObject<HTMLDivElement | null>,
  initialPosition: { x: number; y: number }
) => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number }>(initialPosition)

  const handleDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element || !position) return

    setTimeout(() => setIsDragging(true), 200)
    const startPosition = { x: event.clientX, y: event.clientY }

    const handleMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startPosition.x
      const dy = moveEvent.clientY - startPosition.y
      const newX = position.x + dx
      const newY = position.y + dy
      const clamped = clampPositionsToScreen(newX, newY, element.clientWidth, element.clientHeight)
      const newPos = {
        x: clamped.newX,
        y: clamped.newY,
      }
      setPosition(newPos)
    }

    const handleMouseUp = () => {
      setTimeout(() => setIsDragging(false), 200)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
  return { position, handleDrag, isDragging }
}
