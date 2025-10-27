'use client'

import { AuthContainer } from './AuthContainer'
import './styles.css'
import { useLevels } from './levels/useLevel'
import { useState } from 'react'
import { PlayerIds } from './player-constants'

export default function ThirtyFactorAuthentication() {
  const [playerId, setPlayerId] = useState(PlayerIds.Mock)
  const [isGameOver, setIsGameOver] = useState(false)

  const { content, controls, level, resetLevel, handleLevelAdvance } = useLevels()

  return (
    <div className="relative w-screen h-screen flex flex-col">
      <div className="absolute left-[50%] -translate-x-[50%] top-8">
        <h1 className="text-2xl">Thirty Factor Authentication</h1>
      </div>
      {!isGameOver && (
        <AuthContainer
          playerId={playerId}
          level={level}
          handleLevelAdvance={handleLevelAdvance}
          setIsGameOver={setIsGameOver}
          Content={content}
          Controls={controls}
        />
      )}
      {isGameOver && (
        <div className="absolute top-[25%] -translate-y-[50%] left-[50%] -translate-x-[50%] max-w-[650px] bg-red-100 p-8 rounded-md shadow-lg">
          <h2 className="text-4xl mb-4">You have failed to authenticate.</h2>
          <h3>
            To protect your account, it has been temporarily locked and all data has been deleted.
          </h3>
          <button
            className="mt-2 auth-button"
            onClick={() => {
              resetLevel()
              setIsGameOver(false)
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}
