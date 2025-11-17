import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import { DropdownSelector } from '../components/dropdown-selector'

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
export const ZodiacContent = ({ playerId, validateAdvance, cancelAdvance }: ContentProps) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string>()

  const [selectedSun, setSelectedSun] = useState(defaultSign)
  const [selectedMoon, setSelectedMoon] = useState(defaultSign)
  const [selectedRising, setSelectedRising] = useState(defaultSign)

  const targetZodiac = PlayerInformation[playerId].zodiac

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

    const optionResult = `${sunRes}-${moonRes}-${risingRes}`
    if (targetZodiac.toLocaleLowerCase() === optionResult.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <>
      <h3 className="mb-4">Please confirm your zodiac alignment.</h3>
      <div className="flex justify-between gap-4">
        <DropdownSelector
          id={'zodiac-sun'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'sun')}
          width={150}
          label={'Sun'}
        />
        <DropdownSelector
          id={'zodiac-moon'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'moon')}
          width={150}
          label={'Moon'}
        />
        <DropdownSelector
          id={'zodiac-rising'}
          activeId={activeDropdownId}
          setActiveId={setActiveDropdownId}
          options={signs}
          onOptionSelect={(option) => handleZodiacSelect(option, 'rising')}
          width={150}
          label={'Rising/Ascendant'}
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
