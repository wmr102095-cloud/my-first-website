import { useState } from 'react'
import { Box, AppBar, Toolbar, TextField, InputAdornment, CircularProgress, Avatar, Typography, Grid } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'

export default function Search() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (q) => {
    setQuery(q)
    if (!q.trim()) { setUsers([]); setPosts([]); return }
    setLoading(true)
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from('sns_users').select('id, username, display_name, avatar_url').ilike('username', `%${q}%`).limit(10),
      supabase.from('sns_posts').select('id, image_url').not('image_url', 'is', null).limit(12),
    ])
    setUsers(u || [])
    setPosts(p || [])
    setLoading(false)
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbdbdb' }}>
        <Toolbar sx={{ minHeight: 56, px: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="검색"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8e8e8e', fontSize: '1.1rem' }} /></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#efefef', '& fieldset': { border: 'none' } } }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: '56px', pb: '64px', maxWidth: 600, mx: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress size={24} sx={{ color: '#0095f6' }} /></Box>}

        {/* 사용자 검색 결과 */}
        {users.length > 0 && (
          <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbdbdb' }}>
            {users.map(u => (
              <Box key={u.id} onClick={() => navigate(`/profile/${u.id}`)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#fafafa' } }}>
                <Avatar src={u.avatar_url} sx={{ width: 44, height: 44 }}>{u.display_name?.[0]?.toUpperCase()}</Avatar>
                <Box>
                  <Typography fontWeight={700} fontSize="0.9rem">{u.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{u.display_name}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* 전체 게시물 그리드 (검색어 없을 때) */}
        {!query && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', mt: '2px' }}>
            {posts.map(p => (
              <Box key={p.id} onClick={() => navigate(`/post/${p.id}`)}
                sx={{ position: 'relative', paddingTop: '100%', cursor: 'pointer' }}>
                <Box component="img" src={p.image_url} alt=""
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <BottomNav />
    </Box>
  )
}
