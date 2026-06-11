import { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Grid, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SettingsIcon from '@mui/icons-material/Settings'
import GridOnIcon from '@mui/icons-material/GridOn'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile: myProfile, refreshProfile } = useAuth()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' })

  const isMe = myProfile && String(myProfile.id) === String(id)

  useEffect(() => {
    fetchUser()
    fetchPosts()
  }, [id])

  const fetchUser = async () => {
    const { data } = await supabase.from('sns_users').select('*').eq('id', id).single()
    setUser(data)
    setLoading(false)
  }

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('sns_posts')
      .select('id, image_url, likes_count, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const handleEdit = async () => {
    if (!editForm.display_name.trim()) return
    await supabase.from('sns_users').update({
      display_name: editForm.display_name,
      bio: editForm.bio,
    }).eq('id', myProfile.id)
    setEditOpen(false)
    fetchUser()
    refreshProfile()
  }

  const openEdit = () => {
    setEditForm({ display_name: user?.display_name || '', bio: user?.bio || '' })
    setEditOpen(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={28} sx={{ color: '#0095f6' }} />
    </Box>
  )
  if (!user) return null

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', maxWidth: 600, mx: 'auto' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbdbdb' }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: '#262626' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography fontWeight={700} fontSize="1rem" flex={1} textAlign="center">{user.username}</Typography>
          {isMe && (
            <IconButton edge="end" onClick={handleLogout} sx={{ color: '#262626' }}>
              <SettingsIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* 프로필 정보 */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
          <Avatar
            src={user.avatar_url}
            sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: '#dbdbdb', color: '#8e8e8e' }}
          >
            {user.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={700} fontSize="1rem">{posts.length}</Typography>
                <Typography variant="caption" color="text.secondary">게시물</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography fontWeight={700} fontSize="0.9rem">{user.display_name || user.username}</Typography>
        {user.bio && (
          <Typography fontSize="0.88rem" color="text.secondary" mt={0.5} sx={{ whiteSpace: 'pre-wrap' }}>
            {user.bio}
          </Typography>
        )}

        {isMe && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={openEdit}
              sx={{ borderColor: '#dbdbdb', color: '#262626', fontWeight: 600, borderRadius: 2, height: 32, fontSize: '0.82rem' }}
            >
              프로필 편집
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{ borderColor: '#dbdbdb', color: '#ed4956', fontWeight: 600, borderRadius: 2, height: 32, fontSize: '0.82rem' }}
            >
              로그아웃
            </Button>
          </Box>
        )}
      </Box>

      {/* 탭 구분선 */}
      <Box sx={{ borderTop: '1px solid #dbdbdb', display: 'flex', justifyContent: 'center', py: 1.5, gap: 0.5, color: '#262626' }}>
        <GridOnIcon sx={{ fontSize: '1.1rem' }} />
        <Typography fontSize="0.8rem" fontWeight={700}>게시물</Typography>
      </Box>

      {/* 포스트 그리드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {posts.map(post => (
          <Box
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            sx={{ position: 'relative', paddingTop: '100%', cursor: 'pointer' }}
          >
            {post.image_url ? (
              <Box
                component="img"
                src={post.image_url}
                alt=""
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">텍스트</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {posts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary" fontSize="0.9rem">아직 게시물이 없습니다.</Typography>
        </Box>
      )}

      {/* 프로필 편집 다이얼로그 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>프로필 편집</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="표시 이름"
            size="small"
            value={editForm.display_name}
            onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="소개글"
            size="small"
            multiline
            rows={3}
            value={editForm.bio}
            onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button variant="contained" onClick={handleEdit} sx={{ bgcolor: '#0095f6' }}>저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
