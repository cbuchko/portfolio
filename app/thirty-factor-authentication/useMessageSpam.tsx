import { useEffect, useRef, useState } from 'react'
import { useSound } from '../utils/useSounds'

export const useMessageSpam = (spamMessages: string[], realMessage: string, delayInMs = 7000) => {
  const [message, setMessage] = useState<string | null>(null)

  const { playSound: playMessageSound } = useSound(
    '/thirty-factor-authentication/sounds/message.mp3',
    0.2
  )
  const messageIndexRef = useRef(-1)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (messageIndexRef.current === -1) {
      playMessageSound()
      setMessage(realMessage)
      messageIndexRef.current = 0
    }
  }, [realMessage, playMessageSound])

  useEffect(() => {
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
    }
  }, [delayInMs, spamMessages, playMessageSound])

  const handleResendCode = () => {
    const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
    audio.volume = 0.2
    audio.play()
    setMessage(realMessage)
  }

  return { message, handleResendCode }
}
