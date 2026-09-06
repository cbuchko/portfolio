import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { ParlorRoomContent } from './ParlorRoom'
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
import { BirdCallContent, BirdCallControls } from './BirdCalls'
import { RoadTripContent } from './RoadTrip'
import { useSound } from '@/app/utils/useSounds'
import { SpotifyContent } from './Spotify'
import { MastermindContent } from './Mastermind'
import { DartboardContent } from './Dartboard'
import { SecurityQuestionsContent, SecurityQuestionsControls } from './SecurityQuestions'
import { PizzatronContent } from './Pizzatron'
import { ContentProps, ControlProps } from './types'
import { captureTfaEvent, sessionProps } from '../analytics'

type LevelContent = (props: ContentProps) => React.JSX.Element | null
type LevelControls = (props: ControlProps) => React.JSX.Element | null

export type LevelTiming = {
  level: number
  id: string
  title: string
  durationMs: number
  strikes: number
}

type LevelDefinition = {
  content: LevelContent
  controls?: LevelControls
  requiresLoad?: boolean
  /** Stable analytics identity. Never rename or reuse after a level is replaced. */
  id: string
  title: string
}

export const getLevelMeta = (levelNumber: number) => {
  const def = LEVELS[levelNumber - 1]
  return {
    id: def?.id ?? `level-${levelNumber}`,
    title: def?.title ?? `Level ${levelNumber}`,
  }
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
  finalizeRunStats: () => LevelTiming[]
  strikesThisLevel: number
  registerStrike: () => number
}

// True 30 factors — Account Select is pre-game, not in this list.
export const LEVELS: LevelDefinition[] = [
  {
    id: 'identity-lock',
    content: IdentityLockContent,
    controls: IdentityLockControls,
    title: 'Identity Lock',
  },
  {
    id: 'security-questions',
    content: SecurityQuestionsContent,
    controls: SecurityQuestionsControls,
    title: 'Security Questions',
  },
  { id: 'app-code', content: BasicAppCodeContent, controls: BasicAppCodeControls, title: 'App Code' },
  {
    id: 'message-spam',
    content: MessageSpamContent,
    controls: MessageSpamControls,
    title: 'Message Spam',
  },
  { id: 'legal-name', content: LegalNameContent, controls: LegalNameControls, title: 'Legal Name' },
  {
    id: 'password-reset',
    content: FallbackOneContent,
    controls: FallbackOneControls,
    title: 'Password Reset',
  },
  { id: 'biometrics', content: BiometricContent, controls: BiometricControls, title: 'Biometrics' },
  { id: 'birthplace', content: MapContent, controls: MapControls, title: 'Birthplace' },
  { id: 'post-it-code', content: PostItContent, controls: PostItControls, title: 'Post-it Code' },
  {
    id: 'package-tracking',
    content: UPSContent,
    controls: UPSControls,
    title: 'Package Tracking',
  },
  {
    id: 'password-confirm',
    content: FallbackTwoContent,
    controls: FallbackTwoControls,
    title: 'Password Confirm',
  },
  { id: 'zodiac', content: ZodiacContent, controls: ZodiacControls, title: 'Zodiac' },
  {
    id: 'authenticator-app',
    content: AppCodeContent,
    controls: AppCodeControls,
    title: 'Authenticator App',
  },
  { id: 'aquarium', content: AquariumContent, controls: AquariumControls, title: 'Aquarium' },
  { id: 'quotes', content: QuotesContent, title: 'Quotes' },
  { id: 'road-trip', content: RoadTripContent, requiresLoad: true, title: 'Road Trip' },
  { id: 'parlor-room', content: ParlorRoomContent, requiresLoad: true, title: 'Parlor Room' },
  { id: 'dartboard', content: DartboardContent, title: 'Dartboard' },
  { id: 'filmography', content: IMDBContent, title: 'Filmography' },
  { id: 'tax-return', content: TaxReturnContent, controls: TaxReturnControls, title: 'Tax Return' },
  { id: 'fishing', content: FishingContent, controls: FishingControls, title: 'Fishing' },
  {
    id: 'bird-calls',
    content: BirdCallContent,
    controls: BirdCallControls,
    requiresLoad: true,
    title: 'Bird Calls',
  },
  { id: 'pizzatron', content: PizzatronContent, title: 'Pizzatron' },
  { id: 'mastermind', content: MastermindContent, title: 'Mastermind' },
  {
    id: 'package-arrival',
    content: UPSFinishContent,
    controls: UPSFinishControls,
    requiresLoad: true,
    title: 'Package Arrival',
  },
  { id: 'rhythm-challenge', content: SpotifyContent, title: 'Rhythm Challenge' },
  {
    id: 'bomb-defusal',
    content: BombDefusalContent,
    controls: BombDefusalControls,
    title: 'Bomb Defusal',
  },
  { id: 'papers-please', content: PapersPleaseContent, title: 'Papers Please' },
  {
    id: 'einstein-riddle',
    content: EinsteinContent,
    controls: EinsteinControls,
    title: 'Einstein Riddle',
  },
  { id: 'undertale', content: UndertaleContent, title: 'Undertale' },
]

//AAAA@@may00
export const useLevels = () => {
  const [level, setLevel] = useState(1)
  const levelRef = useRef(1)

  const [startTime, setStartTime] = useState(new Date().getTime())
  const [levelEnteredAt, setLevelEnteredAt] = useState(() => Date.now())
  const levelEnteredAtRef = useRef(levelEnteredAt)

  useEffect(() => {
    levelRef.current = level
    levelEnteredAtRef.current = levelEnteredAt
  }, [level, levelEnteredAt])

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
    const currentLevel = levelRef.current
    const meta = getLevelMeta(currentLevel)
    captureTfaEvent('tfa_strike', {
      ...sessionProps(),
      level: currentLevel,
      level_id: meta.id,
      level_title: meta.title,
      strike_number: next,
    })
    return next
  }, [])

  const recordLevelTiming = useCallback((levelNumber: number) => {
    if (levelNumber < 1 || levelNumber > maxLevel) return
    if (levelTimingsRef.current.some((entry) => entry.level === levelNumber)) return

    const durationMs = Math.max(0, Date.now() - levelEnteredAtRef.current)
    const meta = getLevelMeta(levelNumber)
    const strikes = strikesThisLevelRef.current
    const next = [
      ...levelTimingsRef.current,
      { level: levelNumber, id: meta.id, title: meta.title, durationMs, strikes },
    ]
    levelTimingsRef.current = next
    setLevelTimings(next)
  }, [])

  const handleLevelAdvance = useCallback(() => {
    playSuccessSound()
    const completedLevel = levelRef.current
    recordLevelTiming(completedLevel)
    const completed = levelTimingsRef.current.find((entry) => entry.level === completedLevel)
    if (completed) {
      captureTfaEvent('tfa_level_completed', {
        ...sessionProps(),
        level: completed.level,
        level_id: completed.id,
        level_title: completed.title,
        duration_ms: completed.durationMs,
        strikes: completed.strikes,
      })
    }
    clearStrikes()
    const enteredAt = Date.now()
    levelEnteredAtRef.current = enteredAt
    setLevelEnteredAt(enteredAt)
    setLevel((current) => current + 1)
  }, [playSuccessSound, recordLevelTiming, clearStrikes])

  const finalizeRunStats = useCallback(() => {
    recordLevelTiming(levelRef.current)
    return levelTimingsRef.current
  }, [recordLevelTiming])

  /** Fresh run clocks at Identity Lock — call when leaving pre-game or on full reset. */
  const resetLevel = useCallback(() => {
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
  }, [clearStrikes])

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
    return {
      baseProps,
      content: IdentityLockContent,
      controls: IdentityLockControls,
      requiresLoad: false,
      title: 'Identity Lock',
      id: 'identity-lock',
    }
  }
  return { baseProps, ...levelDef, requiresLoad: levelDef.requiresLoad || false }
}
