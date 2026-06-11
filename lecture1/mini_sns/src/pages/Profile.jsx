import { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Avatar, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GridOnIcon from '@mui/icons-material/GridOn'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
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

  useEffect(() => { fetchUser(); fetchPosts() }, [id])

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
    await supabase.from('sns_users').update({ display_name: editForm.display_name, bio: editForm.bio }).eq('id', myProfile.id)
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1b2838' }}>
      <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
    </Box>
  )
  if (!user) return null

  return (
    <Box sx={{ bgcolor: '#1b2838', minHeight: '100vh' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1, bgcolor: '#16202d', borderBottom: '1px solid #2a475e', position: 'sticky', top: 0, zIndex: 10 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#c6d4df' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#c6d4df', flex: 1, ml: 0.5 }}>{user.username}</Typography>
      </Box>

      {/* 프로필 영역 */}
      <Box sx={{ px: 3, pt: 3, pb: 2, maxWidth: 640, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
          <Avatar
            src={user.avatar_url}
            sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: '#2a475e', border: '3px solid #3d6b8e', color: '#66c0f4' }}
          >
            {user.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#c6d4df' }}>{posts.length}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>게시물</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#c6d4df' }}>
          {user.display_name || user.username}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mt: 0.3 }}>@{user.username}</Typography>
        {user.bio && (
          <Typography sx={{ fontSize: '0.88rem', color: '#a8cfe8', mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
            {user.bio}
          </Typography>
        )}

        {isMe && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              fullWidth variant="outlined" size="small"
              startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
              onClick={openEdit}
              sx={{ borderColor: '#2a475e', color: '#c6d4df', fontWeight: 600, height: 34, fontSize: '0.82rem', '&:hover': { borderColor: '#66c0f4', bgcolor: '#2a475e' } }}
            >
              프로필 편집
            </Button>
            <Button
              fullWidth variant="outlined" size="small"
              startIcon={<LogoutIcon sx={{ fontSize: '0.9rem' }} />}
              onClick={handleLogout}
              sx={{ borderColor: '#2a475e', color: '#ef4444', fontWeight: 600, height: 34, fontSize: '0.82rem', '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
            >
              로그아웃
            </Button>
          </Box>
        )}
      </Box>

      {/* 게시물 탭 구분선 */}
      <Divider sx={{ borderColor: '#2a475e' }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.2, gap: 0.6, color: '#66c0f4', borderBottom: '2px solid #66c0f4', maxWidth: 640, mx: 'auto' }}>
        <GridOnIcon sx={{ fontSize: '1rem' }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#66c0f4' }}>게시물</Typography>
      </Box>

      {/* 포스트 그리드 */}
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
          {posts.map((post) => (
            <Box
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              sx={{ position: 'relative', paddingTop: '100%', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            >
              {post.image_url ? (
                <Box
                  component="img" src={post.image_url} alt=""
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#16202d', border: '1px solid #2a475e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>텍스트</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {posts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#8fa4b9', fontSize: '0.9rem' }}>아직 게시물이 없습니다.</Typography>
          </Box>
        )}
      </Box>

      {/* 프로필 편집 다이얼로그 */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#c6d4df', borderBottom: '1px solid #2a475e' }}>
          프로필 편집
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5 }}>표시 이름</Typography>
          <TextField
            fullWidth size="small"
            value={editForm.display_name}
            onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5 }}>소개글</Typography>
          <TextField
            fullWidth size="small" multiline rows={3}
            value={editForm.bio}
            onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
            inputProps={{ maxLength: 150 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #2a475e' }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#8fa4b9' }}>취소</Button>
          <Button variant="contained" color="primary" onClick={handleEdit}>저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
