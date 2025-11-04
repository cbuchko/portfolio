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
  handleLevelAdvance: () => void
  setIsLoading: (loading: boolean) => void
}
