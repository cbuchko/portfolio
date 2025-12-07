import { useEffect, useRef, useState } from 'react'
import { ScoreProps } from './useScore'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

type InvaderType = {
  id: string
  xPos: number
}

const invaderFrequency = 20000
const invaderTimeToLive = 10000
export const SpaceInvaders = ({ scoreProps }: { scoreProps: ScoreProps }) => {
  const [invaders, setInvaders] = useState<InvaderType[]>([])

  useEffectInitializer(() => {
    const id = crypto.randomUUID()
    setInvaders((prevInvaders) => [...prevInvaders, { id, xPos: Math.random() * 80 }])
    setInterval(() => {
      const id = crypto.randomUUID()
      setInvaders((prevInvaders) => [...prevInvaders, { id, xPos: Math.random() * 80 }])
    }, invaderFrequency)
  }, [])

  return (
    <div className="absolute -top-[100px]">
      {invaders.map((invader) => (
        <Invader
          key={invader.id}
          id={invader.id}
          xPos={invader.xPos}
          setInvaders={setInvaders}
          scoreProps={scoreProps}
        />
      ))}
    </div>
  )
}

const Invader = ({
  id,
  xPos,
  scoreProps,
  setInvaders,
}: {
  id: string
  xPos: number
  setInvaders: React.Dispatch<React.SetStateAction<InvaderType[]>>
  scoreProps: ScoreProps
}) => {
  const invaderRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const squashInvader = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
    const audio = new Audio('/idle_game/splat.mp3')
    audio.volume = 0.2
    audio.play()
    setInvaders((prevInvaders) => prevInvaders.filter((inc) => inc.id !== id))
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setInvaders((prevInvaders) => prevInvaders.filter((inc) => inc.id !== id))
      scoreProps.spendScore(10000, () => {})
    }, invaderTimeToLive)

    intervalRef.current = timeoutId

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      ref={invaderRef}
      className="absolute w-6 h-6 invader cursor-pointer"
      style={{ left: `${xPos}px` }}
      onClick={squashInvader}
    >
      <img src="/idle_game/icons/bug.svg" alt="bug" className="rotate-180" />
    </div>
  )
}
