import { useSyncExternalStore } from 'react'
import type { KioskState } from './types'

let kiosk: KioskState = 'plate'
const listeners = new Set<() => void>()

export const setSharedKioskState = (next: KioskState) => {
  if (kiosk === next) return
  kiosk = next
  listeners.forEach((listen) => listen())
}

export const useKioskState = () =>
  useSyncExternalStore<KioskState>(
    (listen) => {
      listeners.add(listen)
      return () => listeners.delete(listen)
    },
    () => kiosk,
    () => 'plate'
  )
