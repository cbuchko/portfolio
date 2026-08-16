import { useEffect, useMemo } from 'react'
import { PlayerIds, PlayerInformation } from '../player-constants'
import { ControlProps, IdentitySelectProps } from './types'
import classNames from 'classnames'

export const OneContent = ({
  playerId,
  setPlayerId,
  validateAdvance,
  cancelAdvance,
  isMobile,
}: IdentitySelectProps) => {
  const characters = useMemo(() => {
    return Object.entries(PlayerInformation).map(([id, info]) => ({
      id: Number(id) as PlayerIds,
      name: info.name,
    }))
  }, [])

  useEffect(() => {
    if (playerId !== undefined) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [playerId, validateAdvance, cancelAdvance])

  const handleCharacterSelect = (id: PlayerIds) => {
    if (playerId === id) {
      setPlayerId(undefined)
      localStorage.removeItem('playerId')
      cancelAdvance()
      return
    }
    setPlayerId(id)
    localStorage.setItem('playerId', id.toString())
    validateAdvance()
  }

  return (
    <>
      <h2 className="mb-4 text-3xl">Welcome Back!</h2>
      <p className="text-lg">{`It's been a while since we've seen you.`}</p>
      <p className="text-lg">{`Please confirm your identity to continue.`}</p>
      <p className="mt-4 text-lg">Previously Signed In As:</p>
      <div
        className={classNames('grid grid-cols-3 gap-3 mt-3', {
          '!grid-cols-2': isMobile,
        })}
      >
        {characters.map((character) => {
          const isSelected = playerId === character.id
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => handleCharacterSelect(character.id)}
              className={classNames(
                'aspect-square w-[80%] justify-self-center cursor-pointer transition-transform duration-500 border border-black rounded-md bg-white font-semibold flex items-center justify-center text-center px-2',
                {
                  'outline-2 outline-yellow-300 scale-80 shadow-lg': isSelected,
                }
              )}
            >
              {character.name}
            </button>
          )
        })}
      </div>
    </>
  )
}

export const OneControls = ({ handleLevelAdvance, handleGameOver, playerId }: ControlProps) => {
  if (playerId === undefined) return null

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
