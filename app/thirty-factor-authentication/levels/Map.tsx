import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import { LeafletMarker } from '../components/Marker'

export type MapProps = {
  handleCitySelect: (city?: string) => void
  selectedCity?: string
  minZoom?: number
  markers?: Marker[]
  initialCoordinate?: LatLngTuple
  className: string
}

export type Marker = { name: string; coordinates: number[]; message?: string }

const redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function Map({
  handleCitySelect,
  selectedCity,
  minZoom,
  markers = [],
  initialCoordinate = [0, 0],
  className,
}: MapProps) {
  return (
    <MapContainer
      className={className}
      center={initialCoordinate}
      zoom={1}
      scrollWheelZoom={true}
      zoomControl={false}
      minZoom={minZoom}
      worldCopyJump={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      />
      {markers.map((city, idx) => (
        <LeafletMarker
          key={idx}
          position={city.coordinates as [number, number]}
          icon={selectedCity === city.name ? redIcon : blueIcon}
          message={city.message}
          eventHandlers={{
            click: () => {
              if (selectedCity === city.name) {
                handleCitySelect(undefined)
                return
              }
              handleCitySelect(city.name)
            },
          }}
        />
      ))}
    </MapContainer>
  )
}
