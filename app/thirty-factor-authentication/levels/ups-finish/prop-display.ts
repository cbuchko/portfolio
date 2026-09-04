/**
 * Prop size & scale per render context.
 *
 * - world: pixel size in the play area (optional mobile override)
 * - inventory: fits INVENTORY_FRAME_RATIO of the slot; use scale/rotate to tune
 * - cursor: follows held-item cursor; defaults to world if omitted
 */

import type { CSSProperties } from 'react'

export type PropDisplayContext = 'world' | 'inventory' | 'cursor'

/** Fraction of the inventory slot the icon frame occupies (uniform for all items). */
export const INVENTORY_FRAME_RATIO = 0.78

export type WorldDisplaySpec = {
  width: number
  height: number
  rotate?: number
  mobile?: { width: number; height: number }
}

export type InventoryDisplaySpec = {
  /** Multiplier inside the fit frame — use when sprite has extra transparent padding. */
  scale?: number
  rotate?: number
}

export type CursorDisplaySpec = {
  width?: number
  height?: number
  rotate?: number
}

export type PropDisplayConfig = {
  world: WorldDisplaySpec
  inventory: InventoryDisplaySpec
  cursor?: CursorDisplaySpec
}

export const resolveCursorDisplay = (config: PropDisplayConfig): WorldDisplaySpec => ({
  width: config.cursor?.width ?? config.world.width,
  height: config.cursor?.height ?? config.world.height,
  rotate: config.cursor?.rotate ?? config.world.rotate,
})

export const resolveWorldDisplay = (
  config: PropDisplayConfig,
  mobile = false
): WorldDisplaySpec => {
  if (mobile && config.world.mobile) return { ...config.world, ...config.world.mobile }
  return config.world
}

export type PropFrameStyleOptions = {
  mobile?: boolean
}

export const propFrameStyle = (
  context: PropDisplayContext,
  config: PropDisplayConfig,
  opts: PropFrameStyleOptions = {}
): CSSProperties => {
  if (context === 'inventory') {
    const framePct = INVENTORY_FRAME_RATIO * 100
    const { scale = 1, rotate = 0 } = config.inventory
    const transforms: string[] = []
    if (rotate) transforms.push(`rotate(${rotate}deg)`)
    if (scale !== 1) transforms.push(`scale(${scale})`)
    return {
      width: `${framePct}%`,
      height: `${framePct}%`,
      transform: transforms.length ? transforms.join(' ') : undefined,
    }
  }

  if (context === 'cursor') {
    const spec = resolveCursorDisplay(config)
    const rotate = spec.rotate ?? 0
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: spec.width,
      height: spec.height,
      transform: `translate(-50%, -50%)${rotate ? ` rotate(${rotate}deg)` : ''}`,
      pointerEvents: 'none',
    }
  }

  const spec = resolveWorldDisplay(config, opts.mobile)
  return {
    width: spec.width,
    height: spec.height,
    transform: spec.rotate ? `rotate(${spec.rotate}deg)` : undefined,
  }
}

export const propFrameClassName = (context: PropDisplayContext) =>
  `nm-prop-frame nm-prop-frame--${context}`

/** Outer nm-prop-visual wrapper for world-spawned items. */
export const worldPropOuterStyle = (config: PropDisplayConfig, mobile = false): CSSProperties => {
  const spec = resolveWorldDisplay(config, mobile)
  return {
    width: spec.width,
    height: spec.height,
    transform: spec.rotate
      ? `translate(-50%, -50%) rotate(${spec.rotate}deg)`
      : 'translate(-50%, -50%)',
  }
}
