import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

const levelDuration = 1000 * 30
export const MaintenanceContent = ({ handleLevelAdvance }: ContentProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
    }
  }, [])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleLevelAdvance(true)
    }, levelDuration)

    const mouseMoveEvent = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        handleLevelAdvance(true)
      }, levelDuration)
    }

    addEventListener('mousemove', mouseMoveEvent)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      removeEventListener('mousemove', mouseMoveEvent)
    }
  }, [])
  return (
    <>
      <h3>Sorry, the Authentication service is currently under maintenance.</h3>
      <h3>Please don't do anything while we resolve the problem. </h3>
      <div className="flex items-center justify-between mt-8">
        <Image
          src="/thirty-factor-authentication/maintenance.webp"
          alt="maintenance"
          height={150}
          width={150}
        />
        <Image
          src="/thirty-factor-authentication/sorry.jpg"
          alt="maintenance"
          height={150}
          width={150}
        />
        <Image
          src="/thirty-factor-authentication/work.jpg"
          alt="maintenance"
          height={150}
          width={150}
        />
      </div>
      <audio ref={audioRef} src="/idle_Game/audio/jazz.mp3" autoPlay loop />
    </>
  )
}

export const MaintenanceControls = ({ handleLevelAdvance }: ControlProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((elapsed) => elapsed + 1)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })
  return (
    <>
      <div className="grow" />
      {timeElapsed > 45 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Dude just relax
        </button>
      )}
      {timeElapsed > 25 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Beat Game
        </button>
      )}
      {timeElapsed > 15 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Finish Maintenance
        </button>
      )}
      {timeElapsed > 5 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Submit
        </button>
      )}
    </>
  )
}
