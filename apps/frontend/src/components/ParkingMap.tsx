import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../styles/ParkingMap.css'

interface Parking {
  id: number
  spot_num: string
  address: string
  latitude: number
  longitude: number
  price: number
  status: string
  description?: string
}

interface ParkingMapProps {
  onParkingSelect?: (parking: Parking) => void
  initialLat?: number
  initialLng?: number
  radius?: number
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function ParkingMap({
  onParkingSelect,
  initialLat = 4.7110,
  initialLng = -74.0721,
  radius = 5
}: ParkingMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error('Falta VITE_MAPBOX_TOKEN en el frontend. Agrega la variable de entorno con tu token Mapbox.')
      return
    }

    if (!mapContainer.current || mapRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 13
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, [initialLat, initialLng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })
          map.flyTo({ center: [lng, lat], zoom: 13 })
          addUserMarker(lat, lng)
          searchParkings(lat, lng, radius)
        },
        () => {
          searchParkings(initialLat, initialLng, radius)
        }
      )
    } else {
      searchParkings(initialLat, initialLng, radius)
    }
  }, [radius, initialLat, initialLng])

  const addUserMarker = (lat: number, lng: number) => {
    const map = mapRef.current
    if (!map) return

    new mapboxgl.Marker({ color: '#2ecc71' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Tu ubicación'))
      .addTo(map)
  }

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  const addMarkers = (parkingsData: Parking[]) => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    parkingsData.forEach((parking) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="parking-popup">
          <h4>${parking.spot_num}</h4>
          <p><strong>Dirección:</strong> ${parking.address}</p>
          <p><strong>Precio:</strong> $${parking.price} COP/hora</p>
          <p><strong>Estado:</strong> ${parking.status === 'available' ? 'Disponible' : 'Ocupado'}</p>
          ${parking.description ? `<p><strong>Detalles:</strong> ${parking.description}</p>` : ''}
        </div>
      `)

      const marker = new mapboxgl.Marker({ color: parking.status === 'available' ? '#2ecc71' : '#e74c3c' })
        .setLngLat([parking.longitude, parking.latitude])
        .setPopup(popup)
        .addTo(map)

      marker.getElement().addEventListener('click', () => {
        setSelectedParking(parking)
        if (onParkingSelect) {
          onParkingSelect(parking)
        }
      })

      markersRef.current.push(marker)
    })
  }

  const searchParkings = async (lat: number, lng: number, radiusKm: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/parkings/search?latitude=${lat}&longitude=${lng}&radius=${radiusKm}`
      )
      if (!response.ok) {
        throw new Error('No se pudo obtener parqueaderos')
      }
      const data: Parking[] = await response.json()
      setParkings(data)
      addMarkers(data)
    } catch (error) {
      console.error('Error obteniendo parqueaderos:', error)
      const fallback = await fetch('http://localhost:3000/api/v1/parkings')
      if (fallback.ok) {
        const allData: Parking[] = await fallback.json()
        setParkings(allData)
        addMarkers(allData)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoToUser = () => {
    const map = mapRef.current
    if (map && userLocation) {
      map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13 })
    }
  }

  return (
    <div className="parking-map-container">
      <div className="parking-map-header">
        <h2>🗺️ Parqueaderos Disponibles</h2>
        <div className="map-controls">
          <button
            onClick={handleGoToUser}
            className="location-button"
            title="Mi ubicación"
          >
            📍
          </button>
        </div>
      </div>

      <div className="map-wrapper">
        <div ref={mapContainer} id="parking-map" className="parking-map" />

        {loading && <div className="loading-overlay">Cargando parqueaderos...</div>}

        {selectedParking && (
          <div className="parking-details">
            <button className="close-button" onClick={() => setSelectedParking(null)}>
              ✕
            </button>
            <h3>{selectedParking.spot_num}</h3>
            <div className="detail-item">
              <strong>Dirección:</strong>
              <p>{selectedParking.address}</p>
            </div>
            <div className="detail-item">
              <strong>Precio:</strong>
              <p className="price">${selectedParking.price} COP/hora</p>
            </div>
            <div className="detail-item">
              <strong>Estado:</strong>
              <p className={`status ${selectedParking.status}`}>
                {selectedParking.status === 'available' ? '✓ Disponible' : '✗ Ocupado'}
              </p>
            </div>
            {selectedParking.description && (
              <div className="detail-item">
                <strong>Detalles:</strong>
                <p>{selectedParking.description}</p>
              </div>
            )}
            {selectedParking.status === 'available' && (
              <button className="reserve-button">Reservar</button>
            )}
          </div>
        )}
      </div>

      <div className="parkings-list">
        <h3>Parqueaderos Cercanos ({parkings.length})</h3>
        <div className="parkings-grid">
          {parkings.map((parking) => (
            <div
              key={parking.id}
              className={`parking-card ${parking.status === 'available' ? 'available' : 'occupied'}`}
              onClick={() => {
                setSelectedParking(parking)
                if (mapRef.current) {
                  mapRef.current.flyTo({ center: [parking.longitude, parking.latitude], zoom: 15 })
                }
              }}
            >
              <div className="card-header">
                <h4>{parking.spot_num}</h4>
                <span className={`status-badge ${parking.status}`}>
                  {parking.status === 'available' ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
              <p className="address">📍 {parking.address}</p>
              <p className="price">💰 ${parking.price} COP/hora</p>
              {parking.description && <p className="description">{parking.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
