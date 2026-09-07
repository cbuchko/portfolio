import { useCallback, useEffect, useRef, useState } from 'react'
import { TYPEWRITER_MS } from './prop-config'

export const useTypewriter = (text: string, active: boolean) => {
  const [visible, setVisible] = useState(active ? text.slice(0, 1) : '')
  const [done, setDone] = useState(false)
  const [run, setRun] = useState({ text, active })
  const intervalRef = useRef<number | null>(null)

  if (run.text !== text || run.active !== active) {
    setRun({ text, active })
    setVisible(active ? text.slice(0, 1) : '')
    setDone(false)
  }

  const stopInterval = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const complete = useCallback(() => {
    stopInterval()
    setVisible(text)
    setDone(true)
  }, [text])

  useEffect(() => {
    stopInterval()
    if (!active || done) return

    intervalRef.current = window.setInterval(() => {
      setVisible((prev) => {
        const nextLen = Math.min(prev.length + 1, text.length)
        const next = text.slice(0, nextLen)
        if (nextLen >= text.length) {
          stopInterval()
          setDone(true)
        }
        return next
      })
    }, TYPEWRITER_MS)

    return stopInterval
  }, [text, active, done])

  return { visible: active ? visible : '', done: active && done, complete }
}
