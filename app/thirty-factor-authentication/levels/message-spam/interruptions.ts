export type BusyScreen = 'call' | 'install' | 'photo'

export type Effect =
  | { type: 'clear' }
  /** Clears every item from the same burst (group chat Mute). */
  | { type: 'clearGroup' }
  /** Clears, then piles follow-ups on top. */
  | { type: 'spawn'; ids: string[] }
  /** Clears, then the same item lands on top again later. */
  | { type: 'snooze'; ms: number }
  /** Locks the phone on a busy screen, then clears. */
  | { type: 'busy'; ms: number; screen: BusyScreen; spawn?: string[] }
  | { type: 'dim' }
  /** Not allowed: the banner snaps back. */
  | { type: 'bounce' }
  | { type: 'approveReal' }
  | { type: 'denyReal' }

export type ActionTone = 'neutral' | 'primary' | 'danger' | 'accept' | 'decline' | 'star'

export type Action = {
  label: string
  effect: Effect
  /** A delaying choice. Never a strike, but tracked. */
  wrong?: boolean
  tone?: ActionTone
}

export type Template = {
  id: string
  kind: 'banner' | 'takeover'
  app: string
  icon: string
  iconBg: string
  title?: string
  body: string
  detail?: string
  actions?: Action[]
  swipe: Effect
  /** Arrives as several banners at once; each entry is one banner body. */
  burst?: string[]
}

const clear: Effect = { type: 'clear' }
const bounce: Effect = { type: 'bounce' }

const text = (id: string, sender: string, body: string): Template => ({
  id,
  kind: 'banner',
  app: 'Messages',
  icon: '💬',
  iconBg: 'bg-green-500',
  title: sender,
  body,
  swipe: clear,
})

const signInActions = (approve: Effect, deny: Effect, approveWrong: boolean, denyWrong: boolean) => [
  { label: 'Deny', effect: deny, tone: 'danger' as const, wrong: denyWrong },
  { label: 'Approve', effect: approve, tone: 'primary' as const, wrong: approveWrong },
]

export const REAL_PROMPT: Template = {
  id: 'real',
  kind: 'banner',
  app: 'Thirty Factor',
  icon: 'lock',
  iconBg: 'bg-white',
  title: 'Approve this sign-in',
  body: 'Thirty Factor Authentication · this browser',
  actions: [{ label: 'Approve', effect: { type: 'approveReal' }, tone: 'primary' }],
  swipe: bounce,
}

const fakeSignIn = (id: string, place: string, device: string): Template => ({
  id,
  kind: 'banner',
  app: 'Authenticator',
  icon: '🔐',
  iconBg: 'bg-gray-700',
  title: 'Are you trying to sign in?',
  body: 'Thirty Factr Authentication',
  detail: `${place} · ${device}`,
  actions: signInActions(
    { type: 'spawn', ids: ['security-alert', 'secure-account'] },
    clear,
    true,
    false
  ),
  swipe: bounce,
})

const TEMPLATE_LIST: Template[] = [
  // --- texts: swipe away ---
  text('unknown-hey', 'Unknown', 'hey what you up to?'),
  text('dad-facetime', 'Dad', 'Mom and I would like to FaceTime.'),
  text('grandma', 'Grandma', '😂😂😂'),
  text('sam', 'Sam', 'can we talk about last night please???'),
  text('verizon', 'Verizon', 'Your phone bill is ready to be reviewed.'),

  // --- banners with their own action ---
  {
    id: 'promo',
    kind: 'banner',
    app: 'Messages',
    icon: '🏷️',
    iconBg: 'bg-yellow-400',
    title: 'Best Buy Rewards',
    body: 'Exclusive loyalty offer just for you! Reply STOP to opt out.',
    actions: [{ label: 'STOP', effect: { type: 'spawn', ids: ['unsubscribed'] } }],
    swipe: bounce,
  },
  {
    id: 'uber-rating',
    kind: 'banner',
    app: 'Uber',
    icon: '🚗',
    iconBg: 'bg-black',
    title: 'How was your ride with Doug?',
    body: 'Rate your driver to continue.',
    actions: [
      { label: '★', tone: 'star', wrong: true, effect: { type: 'spawn', ids: ['uber-survey'] } },
      { label: '★', tone: 'star', effect: clear },
      { label: '★', tone: 'star', effect: clear },
      { label: '★', tone: 'star', effect: clear },
      { label: '★', tone: 'star', effect: clear },
    ],
    swipe: bounce,
  },
  {
    id: 'calendar',
    kind: 'banner',
    app: 'Calendar',
    icon: '📅',
    iconBg: 'bg-red-500',
    title: 'Dentist',
    body: 'In 15 minutes · Dr. Molar Family Dentistry',
    actions: [
      { label: 'Snooze', tone: 'primary', wrong: true, effect: { type: 'snooze', ms: 6000 } },
      { label: 'Dismiss', effect: clear },
    ],
    swipe: bounce,
  },
  {
    id: 'lads',
    kind: 'banner',
    app: 'Messages',
    icon: '👥',
    iconBg: 'bg-green-500',
    title: 'The Lads',
    body: '',
    burst: [
      'Jeff: lads we should get kbbq',
      'Mike: im in',
      'Jeff: tonight??',
      'Dev: 🥩🥩🥩',
    ],
    actions: [{ label: 'Mute', effect: { type: 'clearGroup' } }],
    swipe: clear,
  },
  fakeSignIn('fake-moscow', 'Moscow, Russia', 'Unknown device'),
  fakeSignIn('fake-lagos', 'Lagos, Nigeria', 'Windows XP'),

  // --- follow-ups: swipe away ---
  text('unsubscribed', 'Best Buy Rewards', 'You have been unsubscribed. Reply START to resubscribe.'),
  text('mom-declined', 'Mom', 'why did you decline??'),
  {
    ...text('uber-survey', 'Uber', 'Sorry to hear that. Tell us what went wrong.'),
    app: 'Uber',
    icon: '🚗',
    iconBg: 'bg-black',
  },
  {
    ...text('security-alert', 'Security alert', 'New sign-in to your account from Moscow.'),
    app: 'Thirty Factr',
    icon: '⚠️',
    iconBg: 'bg-orange-500',
  },
  {
    ...text('secure-account', 'Was this you?', 'Secure your account now. Click here to reset.'),
    app: 'Thirty Factr',
    icon: '⚠️',
    iconBg: 'bg-orange-500',
  },
  {
    ...text('denied', 'Sign-in denied', 'Sending a new request...'),
    app: 'Thirty Factor',
    icon: 'lock',
    iconBg: 'bg-white',
  },

  // --- takeovers ---
  {
    id: 'mom-call',
    kind: 'takeover',
    app: 'Phone',
    icon: '📞',
    iconBg: 'bg-green-500',
    title: 'Mom',
    body: 'is calling...',
    actions: [
      { label: 'Decline', tone: 'decline', effect: { type: 'spawn', ids: ['mom-declined'] } },
      { label: 'Accept', tone: 'accept', wrong: true, effect: { type: 'busy', ms: 4000, screen: 'call' } },
    ],
    swipe: bounce,
  },
  {
    id: 'low-battery',
    kind: 'takeover',
    app: 'Battery',
    icon: '🪫',
    iconBg: 'bg-red-500',
    title: 'Low Battery',
    body: '10% battery remaining',
    actions: [
      { label: 'Close', effect: clear },
      { label: 'Low Power Mode', effect: { type: 'dim' } },
    ],
    swipe: bounce,
  },
  {
    id: 'ios-update',
    kind: 'takeover',
    app: 'Settings',
    icon: '⚙️',
    iconBg: 'bg-gray-500',
    title: 'iOS 26.4.1 is available',
    body: 'This update includes important security fixes and new emoji.',
    actions: [
      { label: 'Install Now', tone: 'primary', wrong: true, effect: { type: 'busy', ms: 3000, screen: 'install' } },
      { label: 'Later', effect: clear },
    ],
    swipe: bounce,
  },
  {
    id: 'airdrop',
    kind: 'takeover',
    app: 'AirDrop',
    icon: '📡',
    iconBg: 'bg-blue-500',
    title: 'AirDrop',
    body: 'Jeff would like to share "kbbq_menu.jpg"',
    actions: [
      { label: 'Decline', effect: clear },
      { label: 'Accept', tone: 'primary', wrong: true, effect: { type: 'busy', ms: 2000, screen: 'photo' } },
    ],
    swipe: bounce,
  },
]

export const TEMPLATES: Record<string, Template> = Object.fromEntries(
  TEMPLATE_LIST.map((t) => [t.id, t])
)

/** Lands in a rapid burst right after the real prompt, burying it fast. */
export const ONSLAUGHT_IDS = ['unknown-hey', 'promo', 'dad-facetime', 'calendar', 'grandma']

/** Always the first arrivals, so each kind of clear is taught early. The call follows the burst. */
export const OPENING_IDS = [...ONSLAUGHT_IDS, 'mom-call']

export const STREAM_BANNER_IDS = [
  'unknown-hey',
  'dad-facetime',
  'grandma',
  'sam',
  'verizon',
  'promo',
  'uber-rating',
  'calendar',
  'lads',
  'fake-moscow',
  'fake-lagos',
]

export const STREAM_TAKEOVER_IDS = ['mom-call', 'low-battery', 'ios-update', 'airdrop']
