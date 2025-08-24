'use client'

import { CSSProperties, useCallback, useState } from 'react'
import './styles.css'
import { SidePanel } from './side-panel/SidePanel'
import { WebsiteElements } from './types'

export default function IdleGame() {
  const [cosmetics, setCosmetics] = useState<CSSProperties>({})
  const [enabledElements, setEnabledElements] = useState<Set<WebsiteElements>>(new Set())

  const onEnableElement = useCallback((element: WebsiteElements) => {
    setEnabledElements((prevElements) => prevElements.add(element))
  }, [])

  console.log({ enabledElements })
  return (
    <div className="flex">
      <div id="view" className="w-[80%]" style={cosmetics}>
        {enabledElements.has(WebsiteElements.title) && <h5>Welcome to our Website!</h5>}
      </div>
      <SidePanel setCosmetics={setCosmetics} onEnableElement={onEnableElement} />
    </div>
  )
}
