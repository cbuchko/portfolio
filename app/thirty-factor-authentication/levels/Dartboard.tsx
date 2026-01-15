import { RefObject, useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

type Position = { x: number; y: number }
export const DartboardContent = ({}: ContentProps) => {
  const [dartPosition, setDartPosition] = useState<Position>()
  const [reticlePosition, setReticlePosition] = useState<{ x: number; y: number }>({ x: 50, y: 20 })

  const boardRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLImageElement>(null)

  const handleDartFire = () => {
    const reticleRect = reticleRef.current?.getBoundingClientRect()
    console.log(reticleRect)
    if (!reticleRect) return
    setDartPosition({
      x: reticleRect.x + reticleSize / 2 - dartSize / 2,
      y: reticleRect.y + reticleSize / 2 - dartSize / 2,
    })
  }

  return (
    <>
      <p className="text-lg">Get a Bullseye.</p>
      <div
        className="relative flex justify-center items-center bg-amber-900 py-8 mt-8"
        ref={boardRef}
      >
        <Board />
        <Retical
          position={reticlePosition}
          setPosition={setReticlePosition}
          boardRef={boardRef}
          reticleRef={reticleRef}
        />
        {dartPosition && <Dart dartPosition={dartPosition} />}
      </div>
      <button
        className="w-full mx-auto mt-8 shadow-lg select-none border rounded-lg py-4 cursor-pointer hold-button active:bg-gray-200"
        onClick={handleDartFire}
      >
        THROW
      </button>
    </>
  )
}

/** Credit for the dartboard HTML/CSS goes to Mucahit on this codepen https://codepen.io/kenyoste/pen/eYLxZva */
const Board = () => {
  return (
    <div className="big-black">
      <div className="dart">
        <div className="black">
          <div className="green-red">
            <div className="bw"></div>
            <div className="green">
              <div className="red"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const reticleSize = 48
const Retical = ({
  position,
  setPosition,
  boardRef,
  reticleRef,
}: {
  position: Position
  setPosition: (position: Position) => void
  boardRef: RefObject<HTMLDivElement | null>
  reticleRef: RefObject<HTMLImageElement | null>
}) => {
  const directionRef = useRef<{ right: boolean; down: boolean }>({ right: true, down: true })

  useEffect(() => {
    const interval = setInterval(() => {
      const oldX = position.x
      const oldY = position.y
      const moveMagnitudeX = Math.random() * (50 - 5) + 5
      const moveMagnitudeY = Math.random() * (50 - 5) + 5

      let newX = directionRef.current.right ? moveMagnitudeX + oldX : -moveMagnitudeX + oldX
      let newY = directionRef.current.down ? moveMagnitudeY + oldY : -moveMagnitudeY + oldY

      const board = boardRef.current
      const boardPosition = board?.getBoundingClientRect()
      if (!boardPosition) return
      if (newY + moveMagnitudeY > boardPosition.height) {
        directionRef.current = { ...directionRef.current, down: false }
        newY = boardPosition.height - reticleSize / 2
      }
      if (newY - moveMagnitudeY < 0) {
        directionRef.current = { ...directionRef.current, down: true }
        newY = 0
      }
      if (newX - moveMagnitudeX < 0) {
        directionRef.current = { ...directionRef.current, right: true }
        newX = 0
      }
      if (newX + moveMagnitudeX > boardPosition.width) {
        directionRef.current = { ...directionRef.current, right: false }
        newX = boardPosition.width - reticleSize / 2
      }
      setPosition({ x: newX, y: newY })
    }, 100)

    return () => clearInterval(interval)
  }, [position])

  return (
    <Image
      ref={reticleRef}
      src="/thirty-factor-authentication/icons/crosshair3.png"
      alt="crosshair"
      height={reticleSize}
      width={reticleSize}
      className="absolute  transition-all"
      style={{ left: position.x, top: position.y }}
    />
  )
}

const dartSize = 8
const Dart = ({ dartPosition }: { dartPosition: Position }) => {
  return (
    <div
      className="fixed bg-green-500"
      style={{ left: dartPosition.x, top: dartPosition.y, height: dartSize, width: dartSize }}
    />
  )
}

export const DartboardControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
