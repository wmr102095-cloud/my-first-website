import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import Login from './pages/Login'
import Register from './pages/Register'
import Store from './pages/Store'
import Library from './pages/Library'
import GameDetail from './pages/GameDetail'
import Feed from './pages/Feed'
import PostDetail from './pages/PostDetail'
import PostWrite from './pages/PostWrite'
import Profile from './pages/Profile'
import Friends from './pages/Friends'

function LauncherLayout() {
  const { session, loading } = useAuth()
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1b2838' }}>
      <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
    </Box>
  )
  if (!session) return <Navigate to="/login" replace />
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#1b2838' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: '220px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopHeader />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
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
      <Route element={<LauncherLayout />}>
        <Route path="/" element={<Store />} />
        <Route path="/library" element={<Library />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/community" element={<Feed />} />
        <Route path="/write" element={<PostWrite />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
