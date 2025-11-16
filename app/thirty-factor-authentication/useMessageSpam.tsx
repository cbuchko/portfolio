import { useEffect, useRef, useState } from 'react'

export const useMessageSpam = (spamMessages: string[], realMessage: string) => {
  const [message, setMessage] = useState<string | null>(null)

  const messageIndexRef = useRef(-1)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  //every 5 seconds replace the message on screen with a new one
  useEffect(() => {
    if (messageIndexRef.current === -1) {
      const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
      audio.volume = 0.2
      audio.play()
      setMessage(realMessage)
      messageIndexRef.current = 0
    }
    intervalRef.current = setInterval(() => {
      const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
      audio.volume = 0.2
      audio.play()
      setMessage(spamMessages[messageIndexRef.current])

      //cycle to the next message
      if (messageIndexRef.current >= spamMessages.length - 1) {
        messageIndexRef.current = 1
      } else messageIndexRef.current = messageIndexRef.current + 1
    }, 7000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleResendCode = () => {
    const audio = new Audio('/thirty-factor-authentication/sounds/message.mp3')
    audio.volume = 0.2
    audio.play()
    setMessage(realMessage)
  }

  return { message, handleResendCode }
}
