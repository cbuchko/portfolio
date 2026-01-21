import React, { useCallback, useState } from 'react'
import { OneContent, OneControls } from './1'
import { TwoContent, TwoControls } from './2'
import { MessageSpamContent, MessageSpamControls } from './MessageSpam'
import { ZodiacContent, ZodiacControls } from './Zodiac'
import { FallbackOneContent, FallbackOneControls } from './Fallback1'
import { forceLevel } from '../constants'
import { FallbackTwoContent, FallbackTwoControls } from './Fallback2'
import { MapContent, MapControls } from './MapBirthplace'
import { PostItContent, PostItControls } from './PostIt'
import { BiometricContent, BiometricControls } from './Biometric'
import { TaxReturnContent, TaxReturnControls } from './TaxReturn'
import { AppCodeContent, AppCodeControls } from './AppCode'
import { IMDBContent } from './IMDB'
import { BirdCallContent, BirdCallControls } from './BirdCalls'
import { ParlorRoomContent } from './ParlorRoom'
import { MaintenanceContent, MaintenanceControls } from './Maintenance'
import { QuotesContent } from './Quotes'
import { PapersPleaseContent } from './PapersPlease'
import { AquariumContent, AquariumControls } from './Aquarium'
import { UndertaleContent } from './Undertale'
import { BombDefusalContent, BombDefusalControls } from './BombDefusal'
import { BasicAppCodeContent, BasicAppCodeControls } from './BasicAppCode'
import { EinsteinContent, EinsteinControls } from './Einstein'
import { UPSContent, UPSControls } from './UPS'
import { UPSFinishContent, UPSFinishControls } from './UPSFinish'
import { SSOIds } from './SSO'
import { FishingContent, FishingControls } from './Fishing'
import { RoadTripContent } from './RoadTrip'
import { BrainScanContent, BrainScanControls } from './BrainScan'
import { useSound } from '@/app/utils/useSounds'
import { SpotifyContent } from './Spotify'
import { MastermindContent } from './Mastermind'
import { DartboardContent } from './Dartboard'

export type LevelProps = {
  level: number
  setLevel: React.Dispatch<React.SetStateAction<number>>
  handleLevelAdvance: () => void
  resetLevel: () => void
  requiresLoad: boolean
  upsTrackingCode: string
  upsTrackingTime: number
  setUPSTrackingCode: (code: string) => void
  setUPSTrackingTime: (time: number) => void
  selectedSSOIds: Set<SSOIds>
  setSelectedSSOIds: React.Dispatch<React.SetStateAction<Set<SSOIds>>>
  startTime: number
}

//AAAA@@may00
export const useLevels = () => {
  const [level, setLevel] = useState(1)

  const [startTime, setStartTime] = useState(new Date().getTime())

  const { playSound: playSuccessSound } = useSound(
    '/thirty-factor-authentication/sounds/success.mp3',
    0.2
  )

  //details for tracking the overarching UPS mechanics
  const [upsTrackingCode, setUPSTrackingCode] = useState('')
  const [upsTrackingTime, setUPSTrackingTime] = useState(0)

  const [selectedSSOIds, setSelectedSSOIds] = useState<Set<SSOIds>>(new Set())

  const handleLevelAdvance = useCallback(() => {
    playSuccessSound()
    setLevel((level) => level + 1)
  }, [playSuccessSound])

  const resetLevel = () => {
    setLevel(1)
    setStartTime(new Date().getTime())
    setUPSTrackingCode('')
    setUPSTrackingTime(0)
    setSelectedSSOIds(new Set())
  }

  const baseProps = {
    level,
    setLevel,
    handleLevelAdvance,
    resetLevel,
    upsTrackingCode,
    upsTrackingTime,
    setUPSTrackingCode,
    setUPSTrackingTime,
    selectedSSOIds,
    setSelectedSSOIds,
    startTime,
  } as LevelProps

  const levelToUse = forceLevel > 0 ? forceLevel : level
  const LEVELS = [
    { content: OneContent, controls: OneControls },
    { content: TwoContent, controls: TwoControls },
    { content: BasicAppCodeContent, controls: BasicAppCodeControls },
    { content: MessageSpamContent, controls: MessageSpamControls },
    { content: FallbackOneContent, controls: FallbackOneControls }, //5
    { content: MapContent, controls: MapControls },
    { content: BiometricContent, controls: BiometricControls },
    { content: PostItContent, controls: PostItControls },
    { content: ZodiacContent, controls: ZodiacControls },
    { content: UPSContent, controls: UPSControls }, //10
    { content: FallbackTwoContent, controls: FallbackTwoControls },
    { content: AppCodeContent, controls: AppCodeControls },
    { content: QuotesContent },
    { content: AquariumContent, controls: AquariumControls },
    { content: MaintenanceContent, controls: MaintenanceControls }, //15
    { content: IMDBContent },
    { content: BrainScanContent, controls: BrainScanControls },
    { content: RoadTripContent, requiresLoad: true },
    { content: ParlorRoomContent, requiresLoad: true },
    { content: DartboardContent }, //20
    { content: TaxReturnContent, controls: TaxReturnControls },
    { content: FishingContent, controls: FishingControls },
    { content: BirdCallContent, controls: BirdCallControls, requiresLoad: true },
    { content: MastermindContent },
    { content: UPSFinishContent, controls: UPSFinishControls, requiresLoad: true }, //25
    { content: SpotifyContent },
    { content: BombDefusalContent, controls: BombDefusalControls },
    { content: PapersPleaseContent },
    { content: EinsteinContent, controls: EinsteinControls },
    { content: UndertaleContent }, //30
  ]

  const levelDef = LEVELS[levelToUse - 1]
  if (!levelDef) {
    // fallback
    return {
      baseProps,
      content: OneContent,
      controls: OneControls,
      requiresLoad: false,
    }
  }
  return { baseProps, ...levelDef, requiresLoad: levelDef.requiresLoad || false }
}
