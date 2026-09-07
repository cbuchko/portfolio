import { useEffect, useState } from 'react'
import { mobileHeightBreakpoint, mobileWidthBreakpoint } from './constants'

export type TfaLayout = {
  isNarrow: boolean
  isShort: boolean
  isTouch: boolean
  isCompact: boolean
  /** Width-only alias so existing level layouts stay on the 500px path. */
  isMobile: boolean
  viewportWidth: number
  viewportHeight: number
}

const idleLayout: TfaLayout = {
  isNarrow: false,
  isShort: false,
  isTouch: false,
  isCompact: false,
  isMobile: false,
  viewportWidth: 0,
  viewportHeight: 0,
}

const readLayout = (): TfaLayout => {
  const viewport = window.visualViewport
  const width = viewport?.width ?? window.innerWidth
  const height = viewport?.height ?? window.innerHeight
  const isNarrow = width < mobileWidthBreakpoint
  const isShort = height < mobileHeightBreakpoint
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  return {
    isNarrow,
    isShort,
    isTouch,
    isCompact: isNarrow || isShort,
    isMobile: isNarrow,
    viewportWidth: Math.round(width),
    viewportHeight: Math.round(height),
  }
}

export function useTfaLayout(): TfaLayout {
  const [layout, setLayout] = useState<TfaLayout>(idleLayout)

  useEffect(() => {
    const sync = () => setLayout(readLayout())
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
