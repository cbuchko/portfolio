import type { DecoSpawnId, PropSpawnId, SpawnPos } from './types'

export const FLASHLIGHT_ENABLED = true

export const CONE_DESKTOP = 118
export const CONE_MOBILE = 150
export const MOBILE_PAN_THRESHOLD = 8
export const TYPEWRITER_MS = 16

export const MOBILE_PAN_RADIUS_RATIO = 1.25
export const MOBILE_SPAWN_EDGE_MARGIN = 4
export const MOBILE_AUTH_EXCLUSION_PAD_PX = 12
export const MOBILE_MIN_PROP_GAP_PX = 56
export const MOBILE_DECO_GAP_PX = 24

/** Percent padding between puzzle-prop footprints on desktop (edge-to-edge). */
export const DESKTOP_MIN_PROP_GAP = 3
/** Percent padding for deco vs props / other deco on desktop. */
export const DESKTOP_DECO_GAP = 2

export const AUTH_EXCLUSION = {
  desktop: { left: 26, top: 5, right: 74, bottom: 46 },
}

export const PUZZLE_PROP_ORDER: PropSpawnId[] = [
  'hedge',
  'toolbox',
  'envelope',
  'mat',
  'dirtMound',
  'shovel',
  'trimmersHalf',
  'scrap',
  'garbageCan',
]

export const DECO_PROP_ORDER: DecoSpawnId[] = [
  'filmDvd',
  'postItNote',
  'nightManorDvd',
  'zodiacChart',
  'pizzaSlice',
  'fishBowl',
]

export const PROP_FOOTPRINTS: Record<PropSpawnId, { w: number; h: number }> = {
  hedge: { w: 14, h: 14 },
  toolbox: { w: 6, h: 6 },
  envelope: { w: 4, h: 3 },
  mat: { w: 8, h: 4 },
  trimmersHalf: { w: 6, h: 6 },
  scrap: { w: 5, h: 4 },
  dirtMound: { w: 7, h: 5 },
  shovel: { w: 7, h: 7 },
  garbageCan: { w: 9, h: 9 },
}

export const MOBILE_PROP_PIXELS: Record<PropSpawnId, { w: number; h: number }> = {
  hedge: { w: 100, h: 100 },
  toolbox: { w: 56, h: 56 },
  envelope: { w: 68, h: 44 },
  mat: { w: 140, h: 36 },
  trimmersHalf: { w: 64, h: 64 },
  scrap: { w: 84, h: 64 },
  dirtMound: { w: 96, h: 56 },
  shovel: { w: 72, h: 72 },
  garbageCan: { w: 72, h: 72 },
}

export const FALLBACK_LAYOUT: Record<PropSpawnId, SpawnPos> = {
  hedge: { left: 16, top: 58 },
  toolbox: { left: 82, top: 28 },
  envelope: { left: 74, top: 70 },
  mat: { left: 48, top: 86 },
  trimmersHalf: { left: 10, top: 44 },
  scrap: { left: 28, top: 78 },
  dirtMound: { left: 62, top: 52 },
  shovel: { left: 38, top: 32 },
  garbageCan: { left: 90, top: 62 },
}

export const MOBILE_FALLBACK_LAYOUT: Record<PropSpawnId, SpawnPos> = {
  hedge: { left: 50, top: 16 },
  toolbox: { left: 82, top: 32 },
  envelope: { left: 78, top: 78 },
  mat: { left: 50, top: 82 },
  trimmersHalf: { left: 18, top: 32 },
  scrap: { left: 22, top: 68 },
  dirtMound: { left: 78, top: 52 },
  shovel: { left: 24, top: 52 },
  garbageCan: { left: 28, top: 78 },
}

export const DECO_FOOTPRINTS: Record<DecoSpawnId, { w: number; h: number }> = {
  filmDvd: { w: 4, h: 4 },
  postItNote: { w: 4, h: 4 },
  nightManorDvd: { w: 4, h: 4 },
  zodiacChart: { w: 6, h: 5 },
  pizzaSlice: { w: 5, h: 4 },
  fishBowl: { w: 6, h: 6 },
}

export const DECO_MOBILE_PIXELS: Record<DecoSpawnId, { w: number; h: number }> = {
  filmDvd: { w: 40, h: 40 },
  postItNote: { w: 44, h: 44 },
  nightManorDvd: { w: 40, h: 40 },
  zodiacChart: { w: 64, h: 56 },
  pizzaSlice: { w: 52, h: 48 },
  fishBowl: { w: 56, h: 56 },
}

export const DECO_FALLBACK_LAYOUT: Record<DecoSpawnId, SpawnPos> = {
  filmDvd: { left: 14, top: 36 },
  postItNote: { left: 86, top: 44 },
  nightManorDvd: { left: 12, top: 68 },
  zodiacChart: { left: 88, top: 72 },
  pizzaSlice: { left: 84, top: 18 },
  fishBowl: { left: 72, top: 16 },
}

export const DECO_MOBILE_FALLBACK: Record<DecoSpawnId, SpawnPos> = {
  filmDvd: { left: 30, top: 22 },
  postItNote: { left: 70, top: 26 },
  nightManorDvd: { left: 26, top: 72 },
  zodiacChart: { left: 74, top: 76 },
  pizzaSlice: { left: 72, top: 20 },
  fishBowl: { left: 68, top: 18 },
}

/** CSS class roots for deco props that are still CSS-drawn (not sprite assets). */
export const DECO_VISUAL_CLASSES: Partial<Record<DecoSpawnId, string>> = {
  postItNote: 'nm-deco--postit',
  zodiacChart: 'nm-deco--zodiac',
  pizzaSlice: 'nm-deco--pizza',
}

export const shuffleOrder = <T,>(order: T[]): T[] => {
  const next = [...order]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}
