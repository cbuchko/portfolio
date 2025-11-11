import { MouseEvent as ReactMouseEvent, Ref, RefObject, useEffect, useState } from 'react'
import { clampPositionsToScreen } from './utils'

export const useElementDrag = (
  ref: RefObject<HTMLDivElement | null>,
  initialPosition: { x: number; y: number }
) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setPosition(initialPosition)
  }, [])

  const handleDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element || !position) return

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
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
  return { position, handleDrag }
}
