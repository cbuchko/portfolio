/**
 * External prop sprites for Package Arrival.
 * Add PNG/WebP paths and display specs here as props migrate to image assets.
 */

import type { DecoSpawnId, ItemId } from './types'
import type { PropDisplayConfig } from './prop-display'

export type PropAssetDefinition = {
  src: string
  width: number
  height: number
  alt: string
  /** Prefer crisp upscaling for pixel-art sprites. */
  pixelated?: boolean
  display: PropDisplayConfig
}

const SPRITES = '/thirty-factor-authentication/props/sprites'
const SOUNDS = '/thirty-factor-authentication/sounds'

/** Short one-shots for inventory / use interactions */
export const SFX = {
  pickup: `${SOUNDS}/place.mp3`,
  use: `${SOUNDS}/osu-click.mp3`,
} as const

/** Auth key slot on the login card */
const keyholeDisplay: PropDisplayConfig = {
  world: { width: 32, height: 40, mobile: { width: 36, height: 44 } },
  inventory: { scale: 1 },
  cursor: { width: 32, height: 40 },
}

/** Shared sizing for 64×64 pixel-art sprites */
const sprite64Display: PropDisplayConfig = {
  world: { width: 64, height: 64, mobile: { width: 56, height: 56 } },
  inventory: { scale: 1 },
  cursor: { width: 64, height: 64 },
}

/** Bush is a landmark — large in the play area */
const bushDisplay: PropDisplayConfig = {
  world: { width: 160, height: 160, mobile: { width: 100, height: 100 } },
  inventory: { scale: 1 },
  cursor: { width: 64, height: 64 },
}

/** Play-area emphasis props */
const shovelDisplay: PropDisplayConfig = {
  world: { width: 80, height: 80, mobile: { width: 72, height: 72 } },
  inventory: { scale: 1 },
  cursor: { width: 64, height: 64 },
}

const garbageCanDisplay: PropDisplayConfig = {
  world: { width: 100, height: 100, mobile: { width: 72, height: 72 } },
  inventory: { scale: 1 },
  cursor: { width: 64, height: 64 },
}

/** Small deco discs */
const dvdDisplay: PropDisplayConfig = {
  world: { width: 44, height: 44, mobile: { width: 40, height: 40 } },
  inventory: { scale: 1 },
  cursor: { width: 44, height: 44 },
}

export const PROP_ASSETS = {
  shovel: {
    src: `${SPRITES}/shovel.png`,
    width: 64,
    height: 64,
    alt: 'Shovel',
    pixelated: true,
    display: shovelDisplay,
  },
  cutter: {
    src: `${SPRITES}/boxcutter.png`,
    width: 64,
    height: 64,
    alt: 'Box cutter',
    pixelated: true,
    display: sprite64Display,
  },
  ductTape: {
    src: '/thirty-factor-authentication/props/duct%20tape.webp',
    width: 64,
    height: 64,
    alt: 'Duct tape',
    pixelated: true,
    display: sprite64Display,
  },
  toolbox: {
    src: `${SPRITES}/toolbox.png`,
    width: 64,
    height: 64,
    alt: 'Toolbox',
    pixelated: true,
    display: sprite64Display,
  },
  garbageCan: {
    src: `${SPRITES}/garbagecan.png`,
    width: 64,
    height: 64,
    alt: 'Garbage can',
    pixelated: true,
    display: garbageCanDisplay,
  },
  /** UPS package — inventory / cursor */
  upsBox: {
    src: `${SPRITES}/upsbox.png`,
    width: 64,
    height: 64,
    alt: 'UPS package',
    pixelated: true,
    display: sprite64Display,
  },
  /** Bush with package stuck inside (starting state) */
  bushWithBox: {
    src: `${SPRITES}/box-in-bush.png`,
    width: 64,
    height: 64,
    alt: 'Bush with package',
    pixelated: true,
    display: bushDisplay,
  },
  /** Bush trimmed back, package free to take */
  bushCutWithBox: {
    src: `${SPRITES}/bush-cut-with-box.png`,
    width: 64,
    height: 64,
    alt: 'Trimmed bush with package',
    pixelated: true,
    display: bushDisplay,
  },
  /** Empty bush after package taken */
  bush: {
    src: `${SPRITES}/bush.png`,
    width: 64,
    height: 64,
    alt: 'Bush',
    pixelated: true,
    display: bushDisplay,
  },
  trimmers: {
    src: `${SPRITES}/trimmer-full.png`,
    width: 64,
    height: 64,
    alt: 'Hedge trimmers',
    pixelated: true,
    display: sprite64Display,
  },
  trimmersPartA: {
    src: `${SPRITES}/trimmer-half1.png`,
    width: 64,
    height: 64,
    alt: 'Trimmer blade',
    pixelated: true,
    display: sprite64Display,
  },
  trimmersPartATaped: {
    src: `${SPRITES}/trimmer-half1-taped.png`,
    width: 64,
    height: 64,
    alt: 'Trimmer blade with tape',
    pixelated: true,
    display: sprite64Display,
  },
  trimmersPartB: {
    src: `${SPRITES}/trimmer-half2.png`,
    width: 64,
    height: 64,
    alt: 'Trimmer body',
    pixelated: true,
    display: sprite64Display,
  },
  trimmersPartBTaped: {
    src: `${SPRITES}/trimmer-half2-taped.png`,
    width: 64,
    height: 64,
    alt: 'Trimmer body with tape',
    pixelated: true,
    display: sprite64Display,
  },
  authKey: {
    src: `${SPRITES}/gold-key.png`,
    width: 64,
    height: 64,
    alt: 'Authentication key',
    pixelated: true,
    display: sprite64Display,
  },
  rustyKey: {
    src: `${SPRITES}/rusty-key.png`,
    width: 64,
    height: 64,
    alt: 'Brass key',
    pixelated: true,
    display: sprite64Display,
  },
  dvd: {
    src: `${SPRITES}/dvd.png`,
    width: 64,
    height: 64,
    alt: 'DVD',
    pixelated: true,
    display: dvdDisplay,
  },
  decoFishBowl: {
    src: `${SPRITES}/fishbowl.png`,
    width: 64,
    height: 64,
    alt: 'Fish bowl',
    pixelated: true,
    display: sprite64Display,
  },
  keyhole: {
    src: `${SPRITES}/keyhole.png`,
    width: 64,
    height: 64,
    alt: 'Key slot',
    pixelated: true,
    display: keyholeDisplay,
  },
} as const satisfies Record<string, PropAssetDefinition>

export type PropAssetId = keyof typeof PROP_ASSETS

export type ScenePropAssetId =
  | 'toolbox'
  | 'garbageCan'
  | 'bush'
  | 'bushWithBox'
  | 'bushCutWithBox'

export const ITEM_ASSET_IDS: Partial<Record<ItemId, PropAssetId>> = {
  shovel: 'shovel',
  cutter: 'cutter',
  ductTape: 'ductTape',
  trimmers: 'trimmers',
  box: 'upsBox',
  key: 'authKey',
  toolboxKey: 'rustyKey',
}

export const DECO_ASSET_IDS: Partial<Record<DecoSpawnId, PropAssetId>> = {
  filmDvd: 'dvd',
  nightManorDvd: 'dvd',
  fishBowl: 'decoFishBowl',
}

export const getAssetDisplay = (id: PropAssetId) => PROP_ASSETS[id].display

export type TrimmerVisualHalf = 'full' | 'blade' | 'body'

export const getTrimmerAssetId = (
  half: TrimmerVisualHalf,
  taped = false
): PropAssetId => {
  if (half === 'full') return 'trimmers'
  if (half === 'blade') return taped ? 'trimmersPartATaped' : 'trimmersPartA'
  return taped ? 'trimmersPartBTaped' : 'trimmersPartB'
}

/** Bush / hedge visual by puzzle progress */
export const getBushAssetId = (
  boxFreed: boolean,
  boxTaken: boolean
): Extract<PropAssetId, 'bush' | 'bushWithBox' | 'bushCutWithBox'> => {
  if (boxTaken) return 'bush'
  if (boxFreed) return 'bushCutWithBox'
  return 'bushWithBox'
}
