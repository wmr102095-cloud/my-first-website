import { useState, useEffect, useCallback } from 'react'
import { Box, CircularProgress, Typography, Fab } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import PostCard from '../components/PostCard'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const navigate = useNavigate()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sns_posts')
      .select('*, sns_users ( id, username, display_name, avatar_url )')
      .order('created_at', { ascending: false })
      .limit(30)

    if (!data) { setLoading(false); return }

    if (profile) {
      const postIds = data.map((p) => p.id)
      const { data: myLikes } = await supabase.from('sns_likes').select('post_id').eq('user_id', profile.id).in('post_id', postIds)
      const likedSet = new Set((myLikes || []).map((l) => l.post_id))
      setPosts(data.map((p) => ({ ...p, user_liked: likedSet.has(p.id) })))
    } else {
      setPosts(data.map((p) => ({ ...p, user_liked: false })))
    }
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <Box sx={{ bgcolor: '#1b2838', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: '1px solid #2a475e' }}>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#c6d4df' }}>커뮤니티</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', mt: 0.3 }}>게이머들의 이야기를 공유하세요</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}>
            <Typography sx={{ color: '#8fa4b9' }}>아직 게시물이 없습니다.</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#8fa4b9', mt: 0.5 }}>첫 게시물을 작성해보세요!</Typography>
          </Box>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onRefresh={fetchPosts} />)
        )}
      </Box>

      {/* FAB for writing */}
      <Fab
        color="primary"
        onClick={() => navigate('/write')}
        sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#66c0f4', '&:hover': { bgcolor: '#4aabf0' } }}
      >
        <EditIcon />
      </Fab>
    </Box>
  )
}
