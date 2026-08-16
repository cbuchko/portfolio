import { useEffect, useRef, useState } from 'react'
import { useSound } from '../utils/useSounds'
import { useEffectInitializer } from '../utils/useEffectUnsafe'

export const useMessageSpam = (
  spamMessages: string[],
  realMessage?: string,
  delayInMs = 7000,
  enabled = true
) => {
  const [message, setMessage] = useState<string | undefined>(realMessage)

  const { playSound: playMessageSound, stopSound: stopMessageSound } = useSound(
    '/thirty-factor-authentication/sounds/message.mp3',
    0.2
  )
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
      stopMessageSound()
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
  }, [delayInMs, spamMessages, playMessageSound, stopMessageSound, enabled])

  const handleResendCode = () => {
    if (!enabled) return
    playMessageSound()
    setMessage(realMessage)
  }

  return { message, handleResendCode }
}
