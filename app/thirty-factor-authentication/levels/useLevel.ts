import { useCallback, useState } from 'react'
import { OneContent, OneControls } from './1'
import { TwoContent, TwoControls } from './2'
import { MessageSpamContent, MessageSpamControls } from './MessageSpam'
import { ZodiacContent, ZodiacControls } from './Zodiac'
import { DoubleNegativeContent, DoubleNegativeControls } from './DoubleNegative'

const forceLevel = 0
export const useLevels = () => {
  const [level, setLevel] = useState(1)

  const handleLevelAdvance = useCallback(() => {
    const audio = new Audio('/thirty-factor-authentication/sounds/success.mp3')
    audio.volume = 0.2
    audio.play()
    setLevel((level) => level + 1)
  }, [])

  const resetLevel = () => setLevel(1)

  const baseProps = {
    level,
    handleLevelAdvance,
    resetLevel,
  }

  const levelToUse = forceLevel > 0 ? forceLevel : level
  switch (levelToUse) {
    case 1:
      return {
        ...baseProps,
        content: OneContent,
        controls: OneControls,
      }
    case 2:
      return {
        ...baseProps,
        content: TwoContent,
        controls: TwoControls,
      }
    case 3:
      return {
        ...baseProps,
        content: MessageSpamContent,
        controls: MessageSpamControls,
      }
    case 4:
      return {
        ...baseProps,
        content: ZodiacContent,
        controls: ZodiacControls,
      }
    case 5:
      return {
        ...baseProps,
        content: DoubleNegativeContent,
        controls: DoubleNegativeControls,
      }
    default:
      return {
        ...baseProps,
        content: OneContent,
        controls: OneControls,
      }
  }
}
