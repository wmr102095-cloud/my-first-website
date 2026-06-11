import { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, TextField, Button, CircularProgress, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return '방금 전'
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  return `${Math.floor(s / 86400)}일 전`
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase
      .from('sns_posts')
      .select('*, sns_users(id, username, display_name, avatar_url)')
      .eq('id', id)
      .single()
    if (data) {
      setPost(data)
      setLikesCount(data.likes_count || 0)
      if (profile) {
        const { data: like } = await supabase
          .from('sns_likes')
          .select('id')
          .eq('user_id', profile.id)
          .eq('post_id', id)
          .maybeSingle()
        setLiked(!!like)
      }
    }
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('sns_comments')
      .select('*, sns_users(id, username, display_name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const handleLike = async () => {
    if (!profile) return
    if (liked) {
      await supabase.from('sns_likes').delete().eq('user_id', profile.id).eq('post_id', id)
      setLiked(false); setLikesCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('sns_likes').insert({ user_id: profile.id, post_id: id })
      setLiked(true); setLikesCount(c => c + 1)
    }
  }

  const handleComment = async () => {
    if (!profile || !newComment.trim()) return
    setPosting(true)
    await supabase.from('sns_comments').insert({ content: newComment.trim(), user_id: profile.id, post_id: Number(id) })
    setNewComment('')
    await fetchComments()
    setPosting(false)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={28} sx={{ color: '#0095f6' }} />
    </Box>
  )

  if (!post) return null

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', maxWidth: 600, mx: 'auto' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbdbdb' }}>
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: '#262626' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography fontWeight={700} fontSize="1rem">게시물</Typography>
        </Toolbar>
      </AppBar>

      {/* 작성자 */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1.5 }}>
        <Avatar src={post.sns_users?.avatar_url} sx={{ width: 34, height: 34 }}>
          {post.sns_users?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700} fontSize="0.88rem">{post.sns_users?.username}</Typography>
          <Typography variant="caption" color="text.secondary">{timeAgo(post.created_at)}</Typography>
        </Box>
      </Box>

      {/* 이미지 */}
      {post.image_url && (
        <Box component="img" src={post.image_url} alt="post" sx={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'cover' }} />
      )}

      {/* 액션 */}
      <Box sx={{ px: 1, pt: 0.5, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleLike} size="small" sx={{ color: liked ? '#ed4956' : '#262626' }}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>

      {likesCount > 0 && (
        <Typography fontWeight={700} fontSize="0.88rem" sx={{ px: 2 }}>좋아요 {likesCount.toLocaleString()}개</Typography>
      )}

      {post.caption && (
        <Box sx={{ px: 2, py: 0.5 }}>
          <Typography component="span" fontWeight={700} fontSize="0.88rem" mr={1}>{post.sns_users?.username}</Typography>
          <Typography component="span" fontSize="0.88rem">{post.caption}</Typography>
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      {/* 댓글 목록 */}
      <Box sx={{ px: 2, pb: 2 }}>
        {comments.length === 0 ? (
          <Typography color="text.secondary" fontSize="0.85rem" textAlign="center" py={2}>
            첫 댓글을 남겨보세요
          </Typography>
        ) : (
          comments.map(c => (
            <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Avatar src={c.sns_users?.avatar_url} sx={{ width: 30, height: 30, flexShrink: 0 }}>
                {c.sns_users?.display_name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography component="span" fontWeight={700} fontSize="0.85rem" mr={1}>{c.sns_users?.username}</Typography>
                <Typography component="span" fontSize="0.85rem">{c.content}</Typography>
                <Typography display="block" variant="caption" color="text.secondary">{timeAgo(c.created_at)}</Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* 댓글 입력 */}
      {profile && (
        <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#fff', borderTop: '1px solid #dbdbdb', px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <Avatar src={profile.avatar_url} sx={{ width: 32, height: 32, flexShrink: 0 }}>
            {profile.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <TextField
            fullWidth
            size="small"
            placeholder="댓글 달기..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
            multiline
            maxRows={3}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiOutlinedInput-root': { bgcolor: 'transparent', p: 0 } }}
          />
          <Button
            size="small"
            onClick={handleComment}
            disabled={!newComment.trim() || posting}
            sx={{ color: '#0095f6', fontWeight: 700, minWidth: 'auto', flexShrink: 0 }}
          >
            {posting ? <CircularProgress size={16} /> : '게시'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
