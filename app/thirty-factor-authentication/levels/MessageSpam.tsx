import { useEffect, useRef, useState } from 'react'
import { ContentProps } from './types'
import { shuffle } from '../utils'
import { ExtrasPortal } from '../components/ExtrasPortal'
import { useSfx } from '@/app/utils/audio'
import { setTfaAttemptContext } from '../analytics'
import {
  ONSLAUGHT_IDS,
  OPENING_IDS,
  REAL_PROMPT,
  STREAM_BANNER_IDS,
  STREAM_TAKEOVER_IDS,
  TEMPLATES,
  type Action,
  type Effect,
} from './message-spam/interruptions'
import { LockScreen, type BusyState, type PileItem } from './message-spam/LockScreen'

/** Most items that can sit on top of the real prompt. The stream pauses at the cap. */
const PILE_CAP = 8
const ARRIVAL_MS = 3500
/** Gap between arrivals in the opening burst. */
const ONSLAUGHT_MS = 350
/**
 * Phones can't hover, so the burst starts on a timer instead.
 * Long enough to read the prompt before it gets buried.
 */
const TOUCH_ONSLAUGHT_DELAY_MS = 3000
const TAKEOVER_EVERY = 5

const isTakeover = (item: PileItem) => item.template.kind === 'takeover'

export const MessageSpamContent = ({ handleLevelAdvance, layout }: ContentProps) => {
  const [pile, setPileState] = useState<PileItem[]>([])
  const [real, setReal] = useState<PileItem | null>(null)
  const [busy, setBusyState] = useState<BusyState | null>(null)
  const [dimmed, setDimmed] = useState(false)

  const pileRef = useRef<PileItem[]>([])
  const busyRef = useRef(false)
  const wonRef = useRef(false)
  const nextIdRef = useRef(1)
  const arrivalsRef = useRef(0)
  const bannerBagRef = useRef<string[]>([])
  const takeoverBagRef = useRef<string[]>([])
  const timersRef = useRef(new Set<number>())
  const intervalRef = useRef<number | undefined>(undefined)
  const startedRef = useRef(false)
  const beginStreamRef = useRef<() => void>(() => {})
  /** True when a mouse can hover the phone. Phones fall back to the timed burst. */
  const hoverGateRef = useRef(false)
  const statsRef = useRef({ seen: 0, cleared: 0, wrong: 0, fakeApproved: 0, realDenied: 0 })

  const playMessage = useSfx('message')

  const syncContext = () => {
    const current = pileRef.current
    const stats = statsRef.current
    const blocker = current.find(isTakeover) ?? current[0]
    setTfaAttemptContext({
      interruptions_seen: stats.seen,
      interruptions_cleared: stats.cleared,
      wrong_actions: stats.wrong,
      fake_approved: stats.fakeApproved,
      real_denied: stats.realDenied,
      pile_size: current.length,
      last_blocker: busyRef.current ? 'busy' : (blocker?.template.id ?? 'real'),
    })
  }

  const setPile = (next: PileItem[]) => {
    pileRef.current = next
    setPileState(next)
    syncContext()
  }

  const setBusy = (next: BusyState | null) => {
    busyRef.current = Boolean(next)
    setBusyState(next)
  }

  const later = (fn: () => void, ms: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer)
      fn()
    }, ms)
    timersRef.current.add(timer)
  }

  const makeItems = (templateId: string): PileItem[] => {
    const template = TEMPLATES[templateId]
    if (template.burst) {
      const group = nextIdRef.current++
      return template.burst.map((body) => ({ id: nextIdRef.current++, template, body, group }))
    }
    return [{ id: nextIdRef.current++, template }]
  }

  /** Piles items on top, trimmed to the cap. Only one takeover at a time. */
  const pushOnTop = (templateIds: string[]) => {
    if (wonRef.current) return
    let next = pileRef.current
    let added = 0
    for (const templateId of templateIds) {
      const room = PILE_CAP - next.length
      if (room <= 0) break
      const items = makeItems(templateId)
      if (isTakeover(items[0]) && next.some(isTakeover)) continue
      const trimmed = items.slice(0, room)
      next = [...trimmed, ...next]
      added += trimmed.length
    }
    if (added === 0) return
    statsRef.current.seen += added
    setPile(next)
    playMessage()
  }

  const draw = (bagRef: { current: string[] }, source: string[]) => {
    if (bagRef.current.length === 0) bagRef.current = shuffle([...source])
    return bagRef.current.pop()!
  }

  const nextArrivalId = () => {
    const n = arrivalsRef.current++
    if (n < OPENING_IDS.length) return OPENING_IDS[n]
    const takeoverActive = busyRef.current || pileRef.current.some(isTakeover)
    if (n % TAKEOVER_EVERY === TAKEOVER_EVERY - 1 && !takeoverActive) {
      return draw(takeoverBagRef, STREAM_TAKEOVER_IDS)
    }
    return draw(bannerBagRef, STREAM_BANNER_IDS)
  }

  const arrive = () => {
    if (wonRef.current || pileRef.current.length >= PILE_CAP) return
    pushOnTop([nextArrivalId()])
  }

  const beginStream = () => {
    if (startedRef.current || wonRef.current) return
    startedRef.current = true
    ONSLAUGHT_IDS.forEach((_, i) => later(arrive, i * ONSLAUGHT_MS))
    later(() => {
      intervalRef.current = window.setInterval(arrive, ARRIVAL_MS)
    }, ONSLAUGHT_IDS.length * ONSLAUGHT_MS)
  }
  beginStreamRef.current = beginStream

  useEffect(() => {
    const timers = timersRef.current
    setTfaAttemptContext({ interruptions_seen: 0, pile_size: 0, last_blocker: 'none' })
    setReal({ id: nextIdRef.current++, template: REAL_PROMPT })
    playMessage()

    hoverGateRef.current = window.matchMedia('(hover: hover)').matches
    const touchStart = hoverGateRef.current
      ? undefined
      : window.setTimeout(() => beginStreamRef.current(), TOUCH_ONSLAUGHT_DELAY_MS)

    return () => {
      if (touchStart) window.clearTimeout(touchStart)
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
    // The prompt and the stream start once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onEngage = () => {
    if (hoverGateRef.current) beginStreamRef.current()
  }

  const without = (item: PileItem) => pileRef.current.filter((i) => i.id !== item.id)

  const resolve = (item: PileItem, effect: Effect, wrong = false) => {
    if (wonRef.current || busyRef.current) return
    const stats = statsRef.current
    if (wrong) stats.wrong += 1

    switch (effect.type) {
      case 'approveReal':
        wonRef.current = true
        syncContext()
        handleLevelAdvance(true)
        return
      case 'denyReal':
        stats.realDenied += 1
        pushOnTop([draw(bannerBagRef, STREAM_BANNER_IDS), draw(bannerBagRef, STREAM_BANNER_IDS), 'denied'])
        syncContext()
        return
      case 'bounce':
        return
      case 'clear':
        stats.cleared += 1
        setPile(without(item))
        return
      case 'clearGroup': {
        const next = pileRef.current.filter((i) =>
          item.group == null ? i.id !== item.id : i.group !== item.group
        )
        stats.cleared += pileRef.current.length - next.length
        setPile(next)
        return
      }
      case 'spawn':
        stats.cleared += 1
        if (item.template.id.startsWith('fake-')) stats.fakeApproved += 1
        setPile(without(item))
        pushOnTop(effect.ids)
        return
      case 'snooze':
        setPile(without(item))
        later(() => pushOnTop([item.template.id]), effect.ms)
        return
      case 'dim':
        stats.cleared += 1
        setDimmed(true)
        setPile(without(item))
        return
      case 'busy':
        setBusy({ screen: effect.screen, ms: effect.ms })
        syncContext()
        later(() => {
          setBusy(null)
          stats.cleared += 1
          setPile(without(item))
          if (effect.spawn) pushOnTop(effect.spawn)
        }, effect.ms)
        return
    }
  }

  const onAction = (item: PileItem, action: Action) => resolve(item, action.effect, action.wrong)
  const onSwipe = (item: PileItem) => resolve(item, item.template.swipe)

  return (
    <>
      <p className="text-lg">{`We sent a sign-in request to your phone.`}</p>
      <small>
        Approve it to continue.
      </small>
      <ExtrasPortal>
        <div className="w-[var(--tfa-auth-width,100%)] px-2">
          <LockScreen
            pile={pile}
            real={real}
            busy={busy}
            dimmed={dimmed}
            isTouch={layout.isTouch}
            isShort={layout.isShort}
            onEngage={onEngage}
            onAction={onAction}
            onSwipe={onSwipe}
          />
        </div>
      </ExtrasPortal>
    </>
  )
}
