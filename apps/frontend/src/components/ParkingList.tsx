import { useState, useEffect } from 'react';
import '../styles/ParkingList.css';

interface Parking {
  id: number;
  host_id: number;
  spot_num: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  status: string;
  description?: string;
}

interface ParkingListProps {
  hostId?: number;
  showHostParkings?: boolean;
}

export default function ParkingList({ hostId, showHostParkings = false }: ParkingListProps) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('available');

  useEffect(() => {
    fetchParkings();
  }, [hostId, showHostParkings, filter]);

  const fetchParkings = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = 'http://localhost:3000/api/v1/parkings';
      
      if (showHostParkings && hostId) {
        url = `http://localhost:3000/api/v1/parkings/host/${hostId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener parqueaderos');
      }

      let data: Parking[] = await response.json();

      // Filtrar según selección
      if (filter !== 'all') {
        data = data.filter(p => p.status === filter);
      }

      setParkings(data);
    } catch (err) {
      setError('Error al cargar los parqueaderos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (parkingId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/parkings/${parkingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        fetchParkings();
      } else {
        setError('Error al actualizar el estado');
      }
    } catch (err) {
      setError('Error al actualizar el estado');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando parqueaderos...</div>;
  }

  return (
    <div className="parking-list-container">
      <div className="list-header">
        <h2>
          {showHostParkings ? '📍 Mis Parqueaderos' : '🅿️ Parqueaderos Disponibles'}
        </h2>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Disponibles
          </button>
          <button 
            className={`filter-btn ${filter === 'occupied' ? 'active' : ''}`}
            onClick={() => setFilter('occupied')}
          >
            Ocupados
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {parkings.length === 0 ? (
        <div className="empty-state">
          <p>No hay parqueaderos disponibles en este momento</p>
        </div>
      ) : (
        <div className="parkings-table">
          <table>
            <thead>
              <tr>
                <th>Puesto</th>
                <th>Dirección</th>
                <th>Precio/Hora</th>
                <th>Estado</th>
                {showHostParkings && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {parkings.map((parking) => (
                <tr key={parking.id} className={`status-${parking.status}`}>
                  <td className="spot-cell">
                    <strong>{parking.spot_num}</strong>
                    {parking.description && (
                      <small>{parking.description}</small>
                    )}
                  </td>
                  <td>{parking.address}</td>
                  <td className="price-cell">${parking.price.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${parking.status}`}>
                      {parking.status === 'available' ? '✓ Disponible' : '✗ Ocupado'}
                    </span>
                  </td>
                  {showHostParkings && (
                    <td className="actions-cell">
                      <select 
                        value={parking.status}
                        onChange={(e) => handleStatusChange(parking.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="available">Disponible</option>
                        <option value="occupied">Ocupado</option>
                        <option value="reserved">Reservado</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
