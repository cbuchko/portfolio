import { useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import Image from 'next/image'

const levelDuration = 1000 * 30
export const MaintenanceContent = ({ handleLevelAdvance }: ContentProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((elapsed) => elapsed + 1)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
      audioRef.current.play()
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
  }, [handleLevelAdvance])

  return (
    <>
      <p className="text-lg">{`Sorry, the Authentication service is currently under maintenance.`}</p>
      <p className="text-lg">
        {`Please don't do`} <span className="italic">anything</span> while we resolve the problem.
      </p>
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
      {timeElapsed > 60 * 3 && (
        <p className="mt-8 max-w-[500px]">
          I really didn't think I'd have to say this, but it's been three minutes. When I told you
          to not do <span className="font-bold">ANYTHING</span>, I meant it. I'd recommend reading
          the prompts in the future.
        </p>
      )}
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
  }, [])
  return (
    <>
      {timeElapsed <= 46 && <div className="grow" />}
      {timeElapsed > 46 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Relax
        </button>
      )}
      {timeElapsed > 35 && (
        <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
          Win Game
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
