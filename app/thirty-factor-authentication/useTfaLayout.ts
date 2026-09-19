import { useEffect, useState } from 'react'
import {
  fitReferenceHeight,
  minFit,
  mobileHeightBreakpoint,
  mobileWidthBreakpoint,
} from './constants'

export type TfaLayout = {
  /** Width < mobileWidthBreakpoint: stack rows into columns. */
  isNarrow: boolean
  /** Height < mobileHeightBreakpoint: compact chrome, shrink props. */
  isShort: boolean
  /** Pointer is a finger: on-screen controls, "tap" copy, bigger hit slop. */
  isTouch: boolean
  /** isNarrow || isShort */
  isCompact: boolean
  /** @deprecated width-only alias of isNarrow; use isNarrow / isShort / isTouch. */
  isMobile: boolean
  /**
   * Continuous scale for fixed-size play areas, 1 at the reference viewport and
   * clamped at minFit. Mirrored to the shell as `--tfa-fit`.
   */
  fit: number
  viewportWidth: number
  viewportHeight: number
}

const idleLayout: TfaLayout = {
  isNarrow: false,
  isShort: false,
  isTouch: false,
  isCompact: false,
  isMobile: false,
  fit: 1,
  viewportWidth: 0,
  viewportHeight: 0,
}

/**
 * Height-driven: phones already have width-specific layouts via isNarrow, so
 * only the vertical budget shrinks fixed-size play areas.
 */
export const computeFit = (height: number) => {
  const raw = height / fitReferenceHeight
  const clamped = Math.min(1, Math.max(minFit, raw))
  return Math.round(clamped * 100) / 100
}

export const readViewportSize = () => {
  const viewport = window.visualViewport
  return {
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
  }
}

const readLayout = (): TfaLayout => {
  const { width, height } = readViewportSize()
  const isNarrow = width < mobileWidthBreakpoint
  const isShort = height < mobileHeightBreakpoint
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  return {
    isNarrow,
    isShort,
    isTouch,
    isCompact: isNarrow || isShort,
    isMobile: isNarrow,
    fit: computeFit(height),
    viewportWidth: Math.round(width),
    viewportHeight: Math.round(height),
  }
}

const layoutEqual = (a: TfaLayout, b: TfaLayout) =>
  a.isNarrow === b.isNarrow &&
  a.isShort === b.isShort &&
  a.isTouch === b.isTouch &&
  a.fit === b.fit &&
  a.viewportWidth === b.viewportWidth &&
  a.viewportHeight === b.viewportHeight

export function useTfaLayout(): TfaLayout {
  const [layout, setLayout] = useState<TfaLayout>(idleLayout)

  useEffect(() => {
    const sync = () =>
      setLayout((prev) => {
        const next = readLayout()
        return layoutEqual(prev, next) ? prev : next
      })
    sync()
    window.addEventListener('resize', sync)
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', sync)
    viewport?.addEventListener('scroll', sync)
    return () => {
      window.removeEventListener('resize', sync)
      viewport?.removeEventListener('resize', sync)
      viewport?.removeEventListener('scroll', sync)
    }
  }, [])

  return layout
}
