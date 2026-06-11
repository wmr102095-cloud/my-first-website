import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import PostDetail from './pages/PostDetail'
import PostWrite from './pages/PostWrite'
import Profile from './pages/Profile'
import Search from './pages/Search'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={28} sx={{ color: '#0095f6' }} />
    </Box>
  )
  return session ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  return session ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/write" element={<ProtectedRoute><PostWrite /></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Box sx={{ maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#fafafa' }}>
          <AppRoutes />
        </Box>
      </HashRouter>
    </AuthProvider>
  )
}
