import { useCallback, useEffect, useRef, useState } from 'react'
import { TYPEWRITER_MS } from './prop-config'

export const useTypewriter = (text: string, active: boolean) => {
  const [visible, setVisible] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const complete = useCallback(() => {
    stopInterval()
    indexRef.current = text.length
    setVisible(text)
    setDone(true)
  }, [text])

  useEffect(() => {
    stopInterval()
    if (!active) {
      setVisible('')
      setDone(false)
      indexRef.current = 0
      return
    }

    indexRef.current = 0
    setVisible('')
    setDone(false)

    intervalRef.current = window.setInterval(() => {
      indexRef.current += 1
      setVisible(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        stopInterval()
        setDone(true)
      }
    }, TYPEWRITER_MS)

    return stopInterval
  }, [text, active])

  return { visible, done, complete }
}
