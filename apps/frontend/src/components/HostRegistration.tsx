import { useState } from 'react';
import '../styles/HostRegistration.css';

interface HostRegistrationProps {
  onSuccess?: (user: any) => void;
}

export default function HostRegistration({ onSuccess }: HostRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location,
          role: 'anfitrión'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al registrar');
        return;
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      
      if (onSuccess) {
        onSuccess(user);
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: ''
      });
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-registration-container">
      <div className="host-registration-card">
        <h2>Crear Cuenta de Anfitrión</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Ubicación/Ciudad</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Medellín, Bogotá, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
              required
            />
            <small>Mín. 8 caracteres, mayúscula, número y símbolo (!@#$%^&*)</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
