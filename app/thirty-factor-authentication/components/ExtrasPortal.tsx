'use client'

import { ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

export const ExtrasPortal = ({ children }: { children: ReactNode }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  useEffectInitializer(() => {
    setPortalElement(document.getElementById('extras-portal'))
  }, [])

  if (!portalElement) return null
  return createPortal(children, portalElement)
}
