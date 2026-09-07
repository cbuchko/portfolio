import { useEffect, useRef, useState } from 'react'
import { useSfx } from '../utils/audio'
import { useEffectInitializer } from '../utils/useEffectUnsafe'

export const useMessageSpam = (
  spamMessages: string[],
  realMessage?: string,
  delayInMs = 7000,
  enabled = true
) => {
  const [message, setMessage] = useState<string | undefined>(realMessage)

  const playMessageSound = useSfx('message')
  const messageIndexRef = useRef(-1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffectInitializer(() => {
    if (!enabled) return
    if (messageIndexRef.current === -1 && realMessage) {
      playMessageSound()
      setMessage(realMessage)
      messageIndexRef.current = 0
    }
  }, [realMessage, playMessageSound, enabled])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      messageIndexRef.current = -1
      return
    }

    intervalRef.current = setInterval(() => {
      playMessageSound()
      setMessage(spamMessages[messageIndexRef.current])

      //cycle to the next message
      if (messageIndexRef.current >= spamMessages.length - 1) {
        messageIndexRef.current = 1
      } else messageIndexRef.current = messageIndexRef.current + 1
    }, delayInMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [delayInMs, spamMessages, playMessageSound, enabled])

  const handleResendCode = () => {
    if (!enabled) return
    playMessageSound()
    setMessage(realMessage)
  }

  return { message, handleResendCode }
}
