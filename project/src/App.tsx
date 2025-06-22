import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import Account from './pages/Account'
import MinesGame from './pages/games/MinesGame'
import DiceGame from './pages/games/DiceGame'
import BlackjackGame from './pages/games/BlackjackGame'
import LimboGame from './pages/games/LimboGame'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" />
  }
  
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/games" element={<Games />} />
                      <Route path="/games/mines" element={<MinesGame />} />
                      <Route path="/games/dice" element={<DiceGame />} />
                      <Route path="/games/blackjack" element={<BlackjackGame />} />
                      <Route path="/games/limbo" element={<LimboGame />} />
                      <Route path="/account" element={<Account />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App