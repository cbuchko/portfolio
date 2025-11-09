import { PlayerIds } from '../player-constants'

export type ControlProps = {
  handleLevelAdvance: (skipVerify?: boolean) => void
  handleGameOver: () => void
  validateAdvance: () => void
}

export type ContentProps = {
  playerId: PlayerIds
  validateAdvance: () => void
  cancelAdvance: () => void
  handleLevelAdvance: (skipVerify?: boolean) => void
  setIsLoading: (loading: boolean) => void
}
