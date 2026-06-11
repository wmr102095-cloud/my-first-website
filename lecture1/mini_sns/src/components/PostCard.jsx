import { useState } from 'react'
import { Box, Avatar, Typography, IconButton, Divider } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function PostCard({ post, onRefresh }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [liked, setLiked] = useState(post.user_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [liking, setLiking] = useState(false)

  const author = post.sns_users

  const handleLike = async () => {
    if (!profile || liking) return
    setLiking(true)
    if (liked) {
      await supabase.from('sns_likes').delete()
        .eq('user_id', profile.id).eq('post_id', post.id)
      setLiked(false)
      setLikesCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('sns_likes').insert({ user_id: profile.id, post_id: post.id })
      setLiked(true)
      setLikesCount(c => c + 1)
    }
    setLiking(false)
  }

  return (
    <Box sx={{ bgcolor: '#fff', mb: 1.5 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1.5 }}>
        <Avatar
          src={author?.avatar_url}
          sx={{ width: 34, height: 34, cursor: 'pointer', border: '2px solid #dbdbdb' }}
          onClick={() => navigate(`/profile/${author?.id}`)}
        >
          {author?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Typography
          fontWeight={700}
          fontSize="0.88rem"
          sx={{ cursor: 'pointer', flex: 1 }}
          onClick={() => navigate(`/profile/${author?.id}`)}
        >
          {author?.username}
        </Typography>
        <Typography variant="caption" color="text.secondary">{timeAgo(post.created_at)}</Typography>
      </Box>

      {/* 이미지 */}
      {post.image_url && (
        <Box
          component="img"
          src={post.image_url}
          alt="post"
          onDoubleClick={handleLike}
          sx={{ width: '100%', display: 'block', maxHeight: 500, objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => navigate(`/post/${post.id}`)}
        />
      )}

      {/* 액션 */}
      <Box sx={{ px: 1, pt: 0.5, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleLike} size="small" sx={{ color: liked ? '#ed4956' : '#262626' }}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <IconButton size="small" onClick={() => navigate(`/post/${post.id}`)} sx={{ color: '#262626' }}>
          <ChatBubbleOutlineRoundedIcon />
        </IconButton>
      </Box>

      {/* 좋아요 수 */}
      {likesCount > 0 && (
        <Typography fontWeight={700} fontSize="0.88rem" sx={{ px: 2 }}>
          좋아요 {likesCount.toLocaleString()}개
        </Typography>
      )}

      {/* 캡션 */}
      {post.caption && (
        <Box sx={{ px: 2, pb: 0.5, mt: 0.25 }}>
          <Typography component="span" fontWeight={700} fontSize="0.88rem" sx={{ mr: 1 }}>
            {author?.username}
          </Typography>
          <Typography component="span" fontSize="0.88rem">{post.caption}</Typography>
        </Box>
      )}

      {/* 댓글 보기 */}
      {post.comment_count > 0 && (
        <Typography
          fontSize="0.85rem"
          color="text.secondary"
          sx={{ px: 2, pb: 1, cursor: 'pointer' }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          댓글 {post.comment_count}개 모두 보기
        </Typography>
      )}

      <Divider sx={{ mt: 1 }} />
    </Box>
  )
}
