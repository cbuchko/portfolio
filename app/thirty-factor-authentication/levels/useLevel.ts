import React, { useCallback, useRef, useState } from 'react'
import { OneContent, OneControls } from './1'
import { IdentityLockContent, IdentityLockControls } from './IdentityLock'
import { LegalNameContent, LegalNameControls } from './LegalName'
import { MessageSpamContent, MessageSpamControls } from './MessageSpam'
import { ZodiacContent, ZodiacControls } from './Zodiac'
import { FallbackOneContent, FallbackOneControls } from './Fallback1'
import { forceLevel, maxLevel } from '../constants'
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
import { useSound } from '@/app/utils/useSounds'
import { SpotifyContent } from './Spotify'
import { MastermindContent } from './Mastermind'
import { DartboardContent } from './Dartboard'
import { SecurityQuestionsContent, SecurityQuestionsControls } from './SecurityQuestions'
import { ControlProps, IdentitySelectProps } from './types'

type LevelContent = (props: IdentitySelectProps) => React.JSX.Element | null
type LevelControls = (props: ControlProps) => React.JSX.Element | null

export type LevelTiming = {
  level: number
  title: string
  durationMs: number
  strikes: number
}

type LevelDefinition = {
  content: LevelContent
  controls?: LevelControls
  requiresLoad?: boolean
  title: string
}

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
  levelTimings: LevelTiming[]
  finalizeRunStats: () => void
  strikesThisLevel: number
  registerStrike: () => number
}

// Character levels use ContentProps (playerId required). The shell passes
// IdentitySelectProps; AuthContainer guarantees playerId after level 1.
export const LEVELS: LevelDefinition[] = [
  { content: OneContent, controls: OneControls, title: 'Account Select' },
  { content: IdentityLockContent, controls: IdentityLockControls, title: 'Identity Lock' },
  {
    content: SecurityQuestionsContent,
    controls: SecurityQuestionsControls,
    title: 'Security Questions',
  },
  { content: BasicAppCodeContent, controls: BasicAppCodeControls, title: 'App Code' },
  { content: MessageSpamContent, controls: MessageSpamControls, title: 'Message Spam' }, //5
  { content: LegalNameContent, controls: LegalNameControls, title: 'Legal Name' },
  { content: FallbackOneContent, controls: FallbackOneControls, title: 'Password Reset' },
  { content: BiometricContent, controls: BiometricControls, title: 'Biometrics' },
  { content: MapContent, controls: MapControls, title: 'Birthplace' }, //10
  { content: PostItContent, controls: PostItControls, title: 'Post-it Code' },
  { content: UPSContent, controls: UPSControls, title: 'Package Tracking' },
  { content: FallbackTwoContent, controls: FallbackTwoControls, title: 'Password Confirm' },
  { content: ZodiacContent, controls: ZodiacControls, title: 'Zodiac' },
  { content: AppCodeContent, controls: AppCodeControls, title: 'Authenticator App' },
  { content: AquariumContent, controls: AquariumControls, title: 'Aquarium' }, //15
  { content: MaintenanceContent, controls: MaintenanceControls, title: 'Maintenance' },
  { content: QuotesContent, title: 'Quotes' }, 
  { content: RoadTripContent, requiresLoad: true, title: 'Road Trip' },
  { content: ParlorRoomContent, requiresLoad: true, title: 'Parlor Room' }, 
  { content: DartboardContent, title: 'Dartboard' }, //20
  { content: IMDBContent, title: 'Filmography' },
  { content: TaxReturnContent, controls: TaxReturnControls, title: 'Tax Return' },
  { content: FishingContent, controls: FishingControls, title: 'Fishing' },
  { content: BirdCallContent, controls: BirdCallControls, requiresLoad: true, title: 'Bird Calls' },
  { content: MastermindContent, title: 'Mastermind' },
  {
    content: UPSFinishContent,
    controls: UPSFinishControls,
    requiresLoad: true,
    title: 'Package Delivery',
  },
  { content: SpotifyContent, title: 'Rhythm Challenge' },
  { content: BombDefusalContent, controls: BombDefusalControls, title: 'Bomb Defusal' },
  { content: PapersPleaseContent, title: 'Papers Please' },
  { content: EinsteinContent, controls: EinsteinControls, title: 'Einstein Riddle' },
  { content: UndertaleContent, title: 'Final Defense' },
] as LevelDefinition[]

//AAAA@@may00
export const useLevels = () => {
  const [level, setLevel] = useState(1)
  const levelRef = useRef(1)
  levelRef.current = level

  const [startTime, setStartTime] = useState(new Date().getTime())
  const [levelEnteredAt, setLevelEnteredAt] = useState(() => Date.now())
  const levelEnteredAtRef = useRef(levelEnteredAt)
  levelEnteredAtRef.current = levelEnteredAt

  const [levelTimings, setLevelTimings] = useState<LevelTiming[]>([])
  const levelTimingsRef = useRef<LevelTiming[]>([])

  const [strikesThisLevel, setStrikesThisLevel] = useState(0)
  const strikesThisLevelRef = useRef(0)

  const { playSound: playSuccessSound } = useSound(
    '/thirty-factor-authentication/sounds/success.mp3',
    0.2
  )

  //details for tracking the overarching UPS mechanics
  const [upsTrackingCode, setUPSTrackingCode] = useState('')
  const [upsTrackingTime, setUPSTrackingTime] = useState(0)

  const [selectedSSOIds, setSelectedSSOIds] = useState<Set<SSOIds>>(new Set())

  const clearStrikes = useCallback(() => {
    strikesThisLevelRef.current = 0
    setStrikesThisLevel(0)
  }, [])

  const registerStrike = useCallback(() => {
    const next = Math.min(3, strikesThisLevelRef.current + 1)
    strikesThisLevelRef.current = next
    setStrikesThisLevel(next)
    return next
  }, [])

  const recordLevelTiming = useCallback((levelNumber: number) => {
    if (levelNumber < 1 || levelNumber > maxLevel) return
    if (levelTimingsRef.current.some((entry) => entry.level === levelNumber)) return

    const durationMs = Math.max(0, Date.now() - levelEnteredAtRef.current)
    const title = LEVELS[levelNumber - 1]?.title ?? `Level ${levelNumber}`
    const strikes = strikesThisLevelRef.current
    const next = [...levelTimingsRef.current, { level: levelNumber, title, durationMs, strikes }]
    levelTimingsRef.current = next
    setLevelTimings(next)
  }, [])

  const handleLevelAdvance = useCallback(() => {
    playSuccessSound()
    const completedLevel = levelRef.current
    recordLevelTiming(completedLevel)
    clearStrikes()
    const enteredAt = Date.now()
    levelEnteredAtRef.current = enteredAt
    setLevelEnteredAt(enteredAt)
    setLevel((current) => current + 1)
  }, [playSuccessSound, recordLevelTiming, clearStrikes])

  const finalizeRunStats = useCallback(() => {
    recordLevelTiming(levelRef.current)
  }, [recordLevelTiming])

  const resetLevel = () => {
    setLevel(1)
    levelRef.current = 1
    const now = Date.now()
    setStartTime(now)
    levelEnteredAtRef.current = now
    setLevelEnteredAt(now)
    levelTimingsRef.current = []
    setLevelTimings([])
    clearStrikes()
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
    levelTimings,
    finalizeRunStats,
    strikesThisLevel,
    registerStrike,
  } as LevelProps

  const levelToUse = forceLevel > 0 ? forceLevel : level
  const levelDef = LEVELS[levelToUse - 1]
  if (!levelDef) {
    // fallback
    return {
      baseProps,
      content: OneContent,
      controls: OneControls,
      requiresLoad: false,
      title: 'Account Select',
    }
  }
  return { baseProps, ...levelDef, requiresLoad: levelDef.requiresLoad || false }
}
