import posthog from 'posthog-js'
import { devMode, forceLevel } from './constants'
import type { TfaLayout } from './useTfaLayout'

const RUN_INDEX_KEY = 'tfa_run_index'
const PENDING_END_KEY = 'tfa_pending_run_end'
const PENDING_ABANDON_KEY = 'tfa_pending_abandon'
/** Sticky skip for Connor’s own production playtests. Phone and desktop each need it once. */
const INTERNAL_KEY = 'tfa_internal'
export const TFA_AFK_MS = 5 * 60 * 1000
export const TFA_ABANDON_STASH_MS = 15 * 1000
export const TFA_RUN_HEARTBEAT_MS = 30 * 1000
/** Reopen + start within this of hide = continue, not a quit. */
export const TFA_CONTINUE_MS = 90 * 1000

type TfaCaptureOptions = {
  send_instantly?: boolean
  transport?: 'sendBeacon' | 'XHR' | 'fetch'
}

export type TfaEventProps = Record<string, string | number | boolean | undefined>

export type TfaPendingEnd = {
  outcome: 'won' | 'lost'
  last_level: number
  last_level_id?: string
  last_level_title: string
  total_duration_ms?: number
  endedAt: number
}

export type TfaPendingAbandon = {
  abandon_id: string
  reason: 'tab_close' | 'afk'
  run_index?: number
  character_id?: number
  character_name?: string
  is_mobile?: boolean
  is_short?: boolean
  is_touch?: boolean
  viewport_h?: number
  level: number
  level_id?: string
  level_title?: string
  duration_on_level_ms: number
  total_duration_ms: number
  strikes_this_level: number
  hiddenAt: number
}

export type TfaSession = {
  characterId?: number
  characterName?: string
  layout?: TfaLayout
  runIndex?: number
  runStartedAt?: number
  level?: number
  levelId?: string
  levelTitle?: string
  strikesThisLevel?: number
  levelEnteredAt?: number
}

let initialized = false
let flushedPendingAbandon = false
let session: TfaSession = {}

const isLocalHost = () => {
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local')
}

const isInternalPlaytest = () => {
  try {
    const raw = new URLSearchParams(window.location.search).get('tfa_internal')
    if (raw === '1' || raw === 'true') {
      localStorage.setItem(INTERNAL_KEY, '1')
      return true
    }
    if (raw === '0' || raw === 'false') {
      localStorage.removeItem(INTERNAL_KEY)
      return false
    }
    return localStorage.getItem(INTERNAL_KEY) === '1'
  } catch {
    return false
  }
}

const analyticsAllowed = () => {
  if (typeof window === 'undefined') return false
  if (process.env.NODE_ENV === 'development') return false
  if (isLocalHost()) return false
  if (devMode || forceLevel > 0) return false
  if (isInternalPlaytest()) return false
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)
}

export const initTfaAnalytics = () => {
  if (initialized || !analyticsAllowed()) return

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (!token) return

  posthog.init(token, {
    api_host: '/factor-relay',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: false,
    },
    loaded: (ph) => {
      const syncReplay = () => {
        if (ph.isFeatureEnabled('tfa-session-replay')) {
          ph.startSessionRecording()
        } else {
          ph.stopSessionRecording()
        }
      }
      ph.onFeatureFlags(syncReplay)
    },
  })
  initialized = true
}

export const isTfaAnalyticsReady = () => initialized

export const setTfaSession = (next: Partial<TfaSession>) => {
  session = { ...session, ...next }
}

export const getTfaSession = () => session

export const captureTfaEvent = (
  event: string,
  props: TfaEventProps = {},
  options?: TfaCaptureOptions
) => {
  if (!initialized) return
  const cleaned: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) cleaned[key] = value
  }
  posthog.capture(event, cleaned, options)
}

export const sessionProps = (): TfaEventProps => ({
  character_id: session.characterId,
  character_name: session.characterName,
  is_mobile: session.layout?.isMobile,
  is_short: session.layout?.isShort,
  is_touch: session.layout?.isTouch,
  viewport_h: session.layout?.viewportHeight,
  run_index: session.runIndex,
})

export const incrementRunIndex = () => {
  const current = Number(localStorage.getItem(RUN_INDEX_KEY) || '0')
  const runIndex = Number.isFinite(current) ? current + 1 : 1
  localStorage.setItem(RUN_INDEX_KEY, String(runIndex))
  return { run_index: runIndex, is_first_run: runIndex === 1 }
}

export const readPendingEnd = (): TfaPendingEnd | null => {
  try {
    const raw = localStorage.getItem(PENDING_END_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TfaPendingEnd
  } catch {
    return null
  }
}

export const writePendingEnd = (pending: TfaPendingEnd) => {
  localStorage.setItem(PENDING_END_KEY, JSON.stringify(pending))
}

export const clearPendingEnd = () => {
  localStorage.removeItem(PENDING_END_KEY)
}

export const readPendingAbandon = (): TfaPendingAbandon | null => {
  try {
    const raw = localStorage.getItem(PENDING_ABANDON_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TfaPendingAbandon
  } catch {
    return null
  }
}

export const writePendingAbandon = (pending: TfaPendingAbandon) => {
  flushedPendingAbandon = false
  try {
    localStorage.setItem(PENDING_ABANDON_KEY, JSON.stringify(pending))
  } catch {
    // Private mode / quota — live sendBeacon is the only path left.
  }
}

export const clearPendingAbandon = () => {
  try {
    localStorage.removeItem(PENDING_ABANDON_KEY)
  } catch {
    // ignore
  }
}

const abandonEventProps = (
  pending: TfaPendingAbandon,
  deliveredVia: 'live' | 'beacon' | 'flush'
): TfaEventProps => ({
  abandon_id: pending.abandon_id,
  delivered_via: deliveredVia,
  reason: pending.reason,
  character_id: pending.character_id,
  character_name: pending.character_name,
  is_mobile: pending.is_mobile,
  is_short: pending.is_short,
  is_touch: pending.is_touch,
  viewport_h: pending.viewport_h,
  run_index: pending.run_index,
  level: pending.level,
  level_id: pending.level_id,
  level_title: pending.level_title,
  duration_on_level_ms: pending.duration_on_level_ms,
  total_duration_ms: pending.total_duration_ms,
  strikes_this_level: pending.strikes_this_level,
})

export const captureAbandonEvent = (
  pending: TfaPendingAbandon,
  deliveredVia: 'live' | 'beacon' | 'flush'
) => {
  captureTfaEvent(
    'tfa_run_abandoned',
    abandonEventProps(pending, deliveredVia),
    deliveredVia === 'beacon'
      ? { send_instantly: true, transport: 'sendBeacon' }
      : { send_instantly: true }
  )
}

export const flushPendingAbandon = () => {
  if (flushedPendingAbandon) return
  flushedPendingAbandon = true
  const pending = readPendingAbandon()
  if (!pending) return
  clearPendingAbandon()
  captureAbandonEvent(pending, 'flush')
}

export const isFreshPendingAbandon = (pending: TfaPendingAbandon | null, now = Date.now()) =>
  Boolean(pending && now - pending.hiddenAt <= TFA_CONTINUE_MS)

export const captureResumeEvent = (abandonId: string, extra: TfaEventProps = {}) => {
  captureTfaEvent(
    'tfa_run_resumed',
    {
      ...sessionProps(),
      abandon_id: abandonId,
      ...extra,
    },
    { send_instantly: true }
  )
}
