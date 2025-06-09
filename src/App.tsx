import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Wallet from './pages/Wallet'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, we'll assume the user is authenticated
  // In a real app, you'd check authentication state here
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, we'll assume the user is not authenticated
  // In a real app, you'd redirect to dashboard if authenticated
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/trading" element={
          <ProtectedRoute>
            <Layout>
              <Trading />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Layout>
              <Wallet />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App