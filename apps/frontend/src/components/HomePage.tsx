import { useState, useEffect } from 'react'
import ParkingForm from './ParkingForm'
import ParkingList from './ParkingList'
import '../styles/HomePage.css'

interface HomePageProps {
  user: any
  onLogout?: () => void
  onNavigate?: (section: string) => void
}

interface Parking {
  id: number
  host_id: number
  spot_num: string
  price: number
  description: string
  address: string
  latitude: number
  longitude: number
  status: string
  created_at?: string
}

export default function HomePage({ user, onLogout, onNavigate }: HomePageProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showAddParkingForm, setShowAddParkingForm] = useState(false)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loadingParkings, setLoadingParkings] = useState(false)

  const handleAddParking = () => {
    setShowAddParkingForm(prev => !prev)
  }

  const loadUserParkings = async () => {
    if (!user.id) return
    setLoadingParkings(true)
    try {
      const response = await fetch(`http://localhost:3000/api/v1/parkings/host/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const normalizedParkings = Array.isArray(data)
          ? data.map((parking: any) => ({
              ...parking,
              price: Number(parking.price),
              latitude: Number(parking.latitude),
              longitude: Number(parking.longitude)
            }))
          : []
        setParkings(normalizedParkings)
      }
    } catch (error) {
      console.error('Error cargando parqueaderos:', error)
    } finally {
      setLoadingParkings(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'admin' && user.role === 'admin') {
      loadUserParkings()
    }
  }, [activeSection, user])

  const handleNavigation = (section: string) => {
    setActiveSection(section)
    if (onNavigate) {
      onNavigate(section)
    }
  }

  const getRoleDisplay = () => {
    const roleMap: Record<string, string> = {
      conductor: ' Conductor',
      admin: ' Administrador',
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
               Dashboard
            </button>
            <button
              className={`nav-item ${activeSection === 'parking' ? 'active' : ''}`}
              onClick={() => handleNavigation('parking')}
            >
               Parqueaderos
            </button>
            <button
              className={`nav-item ${activeSection === 'reservations' ? 'active' : ''}`}
              onClick={() => handleNavigation('reservations')}
            >
               Mis Reservas
            </button>
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavigation('profile')}
            >
               Perfil
            </button>
            {user.role === 'admin' && (
              <button
                className={`nav-item ${activeSection === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavigation('admin')}
              >
                 Administración
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
                  <h3> Estadísticas</h3>
                  <p>Bienvenido a QPO</p>
                  <p className="card-stat">0 Reservas activas</p>
                </div>
                <div className="dashboard-card">
                  <h3> Parqueaderos cercanos</h3>
                  <p>Encontramos 0 parqueaderos</p>
                  <p className="card-stat">en tu área</p>
                </div>
                <div className="dashboard-card">
                  <h3> Transacciones</h3>
                  <p>Historial de pagos</p>
                  <p className="card-stat">$0.00 total</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'parking' && (
            <div className="content-section">
              <ParkingList userId={user.id} />
            </div>
          )}

          {activeSection === 'reservations' && (
            <div className="content-section">
              <h2>Mis Reservas</h2>
              <div className="empty-state">
                <p> No tienes reservas</p>
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
              <div className="content-header-row">
                <h2>Panel de Administración</h2>
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
              </div>

              {showAddParkingForm ? (
                <ParkingForm hostId={user.id} onSuccess={() => {
                  setShowAddParkingForm(false)
                  loadUserParkings()
                }} />
              ) : (
                <div>
                  {loadingParkings ? (
                    <div className="empty-state">
                      <p>Cargando parqueaderos...</p>
                    </div>
                  ) : parkings.length > 0 ? (
                    <div className="parkings-grid">
                      {parkings.map(parking => (
                        <div key={parking.id} className="parking-card">
                          <div className="parking-card-header">
                            <h3>{parking.spot_num}</h3>
                            <span className={`status-badge ${parking.status}`}>
                              {parking.status === 'available' ? ' Disponible' : ' No disponible'}
                            </span>
                          </div>
                          <div className="parking-card-body">
                            <p className="price"><strong>${Number(parking.price).toLocaleString('es-CO')}</strong>/hora</p>
                            <p className="address"> {parking.address}</p>
                            {parking.description && <p className="description">{parking.description}</p>}
                            <p className="coordinates">
                              Lat: {typeof parking.latitude === 'number' ? parking.latitude.toFixed(4) : parking.latitude}, Lng: {typeof parking.longitude === 'number' ? parking.longitude.toFixed(4) : parking.longitude}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p> No tienes parqueaderos registrados</p>
                      <p className="text-small">Haz clic en "Agregar Parqueadero" para crear uno</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
