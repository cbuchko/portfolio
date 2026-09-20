import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import { DropdownSelector } from '../components/dropdown-selector'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'
import { setTfaAttemptContext } from '../analytics'

const signs = [
  'Aries',
  'Aquarius',
  'Cancer',
  'Capricorn',
  'Gemini',
  'Leo',
  'Libra',
  'Pisces',
  'Sagittarius',
  'Scorpio',
  'Taurus',
  'Virgo',
]

const defaultSign = 'Aries'

const syncZodiacAttempt = (sun: string, moon: string, rising: string) => {
  setTfaAttemptContext({
    sun,
    moon,
    rising,
    zodiac_attempt: `${sun}-${moon}-${rising}`.toLocaleLowerCase(),
  })
}

export const ZodiacContent = ({
  playerId,
  validateAdvance,
  cancelAdvance,
  layout,
}: ContentProps) => {
  const { isNarrow: isMobile, isShort } = layout
  const [activeDropdownId, setActiveDropdownId] = useState<string>()

  const [selectedSun, setSelectedSun] = useState(defaultSign)
  const [selectedMoon, setSelectedMoon] = useState(defaultSign)
  const [selectedRising, setSelectedRising] = useState(defaultSign)

  const targetZodiac = PlayerInformation[playerId].zodiac

  useEffectInitializer(() => {
    syncZodiacAttempt(defaultSign, defaultSign, defaultSign)
  }, [])

  const handleZodiacSelect = (option: string, type: 'sun' | 'moon' | 'rising') => {
    let sunRes = selectedSun
    let moonRes = selectedMoon
    let risingRes = selectedRising
    if (type === 'sun') {
      sunRes = option
      setSelectedSun(option)
    } else if (type === 'moon') {
      moonRes = option
      setSelectedMoon(option)
    } else {
      risingRes = option
      setSelectedRising(option)
    }

    syncZodiacAttempt(sunRes, moonRes, risingRes)
    const optionResult = `${sunRes}-${moonRes}-${risingRes}`
    if (targetZodiac.toLocaleLowerCase() === optionResult.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <p className="mb-4 text-lg">Please confirm your zodiac alignment.</p>
      <div
        className={classNames('flex justify-between gap-4', { 'flex-col items-center': isMobile })}
      >
        <DropdownSelector
          id={'zodiac-sun'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'sun')}
          width={150}
          label={'Sun'}
          compact={isShort}
        />
        <DropdownSelector
          id={'zodiac-moon'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'moon')}
          width={150}
          label={'Moon'}
          compact={isShort}
        />
        <DropdownSelector
          id={'zodiac-rising'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'rising')}
          width={150}
          label={'Rising/Ascendant'}
          compact={isShort}
        />
      </div>
    </>
  )
}

export const ZodiacControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
