import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import classNames from 'classnames'
import type { Action, ActionTone, BusyScreen, Template } from './interruptions'

export type PileItem = {
  id: number
  template: Template
  /** Per-banner body for group chat bursts. */
  body?: string
  group?: number
}

export type BusyState = { screen: BusyScreen; ms: number }

type LockScreenProps = {
  /** Top of the pile first. */
  pile: PileItem[]
  real: PileItem | null
  busy: BusyState | null
  dimmed: boolean
  isTouch: boolean
  isShort: boolean
  /** First time a pointer enters the phone. Desktop uses this to start the pile. */
  onEngage?: () => void
  onAction: (item: PileItem, action: Action) => void
  onSwipe: (item: PileItem) => void
}

const SWIPE_THRESHOLD = 60
/** How far each buried card sits below the one on top of it. */
const LAYER_OFFSET = 5
const MAX_OFFSET_LAYERS = 8
/** Drops the pile over the real prompt's Approve button. The prompt itself stays put. */
const COVER_APPROVE = 40

const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const skewFor = (id: number) => ({
  x: (seeded(id) - 0.5) * 18,
  y: (seeded(id + 1) - 0.5) * 8,
  rotate: (seeded(id + 2) - 0.5) * 7,
})

export const LockScreen = ({
  pile,
  real,
  busy,
  dimmed,
  isTouch,
  isShort,
  onEngage,
  onAction,
  onSwipe,
}: LockScreenProps) => {
  const [now] = useState(() => new Date())
  const takeover = pile.find((item) => item.template.kind === 'takeover')
  const deck = [...pile.filter((item) => item.template.kind === 'banner'), ...(real ? [real] : [])]
  const blocked = Boolean(takeover || busy)

  return (
    <div
      className={classNames(
        'relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[2rem] border-[6px] border-black bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-400 text-white shadow-xl select-none transition-[filter] duration-700',
        { 'brightness-75 saturate-50': dimmed }
      )}
      style={{ height: isShort ? 300 : 380 }}
      onPointerEnter={onEngage}
    >
      <div className="flex items-center justify-between px-5 pt-2 text-xs font-semibold">
        <span>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
        <span className="flex items-center gap-1">
          <span>5G</span>
          <span className="inline-flex h-2.5 w-5 items-center rounded-sm border border-white p-px">
            <span
              className={classNames('block h-full w-1 rounded-[1px]', {
                'bg-yellow-300': dimmed,
                'bg-white': !dimmed,
              })}
            />
          </span>
        </span>
      </div>
      <div className={classNames('text-center', { 'mt-1': isShort, 'mt-3': !isShort })}>
        <div className="text-xs opacity-90">
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className={classNames('font-semibold leading-none', isShort ? 'text-4xl' : 'text-6xl')}>
          {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}
        </div>
      </div>

      <div className={classNames('relative isolate z-0 mx-4', { 'mt-4': isShort, 'mt-7': !isShort })}>
        {deck
          .map((item, depth) => ({ item, depth }))
          .reverse()
          .map(({ item, depth }) => {
            const isReal = item.template.id === 'real'
            const skew = skewFor(item.id)
            const y = isReal
              ? 0
              : COVER_APPROVE + Math.min(depth, MAX_OFFSET_LAYERS) * LAYER_OFFSET + skew.y
            return (
              <div
                key={item.id}
                className="absolute inset-x-0 top-0"
                style={{
                  transform: isReal
                    ? undefined
                    : `translate(${skew.x}px, ${y}px) rotate(${skew.rotate}deg)`,
                  transition: 'transform 250ms ease-out',
                  zIndex: deck.length - depth,
                }}
              >
                <NotificationCard
                  item={item}
                  interactive={depth === 0 && !blocked}
                  isTouch={isTouch}
                  onAction={onAction}
                  onSwipe={onSwipe}
                />
              </div>
            )
          })}
      </div>

      {busy ? (
        <BusyOverlay busy={busy} />
      ) : (
        takeover && <Takeover key={takeover.id} item={takeover} isTouch={isTouch} onAction={onAction} />
      )}
    </div>
  )
}

const AppIcon = ({ template }: { template: Template }) =>
  template.icon === 'lock' ? (
    <img
      src="/thirty-factor-authentication/lock-logo.png"
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0"
    />
  ) : (
    <span
      className={classNames(
        'flex h-5 w-5 items-center justify-center rounded-md text-[11px]',
        template.iconBg
      )}
    >
      {template.icon}
    </span>
  )

const toneClass: Record<ActionTone, string> = {
  neutral: 'bg-black/10 text-black',
  primary: 'bg-blue-500 text-white',
  danger: 'bg-black/10 text-red-600',
  accept: 'bg-green-500 text-white',
  decline: 'bg-red-500 text-white',
  star: 'bg-black/10 text-yellow-500 text-lg',
}

const NotificationCard = ({
  item,
  interactive,
  isTouch,
  onAction,
  onSwipe,
}: {
  item: PileItem
  /** Only the top of the pile can be touched. */
  interactive: boolean
  isTouch: boolean
  onAction: (item: PileItem, action: Action) => void
  onSwipe: (item: PileItem) => void
}) => {
  const { template } = item
  const swipeable = template.swipe.type !== 'bounce'
  const [dx, setDx] = useState(0)
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0)
  const [bounces, setBounces] = useState(0)
  const startRef = useRef<{ x: number; id: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || leaving) return
    if ((e.target as HTMLElement).closest('button')) return
    startRef.current = { x: e.clientX, id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    if (!start || start.id !== e.pointerId) return
    const delta = e.clientX - start.x
    setDx(swipeable ? delta : Math.max(-24, Math.min(24, delta * 0.3)))
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    if (!start || start.id !== e.pointerId) return
    startRef.current = null
    const delta = e.clientX - start.x
    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      setDx(0)
      return
    }
    if (!swipeable) {
      setDx(0)
      setBounces((b) => b + 1)
      return
    }
    dismiss(delta > 0 ? 1 : -1)
  }

  const dismiss = (direction: 1 | -1) => {
    setLeaving(direction)
    window.setTimeout(() => onSwipe(item), 180)
  }

  const body = item.body ?? template.body
  const stars = template.actions?.every((a) => a.tone === 'star')

  return (
    <div
      key={bounces}
      className={classNames(
        'lock-banner relative rounded-2xl border border-black/10 bg-white p-3 text-black shadow-[0_4px_12px_rgba(0,0,0,0.25)]',
        template.id === 'real' && 'border-2 border-blue-500 bg-blue-50',
        { 'notification-wiggle': bounces > 0, 'pointer-events-none': !interactive }
      )}
      style={{
        transform: leaving
          ? `translateX(${leaving * 420}px) rotate(${leaving * 18}deg)`
          : `translateX(${dx}px) rotate(${dx / 20}deg)`,
        transition: leaving || dx === 0 ? 'transform 180ms ease-out' : undefined,
        touchAction: 'pan-y',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-black/60">
        <AppIcon template={template} />
        <span className="grow">{template.app}</span>
        <span className="normal-case">now</span>
        {swipeable && !isTouch && (
          <button
            aria-label="Dismiss"
            className="-mr-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/10 text-xs text-black/70 hover:bg-black/20"
            onClick={() => dismiss(1)}
          >
            ✕
          </button>
        )}
      </div>
      {template.title && <div className="mt-1 text-sm font-semibold">{template.title}</div>}
      {body && <div className="text-sm leading-snug">{body}</div>}
      {template.detail && <div className="text-xs text-black/60">{template.detail}</div>}
      {template.actions && (
        <div className={classNames('mt-2 flex', stars ? 'gap-1' : 'gap-2')}>
          {template.actions.map((action, idx) => (
            <button
              key={idx}
              className={classNames(
                'flex-1 cursor-pointer rounded-lg px-2 text-sm font-semibold transition-transform active:scale-95',
                toneClass[action.tone ?? 'neutral']
              )}
              style={{ minHeight: isTouch ? 44 : 32 }}
              onClick={() => onAction(item, action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Takeover = ({
  item,
  isTouch,
  onAction,
}: {
  item: PileItem
  isTouch: boolean
  onAction: (item: PileItem, action: Action) => void
}) => {
  const { template } = item
  const isCall = template.app === 'Phone'
  return (
    <div
      className={classNames(
        'lock-takeover absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-5 text-center',
        isCall ? 'bg-gradient-to-b from-gray-700 to-gray-900' : 'bg-black/60 backdrop-blur-sm'
      )}
    >
      {isCall ? (
        <>
          <div className="text-4xl font-semibold">{template.title}</div>
          <div className="text-sm opacity-80">{template.body}</div>
          <div className="mt-10 flex w-full justify-around">
            {template.actions?.map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-1">
                <button
                  aria-label={action.label}
                  className={classNames(
                    'flex h-16 w-16 cursor-pointer items-center justify-center rounded-full text-2xl active:scale-95',
                    action.tone === 'decline' ? 'bg-red-500' : 'bg-green-500'
                  )}
                  onClick={() => onAction(item, action)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className={classNames('h-7 w-7 fill-white', {
                      'rotate-[135deg]': action.tone === 'decline',
                    })}
                  >
                    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1L6.6 10.8z" />
                  </svg>
                </button>
                <span className="text-xs">{action.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full rounded-2xl bg-white/95 p-4 text-black shadow-xl">
          <div className="text-2xl">{template.icon}</div>
          <div className="mt-1 font-semibold">{template.title}</div>
          <div className="text-sm text-black/70">{template.body}</div>
          <div className="mt-3 flex flex-col gap-2">
            {template.actions?.map((action) => (
              <button
                key={action.label}
                className={classNames(
                  'cursor-pointer rounded-lg px-3 text-sm font-semibold active:scale-95',
                  toneClass[action.tone ?? 'neutral']
                )}
                style={{ minHeight: isTouch ? 44 : 36 }}
                onClick={() => onAction(item, action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const BusyOverlay = ({ busy }: { busy: BusyState }) => (
  <div className="lock-takeover absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
    {busy.screen === 'call' && (
      <>
        <div className="text-3xl font-semibold">Mom</div>
        <div className="text-sm opacity-80">00:0{Math.round(busy.ms / 1000)}</div>
        <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm italic">
          {`"Hi honey! Is this a bad time? Your father wanted to say hi..."`}
        </div>
      </>
    )}
    {busy.screen === 'install' && (
      <>
        <div className="text-4xl">⚙️</div>
        <div className="text-sm">Installing iOS 26.4.1...</div>
        <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/20">
          <div
            className="lock-progress h-full rounded-full bg-white"
            style={{ animationDuration: `${busy.ms}ms` }}
          />
        </div>
      </>
    )}
    {busy.screen === 'photo' && (
      <>
        <div className="text-xs opacity-70">kbbq_menu.jpg</div>
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-amber-100 text-6xl">
          🥩🍖🥩
        </div>
        <div className="text-sm">{`"ALL YOU CAN EAT $29.99"`}</div>
      </>
    )}
  </div>
)
