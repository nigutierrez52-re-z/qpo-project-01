import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import HomePage from './components/HomePage'
import './App.css'

function App() {
  const [view, setView] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleRegisterSuccess = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setView('login')
  }

  if (user) {
    return <HomePage user={user} onLogout={handleLogout} />
  }

  return (
    <div className="app-shell">
      {view === 'login' ? (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setView('register')}
        />
      ) : (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setView('login')}
        />
      )}
    </div>
  )
}

export default App
