import { useState, useEffect } from 'react'
import LandingSearch from './components/LandingSearch'
import OpportunitySearch from './components/OpportunitySearch'
import OpportunityDashboard from './components/OpportunityDashboard'
import AuthForm from './components/AuthForm'
import { AuthService, AuthData, User } from './utils/auth'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'dashboard' | 'auth'>('auth')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated on app load
    if (AuthService.isAuthenticated()) {
      AuthService.getCurrentUser()
        .then(userData => {
          setUser(userData)
          setIsAuthenticated(true)
          setCurrentView('dashboard')
        })
        .catch(() => {
          AuthService.logout()
          setCurrentView('auth')
        })
    }
  }, [])

  const handleAuth = async (authData: AuthData) => {
    setAuthLoading(true)
    try {
      if (authData.isLogin) {
        await AuthService.login(authData.email, authData.password)
      } else {
        await AuthService.register(authData.email, authData.password, authData.full_name!)
        await AuthService.login(authData.email, authData.password)
      }
      
      const userData = await AuthService.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)
      setCurrentView('dashboard')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView('auth')
  }

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentView('search')
  }

  if (!isAuthenticated) {
    return <AuthForm onSubmit={handleAuth} loading={authLoading} />
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                RFQ Intelligence
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('search')}
                  className="text-sm text-blue-600 font-medium"
                >
                  Search
                </button>
                <span className="text-sm text-gray-600">Welcome, {user?.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <OpportunitySearch initialKeyword={searchKeyword} autoRun={true} />
      </div>
    )
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                RFQ Intelligence
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-sm text-blue-600 font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('search')}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Search
                </button>
                <span className="text-sm text-gray-600">Welcome, {user?.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <OpportunityDashboard />
      </div>
    )
  }

  return (
    <LandingSearch onSubmit={handleSearch} />
  )
}

export default App