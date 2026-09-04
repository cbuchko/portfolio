export type Point = { x: number; y: number }

export type ItemId =
  | 'cutter'
  | 'key'
  | 'scrap'
  | 'box'
  | 'toolboxKey'
  | 'trimmers'
  | 'trimmersPartA'
  | 'trimmersPartB'
  | 'shovel'
  | 'ductTape'

export type TrimmerHalfId = 'trimmersPartA' | 'trimmersPartB'

export type PropSpawnId =
  | 'trimmersHalf'
  | 'scrap'
  | 'hedge'
  | 'envelope'
  | 'mat'
  | 'toolbox'
  | 'dirtMound'
  | 'shovel'
  | 'garbageCan'

export type DecoSpawnId =
  | 'filmDvd'
  | 'postItNote'
  | 'nightManorDvd'
  | 'zodiacChart'
  | 'pizzaSlice'
  | 'fishBowl'

export type TargetId =
  | 'box'
  | 'session'
  | 'envelope'
  | 'mat'
  | 'cutter'
  | 'key'
  | 'scrap'
  | 'toolbox'
  | 'toolboxKey'
  | 'hedge'
  | 'trimmers'
  | 'trimmersPartA'
  | 'trimmersPartB'
  | 'shovel'
  | 'dirtMound'
  | 'garbageCan'
  | 'ductTape'
  | DecoSpawnId

export type SpawnPos = { left: number; top: number }

export type WorldPickupId = 'shovel' | 'trimmersPartB' | 'scrap'

export type WorldPickup = {
  id: WorldPickupId
  spawnId: PropSpawnId
  visual: 'shovel' | 'trimmers-body' | 'scrap'
}

export type ZodiacDisplay = {
  sun: string
  moon: string
  rising: string
}

export type DecoCopyContext = {
  /** Filmography answers used as DVD titles (deco red herrings). */
  dvdTitles: { filmDvd: string; nightManorDvd: string }
  postItDecoy: string
  zodiac: ZodiacDisplay
}

export type MobilePanMetrics = {
  R: number
  worldW: number
  worldH: number
  baseX: number
  baseY: number
  spawnBounds: { leftMin: number; leftMax: number; topMin: number; topMax: number }
  authExclusion: { left: number; top: number; right: number; bottom: number }
}

export type PlacedFootprint = { left: number; top: number; w: number; h: number }
