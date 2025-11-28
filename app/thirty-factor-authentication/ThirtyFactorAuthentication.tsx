'use client'

import { AuthContainer } from './AuthContainer'
import './styles.css'
import { useLevels } from './levels/useLevel'
import { useState } from 'react'
import { PlayerIds } from './player-constants'
import { devMode, maxLevel } from './constants'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { UPSTracker } from './components/UPSTracker'
import { PortfolioHeader } from '../components/PortfolioHeader'
import Image from 'next/image'
import { VictoryScreen } from './VictoryScreen'

export default function ThirtyFactorAuthentication() {
  const [playerId] = useState(PlayerIds.Biden)
  const [isGameOver, setIsGameOver] = useState(false)

  const { content, controls, baseProps } = useLevels()
  const { level, setLevel, upsTrackingCode, upsTrackingTime, resetLevel } = baseProps

  const isCompleted = level === maxLevel + 1

  return (
    <>
      <div className="relative w-screen h-screen flex flex-col overflow-y-auto">
        <div className="absolute left-[50%] -translate-x-[50%] top-8 flex items-center gap-2">
          <Image
            src="/thirty-factor-authentication/horizontal-logo.png"
            alt="logo"
            height={48}
            width={516}
          />
        </div>
        {!isGameOver && !isCompleted && (
          <>
            <DndProvider backend={HTML5Backend}>
              <AuthContainer
                playerId={playerId}
                setIsGameOver={setIsGameOver}
                Content={content}
                Controls={controls}
                baseProps={baseProps}
              />
            </DndProvider>
            <div id="extras-portal" />
            {!!upsTrackingCode && !!upsTrackingTime && (
              <UPSTracker code={upsTrackingCode} time={upsTrackingTime} />
            )}
          </>
        )}
        {isCompleted && <VictoryScreen playerId={playerId} levelProps={baseProps} />}
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
        {devMode && (
          <div className="fixed flex flex-col text-left w-max p-2 gap-3">
            <h2 className="mb-2">Dev Mode:</h2>
            <button
              className="border p-1 cursor-pointer"
              onClick={() => setLevel((level) => level + 1)}
            >
              Next Level
            </button>
            <button
              className="border p-1 cursor-pointer"
              onClick={() => setLevel((level) => level - 1)}
            >
              Previous Level
            </button>
          </div>
        )}
        <PortfolioHeader />
      </div>
    </>
  )
}
