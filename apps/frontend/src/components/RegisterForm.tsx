import { useState, type FormEvent } from 'react'
import '../styles/LoginForm.css'

interface RegisterFormProps {
  onRegisterSuccess?: (user: any) => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('conductor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(' Cuenta registrada correctamente')
        localStorage.setItem('user', JSON.stringify(data))
        setName('')
        setEmail('')
        setPassword('')
        setRole('conductor')
        if (onRegisterSuccess) {
          onRegisterSuccess(data)
        }
      } else {
        setError(' ' + (data.message || 'Error en el registro'))
      }
    } catch (err) {
      setError(' Error de conexión con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Crear cuenta</h1>
        <p className="subtitle">Regístrate para comenzar con QPO</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              disabled={loading}
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="conductor">Conductor</option>
              <option value="admin">Anfitrión</option>
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="signup-link">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
}
