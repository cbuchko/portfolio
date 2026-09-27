import { Marker, MarkerProps, Popup } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

interface LeafletMarkerProps extends MarkerProps {
  message?: React.ReactNode
}

export function LeafletMarker({ message, children, ...props }: LeafletMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker || !message) return

    // Leaflet toggles a popup shut when its pin is clicked. That listener is
    // attached when the popup binds, which is after this effect, so retry once.
    const stopToggle = () => {
      const toggle = (marker as L.Marker & { _openPopup?: L.LeafletEventHandlerFn })._openPopup
      if (toggle) marker.off('click', toggle)
      marker.openPopup()
    }
    stopToggle()
    const retry = window.setTimeout(stopToggle, 0)
    return () => window.clearTimeout(retry)
  }, [message])

  return (
    <Marker ref={markerRef} {...props}>
      {message && (
        <Popup
          autoClose={false}
          closeOnClick={false}
          closeOnEscapeKey={false}
          closeButton={false}
          autoPan={false}
        >
          {message ?? children}
        </Popup>
      )}
    </Marker>
  )
}
