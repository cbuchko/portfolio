import { useCallback, useState } from 'react'
import { OneContent, OneControls } from './1'
import { TwoContent, TwoControls } from './2'
import { MessageSpamContent, MessageSpamControls } from './MessageSpam'
import { ZodiacContent, ZodiacControls } from './Zodiac'
import { DoubleNegativeContent, DoubleNegativeControls } from './DoubleNegative'
import { FallbackOneContent, FallbackOneControls } from './Fallback1'
import { forceLevel } from '../constants'
import { FallbackTwoContent, FallbackTwoControls } from './Fallback2'
import { MapContent, MapControls } from './MapBirthplace'
import { PostItContent, PostItControls } from './PostIt'
import { BiometricContent, BiometricControls } from './Biometric'
import { TaxReturnContent, TaxReturnControls } from './TaxReturn'

//AAAA@@may00
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
        content: FallbackOneContent,
        controls: FallbackOneControls,
      }
    case 6:
      return {
        ...baseProps,
        content: MapContent,
        controls: MapControls,
      }
    case 7:
      return {
        ...baseProps,
        content: PostItContent,
        controls: PostItControls,
      }
    case 8:
      return {
        ...baseProps,
        content: BiometricContent,
        controls: BiometricControls,
      }
    case 9:
      return {
        ...baseProps,
        content: TaxReturnContent,
        controls: TaxReturnControls,
      }
    case 10:
      return {
        ...baseProps,
        content: FallbackTwoContent,
        controls: FallbackTwoControls,
      }
    default:
      return {
        ...baseProps,
        content: OneContent,
        controls: OneControls,
      }
  }
}
