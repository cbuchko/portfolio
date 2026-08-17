import { SetStateAction } from 'react'
import { PlayerIds } from '../player-constants'
import { SSOIds } from './SSO'

export type ControlProps = {
  handleLevelAdvance: (skipVerify?: boolean) => void
  handleGameOver: () => void
  validateAdvance: () => void
  setUPSTrackingTime: (time: number) => void
  playerId?: PlayerIds
}

type ContentPropsBase = {
  setPlayerId: (id: PlayerIds | undefined) => void
  validateAdvance: () => void
  cancelAdvance: () => void
  handleLevelAdvance: (skipVerify?: boolean) => void
  setIsLoading: React.Dispatch<SetStateAction<boolean>>
  upsTrackingCode: string
  upsTrackingTime: number
  setUPSTrackingCode: (code: string) => void
  setUPSTrackingTime: (time: number) => void
  selectedSSOIds: Set<SSOIds>
  setSelectedSSOIds: React.Dispatch<React.SetStateAction<Set<SSOIds>>>
  isMobile?: boolean
}

/** Pre-game Account Select — player may not be chosen yet */
export type IdentitySelectProps = ContentPropsBase & {
  playerId: PlayerIds | undefined
}

/** Level content — a character has already been selected */
export type ContentProps = ContentPropsBase & {
  playerId: PlayerIds
}
