import { JSX, useCallback, useState } from 'react'
import { PlayerIds, PlayerInformation } from './player-constants'
import { ContentProps, ControlProps } from './levels/types'
import { devMode, maxLevel, mobileWidthBreakpoint } from './constants'
import classNames from 'classnames'
import { LevelProps } from './levels/useLevel'
import Image from 'next/image'
import { useEffectInitializer } from '../utils/useEffectUnsafe'
import { useIsMobile } from '../utils/useIsMobile'

type AuthContainerProps = {
  playerId: PlayerIds
  setPlayerId: (id: PlayerIds) => void
  baseProps: LevelProps
  setIsGameOver: (value: boolean) => void
  Content: (props: ContentProps) => JSX.Element | null
  Controls?: (props: ControlProps) => JSX.Element
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
  const [errorCount, setErrorCount] = useState(0)
  const { handleLevelAdvance, level } = baseProps

  const onAdvance = (skipVerify?: boolean) => {
    if (!isAdvanceVerified && !devMode && !skipVerify) {
      playErrorSound()
      setErrorCount((errorCount) => errorCount + 1)
      if (errorCount === 2) {
        setIsGameOver(true)
      }
      return
    }
    setIsAdvanceVerified(false)
    handleLevelAdvance()
    setErrorCount(0)
    setIsLoading(true)
  }

  useEffectInitializer(() => {
    if (!requiresLoad) setIsLoading(false)
  }, [level, requiresLoad])

  const validateAdvance = useCallback(() => setIsAdvanceVerified(true), [])
  const cancelAdvance = useCallback(() => setIsAdvanceVerified(false), [])

  return (
    <>
      <div
        id="auth-container"
        className={classNames('relative  mx-auto mt-28 shadow-md', {
          'opacity-0 pointer-events-none': isLoading && requiresLoad,
        })}
      >
        <div
          id="auth-header"
          className={classNames(
            'flex justify-between items-center py-1 px-4 rounded-t-md bg-blue-300 border',
            { 'min-w-[400px]': !isMobile }
          )}
        >
          <div className="flex gap-2 items-center min-h-[20px]">
            <h6 className="w-full text-xs">{`Authenticating: ${PlayerInformation[playerId].name}`}</h6>
            <div className="flex itsems-center w-max">
              {Array.from({ length: errorCount }).map((_, idx) => (
                <small key={idx} className="text-red-500 h-5 w-5">
                  <Image
                    src="/thirty-factor-authentication/icons/red-x.svg"
                    alt="X"
                    width={20}
                    height={20}
                  />
                </small>
              ))}
            </div>
          </div>
          <h6 className="text-xs">{`Level ${level}/${maxLevel}`}</h6>
        </div>
        <div id="auth-body" className="border rounded-sm border-t-0 rounded-t-none">
          <div id="auth-content" className="px-4 py-8 bg-white rounded-b-lg">
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
            />
          </div>
          {Controls && (
            <div
              id="auth-controls"
              className="px-4 py-3 border-t flex flex-wrap w-full justify-between gap-4 bg-gray-50 rounded-b-sm"
            >
              <Controls
                handleLevelAdvance={onAdvance}
                handleGameOver={() => setIsGameOver(true)}
                validateAdvance={validateAdvance}
                setUPSTrackingTime={baseProps.setUPSTrackingTime}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
