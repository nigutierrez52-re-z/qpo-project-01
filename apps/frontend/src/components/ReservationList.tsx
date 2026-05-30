import { useEffect, useState } from 'react'

interface Reservation {
  id: number
  user_id: number
  spot_id: number
  start_time: string
  end_time?: string | null
  total_price?: number | null
  status: 'active' | 'completed' | 'cancelled'
}

interface ReservationListProps {
  userId: number
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

export default function ReservationList({ userId }: ReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  const loadReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:3000/api/v1/reservations/user/${userId}`)
      if (!response.ok) {
        throw new Error('Error al cargar las reservas')
      }
      const data = await response.json()
      setReservations(data)
    } catch (err) {
      setError('No se pudieron cargar las reservaciones. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [userId])

  const handleEditClick = (reservation: Reservation) => {
    setEditingId(reservation.id)
    setEditValues({
      start_time: toDateTimeLocal(reservation.start_time),
      end_time: toDateTimeLocal(reservation.end_time || ''),
      status: reservation.status
    })
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (reservationId: number) => {
    setError('')
    setMessage('')
    try {
      const payload: Record<string, string> = {}
      if (editValues.start_time) payload.start_time = new Date(editValues.start_time).toISOString()
      if (editValues.end_time) payload.end_time = new Date(editValues.end_time).toISOString()
      if (editValues.status) payload.status = editValues.status

      const response = await fetch(`http://localhost:3000/api/v1/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || 'Error al actualizar la reserva')
      }

      await loadReservations()
      setEditingId(null)
      setMessage('Reserva actualizada correctamente')
    } catch (err) {
      setError('No se pudo actualizar la reserva. Revisa los datos e intenta de nuevo.')
      console.error(err)
    }
  }

  const handleDelete = async (reservationId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta reserva?')) return

    setError('')
    setMessage('')
    try {
      const response = await fetch(`http://localhost:3000/api/v1/reservations/${reservationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || 'Error al eliminar la reserva')
      }

      await loadReservations()
      setMessage('Reserva eliminada correctamente')
    } catch (err) {
      setError('No se pudo eliminar la reserva. Intenta nuevamente.')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="empty-state">Cargando reservaciones...</div>
  }

  return (
    <div className="reservations-list-container">
      <div className="list-header">
        <h2>Mis Reservas</h2>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {reservations.length === 0 ? (
        <div className="empty-state">
          <p>Actualmente no tienes reservas activas.</p>
          <p className="text-small">Haz tu primera reserva desde la sección de parqueaderos.</p>
        </div>
      ) : (
        <div className="reservations-table-wrapper">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plaza</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.spot_id}</td>
                  <td>
                    {editingId === reservation.id ? (
                      <input
                        type="datetime-local"
                        value={editValues.start_time || ''}
                        onChange={e => handleChange('start_time', e.target.value)}
                      />
                    ) : (
                      formatDate(reservation.start_time)
                    )}
                  </td>
                  <td>
                    {editingId === reservation.id ? (
                      <input
                        type="datetime-local"
                        value={editValues.end_time || ''}
                        onChange={e => handleChange('end_time', e.target.value)}
                      />
                    ) : (
                      formatDate(reservation.end_time)
                    )}
                  </td>
                  <td>
                    {editingId === reservation.id ? (
                      <select
                        value={editValues.status || reservation.status}
                        onChange={e => handleChange('status', e.target.value)}
                      >
                        <option value="active">Activo</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    ) : (
                      reservation.status === 'active' ? 'Activo' : reservation.status === 'completed' ? 'Completado' : 'Cancelado'
                    )}
                  </td>
                  <td>{reservation.total_price != null ? `$${Number(reservation.total_price).toLocaleString()}` : '—'}</td>
                  <td className="actions-cell">
                    {editingId === reservation.id ? (
                      <>
                        <button className="btn-small primary" onClick={() => handleSave(reservation.id)}>
                          Guardar
                        </button>
                        <button className="btn-small" onClick={handleCancelEdit}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-small" onClick={() => handleEditClick(reservation)}>
                          Editar
                        </button>
                        <button className="btn-small danger" onClick={() => handleDelete(reservation.id)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
