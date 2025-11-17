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
import { PapersPleaseContent } from './PapersPlease'
import { AquariumContent, AquariumControls } from './Aquarium'
import { UndertaleContent } from './Undertale'
import { BombDefusalContent, BombDefusalControls } from './BombDefusal'
import { BasicAppCodeContent, BasicAppCodeControls } from './BasicAppCode'

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
  const LEVELS = [
    { content: OneContent, controls: OneControls },
    { content: TwoContent, controls: TwoControls },
    { content: BasicAppCodeContent, controls: BasicAppCodeControls },
    { content: MessageSpamContent, controls: MessageSpamControls },
    { content: ZodiacContent, controls: ZodiacControls }, //5
    { content: FallbackOneContent, controls: FallbackOneControls },
    { content: MapContent, controls: MapControls },
    { content: PostItContent, controls: PostItControls },
    { content: BiometricContent, controls: BiometricControls },
    { content: TaxReturnContent, controls: TaxReturnControls }, //10
    { content: FallbackTwoContent, controls: FallbackTwoControls },
    { content: AppCodeContent, controls: AppCodeControls },
    { content: IMDBContent, controls: IMDBControls, requiresLoad: true },
    { content: ParlorRoomContent, controls: undefined, requiresLoad: true },
    { content: BirdCallContent, controls: BirdCallControls, requiresLoad: true }, //15
    { content: SelfCheckoutContent, controls: SelfCheckoutControls },
    { content: MaintenanceContent, controls: MaintenanceControls },
    { content: QuotesContent, controls: QuotesControl },
    { content: PapersPleaseContent, controls: undefined },
    { content: AquariumContent, controls: AquariumControls }, //20
    { content: BombDefusalContent, controls: BombDefusalControls },
    { content: UndertaleContent, controls: undefined },
  ]

  const levelDef = LEVELS[levelToUse - 1]
  if (!levelDef) {
    // fallback
    return {
      ...baseProps,
      content: OneContent,
      controls: OneControls,
    }
  }
  return { ...baseProps, ...levelDef }
}
