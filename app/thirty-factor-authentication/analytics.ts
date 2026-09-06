import posthog from 'posthog-js'
import { devMode, forceLevel } from './constants'

const RUN_INDEX_KEY = 'tfa_run_index'
const PENDING_END_KEY = 'tfa_pending_run_end'
export const TFA_AFK_MS = 5 * 60 * 1000

export type TfaEventProps = Record<string, string | number | boolean | undefined>

export type TfaPendingEnd = {
  outcome: 'won' | 'lost'
  last_level: number
  last_level_title: string
  endedAt: number
}

export type TfaSession = {
  characterId?: number
  characterName?: string
  isMobile?: boolean
  runIndex?: number
  level?: number
  levelTitle?: string
  strikesThisLevel?: number
  levelEnteredAt?: number
}

let initialized = false
let session: TfaSession = {}

const isLocalHost = () => {
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local')
}

const analyticsAllowed = () => {
  if (typeof window === 'undefined') return false
  if (process.env.NODE_ENV === 'development') return false
  if (isLocalHost()) return false
  if (devMode || forceLevel > 0) return false
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
  })
  initialized = true
}

export const isTfaAnalyticsReady = () => initialized

export const setTfaSession = (next: Partial<TfaSession>) => {
  session = { ...session, ...next }
}

export const getTfaSession = () => session

export const captureTfaEvent = (event: string, props: TfaEventProps = {}) => {
  if (!initialized) return
  const cleaned: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) cleaned[key] = value
  }
  posthog.capture(event, cleaned)
}

export const sessionProps = (): TfaEventProps => ({
  character_id: session.characterId,
  character_name: session.characterName,
  is_mobile: session.isMobile,
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
