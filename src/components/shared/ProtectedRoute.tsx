import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/data/authContext'

interface ProtectedRouteProps {
  children: React.ReactElement
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect unauthenticated visitor to the staff login page
    const redirectUrl = location.pathname !== '/' ? location.pathname + location.search : '/dashboard'
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace />
  }

  return children
}

