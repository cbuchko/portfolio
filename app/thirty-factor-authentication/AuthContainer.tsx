import { JSX, useCallback, useEffect, useState } from 'react'
import { PlayerIds, PlayerInformation } from './player-constants'
import { ControlProps, IdentitySelectProps } from './levels/types'
import { devMode, maxLevel, mobileWidthBreakpoint } from './constants'
import classNames from 'classnames'
import { LevelProps } from './levels/useLevel'
import Image from 'next/image'
import { useEffectInitializer } from '../utils/useEffectUnsafe'
import { useIsMobile } from '../utils/useIsMobile'

const maxStrikes = 3

type AuthContainerProps = {
  playerId: PlayerIds | undefined
  setPlayerId: (id: PlayerIds | undefined) => void
  baseProps: LevelProps
  setIsGameOver: (value: boolean) => void
  Content: (props: IdentitySelectProps) => JSX.Element | null
  Controls?: (props: ControlProps) => JSX.Element | null
  playErrorSound: () => void
  requiresLoad?: boolean
}

export const AuthContainer = ({
  playerId,
  setPlayerId,
  baseProps,
  setIsGameOver,
  Content,
  Controls,
  playErrorSound,
  requiresLoad,
}: AuthContainerProps) => {
  const isMobile = useIsMobile(mobileWidthBreakpoint)

  const [isLoading, setIsLoading] = useState(false)
  const [isAdvanceVerified, setIsAdvanceVerified] = useState(false)
  const [strikeFeedback, setStrikeFeedback] = useState(false)
  const { handleLevelAdvance, level, strikesThisLevel, registerStrike } = baseProps

  useEffect(() => {
    if (!strikeFeedback) return
    const timeout = setTimeout(() => setStrikeFeedback(false), 450)
    return () => clearTimeout(timeout)
  }, [strikeFeedback])

  const onAdvance = (skipVerify?: boolean) => {
    if (!isAdvanceVerified && !devMode && !skipVerify) {
      playErrorSound()
      setStrikeFeedback(true)
      const next = registerStrike()
      if (next >= maxStrikes) {
        setIsGameOver(true)
      }
      return
    }
    setIsAdvanceVerified(false)
    handleLevelAdvance()
    setIsLoading(true)
  }

  useEffectInitializer(() => {
    if (!requiresLoad) setIsLoading(false)
  }, [level, requiresLoad])

  const validateAdvance = useCallback(() => setIsAdvanceVerified(true), [])
  const cancelAdvance = useCallback(() => setIsAdvanceVerified(false), [])

  // After level 1, a character must have been selected
  if (level !== 1 && playerId === undefined) return null

  const headerThreatened = strikesThisLevel >= 2

  return (
    <>
      <div
        id="auth-container"
        className={classNames('relative mt-28 shadow-md', {
          'opacity-0 pointer-events-none': isLoading && requiresLoad,
          'mb-4 !mt-0 top-[20%]': isMobile,
          'mx-auto': !isMobile,
          'auth-strike-shake': strikeFeedback,
        })}
      >
        <div
          id="auth-header"
          className={classNames(
            'flex justify-between items-center py-1 px-4 rounded-t-md border transition-colors duration-200',
            {
              'min-w-[400px]': !isMobile,
              'w-full': isMobile,
              'bg-red-400': headerThreatened,
              'bg-blue-300': !headerThreatened,
              'auth-header-strike-flash': strikeFeedback,
            }
          )}
        >
          <div className="flex gap-2 items-center min-h-[20px]">
            <h6 className="w-full text-xs">
              {`Authenticating: ${playerId !== undefined ? PlayerInformation[playerId].name : '—'}`}
            </h6>
            <div className="flex items-center w-max gap-0.5" aria-label={`${strikesThisLevel} of ${maxStrikes} strikes`}>
              {Array.from({ length: maxStrikes }).map((_, idx) => {
                const filled = idx < strikesThisLevel
                return (
                  <small
                    key={idx}
                    className={classNames('h-5 w-5', {
                      'text-red-600': filled,
                      'text-gray-400/70': !filled,
                    })}
                  >
                    <Image
                      src={
                        filled
                          ? '/thirty-factor-authentication/icons/red-x.svg'
                          : '/thirty-factor-authentication/icons/x.svg'
                      }
                      alt={filled ? 'Strike' : 'Strike slot'}
                      width={20}
                      height={20}
                      className={classNames({ 'opacity-20': !filled })}
                    />
                  </small>
                )
              })}
            </div>
          </div>
          <h6 className="text-xs">{`Step ${level}/${maxLevel}`}</h6>
        </div>
        <div id="auth-body" className="group/auth-body border border-t-0 rounded-b-md">
          <div
            id="auth-content"
            className="px-4 py-8 bg-white rounded-b-md group-has-[#auth-controls:not(:empty)]/auth-body:rounded-b-none"
          >
            <Content
              playerId={playerId}
              setPlayerId={setPlayerId}
              validateAdvance={validateAdvance}
              cancelAdvance={cancelAdvance}
              handleLevelAdvance={onAdvance}
              setIsLoading={setIsLoading}
              setUPSTrackingCode={baseProps.setUPSTrackingCode}
              setUPSTrackingTime={baseProps.setUPSTrackingTime}
              upsTrackingCode={baseProps.upsTrackingCode}
              upsTrackingTime={baseProps.upsTrackingTime}
              selectedSSOIds={baseProps.selectedSSOIds}
              setSelectedSSOIds={baseProps.setSelectedSSOIds}
              isMobile={isMobile}
            />
          </div>
          {Controls && (
            <div
              id="auth-controls"
              className="px-4 py-3 border-t flex flex-wrap w-full justify-between gap-4 bg-gray-50 rounded-b-md empty:hidden"
            >
              <Controls
                key={level}
                handleLevelAdvance={onAdvance}
                handleGameOver={() => {
                  playErrorSound()
                  setIsGameOver(true)
                }}
                validateAdvance={validateAdvance}
                setUPSTrackingTime={baseProps.setUPSTrackingTime}
                playerId={playerId}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
