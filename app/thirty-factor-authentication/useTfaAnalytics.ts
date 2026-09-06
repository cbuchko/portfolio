import { useCallback, useEffect, useRef } from 'react'
import { maxLevel } from './constants'
import { PlayerIds, PlayerInformation } from './player-constants'
import { getLevelMeta, LevelTiming } from './levels/useLevel'
import {
  TFA_ABANDON_STASH_MS,
  TFA_AFK_MS,
  TFA_CONTINUE_MS,
  TFA_RUN_HEARTBEAT_MS,
  TfaPendingAbandon,
  TfaPendingEnd,
  captureAbandonEvent,
  captureResumeEvent,
  captureTfaEvent,
  clearPendingAbandon,
  clearPendingEnd,
  flushPendingAbandon,
  getTfaSession,
  incrementRunIndex,
  initTfaAnalytics,
  isFreshPendingAbandon,
  isTfaAnalyticsReady,
  readPendingAbandon,
  readPendingEnd,
  sessionProps,
  setTfaSession,
  writePendingAbandon,
  writePendingEnd,
} from './analytics'

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
  const abandonIdRef = useRef<string>(crypto.randomUUID())
  const snapshotRef = useRef<() => TfaPendingAbandon | null>(() => null)

  const characterName = playerId !== undefined ? PlayerInformation[playerId].name : undefined
  const inProgress = hasStarted && !isGameOver && !isCompleted

  useEffect(() => {
    initTfaAnalytics()
    const pending = readPendingAbandon()
    if (!pending) return

    if (!isFreshPendingAbandon(pending)) {
      flushPendingAbandon()
      return
    }

    const waitMs = Math.max(0, TFA_CONTINUE_MS - (Date.now() - pending.hiddenAt))
    const timer = window.setTimeout(() => {
      const still = readPendingAbandon()
      if (still?.abandon_id === pending.abandon_id) flushPendingAbandon()
    }, waitMs)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    snapshotRef.current = () => {
      if (!inProgress || endedRef.current || abandonedRef.current) return null
      const { levelEnteredAt, runStartedAt, runIndex, characterId, characterName: name } = getTfaSession()
      const meta = getLevelMeta(level)
      return {
        abandon_id: abandonIdRef.current,
        reason: 'tab_close',
        run_index: runIndex,
        character_id: characterId,
        character_name: name,
        is_mobile: isMobile,
        level,
        level_id: meta.id,
        level_title: meta.title,
        duration_on_level_ms: levelEnteredAt ? Math.max(0, Date.now() - levelEnteredAt) : 0,
        total_duration_ms: runStartedAt ? Math.max(0, Date.now() - runStartedAt) : 0,
        strikes_this_level: strikesThisLevel,
        hiddenAt: Date.now(),
      }
    }
  }, [inProgress, isMobile, level, strikesThisLevel])

  useEffect(() => {
    setTfaSession({
      characterId: playerId,
      characterName,
      isMobile,
      level,
      levelId: level >= 1 && level <= maxLevel ? getLevelMeta(level).id : undefined,
      levelTitle: level >= 1 && level <= maxLevel ? getLevelMeta(level).title : undefined,
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
      const lastMeta = getLevelMeta(lastLevel)
      const lastId = last?.id ?? lastMeta.id
      const lastTitle = last?.title ?? lastMeta.title
      const totalDurationMs = timings.reduce((sum, entry) => sum + entry.durationMs, 0)
      const totalStrikes = timings.reduce((sum, entry) => sum + (entry.strikes ?? 0), 0)
      const pending: TfaPendingEnd = {
        outcome,
        last_level: lastLevel,
        last_level_id: lastId,
        last_level_title: lastTitle,
        total_duration_ms: totalDurationMs,
        endedAt: Date.now(),
      }
      lastEndedRef.current = pending
      writePendingEnd(pending)
      clearPendingAbandon()

      captureTfaEvent('tfa_run_ended', {
        ...sessionProps(),
        outcome,
        levels_cleared: outcome === 'won' ? maxLevel : Math.max(0, lastLevel - 1),
        last_level: lastLevel,
        last_level_id: lastId,
        last_level_title: lastTitle,
        last_level_duration_ms: last?.durationMs ?? 0,
        last_level_strikes: last?.strikes ?? 0,
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
    const entered = getLevelMeta(level)
    captureTfaEvent('tfa_level_entered', {
      ...sessionProps(),
      level,
      level_id: entered.id,
      level_title: entered.title,
    })
  }, [inProgress, level])

  const stashAbandon = useCallback(() => {
    const pending = snapshotRef.current()
    if (pending) writePendingAbandon(pending)
    return pending
  }, [])

  const abandon = useCallback((reason: 'tab_close' | 'afk', delivery: 'live' | 'beacon') => {
    if (endedRef.current || abandonedRef.current) return
    const pending = snapshotRef.current()
    if (!pending) return
    abandonedRef.current = true
    pending.reason = reason
    writePendingAbandon(pending)
    captureAbandonEvent(pending, delivery)
    if (delivery === 'live') clearPendingAbandon()
  }, [])

  const resumeIfNeeded = useCallback(() => {
    if (!inProgress || endedRef.current || !abandonedRef.current) return
    const abandonId = abandonIdRef.current
    abandonedRef.current = false
    abandonIdRef.current = crypto.randomUUID()
    clearPendingAbandon()
    const meta = getLevelMeta(level)
    captureResumeEvent(abandonId, {
      resume_kind: 'same_tab',
      level,
      level_id: meta.id,
      level_title: meta.title,
    })
  }, [inProgress, level])

  useEffect(() => {
    if (!inProgress) {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
      return
    }

    const armIdle = () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => abandon('afk', 'live'), TFA_AFK_MS)
    }

    const leaveNow = () => {
      stashAbandon()
      abandon('tab_close', 'beacon')
    }

    const onActivity = () => {
      if (document.visibilityState !== 'visible') return
      resumeIfNeeded()
      armIdle()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') leaveNow()
      else {
        resumeIfNeeded()
        armIdle()
      }
    }

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) stashAbandon()
      else leaveNow()
    }

    const sendHeartbeat = () => {
      if (document.visibilityState !== 'visible') return
      const pending = snapshotRef.current()
      if (!pending) return
      writePendingAbandon(pending)
      captureTfaEvent('tfa_run_heartbeat', {
        abandon_id: pending.abandon_id,
        character_id: pending.character_id,
        character_name: pending.character_name,
        is_mobile: pending.is_mobile,
        run_index: pending.run_index,
        level: pending.level,
        level_id: pending.level_id,
        level_title: pending.level_title,
        duration_on_level_ms: pending.duration_on_level_ms,
        total_duration_ms: pending.total_duration_ms,
        strikes_this_level: pending.strikes_this_level,
      })
    }

    stashAbandon()
    sendHeartbeat()
    armIdle()
    const stashTick = window.setInterval(stashAbandon, TFA_ABANDON_STASH_MS)
    const heartbeatTick = window.setInterval(sendHeartbeat, TFA_RUN_HEARTBEAT_MS)
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('freeze', leaveNow)

    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      window.clearInterval(stashTick)
      window.clearInterval(heartbeatTick)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('freeze', leaveNow)
    }
  }, [inProgress, abandon, stashAbandon, resumeIfNeeded])

  const captureRunStarted = useCallback(() => {
    const pendingAbandon = readPendingAbandon()
    const quickContinue = isFreshPendingAbandon(pendingAbandon)

    endedRef.current = false
    abandonedRef.current = false
    lastEnteredRef.current = null
    abandonIdRef.current = crypto.randomUUID()

    if (quickContinue && pendingAbandon) {
      captureResumeEvent(pendingAbandon.abandon_id, {
        resume_kind: 'quick_restart',
        level: pendingAbandon.level,
        level_id: pendingAbandon.level_id,
        level_title: pendingAbandon.level_title,
      })
      clearPendingAbandon()
    } else if (pendingAbandon) {
      flushPendingAbandon()
    }

    const { run_index, is_first_run } = incrementRunIndex()
    setTfaSession({ runIndex: run_index, runStartedAt: Date.now() })

    const pending = lastEndedRef.current ?? readPendingEnd()
    if (pending) {
      captureTfaEvent('tfa_run_retried', {
        ...sessionProps(),
        run_index,
        previous_outcome: pending.outcome,
        previous_last_level: pending.last_level,
        previous_last_level_id: pending.last_level_id,
        previous_last_level_title: pending.last_level_title,
        previous_total_duration_ms: pending.total_duration_ms,
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
