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
  const { isNarrow, isShort, isTouch, fit } = layout
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

  // Mirror the layout tokens onto <html> so body-level portals (night manor,
  // pickers) can read `--tfa-fit` / `[data-short]` like in-shell content.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--tfa-fit', String(fit))
    root.toggleAttribute('data-tfa-short', isShort)
    root.toggleAttribute('data-tfa-narrow', isNarrow)
    root.toggleAttribute('data-tfa-touch', isTouch)
    return () => {
      root.style.removeProperty('--tfa-fit')
      root.removeAttribute('data-tfa-short')
      root.removeAttribute('data-tfa-narrow')
      root.removeAttribute('data-tfa-touch')
    }
  }, [fit, isShort, isNarrow, isTouch])

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
    <div
      className={classNames('relative w-full h-dvh flex flex-col overflow-y-auto tfa-shell', {
        'select-none': isTouch,
        'tfa-shell--short': isShort,
        'tfa-shell--narrow': isNarrow,
      })}
      data-short={isShort || undefined}
      data-narrow={isNarrow || undefined}
      data-touch={isTouch || undefined}
      style={{ '--tfa-fit': fit } as React.CSSProperties}
    >
      <div
        id="tfa-logo"
        className={classNames(
          'absolute left-[50%] -translate-x-[50%] flex items-center bg-white rounded-md !max-w-auto',
          {
            'top-8 p-2': !isNarrow && !isShort,
            'top-3 p-1': !isNarrow && isShort,
            'p-1 w-[calc(100vw-8px)] max-w-[516px]': isNarrow,
            'top-8': isNarrow && !isShort,
            'top-3': isNarrow && isShort,
          }
        )}
      >
        <Image
          src="/thirty-factor-authentication/horizontal-logo.png"
          alt="logo"
          height={48}
          width={516}
          className={classNames('!max-w-none', {
            'h-auto w-full': isNarrow,
            'h-9 w-auto': !isNarrow && isShort,
          })}
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
            <UPSTracker code={upsTrackingCode} time={upsTrackingTime} isMobile={isNarrow} />
          )}
        </>
      )}
      {isCompleted && playerId !== undefined && (
        <VictoryScreen playerId={playerId} levelProps={runBaseProps} />
      )}
      {isGameOver && (
        <div
          className={classNames(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 rounded-md shadow-lg max-h-[85dvh] overflow-y-auto',
            { 'w-full': isNarrow, 'max-w-[650px]': !isNarrow, 'p-8': !isShort, 'p-4': isShort }
          )}
        >
          <h2 className="text-4xl mb-2">You have failed to authenticate.</h2>
          <p>
            To protect your account, it has been temporarily locked and all data has been deleted.
          </p>
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
          <div className="fixed top-0 left-0 z-[200] flex flex-col text-left w-max p-2 gap-3 bg-white">
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
  )
}
