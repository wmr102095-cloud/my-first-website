import { useState, useEffect, useCallback } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import PostCard from '../components/PostCard'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sns_posts')
      .select(`
        *,
        sns_users ( id, username, display_name, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(30)

    if (!data) { setLoading(false); return }

    // 좋아요 여부 확인
    if (profile) {
      const postIds = data.map(p => p.id)
      const { data: myLikes } = await supabase
        .from('sns_likes')
        .select('post_id')
        .eq('user_id', profile.id)
        .in('post_id', postIds)

      const likedSet = new Set((myLikes || []).map(l => l.post_id))
      const postsWithLike = data.map(p => ({ ...p, user_liked: likedSet.has(p.id) }))
      setPosts(postsWithLike)
    } else {
      setPosts(data.map(p => ({ ...p, user_liked: false })))
    }
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <TopBar />
      <Box className="page" sx={{ pt: '56px', pb: '64px', maxWidth: 600, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={28} sx={{ color: '#0095f6' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}>
            <Typography color="text.secondary">아직 게시물이 없습니다.</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              첫 게시물을 작성해보세요! ✏️
            </Typography>
          </Box>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
          ))
        )}
      </Box>
      <BottomNav />
    </Box>
  )
}
