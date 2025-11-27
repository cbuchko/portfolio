import { useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { PlayerInformation } from '../player-constants'
import dynamic from 'next/dynamic'
import { MapProps } from './Map'

//have to lazy load map because leaflet does not support SSR
const Map = dynamic<MapProps>(() => import('./Map').then((mod) => mod.default), {
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
      <p className="text-lg">Please confirm your city of birth.</p>
      <Map
        handleCitySelect={handleCitySelect}
        selectedCity={selectedCity}
        markers={cities}
        className="map"
      />
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

const cities = [
  // United States
  { name: 'New York City', coordinates: [40.7128, -74.006] },
  { name: 'Los Angeles', coordinates: [34.0522, -118.2437] },
  { name: 'Chicago', coordinates: [41.8781, -87.6298] },
  { name: 'Houston', coordinates: [29.7604, -95.3698] },
  { name: 'Philadelphia', coordinates: [39.9526, -75.1652] },
  { name: 'Phoenix', coordinates: [33.4484, -112.074] },
  { name: 'San Antonio', coordinates: [29.4241, -98.4936] },
  { name: 'San Diego', coordinates: [32.7157, -117.1611] },
  { name: 'Dallas', coordinates: [32.7767, -96.797] },
  { name: 'San Jose', coordinates: [37.3382, -121.8863] },
  { name: 'Tucson', coordinates: [32.2226, -110.9747] },
  { name: 'Dayton', coordinates: [39.7589, -84.1916] },
  { name: 'Burlington', coordinates: [44.4759, -73.2121] },
  { name: 'Bismarck', coordinates: [46.8083, -100.7837] },
  { name: 'Tuscumbia', coordinates: [34.7304, -86.5861] },
  { name: 'Aberdeen', coordinates: [45.4647, -98.4865] },
  { name: 'Huntington', coordinates: [38.4192, -82.4452] },
  { name: 'Macon', coordinates: [32.8407, -83.6324] },
  { name: 'scranton', coordinates: [41.4103, -75.6611] },

  // Canada
  { name: 'Toronto', coordinates: [43.6511, -79.347] },
  { name: 'Montreal', coordinates: [45.5017, -73.5673] },
  { name: 'Vancouver', coordinates: [49.2827, -123.1207] },
  { name: 'Calgary', coordinates: [51.0447, -114.0719] },
  { name: 'Edmonton', coordinates: [53.5461, -113.4938] },
  { name: 'Ottawa', coordinates: [45.4215, -75.6972] },
  { name: 'Winnipeg', coordinates: [49.8951, -97.1384] },
  { name: 'Quebec City', coordinates: [46.8139, -71.208] },
  { name: 'Hamilton', coordinates: [43.2557, -79.8711] },
  { name: 'Halifax', coordinates: [44.6488, -63.5752] },
  { name: 'Stratford', coordinates: [43.3712, -80.9839] },
  { name: 'Kingston', coordinates: [44.2312, -76.486] },
  { name: "St. John's", coordinates: [47.5615, -52.7126] },

  // Europe
  { name: 'London', coordinates: [51.5074, -0.1278] },
  { name: 'Paris', coordinates: [48.8566, 2.3522] },
  { name: 'Berlin', coordinates: [52.52, 13.405] },
  { name: 'Madrid', coordinates: [40.4168, -3.7038] },
  { name: 'Rome', coordinates: [41.9028, 12.4964] },
  { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
  { name: 'Brussels', coordinates: [50.8503, 4.3517] },
  { name: 'Vienna', coordinates: [48.2082, 16.3738] },
  { name: 'Warsaw', coordinates: [52.2297, 21.0122] },
  { name: 'Copenhagen', coordinates: [55.6761, 12.5683] },
  { name: 'Uppsala', coordinates: [59.8586, 17.6389] },
  { name: 'Kraków', coordinates: [50.0647, 19.945] },
  { name: 'Reykjavik', coordinates: [64.1355, -21.8954] },
  { name: 'Oranienburg', coordinates: [52.753, 13.239] },
  { name: 'Tbilisi', coordinates: [41.7151, 44.8271] },
  { name: 'Ghent', coordinates: [51.0543, 3.7174] },
  { name: 'Bologna', coordinates: [44.4949, 11.3426] },
  { name: 'Lyon', coordinates: [45.764, 4.8357] },
  { name: 'Salzburg', coordinates: [47.8095, 13.055] },
  { name: 'Naples', coordinates: [40.8518, 14.2681] },
  { name: 'Porto', coordinates: [41.1579, -8.6291] },
  { name: 'Valencia', coordinates: [39.4699, -0.3763] },
  { name: 'Leipzig', coordinates: [51.3397, 12.3731] },
  { name: 'Bruges', coordinates: [51.2093, 3.2247] },
  { name: 'Gdansk', coordinates: [54.352, 18.6466] },
  { name: 'Innsbruck', coordinates: [47.2692, 11.4041] },
  { name: 'Heidelberg', coordinates: [49.3988, 8.6724] },
  { name: 'Lille', coordinates: [50.6292, 3.0573] },
  { name: 'Bergen', coordinates: [60.3913, 5.3221] },
  { name: 'Turku', coordinates: [60.4518, 22.2666] },
  { name: 'Utrecht', coordinates: [52.0907, 5.1214] },
  { name: 'Ghardaïa', coordinates: [32.49, 3.67] },
  { name: 'Coimbra', coordinates: [40.2033, -8.4103] },
  { name: 'Trieste', coordinates: [45.6495, 13.7768] },
  { name: 'Pécs', coordinates: [46.0727, 18.2323] },
]
