/**
 * Display sizing for CSS-drawn inventory/world props (not yet on image assets).
 * Migrate entries to assets.ts as PNGs are added.
 */

import type { ItemId } from './types'
import type { PropDisplayConfig } from './prop-display'

export const CSS_ITEM_DISPLAY: Partial<Record<ItemId, PropDisplayConfig>> = {
  scrap: {
    world: { width: 44, height: 28, rotate: -12 },
    inventory: { scale: 1, rotate: -8 },
    cursor: { width: 44, height: 28, rotate: -12 },
  },
}

export const DEFAULT_CSS_ITEM_DISPLAY: PropDisplayConfig = {
  world: { width: 48, height: 48 },
  inventory: { scale: 1 },
}

export const getCssItemDisplay = (id: ItemId): PropDisplayConfig =>
  CSS_ITEM_DISPLAY[id] ?? DEFAULT_CSS_ITEM_DISPLAY
