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
}

//AAAA@@may00
export const useLevels = () => {
  const [level, setLevel] = useState(1)

  //details for tracking the overarching UPS mechanics
  const [upsTrackingCode, setUPSTrackingCode] = useState('')
  const [upsTrackingTime, setUPSTrackingTime] = useState(0)

  const [selectedSSOIds, setSelectedSSOIds] = useState<Set<SSOIds>>(new Set())

  const handleLevelAdvance = useCallback(() => {
    const audio = new Audio('/thirty-factor-authentication/sounds/success.mp3')
    audio.volume = 0.2
    audio.play()
    setLevel((level) => level + 1)
  }, [])

  const resetLevel = () => setLevel(1)

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
  } as LevelProps

  const levelToUse = forceLevel > 0 ? forceLevel : level
  const LEVELS = [
    { content: OneContent, controls: OneControls },
    { content: TwoContent, controls: TwoControls },
    { content: BasicAppCodeContent, controls: BasicAppCodeControls },
    { content: MessageSpamContent, controls: MessageSpamControls },
    { content: ZodiacContent, controls: ZodiacControls }, //5
    { content: FallbackOneContent, controls: FallbackOneControls },
    { content: MapContent, controls: MapControls },
    { content: BiometricContent, controls: BiometricControls },
    { content: UPSContent, controls: UPSControls, requiresLoad: true },
    { content: FallbackTwoContent, controls: FallbackTwoControls }, //10
    { content: SSOContent },
    { content: AppCodeContent, controls: AppCodeControls },
    { content: PostItContent, controls: PostItControls },
    { content: IMDBContent, controls: IMDBControls, requiresLoad: true },
    { content: SSOContent }, //15
    { content: MaintenanceContent, controls: MaintenanceControls },
    { content: QuotesContent, controls: QuotesControl },
    { content: RoadTripContent, requiresLoad: true },
    //19
    { content: SSOContent }, //20
    { content: AquariumContent, controls: AquariumControls },
    { content: TaxReturnContent, controls: TaxReturnControls },
    { content: ParlorRoomContent, controls: undefined, requiresLoad: true },
    { content: BirdCallContent, controls: BirdCallControls, requiresLoad: true },
    { content: FishingContent, controls: FishingControls }, //25
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
