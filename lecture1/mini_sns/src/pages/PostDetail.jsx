import { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Avatar, TextField, Button, CircularProgress, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { getGameById } from '../data/nexonGames'

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

  useEffect(() => { fetchPost(); fetchComments() }, [id])

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
        const { data: like } = await supabase.from('sns_likes').select('id').eq('user_id', profile.id).eq('post_id', id).maybeSingle()
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
      setLiked(false); setLikesCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('sns_likes').insert({ user_id: profile.id, post_id: id })
      setLiked(true); setLikesCount((c) => c + 1)
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1b2838' }}>
      <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
    </Box>
  )
  if (!post) return null

  const author = post.sns_users
  const game = post.game_id ? getGameById(post.game_id) : null

  return (
    <Box sx={{ bgcolor: '#1b2838', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1, bgcolor: '#16202d', borderBottom: '1px solid #2a475e', position: 'sticky', top: 0, zIndex: 10 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#c6d4df' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#c6d4df', ml: 0.5 }}>게시물</Typography>
      </Box>

      <Box sx={{ flex: 1, maxWidth: 640, mx: 'auto', width: '100%', pb: 10 }}>
        {/* 게임 뱃지 */}
        {game && (
          <Box
            onClick={() => navigate(`/game/${game.id}`)}
            sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          >
            <SportsEsportsIcon sx={{ fontSize: '0.9rem', color: game.accentColor }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: game.accentColor }}>{game.title}</Typography>
          </Box>
        )}

        {/* 작성자 */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1.5 }}>
          <Avatar
            src={author?.avatar_url}
            onClick={() => navigate(`/profile/${author?.id}`)}
            sx={{ width: 36, height: 36, cursor: 'pointer', bgcolor: '#2a475e', border: '2px solid #3d6b8e' }}
          >
            {author?.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c6d4df', cursor: 'pointer' }} onClick={() => navigate(`/profile/${author?.id}`)}>
              {author?.username}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>{timeAgo(post.created_at)}</Typography>
          </Box>
        </Box>

        {/* 이미지 */}
        {post.image_url && (
          <Box component="img" src={post.image_url} alt="post" sx={{ width: '100%', display: 'block', maxHeight: 520, objectFit: 'cover' }} />
        )}

        {/* 액션 */}
        <Box sx={{ px: 1, pt: 0.5, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleLike} size="small" sx={{ color: liked ? '#ed4956' : '#8fa4b9', '&:hover': { color: '#ed4956' } }}>
            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        {likesCount > 0 && (
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', px: 2, color: '#c6d4df' }}>
            좋아요 {likesCount.toLocaleString()}개
          </Typography>
        )}

        {post.caption && (
          <Box sx={{ px: 2, py: 0.8 }}>
            <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.9rem', mr: 1, color: '#c6d4df' }}>{author?.username}</Typography>
            <Typography component="span" sx={{ fontSize: '0.9rem', color: '#a8cfe8' }}>{post.caption}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5, borderColor: '#2a475e' }} />

        {/* 댓글 목록 */}
        <Box sx={{ px: 2, pb: 2 }}>
          {comments.length === 0 ? (
            <Typography sx={{ color: '#8fa4b9', fontSize: '0.85rem', textAlign: 'center', py: 3 }}>
              첫 댓글을 남겨보세요
            </Typography>
          ) : (
            comments.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Avatar
                  src={c.sns_users?.avatar_url}
                  onClick={() => navigate(`/profile/${c.sns_users?.id}`)}
                  sx={{ width: 30, height: 30, flexShrink: 0, cursor: 'pointer', bgcolor: '#2a475e', border: '1px solid #3d6b8e' }}
                >
                  {c.sns_users?.display_name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.85rem', mr: 1, color: '#c6d4df' }}>{c.sns_users?.username}</Typography>
                  <Typography component="span" sx={{ fontSize: '0.85rem', color: '#a8cfe8' }}>{c.content}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9', mt: 0.3 }}>{timeAgo(c.created_at)}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* 댓글 입력 — 하단 고정 */}
      {profile && (
        <Box sx={{
          position: 'fixed', bottom: 0, left: '220px', right: 0,
          bgcolor: '#16202d', borderTop: '1px solid #2a475e',
          px: 2, py: 1.2, display: 'flex', gap: 1.5, alignItems: 'center',
          zIndex: 50,
        }}>
          <Avatar sx={{ width: 30, height: 30, flexShrink: 0, bgcolor: '#2a475e', fontSize: '0.8rem', border: '2px solid #3d6b8e' }}>
            {profile.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <TextField
            fullWidth size="small"
            placeholder="댓글 달기..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
            multiline maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a475e',
                '& fieldset': { border: 'none' },
                '& textarea': { color: '#c6d4df', fontSize: '0.88rem' },
                '& textarea::placeholder': { color: '#8fa4b9' },
              },
            }}
          />
          <Button
            size="small"
            onClick={handleComment}
            disabled={!newComment.trim() || posting}
            sx={{ color: '#66c0f4', fontWeight: 700, minWidth: 'auto', flexShrink: 0, '&:disabled': { color: '#4c7b9a' } }}
          >
            {posting ? <CircularProgress size={16} sx={{ color: '#66c0f4' }} /> : '게시'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
