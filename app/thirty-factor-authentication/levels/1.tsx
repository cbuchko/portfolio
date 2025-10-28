import { useEffect } from 'react'
import { PlayerInformation } from '../player-constants'
import { ContentProps, ControlProps } from './types'

export const OneContent = ({ playerId, validateAdvance }: ContentProps) => {
  const name = PlayerInformation[playerId].name

  useEffect(() => {
    validateAdvance()
  }, [validateAdvance])

  return (
    <>
      <h2 className="mb-4 text-3xl">Welcome Back!</h2>
      <h3 className="w-[350px]">
        {`It's been a while since we've seen you. Please confirm your identity to continue.`}
      </h3>
      <h3 className="mt-4">
        {`Previously Signed In As:`} <span className="mono pl-2 font-semibold">{name}</span>
      </h3>
    </>
  )
}

export const OneControls = ({ handleLevelAdvance, handleGameOver }: ControlProps) => {
  return (
    <>
      <button className="auth-button" onClick={handleGameOver}>
        {`That's Not Me!`}
      </button>
      <button className="auth-button" onClick={() => handleLevelAdvance()}>
        {`That's Me!`}
      </button>
    </>
  )
}
