import { useState } from 'react'
import ParkingForm from './ParkingForm'
import '../styles/HomePage.css'

interface HomePageProps {
  user: any
  onLogout?: () => void
  onNavigate?: (section: string) => void
}

export default function HomePage({ user, onLogout, onNavigate }: HomePageProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showAddParkingForm, setShowAddParkingForm] = useState(false)

  const handleAddParking = () => {
    setShowAddParkingForm(prev => !prev)
  }

  const handleNavigation = (section: string) => {
    setActiveSection(section)
    if (onNavigate) {
      onNavigate(section)
    }
  }

  const getRoleDisplay = () => {
    const roleMap: Record<string, string> = {
      conductor: '🚗 Conductor',
      admin: '⚙️ Administrador',
    }
    return roleMap[user.role] || user.role
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-left">
            <h1>QPO</h1>
            <p>Sistema de Parqueaderos</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{getRoleDisplay()}</span>
            </div>
            <button onClick={onLogout} className="btn-logout">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="home-layout">
        <aside className="home-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-item ${activeSection === 'parking' ? 'active' : ''}`}
              onClick={() => handleNavigation('parking')}
            >
              🅿️ Parqueaderos
            </button>
            <button
              className={`nav-item ${activeSection === 'reservations' ? 'active' : ''}`}
              onClick={() => handleNavigation('reservations')}
            >
              📅 Mis Reservas
            </button>
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavigation('profile')}
            >
              👤 Perfil
            </button>
            {user.role === 'admin' && (
              <button
                className={`nav-item ${activeSection === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavigation('admin')}
              >
                🔧 Administración
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="home-content">
          {activeSection === 'dashboard' && (
            <div className="content-section">
              <h2>Dashboard</h2>
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <h3>📊 Estadísticas</h3>
                  <p>Bienvenido a QPO</p>
                  <p className="card-stat">0 Reservas activas</p>
                </div>
                <div className="dashboard-card">
                  <h3>🅿️ Parqueaderos cercanos</h3>
                  <p>Encontramos 0 parqueaderos</p>
                  <p className="card-stat">en tu área</p>
                </div>
                <div className="dashboard-card">
                  <h3>💰 Transacciones</h3>
                  <p>Historial de pagos</p>
                  <p className="card-stat">$0.00 total</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'parking' && (
            <div className="content-section">
              <div className="content-header-row">
                <h2>Parqueaderos Disponibles</h2>
                {(user.role === 'admin' || user.role === 'host') && (
                  <button
                    className="btn-add-primary"
                    onClick={handleAddParking}
                    style={{
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    + Agregar Parqueadero
                  </button>
                )}
              </div>

              {showAddParkingForm ? (
                <ParkingForm hostId={user.id} onSuccess={() => setShowAddParkingForm(false)} />
              ) : (
                <div className="empty-state">
                  <p>🗺️ Mapa de parqueaderos próximamente</p>
                  <p className="text-small">Aquí podrás ver todos los parqueaderos disponibles en tu zona</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'reservations' && (
            <div className="content-section">
              <h2>Mis Reservas</h2>
              <div className="empty-state">
                <p>📅 No tienes reservas</p>
                <p className="text-small">Haz tu primera reserva desde la sección de parqueaderos</p>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="content-section">
              <h2>Mi Perfil</h2>
              <div className="profile-card">
                <div className="profile-item">
                  <label>Nombre</label>
                  <p>{user.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="profile-item">
                  <label>Rol</label>
                  <p>{getRoleDisplay()}</p>
                </div>
                <div className="profile-item">
                  <label>ID Usuario</label>
                  <p>{user.id || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'admin' && user.role === 'admin' && (
            <div className="content-section">
              <h2>Panel de Administración</h2>
              <div className="empty-state">
                <p>⚙️ Panel administrativo</p>
                <p className="text-small">Gestiona parqueaderos, usuarios y reservas desde aquí</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
