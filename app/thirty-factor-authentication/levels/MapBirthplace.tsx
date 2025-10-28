import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import dynamic from 'next/dynamic'

//have to lazy load map because leaflet does not support SSR
const Map = dynamic<{
  handleCitySelect: (city?: string) => void
  selectedCity?: string
}>(() => import('./Map').then((mod) => mod.default), {
  ssr: false,
})

export const MapContent = ({ playerId, validateAdvance, cancelAdvance }: ContentProps) => {
  const [selectedCity, setSelectedCity] = useState<string>()

  const handleCitySelect = (city?: string) => {
    setSelectedCity(city)
    const targetCity = PlayerInformation[playerId].birthCity
    if (targetCity.toLowerCase() === city?.toLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  return (
    <div className="w-[500px]">
      <h3>Please confirm your city of birth.</h3>
      <Map handleCitySelect={handleCitySelect} selectedCity={selectedCity} />
    </div>
  )
}

export const MapControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}
