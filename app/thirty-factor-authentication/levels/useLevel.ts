import { useCallback, useState } from 'react'
import { OneContent, OneControls } from './1'
import { TwoContent, TwoControls } from './2'
import { MessageSpamContent, MessageSpamControls } from './MessageSpam'
import { ZodiacContent, ZodiacControls } from './Zodiac'
import { FallbackOneContent, FallbackOneControls } from './Fallback1'
import { forceLevel } from '../constants'
import { FallbackTwoContent, FallbackTwoControls } from './Fallback2'
import { MapContent, MapControls } from './MapBirthplace'
import { PostItContent, PostItControls } from './PostIt'
import { BiometricContent, BiometricControls } from './Biometric'
import { TaxReturnContent, TaxReturnControls } from './TaxReturn'
import { AppCodeContent, AppCodeControls } from './AppCode'
import { IMDBContent, IMDBControls } from './IMDB'
import { BirdCallContent, BirdCallControls } from './BirdCalls'
import { SelfCheckoutContent, SelfCheckoutControls } from './SelfCheckout'
import { ParlorRoomContent } from './ParlorRoom'
import { MaintenanceContent, MaintenanceControls } from './Maintenance'
import { QuotesContent, QuotesControl } from './Quotes'
import { PapersPleaseContent, PapersPleaseControls } from './PapersPlease'

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
    requiresLoad: false,
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
    case 11: {
      return {
        ...baseProps,
        content: AppCodeContent,
        controls: AppCodeControls,
      }
    }
    case 12: {
      return {
        ...baseProps,
        content: IMDBContent,
        controls: IMDBControls,
        requiresLoad: true,
      }
    }
    case 13: {
      return {
        ...baseProps,
        content: ParlorRoomContent,
        controls: undefined,
        requiesLoad: true,
      }
    }
    case 14: {
      return {
        ...baseProps,
        content: BirdCallContent,
        controls: BirdCallControls,
        requiresLoad: true,
      }
    }
    case 15: {
      return {
        ...baseProps,
        content: SelfCheckoutContent,
        controls: SelfCheckoutControls,
      }
    }
    case 16: {
      return {
        ...baseProps,
        content: MaintenanceContent,
        controls: MaintenanceControls,
      }
    }
    case 17: {
      return {
        ...baseProps,
        content: QuotesContent,
        controls: QuotesControl,
      }
    }
    case 18: {
      return {
        ...baseProps,
        content: PapersPleaseContent,
        controls: PapersPleaseControls,
      }
    }
    default:
      return {
        ...baseProps,
        content: OneContent,
        controls: OneControls,
      }
  }
}
