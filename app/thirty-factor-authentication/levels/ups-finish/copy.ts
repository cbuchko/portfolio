/**
 * Package Arrival — player-facing copy (reachable dialogue + intentional flavor).
 */

import { DECO_PROP_ORDER } from './prop-config'
import type { DecoCopyContext, DecoSpawnId, ItemId, TargetId, WorldPickup } from './types'

// ---------------------------------------------------------------------------
// Intro & UI chrome
// ---------------------------------------------------------------------------

export const INTRO_COPY = {
  headline: 'The UPS package has arrived. Please enter your physical authentication key.',
  body: 'The lights are out. The last thing you remember is a notification that your package arrived.',
} as const

export const UI_COPY = {
  taken: (label: string) => `You take the ${label.toLowerCase()}.`,
  holdItem: (label: string) => `Use the ${label.toLowerCase()} on what?`,
  putAway: 'You put it away.',
  useless: 'That is not going to help.',
  nothingHappens: 'Nothing happens.',
} as const

// ---------------------------------------------------------------------------
// Inventory item labels
// ---------------------------------------------------------------------------

export const ITEM_LABELS: Record<ItemId, string> = {
  cutter: 'Box cutter',
  key: 'Auth key',
  scrap: 'Torn label',
  box: 'UPS package',
  toolboxKey: 'Brass key',
  trimmers: 'Hedge trimmers',
  trimmersPartA: 'Trimmer blade',
  trimmersPartB: 'Trimmer body',
  shovel: 'Shovel',
  ductTape: 'Duct tape',
}

export const itemLabel = (id: ItemId) => ITEM_LABELS[id]

// ---------------------------------------------------------------------------
// World pickups — takeable scene props (click always takes; labels via itemLabel)
// ---------------------------------------------------------------------------

export const WORLD_PICKUPS: WorldPickup[] = [
  { id: 'shovel', spawnId: 'shovel', visual: 'shovel' },
  { id: 'trimmersPartB', spawnId: 'trimmersHalf', visual: 'trimmers-body' },
  { id: 'scrap', spawnId: 'scrap', visual: 'scrap' },
]

// ---------------------------------------------------------------------------
// Scene props — fixed interactables
// ---------------------------------------------------------------------------

export const SCENE_PROP_COPY = {
  hedge: {
    blocked: 'A dense hedge. A UPS package is wedged deep inside.',
    emptied: 'The bush is trimmed back. The package is gone.',
  },
  envelope: (trackingCode: string) =>
    `A discarded tracking slip. Code ${trackingCode}. Delivered. Left by the hedge.`,
  mat: {
    foundKey: 'You lift the corner of the mat. A small brass key was taped underneath.',
    examine: 'A doormat that says WELCOME. It is lying.',
  },
  toolbox: {
    locked: 'A red metal toolbox. Locked shut. Something rattles inside.',
    open: 'An empty toolbox.',
    unlocked: 'The brass key turns. You take the box cutter that was inside.',
  },
  dirtMound: {
    buried: 'A fresh mound of dirt.',
    dug: 'A shallow hole.',
    dugOutcome: 'You dig through the mound. Buried inside: half a hedge trimmer.',
  },
  garbageCan: {
    rummaged: 'An empty garbage can. Whatever was useful is gone.',
    foundTape: 'You rummage through the trash and find a roll of duct tape.',
  },
  session: {
    examine: 'A narrow key slot in the login terminal. It wants a physical authentication key.',
    win: 'The key turns. Somewhere behind the glass, a session unlocks.',
  },
  /** Any held item used on envelope or mat */
  envelopeOrMatUseless: 'That does nothing useful. Night presses closer.',
} as const

// ---------------------------------------------------------------------------
// Deco props — examine-only flavor
// ---------------------------------------------------------------------------

export const POST_IT_DECOY_CODES = [
  'zooweemama',
  'bazinga',
  'bababoowee',
  'chungus',
  'skibidi',
  'covfefe',
  'smorgasbord',
  'snickerdoodle',
] as const

export const DECO_COPY: Record<DecoSpawnId, (ctx: DecoCopyContext) => string> = {
  filmDvd: (ctx) =>
    `A DVD: “${ctx.dvdTitles.filmDvd}.” Now's not the time to watch it.`,
  postItNote: () => `A yellow Post-it, half unstuck. It says "Call mom".`,
  nightManorDvd: (ctx) =>
    `A DVD: “${ctx.dvdTitles.nightManorDvd}.” Now's not the time to watch it.`,
  zodiacChart: (ctx) =>
    `A crumpled zodiac chart. Sun: ${ctx.zodiac.sun}. Moon: ${ctx.zodiac.moon}. Rising: ${ctx.zodiac.rising}.`,
  pizzaSlice: () => 'A cold slice on a grease-stained ticket. Leftovers from lunch.',
  fishBowl: () => 'An empty fish bowl. The fish are nowhere to be found.',
}

export const getDecoText = (id: DecoSpawnId, ctx: DecoCopyContext) => DECO_COPY[id](ctx)

export const formatZodiacSign = (sign: string) =>
  sign ? sign.charAt(0).toUpperCase() + sign.slice(1) : 'Unknown'

export const parsePlayerZodiac = (zodiac: string) => {
  const [sun, moon, rising] = zodiac.split('-')
  return {
    sun: formatZodiacSign(sun),
    moon: formatZodiacSign(moon),
    rising: formatZodiacSign(rising),
  }
}

// ---------------------------------------------------------------------------
// Puzzle action outcomes
// ---------------------------------------------------------------------------

export const ACTION_COPY = {
  openPackage: 'The blade cuts the seam. The package contained a gold authentication key.',
  cutHedge: 'The trimmers tear through the hedge. The UPS package comes loose.',
  tapeTrimmer: 'You wrap duct tape around the join. It might actually hold.',
  trimmersNeedTape: 'The halves wobble apart. You need something to hold them together.',
  combineTrimmers: 'You attach the two halves together. This should do the trick.',
} as const

// ---------------------------------------------------------------------------
// Wrong item-on-target responses (useOn failures)
// ---------------------------------------------------------------------------

export const USE_ON_FAILURES: Partial<Record<ItemId, Partial<Record<TargetId, string>>>> = {
  trimmersPartA: { hedge: 'Half a trimmer will not cut it. Literally.' },
  trimmersPartB: { hedge: 'Half a trimmer will not cut it. Literally.' },
  ductTape: {
    hedge: 'Tape will not cut a hedge. Probably.',
    session: 'You cannot authenticate with adhesive.',
    box: 'The box is already sealed well enough.',
  },
  shovel: { hedge: 'Digging up a hedge seems like more work than trimming it.' },
  cutter: {
    hedge: 'The box cutter is too small for this hedge.',
    toolbox: 'Prying it would ruin a perfectly good toolbox.',
    session: 'Threatening the login screen feels correct, but changes nothing.',
  },
  trimmers: { box: 'The package is already free. Take it first.' },
  key: {
    toolbox: 'The authentication key is too large for this lock.',
    box: 'The key does not open cardboard. That would be too kind.',
  },
  toolboxKey: {
    session: 'The terminal wants a different kind of key.',
    box: 'Cardboard does not have a keyhole. Yet.',
  },
  scrap: {
    session: 'You hold the torn label up to the terminal. It does not care.',
    box: 'You tape the scrap to the box. Now it looks worse.',
  },
  box: {
    session: 'The terminal does not accept cardboard.',
  },
}

export const isDecoTarget = (target: TargetId): target is DecoSpawnId =>
  (DECO_PROP_ORDER as readonly string[]).includes(target)

export const getUseOnFailure = (holding: ItemId, target: TargetId): string | null => {
  if (isDecoTarget(target)) return UI_COPY.useless
  if (target === 'envelope' || target === 'mat') return SCENE_PROP_COPY.envelopeOrMatUseless
  return USE_ON_FAILURES[holding]?.[target] ?? null
}
