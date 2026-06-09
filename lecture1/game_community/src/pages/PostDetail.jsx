import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Paper, Button,
  Avatar, Divider, TextField, IconButton, Alert,
  CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CommentIcon from '@mui/icons-material/Comment'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import { supabase } from '../supabaseClient'

const BRANDS = {
  benz: { label: 'BENZ', logo: `${import.meta.env.BASE_URL}logos/mercedes.webp`, color: '#e8e8e8' },
  audi: { label: 'AUDI', logo: `${import.meta.env.BASE_URL}logos/audi.svg`,      color: '#e30613' },
  bmw:  { label: 'BMW',  logo: `${import.meta.env.BASE_URL}logos/bmw.svg`,       color: '#1c69d4' },
}

export default function PostDetail({ profile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, title, content, brand, created_at,
        users(id, username),
        likes(id, user_id),
        comments(id, content, created_at, users(id, username))
      `)
      .eq('id', id)
      .single()

    if (!error) setPost(data)
    setLoading(false)
  }

  const handleLike = async () => {
    if (!profile) { navigate('/login'); return }

    const existingLike = post.likes?.find(l => l.user_id === profile.id)

    if (existingLike) {
      await supabase.from('likes').delete().eq('id', existingLike.id)
      setPost(prev => ({ ...prev, likes: prev.likes.filter(l => l.id !== existingLike.id) }))
    } else {
      const { data } = await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: profile.id })
        .select()
        .single()
      if (data) setPost(prev => ({ ...prev, likes: [...(prev.likes || []), data] }))
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return
    if (!profile) { navigate('/login'); return }
    setCommentLoading(true)

    const { data } = await supabase
      .from('comments')
      .insert({ content: comment.trim(), post_id: post.id, user_id: profile.id })
      .select('id, content, created_at, users(id, username)')
      .single()

    if (data) {
      setPost(prev => ({ ...prev, comments: [...(prev.comments || []), data] }))
      setComment('')
    }
    setCommentLoading(false)
  }

  const handleDeleteComment = async (commentId) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setPost(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }))
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('ko-KR')
  const isLiked = post?.likes?.some(l => l.user_id === profile?.id)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: '64px' }}>
        <Alert severity="error">게시글을 찾을 수 없습니다.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>목록으로</Button>
      </Container>
    )
  }

  const brandInfo = post.brand ? BRANDS[post.brand] : null

  return (
    <Container maxWidth="md" sx={{ py: 3, mt: '64px' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        게시판으로
      </Button>

      {/* 게시글 본문 */}
      <Paper sx={{
        p: 3, mb: 2,
        ...(brandInfo && {
          borderTop: `2px solid ${brandInfo.color}66`,
          boxShadow: `0 0 20px ${brandInfo.color}08`,
        }),
      }}>
        {/* 브랜드 배지 */}
        {brandInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <img
              src={brandInfo.logo}
              alt={brandInfo.label}
              style={{ width: 16, height: 16, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
            />
            <Typography variant="caption" fontWeight={700} sx={{ color: brandInfo.color, letterSpacing: 1 }}>
              {brandInfo.label}
            </Typography>
          </Box>
        )}

        <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary', mb: 2, lineHeight: 1.4 }}>
          {post.title}
        </Typography>

        {/* 작성자 정보 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.dark', width: 36, height: 36, fontWeight: 700 }}>
            {post.users?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {post.users?.username || '알 수 없음'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.created_at)}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 14, color: '#ff6b6b' }} />
              <Typography variant="caption" color="text.secondary">{post.likes?.length || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">{post.comments?.length || 0}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 본문 */}
        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>

        {/* 좋아요 버튼 */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            startIcon={isLiked ? <FavoriteIcon sx={{ color: '#ff6b6b' }} /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            variant={isLiked ? 'contained' : 'outlined'}
            size="small"
            sx={{
              borderColor: isLiked ? 'transparent' : '#ff6b6b44',
              color: isLiked ? '#080808' : '#ff6b6b',
              bgcolor: isLiked ? '#ff6b6b' : 'transparent',
              '&:hover': { bgcolor: isLiked ? '#ff5252' : '#ff6b6b11' },
            }}
          >
            좋아요 {post.likes?.length || 0}
          </Button>
        </Box>
      </Paper>

      {/* 댓글 섹션 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon sx={{ color: 'primary.main' }} />
          댓글 {post.comments?.length || 0}개
        </Typography>

        {/* 댓글 입력 */}
        {profile ? (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.dark', flexShrink: 0, fontWeight: 700 }}>
              {profile.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <TextField
                multiline
                minRows={1}
                maxRows={4}
                placeholder="댓글을 입력하세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleCommentSubmit()
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleCommentSubmit}
                disabled={!comment.trim() || commentLoading}
                sx={{
                  bgcolor: comment.trim() ? 'rgba(232,232,232,0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: comment.trim() ? 'primary.main' : 'divider',
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Paper sx={{
            p: 2, mb: 3, textAlign: 'center',
            bgcolor: 'rgba(232,232,232,0.02)',
            border: '1px dashed rgba(232,232,232,0.15)',
          }}>
            <Typography variant="body2" color="text.secondary">
              댓글을 작성하려면{' '}
              <Typography
                component="span"
                variant="body2"
                color="primary.main"
                sx={{ cursor: 'pointer', fontWeight: 700 }}
                onClick={() => navigate('/login')}
              >
                로그인
              </Typography>
              이 필요합니다.
            </Typography>
          </Paper>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* 댓글 목록 */}
        {!post.comments?.length ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {post.comments.map(c => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.dark', width: 36, height: 36, flexShrink: 0, fontWeight: 700 }}>
                  {c.users?.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {c.users?.username || '알 수 없음'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {formatDate(c.created_at)}
                    </Typography>
                    {profile && c.users?.id === profile.id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteComment(c.id)}
                        sx={{ p: 0.3, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                    {c.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  )
}
