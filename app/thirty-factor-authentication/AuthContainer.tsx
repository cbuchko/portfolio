import { JSX, useEffect, useState } from 'react'
import { PlayerIds, PlayerInformation } from './player-constants'
import { ContentProps, ControlProps } from './levels/types'
import XIcon from '@/public/thirty-factor-authentication/icons/x.svg'
import { devMode, maxLevel } from './constants'
import classNames from 'classnames'
import { LevelProps } from './levels/useLevel'

type AuthContainerProps = {
  playerId: PlayerIds
  baseProps: LevelProps
  setIsGameOver: (value: boolean) => void
  Content: (props: ContentProps) => JSX.Element | null
  Controls?: (props: ControlProps) => JSX.Element
}

export const AuthContainer = ({
  playerId,
  baseProps,
  setIsGameOver,
  Content,
  Controls,
}: AuthContainerProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdvanceVerified, setIsAdvanceVerified] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const { handleLevelAdvance, requiresLoad, level } = baseProps

  const onAdvance = (skipVerify?: boolean) => {
    if (!isAdvanceVerified && !devMode && !skipVerify) {
      const audio = new Audio('/thirty-factor-authentication/sounds/error.mp3')
      audio.play()
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

  useEffect(() => {
    if (!requiresLoad) setIsLoading(false)
  }, [level, requiresLoad])

  const validateAdvance = () => setIsAdvanceVerified(true)
  const cancelAdvance = () => setIsAdvanceVerified(false)

  return (
    <>
      <div
        id="auth-container"
        className={classNames('relative min-w-[400px] mx-auto mt-24 shadow-md', {
          'opacity-0 pointer-events-none': isLoading && requiresLoad,
        })}
      >
        <div
          id="auth-header"
          className="flex justify-between items-center min-w-[400px] py-1 px-4 rounded-t-md bg-blue-300 border"
        >
          <div className="flex gap-2 items-center">
            <h6 className="w-full text-xs">{`Authenticating: ${PlayerInformation[playerId].name}`}</h6>
            <div className="flex itsems-center w-max">
              {Array.from({ length: errorCount }).map((_, idx) => (
                <small key={idx} className="text-red-500 h-5 w-5">
                  <XIcon />
                </small>
              ))}
            </div>
          </div>
          <h6 className="text-xs">{`Level ${level}/${maxLevel}`}</h6>
        </div>
        <div id="auth-body" className="border rounded-sm border-t-0 rounded-t-none">
          <div id="auth-content" className="px-4 py-8">
            <Content
              playerId={playerId}
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
