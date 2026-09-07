import {
  AUTH_EXCLUSION,
  DECO_FALLBACK_LAYOUT,
  DECO_FOOTPRINTS,
  DECO_MOBILE_FALLBACK,
  DECO_MOBILE_PIXELS,
  DECO_PROP_ORDER,
  DESKTOP_DECO_GAP,
  DESKTOP_MIN_PROP_GAP,
  FALLBACK_LAYOUT,
  MOBILE_DECO_GAP_PX,
  MOBILE_FALLBACK_LAYOUT,
  MOBILE_MIN_PROP_GAP_PX,
  MOBILE_PROP_PIXELS,
  MOBILE_PAN_RADIUS_RATIO,
  MOBILE_SPAWN_EDGE_MARGIN,
  MOBILE_AUTH_EXCLUSION_PAD_PX,
  PROP_FOOTPRINTS,
  PUZZLE_PROP_ORDER,
  shuffleOrder,
} from './prop-config'
import type {
  DecoSpawnId,
  MobilePanMetrics,
  PlacedFootprint,
  Point,
  PropSpawnId,
  SpawnPos,
} from './types'

const mobileFootprintPct = (id: PropSpawnId, metrics: MobilePanMetrics) => {
  const px = MOBILE_PROP_PIXELS[id]
  return {
    w: (px.w / metrics.worldW) * 100,
    h: (px.h / metrics.worldH) * 100,
  }
}

const mobilePropBounds = (
  left: number,
  top: number,
  id: PropSpawnId,
  metrics: MobilePanMetrics
) => {
  const fp = mobileFootprintPct(id, metrics)
  return {
    l: left - fp.w / 2,
    r: left + fp.w / 2,
    t: top - fp.h / 2,
    b: top + fp.h / 2,
  }
}

const mobilePropRectsOverlap = (
  left: number,
  top: number,
  id: PropSpawnId,
  placed: Partial<Record<PropSpawnId, SpawnPos>>,
  metrics: MobilePanMetrics
) => {
  const gapX = (MOBILE_MIN_PROP_GAP_PX / metrics.worldW) * 100
  const gapY = (MOBILE_MIN_PROP_GAP_PX / metrics.worldH) * 100
  const a = mobilePropBounds(left, top, id, metrics)

  return Object.entries(placed).some(([otherId, pos]) => {
    const b = mobilePropBounds(pos.left, pos.top, otherId as PropSpawnId, metrics)
    return !(a.r + gapX < b.l || a.l - gapX > b.r || a.b + gapY < b.t || a.t - gapY > b.b)
  })
}

const propFitsMobile = (
  left: number,
  top: number,
  footprint: { w: number; h: number },
  bounds: MobilePanMetrics['spawnBounds'],
  exclusion: { left: number; top: number; right: number; bottom: number }
) => {
  const l = left - footprint.w / 2
  const r = left + footprint.w / 2
  const t = top - footprint.h / 2
  const b = top + footprint.h / 2

  if (l < bounds.leftMin || r > bounds.leftMax || t < bounds.topMin || b > bounds.topMax) {
    return false
  }
  if (r > exclusion.left && l < exclusion.right && b > exclusion.top && t < exclusion.bottom) {
    return false
  }
  return true
}

const canPlaceMobileProp = (
  left: number,
  top: number,
  id: PropSpawnId,
  placed: Partial<Record<PropSpawnId, SpawnPos>>,
  metrics: MobilePanMetrics
) => {
  const footprint = mobileFootprintPct(id, metrics)
  if (!propFitsMobile(left, top, footprint, metrics.spawnBounds, metrics.authExclusion)) {
    return false
  }
  return !mobilePropRectsOverlap(left, top, id, placed, metrics)
}

const getMobileSpawnSlots = (metrics: MobilePanMetrics): SpawnPos[] => {
  const { spawnBounds: b } = metrics
  const cx = 50
  const cy = 50
  const rx = ((b.leftMax - b.leftMin) / 2) * 0.98
  const ry = ((b.topMax - b.topMin) / 2) * 0.98
  const degrees = [270, 315, 0, 45, 90, 135, 180, 225]

  return degrees.map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      left: cx + Math.cos(rad) * rx,
      top: cy + Math.sin(rad) * ry,
    }
  })
}

export const getMobilePanMetrics = (
  sceneW: number,
  sceneH: number
): Omit<MobilePanMetrics, 'authExclusion'> => {
  const R = Math.round(Math.min(sceneW, sceneH) * MOBILE_PAN_RADIUS_RATIO)
  const worldW = sceneW + 2 * R
  const worldH = sceneH + 2 * R
  const halfReachW = (R / worldW) * 100
  const halfReachH = (R / worldH) * 100
  const m = MOBILE_SPAWN_EDGE_MARGIN

  return {
    R,
    worldW,
    worldH,
    baseX: sceneW / 2 - worldW / 2,
    baseY: sceneH / 2 - worldH / 2,
    spawnBounds: {
      leftMin: 50 - halfReachW + m,
      leftMax: 50 + halfReachW - m,
      topMin: 50 - halfReachH + m,
      topMax: 50 + halfReachH - m,
    },
  }
}

export const measureAuthExclusion = (
  sceneEl: HTMLDivElement,
  metrics: Omit<MobilePanMetrics, 'authExclusion'>,
  pan: Point = { x: 0, y: 0 }
): { left: number; top: number; right: number; bottom: number } => {
  const auth = document.getElementById('auth-container')
  if (!auth) {
    return { left: 8, top: 18, right: 92, bottom: 82 }
  }

  const logo = document.getElementById('tfa-logo')
  const sceneRect = sceneEl.getBoundingClientRect()
  const originX = sceneRect.left + metrics.baseX + pan.x
  const originY = sceneRect.top + metrics.baseY + pan.y
  const padX = (MOBILE_AUTH_EXCLUSION_PAD_PX / metrics.worldW) * 100
  const padY = (MOBILE_AUTH_EXCLUSION_PAD_PX / metrics.worldH) * 100

  const toWorldX = (screenX: number) => ((screenX - originX) / metrics.worldW) * 100
  const toWorldY = (screenY: number) => ((screenY - originY) / metrics.worldH) * 100

  const authRect = auth.getBoundingClientRect()
  let left = toWorldX(authRect.left) - padX
  let right = toWorldX(authRect.right) + padX
  let top = toWorldY(authRect.top) - padY
  const bottom = toWorldY(authRect.bottom) + padY

  if (logo) {
    const logoRect = logo.getBoundingClientRect()
    left = Math.min(left, toWorldX(logoRect.left) - padX)
    right = Math.max(right, toWorldX(logoRect.right) + padX)
    top = Math.min(top, toWorldY(logoRect.top) - padY)
  }

  return { left, top, right, bottom }
}

export const clampMobilePan = (x: number, y: number, radius: number): Point => ({
  x: Math.max(-radius, Math.min(radius, x)),
  y: Math.max(-radius, Math.min(radius, y)),
})

const propFits = (
  left: number,
  top: number,
  footprint: { w: number; h: number },
  margin: number,
  exclusion: { left: number; top: number; right: number; bottom: number }
) => {
  const l = left - footprint.w / 2
  const r = left + footprint.w / 2
  const t = top - footprint.h / 2
  const b = top + footprint.h / 2

  if (l < margin || r > 100 - margin || t < margin || b > 100 - margin) return false
  if (r > exclusion.left && l < exclusion.right && b > exclusion.top && t < exclusion.bottom) {
    return false
  }
  return true
}

export const layoutOverlapsAuth = (
  layout: Record<PropSpawnId, SpawnPos>,
  metrics: MobilePanMetrics
) =>
  Object.entries(layout).some(([id, pos]) => {
    const footprint = mobileFootprintPct(id as PropSpawnId, metrics)
    return !propFitsMobile(pos.left, pos.top, footprint, metrics.spawnBounds, metrics.authExclusion)
  })

export const layoutPropsTooDense = (
  layout: Record<PropSpawnId, SpawnPos>,
  metrics: MobilePanMetrics
) => {
  const ids = Object.keys(layout) as PropSpawnId[]
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i]
    const pos = layout[id]
    const others: Partial<Record<PropSpawnId, SpawnPos>> = {}
    for (let j = 0; j < ids.length; j += 1) {
      if (i !== j) others[ids[j]] = layout[ids[j]]
    }
    if (mobilePropRectsOverlap(pos.left, pos.top, id, others, metrics)) return true
  }
  return false
}

const propBoundsPct = (
  left: number,
  top: number,
  footprint: { w: number; h: number }
) => ({
  l: left - footprint.w / 2,
  r: left + footprint.w / 2,
  t: top - footprint.h / 2,
  b: top + footprint.h / 2,
})

/** True if candidate AABB sits too close to any already-placed prop. */
const desktopPropRectsOverlap = (
  left: number,
  top: number,
  id: PropSpawnId,
  placed: Partial<Record<PropSpawnId, SpawnPos>>,
  gap = DESKTOP_MIN_PROP_GAP
) => {
  const a = propBoundsPct(left, top, PROP_FOOTPRINTS[id])

  return Object.entries(placed).some(([otherId, pos]) => {
    const b = propBoundsPct(pos.left, pos.top, PROP_FOOTPRINTS[otherId as PropSpawnId])
    return !(a.r + gap < b.l || a.l - gap > b.r || a.b + gap < b.t || a.t - gap > b.b)
  })
}

export const generatePropLayout = (): Record<PropSpawnId, SpawnPos> => {
  const margin = 10
  const exclusion = AUTH_EXCLUSION.desktop
  const order = shuffleOrder(PUZZLE_PROP_ORDER)
  const placed: Partial<Record<PropSpawnId, SpawnPos>> = {}

  const tryRandom = (id: PropSpawnId, attempts: number): SpawnPos | null => {
    const footprint = PROP_FOOTPRINTS[id]
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const left = margin + Math.random() * (100 - margin * 2)
      const top = margin + Math.random() * (100 - margin * 2)
      if (!propFits(left, top, footprint, margin, exclusion)) continue
      if (desktopPropRectsOverlap(left, top, id, placed)) continue
      return { left, top }
    }
    return null
  }

  for (const id of order) {
    let found = tryRandom(id, 160)

    if (!found) {
      const fallback = FALLBACK_LAYOUT[id]
      if (
        propFits(fallback.left, fallback.top, PROP_FOOTPRINTS[id], margin, exclusion) &&
        !desktopPropRectsOverlap(fallback.left, fallback.top, id, placed)
      ) {
        found = fallback
      }
    }

    // Last resort: keep searching rather than stacking on a crowded fallback
    if (!found) found = tryRandom(id, 200)

    if (found) placed[id] = found
  }

  // Anything still missing gets a non-crowded fallback if possible, else raw fallback
  for (const id of order) {
    if (placed[id]) continue
    const fallback = FALLBACK_LAYOUT[id]
    if (!desktopPropRectsOverlap(fallback.left, fallback.top, id, placed)) {
      placed[id] = fallback
      continue
    }
    placed[id] = tryRandom(id, 250) ?? fallback
  }

  return placed as Record<PropSpawnId, SpawnPos>
}

export const generateMobilePropLayout = (metrics: MobilePanMetrics): Record<PropSpawnId, SpawnPos> => {
  const { spawnBounds: bounds } = metrics
  const order = shuffleOrder(PUZZLE_PROP_ORDER)
  const placed: Partial<Record<PropSpawnId, SpawnPos>> = {}
  const slots = shuffleOrder(getMobileSpawnSlots(metrics))

  for (const id of order) {
    let found: SpawnPos | null = null

    for (const slot of slots) {
      const jitter = () => (Math.random() - 0.5) * 4
      const left = slot.left + jitter()
      const top = slot.top + jitter()
      if (!canPlaceMobileProp(left, top, id, placed, metrics)) continue
      found = { left, top }
      break
    }

    if (found) {
      placed[id] = found
      continue
    }

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const left = bounds.leftMin + Math.random() * (bounds.leftMax - bounds.leftMin)
      const top = bounds.topMin + Math.random() * (bounds.topMax - bounds.topMin)
      if (!canPlaceMobileProp(left, top, id, placed, metrics)) continue
      found = { left, top }
      break
    }

    if (found) {
      placed[id] = found
      continue
    }

    const fallback = MOBILE_FALLBACK_LAYOUT[id]
    if (canPlaceMobileProp(fallback.left, fallback.top, id, placed, metrics)) {
      placed[id] = fallback
    }
  }

  for (const id of order) {
    if (placed[id]) continue

    for (const slot of slots) {
      if (canPlaceMobileProp(slot.left, slot.top, id, placed, metrics)) {
        placed[id] = slot
        break
      }
    }
    if (placed[id]) continue

    for (let attempt = 0; attempt < 300; attempt += 1) {
      const left = bounds.leftMin + Math.random() * (bounds.leftMax - bounds.leftMin)
      const top = bounds.topMin + Math.random() * (bounds.topMax - bounds.topMin)
      if (!canPlaceMobileProp(left, top, id, placed, metrics)) continue
      placed[id] = { left, top }
      break
    }
  }

  return { ...MOBILE_FALLBACK_LAYOUT, ...placed } as Record<PropSpawnId, SpawnPos>
}

const decoFootprintPct = (id: DecoSpawnId, metrics: MobilePanMetrics) => {
  const px = DECO_MOBILE_PIXELS[id]
  return {
    w: (px.w / metrics.worldW) * 100,
    h: (px.h / metrics.worldH) * 100,
  }
}

const footprintBoxesOverlap = (
  left: number,
  top: number,
  footprint: { w: number; h: number },
  others: PlacedFootprint[],
  gapX = 0,
  gapY = 0
) => {
  const l = left - footprint.w / 2
  const r = left + footprint.w / 2
  const t = top - footprint.h / 2
  const b = top + footprint.h / 2

  return others.some((other) => {
    const ol = other.left - other.w / 2
    const or = other.left + other.w / 2
    const ot = other.top - other.h / 2
    const ob = other.top + other.h / 2
    return !(r + gapX < ol || l - gapX > or || b + gapY < ot || t - gapY > ob)
  })
}

const canPlaceDeco = (
  left: number,
  top: number,
  id: DecoSpawnId,
  puzzleLayout: Record<PropSpawnId, SpawnPos>,
  decoPlaced: Partial<Record<DecoSpawnId, SpawnPos>>,
  mobile: boolean,
  metrics?: MobilePanMetrics
) => {
  const footprint = mobile && metrics ? decoFootprintPct(id, metrics) : DECO_FOOTPRINTS[id]
  const exclusion = mobile && metrics ? metrics.authExclusion : AUTH_EXCLUSION.desktop
  const bounds =
    mobile && metrics
      ? metrics.spawnBounds
      : { leftMin: 8, leftMax: 92, topMin: 8, topMax: 92 }

  if (!propFitsMobile(left, top, footprint, bounds, exclusion)) return false

  const puzzleFootprints: PlacedFootprint[] = (Object.keys(puzzleLayout) as PropSpawnId[]).map(
    (propId) => ({
      left: puzzleLayout[propId].left,
      top: puzzleLayout[propId].top,
      ...(mobile && metrics ? mobileFootprintPct(propId, metrics) : PROP_FOOTPRINTS[propId]),
    })
  )

  const decoFootprints: PlacedFootprint[] = (Object.keys(decoPlaced) as DecoSpawnId[]).map(
    (decoId) => ({
      left: decoPlaced[decoId]!.left,
      top: decoPlaced[decoId]!.top,
      ...(mobile && metrics ? decoFootprintPct(decoId, metrics) : DECO_FOOTPRINTS[decoId]),
    })
  )

  const gapX = mobile && metrics ? (MOBILE_DECO_GAP_PX / metrics.worldW) * 100 : DESKTOP_DECO_GAP
  const gapY = mobile && metrics ? (MOBILE_DECO_GAP_PX / metrics.worldH) * 100 : DESKTOP_DECO_GAP

  if (footprintBoxesOverlap(left, top, footprint, puzzleFootprints, gapX, gapY)) return false
  if (footprintBoxesOverlap(left, top, footprint, decoFootprints, gapX, gapY)) return false
  return true
}

export const generateDecoLayout = (
  puzzleLayout: Record<PropSpawnId, SpawnPos>,
  mobile: boolean,
  metrics?: MobilePanMetrics
): Record<DecoSpawnId, SpawnPos> => {
  const order = shuffleOrder(DECO_PROP_ORDER)
  const placed: Partial<Record<DecoSpawnId, SpawnPos>> = {}
  const bounds =
    mobile && metrics
      ? metrics.spawnBounds
      : { leftMin: 8, leftMax: 92, topMin: 8, topMax: 92 }
  const fallback = mobile ? DECO_MOBILE_FALLBACK : DECO_FALLBACK_LAYOUT

  for (const id of order) {
    let found: SpawnPos | null = null

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const left = bounds.leftMin + Math.random() * (bounds.leftMax - bounds.leftMin)
      const top = bounds.topMin + Math.random() * (bounds.topMax - bounds.topMin)
      if (!canPlaceDeco(left, top, id, puzzleLayout, placed, mobile, metrics)) continue
      found = { left, top }
      break
    }

    if (
      !found &&
      canPlaceDeco(fallback[id].left, fallback[id].top, id, puzzleLayout, placed, mobile, metrics)
    ) {
      found = fallback[id]
    }

    if (found) placed[id] = found
  }

  return { ...fallback, ...placed } as Record<DecoSpawnId, SpawnPos>
}

export const atCursor = (cursor: Point, rect: DOMRect | undefined, pad = 8) => {
  if (!rect) return false
  return (
    cursor.x >= rect.left - pad &&
    cursor.x <= rect.right + pad &&
    cursor.y >= rect.top - pad &&
    cursor.y <= rect.bottom + pad
  )
}

export const spawnPosStyle = (pos: SpawnPos | undefined) => {
  if (!pos) return { display: 'none' } as const
  return {
    left: `${pos.left}%`,
    top: `${pos.top}%`,
  }
}
