import { useEffect, useMemo } from 'react'
import { PlayerIds, PlayerInformation } from '../player-constants'
import { ControlProps, IdentitySelectProps } from './types'
import classNames from 'classnames'
import Image from 'next/image'
import { audioEngine } from '@/app/utils/audio'

export const OneContent = ({
  playerId,
  setPlayerId,
  validateAdvance,
  cancelAdvance,
  layout,
}: IdentitySelectProps) => {
  const { isMobile } = layout
  const characters = useMemo(() => {
    return Object.entries(PlayerInformation).map(([id, info]) => ({
      id: Number(id) as PlayerIds,
      name: info.name,
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
    // Earliest tap in the whole flow — unlock audio here so the run's first SFX is instant.
    audioEngine.unlock()
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
      <h2 className={classNames({ 'mb-1 text-2xl': isMobile, 'mb-3 text-3xl': !isMobile })}>
        Welcome Back!
      </h2>
      <p className={classNames('text-gray-700', { 'text-base': isMobile, 'text-lg': !isMobile })}>
        Select your account to continue
      </p>
      <div
        className={classNames('flex flex-col border border-gray-200 rounded-sm bg-gray-50 shadow-lg overflow-hidden', {
          'mt-3': isMobile,
          'mt-4': !isMobile,
        })}
      >
        {characters.map((character, index) => {
          const isSelected = playerId === character.id
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => handleCharacterSelect(character.id)}
              className={classNames(
                'flex items-center w-full text-left cursor-pointer transition-colors duration-150 border-l-4',
                {
                  'border-t border-gray-300': index > 0,
                  'bg-blue-50 border-l-blue-400': isSelected,
                  'border-l-transparent hover:bg-gray-100': !isSelected,
                  'gap-2.5 px-3 py-2': isMobile,
                  'gap-3 px-4 py-3': !isMobile,
                }
              )}
            >
              <Image
                src={`/thirty-factor-authentication/portraits/${character.headshot}`}
                alt={character.name}
                width={isMobile ? 32 : 40}
                height={isMobile ? 32 : 40}
                className={classNames('rounded-full object-cover shrink-0', {
                  'h-8 w-8': isMobile,
                  'h-10 w-10': !isMobile,
                })}
              />
              <span className="font-medium text-gray-900 truncate">{character.name}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

export const OneControls = ({ handleLevelAdvance, playerId }: ControlProps) => {
  if (playerId === undefined) return null

  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Authenticate
      </button>
    </>
  )
}
