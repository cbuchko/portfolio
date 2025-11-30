import React, { useCallback, useRef, useState } from 'react'
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
import { IMDBContent, IMDBControls } from './IMDB'
import { BirdCallContent, BirdCallControls } from './BirdCalls'
import { ParlorRoomContent } from './ParlorRoom'
import { MaintenanceContent, MaintenanceControls } from './Maintenance'
import { QuotesContent, QuotesControl } from './Quotes'
import { PapersPleaseContent } from './PapersPlease'
import { AquariumContent, AquariumControls } from './Aquarium'
import { UndertaleContent } from './Undertale'
import { BombDefusalContent, BombDefusalControls } from './BombDefusal'
import { BasicAppCodeContent, BasicAppCodeControls } from './BasicAppCode'
import { EinsteinContent, EinsteinControls } from './Einstein'
import { UPSContent, UPSControls } from './UPS'
import { UPSFinishContent, UPSFinishControls } from './UPSFinish'
import { SSOContent, SSOIds } from './SSO'
import { FishingContent, FishingControls } from './Fishing'
import { RoadTripContent } from './RoadTrip'
import { BrainScanContent, BrainScanControls } from './BrainScan'
import { useSound } from '@/app/utils/useSounds'

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

  const timeRef = useRef(new Date().getTime())

  const playSuccessSound = useSound('/thirty-factor-authentication/sounds/success.mp3', 0.2)

  //details for tracking the overarching UPS mechanics
  const [upsTrackingCode, setUPSTrackingCode] = useState('')
  const [upsTrackingTime, setUPSTrackingTime] = useState(0)

  const [selectedSSOIds, setSelectedSSOIds] = useState<Set<SSOIds>>(new Set())

  const handleLevelAdvance = useCallback(() => {
    playSuccessSound()
    setLevel((level) => level + 1)
  }, [])

  const resetLevel = () => {
    setLevel(1)
    timeRef.current = new Date().getTime()
  }

  const baseProps = {
    level,
    setLevel,
    handleLevelAdvance,
    resetLevel,
    requiresLoad: false,
    upsTrackingCode,
    upsTrackingTime,
    setUPSTrackingCode,
    setUPSTrackingTime,
    selectedSSOIds,
    setSelectedSSOIds,
    startTime: timeRef.current,
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
    { content: FallbackTwoContent, controls: FallbackTwoControls }, //10
    { content: UPSContent, controls: UPSControls, requiresLoad: true },
    { content: AppCodeContent, controls: AppCodeControls }, //APP CODE BEFORE SSO FOR CLARITY
    { content: SSOContent },
    { content: IMDBContent, controls: IMDBControls, requiresLoad: true },
    { content: MaintenanceContent, controls: MaintenanceControls },
    { content: SSOContent }, //15
    { content: BrainScanContent, controls: BrainScanControls },
    { content: RoadTripContent, requiresLoad: true },
    { content: QuotesContent, controls: QuotesControl },
    { content: SSOContent }, //20
    { content: TaxReturnContent, controls: TaxReturnControls },
    { content: ParlorRoomContent, controls: undefined, requiresLoad: true },
    { content: AquariumContent, controls: AquariumControls },
    { content: FishingContent, controls: FishingControls }, //25
    { content: BirdCallContent, controls: BirdCallControls, requiresLoad: true },
    { content: UPSFinishContent, controls: UPSFinishControls, requiresLoad: true },
    { content: BombDefusalContent, controls: BombDefusalControls },
    { content: EinsteinContent, controls: EinsteinControls },
    { content: PapersPleaseContent, controls: undefined },
    { content: UndertaleContent, controls: undefined }, //30
  ]

  const levelDef = LEVELS[levelToUse - 1]
  if (!levelDef) {
    // fallback
    return {
      baseProps,
      content: OneContent,
      controls: OneControls,
    }
  }
  return { baseProps, ...levelDef }
}
