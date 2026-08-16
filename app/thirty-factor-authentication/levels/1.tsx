import { useEffect, useMemo } from 'react'
import { PlayerIds, PlayerInformation } from '../player-constants'
import { ControlProps, IdentitySelectProps } from './types'
import classNames from 'classnames'
import Image from 'next/image'

export const OneContent = ({
  playerId,
  setPlayerId,
  validateAdvance,
  cancelAdvance,
}: IdentitySelectProps) => {
  const characters = useMemo(() => {
    return Object.entries(PlayerInformation).map(([id, info]) => ({
      id: Number(id) as PlayerIds,
      name: info.name,
      email: info.email,
      headshot: info.license.headshot,
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
      <p className="text-lg">{`Please select your account to continue.`}</p>
      <div className="mt-3 flex flex-col border border-gray-400 rounded-lg overflow-hidden">
        {characters.map((character, index) => {
          const isSelected = playerId === character.id
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => handleCharacterSelect(character.id)}
              className={classNames(
                'flex items-center gap-3 w-full px-4 py-3 text-left cursor-pointer transition-colors duration-150 border-l-4 bg-white',
                {
                  'border-t border-gray-300': index > 0,
                  'bg-blue-50 border-l-blue-400': isSelected,
                  'border-l-transparent hover:bg-gray-50': !isSelected,
                }
              )}
            >
              <Image
                src={`/thirty-factor-authentication/portraits/${character.headshot}`}
                alt={character.name}
                width={40}
                height={40}
                className="rounded-full object-cover shrink-0 h-10 w-10"
              />
              <div className="min-w-0 flex flex-col">
                <span className="font-medium text-gray-900 truncate">{character.name}</span>
                <span className="text-sm text-gray-500 truncate">{character.email}</span>
              </div>
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
