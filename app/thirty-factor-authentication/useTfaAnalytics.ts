import { useCallback, useEffect, useRef } from 'react'
import { maxLevel } from './constants'
import { PlayerIds, PlayerInformation } from './player-constants'
import { LEVELS, LevelTiming } from './levels/useLevel'
import {
  TFA_AFK_MS,
  TfaPendingEnd,
  captureTfaEvent,
  clearPendingEnd,
  getTfaSession,
  incrementRunIndex,
  initTfaAnalytics,
  isTfaAnalyticsReady,
  readPendingEnd,
  sessionProps,
  setTfaSession,
  writePendingEnd,
} from './analytics'

const levelTitle = (levelNumber: number) =>
  LEVELS[levelNumber - 1]?.title ?? `Level ${levelNumber}`

type UseTfaAnalyticsArgs = {
  hasStarted: boolean
  isGameOver: boolean
  isCompleted: boolean
  isMobile: boolean
  level: number
  playerId?: PlayerIds
  strikesThisLevel: number
  levelTimings: LevelTiming[]
}

export const useTfaAnalytics = ({
  hasStarted,
  isGameOver,
  isCompleted,
  isMobile,
  level,
  playerId,
  strikesThisLevel,
  levelTimings,
}: UseTfaAnalyticsArgs) => {
  const endedRef = useRef(false)
  const abandonedRef = useRef(false)
  const openedRef = useRef(false)
  const lastEnteredRef = useRef<number | null>(null)
  const lastEndedRef = useRef<TfaPendingEnd | null>(null)
  const idleTimerRef = useRef<number | null>(null)

  const characterName = playerId !== undefined ? PlayerInformation[playerId].name : undefined
  const inProgress = hasStarted && !isGameOver && !isCompleted

  useEffect(() => {
    initTfaAnalytics()
  }, [])

  useEffect(() => {
    setTfaSession({
      characterId: playerId,
      characterName,
      isMobile,
      level,
      levelTitle: level >= 1 && level <= maxLevel ? levelTitle(level) : undefined,
      strikesThisLevel,
    })
  }, [playerId, characterName, isMobile, level, strikesThisLevel])

  useEffect(() => {
    if (!isTfaAnalyticsReady() || openedRef.current) return
    openedRef.current = true
    captureTfaEvent('tfa_game_opened', {
      is_mobile: isMobile,
      referrer: document.referrer || undefined,
    })
  }, [isMobile])

  const markRunEnded = useCallback(
    (outcome: 'won' | 'lost', timings = levelTimings) => {
      if (endedRef.current) return
      endedRef.current = true
      abandonedRef.current = true

      const last = timings[timings.length - 1]
      const lastLevel = last?.level ?? level
      const lastTitle = last?.title ?? levelTitle(lastLevel)
      const totalDurationMs = timings.reduce((sum, entry) => sum + entry.durationMs, 0)
      const totalStrikes = timings.reduce((sum, entry) => sum + (entry.strikes ?? 0), 0)
      const pending: TfaPendingEnd = {
        outcome,
        last_level: lastLevel,
        last_level_title: lastTitle,
        endedAt: Date.now(),
      }
      lastEndedRef.current = pending
      writePendingEnd(pending)

      captureTfaEvent('tfa_run_ended', {
        ...sessionProps(),
        outcome,
        levels_cleared: outcome === 'won' ? maxLevel : Math.max(0, lastLevel - 1),
        last_level: lastLevel,
        last_level_title: lastTitle,
        total_duration_ms: totalDurationMs,
        total_strikes: totalStrikes,
      })
    },
    [level, levelTimings]
  )

  useEffect(() => {
    if (isCompleted) markRunEnded('won')
  }, [isCompleted, markRunEnded])

  useEffect(() => {
    if (!inProgress || level < 1 || level > maxLevel) return
    if (lastEnteredRef.current === level) return
    lastEnteredRef.current = level
    setTfaSession({ levelEnteredAt: Date.now() })
    captureTfaEvent('tfa_level_entered', {
      ...sessionProps(),
      level,
      level_title: levelTitle(level),
    })
  }, [inProgress, level])

  const abandon = useCallback(
    (reason: 'tab_close' | 'afk') => {
      if (!inProgress || endedRef.current || abandonedRef.current) return
      abandonedRef.current = true
      const enteredAt = getTfaSession().levelEnteredAt
      captureTfaEvent('tfa_run_abandoned', {
        ...sessionProps(),
        reason,
        level,
        level_title: levelTitle(level),
        duration_on_level_ms: enteredAt ? Math.max(0, Date.now() - enteredAt) : 0,
        strikes_this_level: strikesThisLevel,
      })
    },
    [inProgress, level, strikesThisLevel]
  )

  useEffect(() => {
    if (!inProgress) {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
      return
    }

    const armIdle = () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => abandon('afk'), TFA_AFK_MS)
    }

    const onActivity = () => {
      if (document.visibilityState === 'visible') armIdle()
    }

    const onPageHide = () => abandon('tab_close')

    armIdle()
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    document.addEventListener('visibilitychange', armIdle)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
      document.removeEventListener('visibilitychange', armIdle)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [inProgress, abandon])

  const captureRunStarted = useCallback(() => {
    endedRef.current = false
    abandonedRef.current = false
    lastEnteredRef.current = null

    const { run_index, is_first_run } = incrementRunIndex()
    setTfaSession({ runIndex: run_index })

    const pending = lastEndedRef.current ?? readPendingEnd()
    if (pending) {
      captureTfaEvent('tfa_run_retried', {
        ...sessionProps(),
        run_index,
        previous_outcome: pending.outcome,
        previous_last_level: pending.last_level,
        previous_last_level_title: pending.last_level_title,
        retry_kind: lastEndedRef.current ? 'immediate' : 'return_visit',
        delay_ms: Math.max(0, Date.now() - pending.endedAt),
      })
      lastEndedRef.current = null
      clearPendingEnd()
    }

    captureTfaEvent('tfa_run_started', {
      ...sessionProps(),
      run_index,
      is_first_run,
    })
  }, [])

  return { captureRunStarted, markRunEnded }
}
