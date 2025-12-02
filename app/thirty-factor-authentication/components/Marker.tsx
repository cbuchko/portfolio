import { Marker, MarkerProps, Popup } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface LeafletMarkerProps extends MarkerProps {
  message?: React.ReactNode
}

export function LeafletMarker({ message, children, ...props }: LeafletMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [])

  return (
    <Marker ref={markerRef} {...props}>
      {message && (
        <Popup autoClose={false} closeOnClick={false} autoPan={false}>
          {message ?? children}
        </Popup>
      )}
    </Marker>
  )
}
