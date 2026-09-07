'use client'

import { AuthContainer } from './AuthContainer'
import './styles.css'
import './waves.css'
import { useLevels } from './levels/useLevel'
import { OneContent, OneControls } from './levels/1'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlayerIds, PlayerInformation } from './player-constants'
import { devMode, forceLevel, maxLevel } from './constants'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { UPSTracker } from './components/UPSTracker'
import Image from 'next/image'
import { VictoryScreen } from './VictoryScreen'
import { RunStats } from './components/RunStats'
import { audioEngine, preloadAll, useSfx } from '../utils/audio'
import { useEffectInitializer } from '../utils/useEffectUnsafe'
import { useTfaLayout } from './useTfaLayout'
import classNames from 'classnames'
import { useTfaAnalytics } from './useTfaAnalytics'

export default function ThirtyFactorAuthentication() {
  const layout = useTfaLayout()
  const { isMobile, isCompact, isTouch } = layout
  const [playerId, setPlayerId] = useState<PlayerIds>()
  const [hasStarted, setHasStarted] = useState(forceLevel > 0)
  const [devHudReady, setDevHudReady] = useState(false)

  useEffectInitializer(() => {
    const storedPlayerId = localStorage.getItem('playerId')
    if (storedPlayerId !== null && storedPlayerId in PlayerInformation) {
      setPlayerId(Number(storedPlayerId) as PlayerIds)
    }
    setDevHudReady(true)
  }, [])

  const [isGameOver, setIsGameOver] = useState(false)
  const playErrorSound = useSfx('error')
  const playSuccessSound = useSfx('success')

  // Decoding doesn't need a gesture, so warm every SFX buffer as soon as the game
  // mounts; the first tap then plays instantly instead of racing the preload.
  useEffectInitializer(() => {
    preloadAll()
  }, [])

  const { content, controls, requiresLoad, baseProps } = useLevels()
  const {
    level,
    setLevel,
    upsTrackingCode,
    upsTrackingTime,
    resetLevel,
    levelTimings,
    finalizeRunStats,
    strikesThisLevel,
  } = baseProps

  const isCompleted = hasStarted && level === maxLevel + 1
  const { captureRunStarted, markRunEnded } = useTfaAnalytics({
    hasStarted,
    isGameOver,
    isCompleted,
    layout,
    level,
    playerId,
    strikesThisLevel,
    levelTimings,
  })

  const resetRun = useCallback(() => {
    resetLevel()
    setHasStarted(false)
    setIsGameOver(false)
  }, [resetLevel])

  const startRun = useCallback(() => {
    // Real click: unlock the audio context + iOS session before anything plays.
    audioEngine.unlock()
    resetLevel()
    captureRunStarted()
    playSuccessSound()
    setHasStarted(true)
  }, [resetLevel, captureRunStarted, playSuccessSound])

  const runBaseProps = useMemo(
    () => ({ ...baseProps, resetLevel: resetRun }),
    [baseProps, resetRun]
  )

  const pregameBaseProps = useMemo(
    () => ({ ...runBaseProps, handleLevelAdvance: startRun }),
    [runBaseProps, startRun]
  )

  useEffect(() => {
    if (!isGameOver || !hasStarted) return
    markRunEnded('lost', finalizeRunStats())
  }, [isGameOver, hasStarted, finalizeRunStats, markRunEnded])

  const dragBackend = useMemo(() => {
    if (typeof window === 'undefined') {
      return HTML5Backend
    }

    return isTouch ? TouchBackend : HTML5Backend
  }, [isTouch])

  const showPregame = !hasStarted && !isGameOver
  const showLevels = hasStarted && !isGameOver && !isCompleted
  const showAuth = showPregame || (showLevels && playerId !== undefined)

  return (
    <>
      <div
        className={classNames('relative w-screen h-screen flex flex-col overflow-y-auto', {
          'select-none': isMobile,
        })}
        style={{ scrollbarGutter: 'stable' }}
      >
        <div
          id="tfa-logo"
          className={classNames(
            'absolute left-[50%] -translate-x-[50%] flex items-center bg-white rounded-md !max-w-auto',
            {
              'top-8 p-2': !isMobile,
              'top-8 p-1 w-[calc(100vw-8px)] max-w-[516px]': isMobile,
            }
          )}
        >
          <Image
            src="/thirty-factor-authentication/horizontal-logo.png"
            alt="logo"
            height={48}
            width={516}
            className={classNames('!max-w-none', { 'h-auto w-full': isMobile })}
            priority
          />
        </div>
        {showAuth && (
          <DndProvider
            backend={dragBackend}
            options={{ delayTouchStart: 0, enableMouseEvents: true }}
          >
            <AuthContainer
              variant={showPregame ? 'pregame' : 'run'}
              playerId={playerId}
              setPlayerId={setPlayerId}
              setIsGameOver={setIsGameOver}
              Content={showPregame ? OneContent : (content as typeof OneContent)}
              Controls={showPregame ? OneControls : controls}
              baseProps={showPregame ? pregameBaseProps : runBaseProps}
              playErrorSound={playErrorSound}
              requiresLoad={showPregame ? false : requiresLoad}
              layout={layout}
            />
          </DndProvider>
        )}
        {showLevels && (
          <>
            <div id="extras-portal" className="flex w-full flex-col items-center" />
            {!!upsTrackingCode && !!upsTrackingTime && (
              <UPSTracker code={upsTrackingCode} time={upsTrackingTime} isMobile={isMobile} />
            )}
          </>
        )}
        {isCompleted && playerId !== undefined && (
          <VictoryScreen playerId={playerId} levelProps={runBaseProps} />
        )}
        {isGameOver && (
          <div
            className={classNames(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 p-8 rounded-md shadow-lg max-h-[85vh] overflow-y-auto',
              { 'w-full': isMobile, 'max-w-[650px]': !isMobile }
            )}
          >
            <h2 className="text-4xl mb-2">You have failed to authenticate.</h2>
            <p>
              To protect your account, it has been temporarily locked and all data has been deleted.
            </p>
            {isMobile && (
              <p>
                {
                  'Try Thirty Factor Authentication on your computer for a more optimized experience.'
                }
              </p>
            )}
            <RunStats levelTimings={levelTimings} accent="defeat" />
            <button className="mt-2 auth-button" onClick={resetRun}>
              Restart
            </button>
          </div>
        )}
        {devMode &&
          hasStarted &&
          devHudReady &&
          createPortal(
            <div className="fixed top-0 left-0 z-[200] flex flex-col text-left w-max p-2 gap-3">
              <h2 className="mb-2">Dev Mode:</h2>
              <button
                className="border p-1 cursor-pointer bg-white"
                onClick={() => setLevel((level) => level + 1)}
              >
                Next Level
              </button>
              <button
                className="border p-1 cursor-pointer bg-white"
                onClick={() => setLevel((level) => level - 1)}
              >
                Previous Level
              </button>
            </div>,
            document.body
          )}
        {/* <PortfolioHeader /> */}
      </div>
    </>
  )
}
