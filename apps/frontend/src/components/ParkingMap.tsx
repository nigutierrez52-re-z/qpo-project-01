import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ParkingMap.css';

interface Parking {
  id: number;
  spot_num: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  status: string;
  description?: string;
}

interface ParkingMapProps {
  onParkingSelect?: (parking: Parking) => void;
  initialLat?: number;
  initialLng?: number;
  radius?: number;
}

export default function ParkingMap({ 
  onParkingSelect, 
  initialLat = 4.7110, 
  initialLng = -74.0721,
  radius = 5
}: ParkingMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Inicializar mapa
  useEffect(() => {
    const container = document.getElementById('parking-map');
    if (!container) return;

    const newMap = L.map('parking-map').setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          if (map) {
            map.setView([lat, lng], 13);
            
            // Marcador de ubicación del usuario
            L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            })
              .addTo(map)
              .bindPopup('Tu ubicación')
              .openPopup();
            
            // Buscar parqueaderos cercanos
            searchParkings(lat, lng, radius);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Usar ubicación por defecto
          searchParkings(initialLat, initialLng, radius);
        }
      );
    }
  }, [map]);

  const searchParkings = async (lat: number, lng: number, radiusKm: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/parkings/search?latitude=${lat}&longitude=${lng}&radius=${radiusKm}`
      );
      
      if (response.ok) {
        const data: Parking[] = await response.json();
        setParkings(data);
        addMarkersToMap(data);
      } else {
        // Si no hay endpoint de búsqueda, obtener todos
        const allResponse = await fetch('http://localhost:3000/api/v1/parkings');
        if (allResponse.ok) {
          const allData: Parking[] = await allResponse.json();
          setParkings(allData);
          addMarkersToMap(allData);
        }
      }
    } catch (error) {
      console.error('Error obteniendo parqueaderos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMarkersToMap = (parkingsData: Parking[]) => {
    if (!map) return;

    // Limpiar marcadores anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== map) {
        map.removeLayer(layer);
      }
    });

    // Agregar marcadores nuevos
    parkingsData.forEach((parking) => {
      const color = parking.status === 'available' ? 'green' : 'red';
      const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;

      const marker = L.marker([parking.latitude, parking.longitude], {
        icon: L.icon({
          iconUrl,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      })
        .addTo(map)
        .bindPopup(`
          <div class="parking-popup">
            <h4>${parking.spot_num}</h4>
            <p><strong>Dirección:</strong> ${parking.address}</p>
            <p><strong>Precio:</strong> $${parking.price}/hora</p>
            <p><strong>Estado:</strong> ${parking.status === 'available' ? 'Disponible' : 'Ocupado'}</p>
            ${parking.description ? `<p><strong>Detalles:</strong> ${parking.description}</p>` : ''}
          </div>
        `)
        .on('click', () => {
          setSelectedParking(parking);
          if (onParkingSelect) {
            onParkingSelect(parking);
          }
        });
    });
  };

  return (
    <div className="parking-map-container">
      <div className="parking-map-header">
        <h2>🗺️ Parqueaderos Disponibles</h2>
        <div className="map-controls">
          <button 
            onClick={() => userLocation && map && map.setView([userLocation.lat, userLocation.lng], 13)}
            className="location-button"
            title="Mi ubicación"
          >
            📍
          </button>
        </div>
      </div>

      <div className="map-wrapper">
        <div id="parking-map" className="parking-map"></div>
        
        {loading && <div className="loading-overlay">Cargando parqueaderos...</div>}

        {selectedParking && (
          <div className="parking-details">
            <button 
              className="close-button" 
              onClick={() => setSelectedParking(null)}
            >
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
                setSelectedParking(parking);
                if (map) {
                  map.setView([parking.latitude, parking.longitude], 15);
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
  );
}
