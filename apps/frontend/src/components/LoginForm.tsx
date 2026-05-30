import { useState, type FormEvent } from 'react';
import '../styles/LoginForm.css';

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(' Login exitoso');
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Limpiar formulario
        setEmail('');
        setPassword('');
        
        // Callback opcional
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        setError(' ' + (data.message || 'Error en login'));
      }
    } catch (err) {
      setError(' Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">Accede a tu cuenta en QPO</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="signup-link">
          ¿No tienes cuenta?{' '}
          <button type="button" className="link-button" onClick={onSwitchToRegister}>
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
