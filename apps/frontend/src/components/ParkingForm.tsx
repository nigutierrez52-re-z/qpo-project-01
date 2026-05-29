import { useState, useEffect } from 'react';
import '../styles/HostRegistration.css';

interface ParkingFormProps {
  hostId: number;
  onSuccess?: (parking: any) => void;
}

export default function ParkingForm({ hostId, onSuccess }: ParkingFormProps) {
  const [formData, setFormData] = useState({
    spot_num: '',
    price: '',
    description: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Obtener ubicación actual del navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.spot_num || !formData.price || !formData.address || !formData.latitude || !formData.longitude) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/parkings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host_id: hostId,
          spot_num: formData.spot_num,
          price: parseFloat(formData.price),
          description: formData.description,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          status: 'available'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al crear parqueadero');
        return;
      }

      const parking = await response.json();
      setSuccessMessage('¡Parqueadero creado exitosamente!');
      
      if (onSuccess) {
        onSuccess(parking);
      }

      setFormData({
        spot_num: '',
        price: '',
        description: '',
        address: '',
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parking-form-container">
      <div className="parking-form-card">
        <h2>Agregar Nuevo Parqueadero</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="spot_num">Número de Puesto</label>
            <input
              type="text"
              id="spot_num"
              name="spot_num"
              value={formData.spot_num}
              onChange={handleChange}
              placeholder="Ej: A-101, B-45"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Calle 10 # 45-20, Piso 3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitud</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="4.7110"
                step="0.0001"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitud</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="-74.0721"
                step="0.0001"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio por Hora (COP)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="5000"
              min="0"
              step="500"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Techado, seguridad 24/7, cámaras"
              rows={3}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creando...' : 'Crear Parqueadero'}
          </button>
        </form>
      </div>
    </div>
  );
}
