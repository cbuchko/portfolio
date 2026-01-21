import { RefObject, useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import Image from 'next/image'
import { useSound } from '@/app/utils/useSounds'

const defaultReticlePos = { x: 150, y: 20 }
const bullseyeSize = 32
type Position = { x: number; y: number }
export const DartboardContent = ({ handleLevelAdvance }: ContentProps) => {
  const [dartPosition, setDartPosition] = useState<Position>()
  const [reticlePosition, setReticlePosition] = useState<{ x: number; y: number }>(
    defaultReticlePos
  )
  const [isPlaying, setIsPlaying] = useState(true)
  const { playSound: playDartThrow } = useSound(
    'thirty-factor-authentication/sounds/dart-throw.wav'
  )
  const { playSound: playNiceThrow } = useSound(
    'thirty-factor-authentication/sounds/nice-throw.mp3'
  )
  const { playSound: playMiss } = useSound('thirty-factor-authentication/sounds/miss.mp3')

  const boardRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLImageElement>(null)

  const resetGame = (isBullseye: boolean) => {
    if (isBullseye) {
      playNiceThrow()
    } else {
      playMiss()
    }

    setTimeout(() => {
      setDartPosition(undefined)
      setReticlePosition(defaultReticlePos)
      setIsPlaying(true)
      handleLevelAdvance(isBullseye)
    }, 2000)
  }

  const handleDartFire = () => {
    playDartThrow()
    const reticleRect = reticleRef.current?.getBoundingClientRect()
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!reticleRect || !boardRect) return
    const dartPosition = {
      x: reticleRect.x + reticleSize / 2 - dartSize / 2,
      y: reticleRect.y + reticleSize / 2 - dartSize / 2,
    }
    setDartPosition(dartPosition)
    setIsPlaying(false)

    const bullseyePosition = {
      x: boardRect.x + boardRect.width / 2,
      y: boardRect.y + boardRect.height / 2,
    }
    let isBullseye = false
    if (
      dartPosition.x > bullseyePosition.x - bullseyeSize / 1.5 &&
      dartPosition.x < bullseyePosition.x + bullseyeSize / 1.5 &&
      dartPosition.y > bullseyePosition.y - bullseyeSize / 1.5 &&
      dartPosition.y < bullseyePosition.y + bullseyeSize / 1.5
    ) {
      isBullseye = true
    }

    setTimeout(() => {
      resetGame(isBullseye)
    }, 500)
  }
  return (
    <>
      <p className="text-lg">Get a Bullseye.</p>
      <div
        className="relative flex justify-center items-center bg-amber-900 py-8 mt-8"
        ref={boardRef}
      >
        <Board />
        {isPlaying && (
          <Retical
            position={reticlePosition}
            setPosition={setReticlePosition}
            boardRef={boardRef}
            reticleRef={reticleRef}
          />
        )}
        {dartPosition && <Dart dartPosition={dartPosition} />}
      </div>
      <button
        className="w-full mx-auto mt-8 shadow-lg select-none border rounded-lg py-4 cursor-pointer hold-button active:bg-gray-200 disabled:bg-gray-300 disabled:pointer-events-none"
        onClick={handleDartFire}
        disabled={!isPlaying}
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
      const moveMagnitudeX = Math.random() * (30 - 5) + 5
      const moveMagnitudeY = Math.random() * (30 - 5) + 5

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
  }, [position, boardRef, setPosition])

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

const dartSize = 16
const Dart = ({ dartPosition }: { dartPosition: Position }) => {
  return (
    <div
      className="fixed bg-black border-4 border-yellow-500 rounded-full"
      style={{ left: dartPosition.x, top: dartPosition.y, height: dartSize, width: dartSize }}
    />
  )
}
