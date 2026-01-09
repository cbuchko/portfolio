'use client'

import { AuthContainer } from './AuthContainer'
import './styles.css'
import './waves.css'
import { useLevels } from './levels/useLevel'
import { useState } from 'react'
import { PlayerIds } from './player-constants'
import { devMode, maxLevel, mobileWidthBreakpoint } from './constants'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { UPSTracker } from './components/UPSTracker'
import Image from 'next/image'
import { VictoryScreen } from './VictoryScreen'
import { useIsMobile } from '../utils/useIsMobile'
import { useSound } from '../utils/useSounds'
import { useEffectInitializer } from '../utils/useEffectUnsafe'

const isTouchDevice =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

export default function ThirtyFactorAuthentication() {
  const [playerId, setPlayerId] = useState<PlayerIds>()

  useEffectInitializer(() => {
    const storedPlayerId = localStorage.getItem('playerId') as PlayerIds | null
    if (storedPlayerId) {
      setPlayerId(storedPlayerId)
    } else {
      setPlayerId(PlayerIds.Biden)
    }
  }, [])

  const [isGameOver, setIsGameOver] = useState(false)
  const isMobile = useIsMobile(mobileWidthBreakpoint)
  const { playSound: playErrorSound } = useSound('/thirty-factor-authentication/sounds/error.mp3')

  const { content, controls, requiresLoad, baseProps } = useLevels()
  const { level, setLevel, upsTrackingCode, upsTrackingTime, resetLevel } = baseProps

  const isCompleted = level === maxLevel + 1

  if (playerId === undefined) return
  return (
    <>
      <div
        className="relative w-screen h-screen flex flex-col overflow-y-auto"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="absolute left-[50%] -translate-x-[50%] top-8 flex items-center gap-2 bg-white rounded-md p-2">
          <Image
            src="/thirty-factor-authentication/horizontal-logo.png"
            alt="logo"
            height={48}
            width={516}
          />
        </div>
        {!isGameOver && !isCompleted && (
          <>
            <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
              <AuthContainer
                playerId={playerId}
                setPlayerId={setPlayerId}
                setIsGameOver={setIsGameOver}
                Content={content}
                Controls={controls}
                baseProps={baseProps}
                playErrorSound={playErrorSound}
                requiresLoad={requiresLoad}
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
        {/* <PortfolioHeader /> */}
      </div>
    </>
  )
}
