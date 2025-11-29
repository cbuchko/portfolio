import { useEffect, useState } from 'react'
import { ContentProps } from './types'
import { PlayerInformation } from '../player-constants'
import dynamic from 'next/dynamic'
import { MapProps, Marker } from './Map'

//have to lazy load map because leaflet does not support SSR
const Map = dynamic<MapProps>(() => import('./Map').then((mod) => mod.default), {
  ssr: false,
})

export const RoadTripContent = ({ playerId, handleLevelAdvance, setIsLoading }: ContentProps) => {
  const [selectedCity, setSelectedCity] = useState<string>()
  const [startingPoint, setStartingPoint] = useState<number[]>([])
  const [markers, setMarkers] = useState<Marker[]>([])

  const handleCitySelect = (city?: string) => {
    setSelectedCity(city)
    const targetCity = PlayerInformation[playerId].birthCity
    if (targetCity.toLowerCase() === city?.toLowerCase()) {
      handleLevelAdvance(true)
    }
  }

  useEffect(() => {
    const startIndex = Math.floor(Math.random() * StartingPoints.length)
    const start = StartingPoints[startIndex]
    const markers = new Array(...RoadTripMarkers)
    markers.push({
      coordinates: start.coordinates,
      name: start.name,
      message: 'You remember your birth city right? Think you could find your way back there?',
    })
    setStartingPoint(start.coordinates)
    setMarkers(markers)
    setIsLoading(false)
  }, [setIsLoading])

  if (!startingPoint || startingPoint.length !== 2) return null

  return (
    <div className="fixed top-0 left-0 h-screen w-screen">
      <Map
        handleCitySelect={handleCitySelect}
        selectedCity={selectedCity}
        minZoom={9} //9
        markers={markers}
        initialCoordinate={startingPoint as [number, number]}
        className="map-full"
      />
    </div>
  )
}

const StartingPoints = [
  { name: 'Manono', coordinates: [-7.288, 27.4321] },
  { name: 'Fada', coordinates: [17.1947, 21.582] },
  { name: 'Saransk', coordinates: [54.2, 45.1745] },
  { name: 'Yakutsk', coordinates: [62.0397, 129.7422] },
]

const RoadTripMarkers: Marker[] = [
  {
    name: 'toronto',
    coordinates: [43.6511, -79.347],
    message: 'Shout out to Toronto, the city where this was made.',
  },
  {
    name: 'Montreal',
    coordinates: [45.5019, -73.35674],
    message: 'Poutine would really hit right now.',
  },
  {
    name: 'New Delhi',
    coordinates: [28.6139, 77.2088],
    message:
      'While New Delhi is not your final destination, it should give you an idea of where to go next.',
  },
  {
    name: 'Sydney',
    coordinates: [-33.8727, 151.2057],
    message: 'Somehow you ended up in Australia. A bit lost?',
  },
  {
    name: 'Los Angeles',
    coordinates: [34.0549, -118.2426],
    message:
      "The sunny shores of Los Angeles welcome you. You're getting warmer in more ways than one.",
  },
  {
    name: 'Beijing',
    coordinates: [39.9042, 116.4074],
    message: "You found Beijing! You should for sure know the continent you're in now. Right?",
  },
  {
    name: 'Honolulu',
    coordinates: [21.3099, -157.8581],
    message: 'Like an oasis in the desert, Hawaii welcomes you on your journey across the Pacific.',
  },
  {
    name: 'Kazakhstan',
    coordinates: [48.0196, 66.9237],
    message: 'If you were Borat, this would be the correct answer.',
  },
  {
    name: 'West Great Wall',
    coordinates: [39, 98],
    message: 'The western tip of the great wall.',
  },
  {
    name: 'Colorado',
    coordinates: [39.5501, -105.7821],
    message:
      "I don't have a fun quip for Colorado, but it is in a very central part of this country.",
  },
  {
    name: 'Columbus',
    coordinates: [39.9625, -83.0032],
    message: `Gen Z might say you're "cooked" if you live in this state.`,
  },
  {
    name: 'Null Island',
    coordinates: [0, 0],
    message: 'This coordinate is at 0 longitude and 0 latitude. Pretty cool eh?',
  },
  {
    name: 'Atlantic',
    coordinates: [45, -40],
    message:
      "There's nothing here. I just wanted to provide some comfort for your journey across the Atlantic! You're halfway there!",
  },
  {
    name: 'Atlantic',
    coordinates: [30, -40],
    message:
      "There's nothing here. I just wanted to provide some comfort for your journey across the Atlantic! You're halfway there!",
  },
  {
    name: 'Atlantic',
    coordinates: [37, -40],
    message:
      "There's nothing here. I just wanted to provide some comfort for your journey across the Atlantic! You're halfway there!",
  },
  {
    name: 'Atlantic',
    coordinates: [22, -40],
    message:
      "There's nothing here. I just wanted to provide some comfort for your journey across the Atlantic! You're halfway there!",
  },
  {
    name: 'Rome',
    coordinates: [41.8967, 12.4822],
    message:
      'If I let you zoom out a little more you would see this country is shaped like a boot.',
  },
  {
    name: 'Lisbon',
    coordinates: [38.7223, -9.1393],
    message: 'Time to set sail across the Atlantic. See you on the other side!',
  },
  {
    name: 'Rio de Janeiro',
    coordinates: [-22.9068, -43.1729],
    message: 'Welcome to the Western Hemishpere!',
  },
  {
    name: 'Greenland',
    coordinates: [61.7069, -42.6043],
    message: "Venturing into Greenland seems like a misstep. I'd turn around.",
  },
  {
    name: 'Cairo',
    coordinates: [30.0444, 31.2357],
    message: "The home of the pyramids, but not the home you're looking for.",
  },
  {
    name: 'Vancouver',
    coordinates: [49.2827, -123.1207],
    message: 'Oh Canada.',
  },
  {
    name: 'scranton',
    coordinates: [41.4103, -75.6611],
  },
  {
    name: 'London',
    coordinates: [51.5072, -0.1276],
    message: "It's a beautiful day in London, that is to say, it's overcast and muggy",
  },
  {
    name: 'Munich',
    coordinates: [48.1351, 11.582],
    message: "I've heard Oktober goes craaazy here.",
  },
  {
    name: 'Paris',
    coordinates: [48.8575, 2.3514],
    message: 'The city of lights guides your way home.',
  },
  {
    name: 'Cape Town',
    coordinates: [-33.9249, 18.4241],
    message: "You've reached the southern tip of Africa.",
  },
  {
    name: 'Anchorage',
    coordinates: [61.2176, -149.8997],
    message: "Alaska may be in the country you want, but it's still quite far.",
  },
  {
    name: 'Dubai',
    coordinates: [25.2048, 55.2708],
    message: 'You might need a bit more money if you wish to stay any longer.',
  },
  {
    name: 'Mexico City',
    coordinates: [19.4326, -99.1332],
    message: 'Ding ding ding, someone found the correct continent!',
  },
  {
    name: 'New York City',
    coordinates: [43.2994, -74.2179],
    message: 'Concrete jungle wet dream tomato.',
  },
  {
    name: 'New Jersey',
    coordinates: [40.4072, -74.0341],
    message: 'Is it bad that this state makes me think of Jersey Shore?',
  },
  {
    name: 'Dallas',
    coordinates: [32.7767, -96.797],
    message: 'Everything is bigger in this state.',
  },
  {
    name: 'Moscow',
    coordinates: [55.7558, 37.6173],
    message: "In a country that's mostly an uninhabitable snowland, you found its capital.",
  },
  {
    name: 'Winnipeg',
    coordinates: [49.8954, -97.1384],
    message: 'Winnipeg is where this games creator was born.',
  },
  {
    name: 'Georgia',
    coordinates: [42.3154, 43.3569],
    message: 'This country shares its name with a US State.',
  },
  {
    name: 'Istanbul',
    coordinates: [41.0082, 28.9784],
    message: "I won't tell you what city this is, but I will tell you it is NOT Constantinople.",
  },
  {
    name: 'Panama',
    coordinates: [8.538, -80.7821],
    message: 'This would be the perfect place to put a canal.',
  },
  {
    name: 'Madagascar',
    coordinates: [-18.7669, 46.8691],
    message:
      "Madagascar is a really good movie. No reason why I'm bring this up right here and right now :)",
  },
  {
    name: 'Morocco',
    coordinates: [31.7917, -7.0926],
    message: 'The markets in this country are really quite... bazaar.',
  },
  {
    name: 'Democratic Republic of the Congo',
    coordinates: [-4.0383, 21.7587],
    message: 'The heart of the DRC.',
  },
  {
    name: 'Chad',
    coordinates: [15.4542, 18.7322],
    message: 'The original Chad.',
  },
  {
    name: 'Tanzania',
    coordinates: [-6.369, 34.8888],
    message: "The Indian Ocean isn't much further East.",
  },
  {
    name: 'Lesotho',
    coordinates: [-29.61, 28.2336],
    message: "A country that's completely surrounded by another country.",
  },
  {
    name: 'Sahara',
    coordinates: [23.4162, 15.6628],
    message: 'This, and everything nearby, is the Sahara Desert.',
  },
  {
    name: 'South Africa',
    coordinates: [-20.288, 27.4321],
    message: 'Let me help you out. Heading further South is unproductive.',
  },
  {
    name: 'South Africa',
    coordinates: [-15.288, 20.4321],
    message: 'Let me help you out. Heading further South is unproductive.',
  },
  {
    name: 'Ethiopia',
    coordinates: [9.145, 40.4897],
    message: 'If I was ever craving Doro Wat, this might be the move.',
  },
  {
    name: 'Russia',
    coordinates: [65.7558, 85.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [60.7558, 95.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [57.7558, 80.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [65.7558, 110.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [55.7558, 110.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [55.7558, 135.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [65.7558, 135.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Russia',
    coordinates: [60.7558, 125.6173],
    message:
      "I don't want you wandering around in this snow desert for too long. South-West would be smart.",
  },
  {
    name: 'Bridge',
    coordinates: [65, -169],
    message: "Didn't there use to be a bridge here?",
  },
]
