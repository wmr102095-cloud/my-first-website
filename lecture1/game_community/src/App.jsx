import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import PostWrite from './pages/PostWrite'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (authId) => {
    const { data } = await supabase
      .from('users')
      .select('id, username')
      .eq('auth_id', authId)
      .single()
    setProfile(data || null)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar profile={profile} onLogout={handleLogout} />
                <Routes>
                  <Route path="/" element={<PostList profile={profile} />} />
                  <Route path="/post/:id" element={<PostDetail profile={profile} />} />
                  <Route
                    path="/write"
                    element={profile ? <PostWrite profile={profile} /> : <Navigate to="/login" replace />}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}
