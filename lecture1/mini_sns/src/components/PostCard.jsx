import { useState } from 'react'
import { Box, Avatar, Typography, IconButton, Divider, Chip } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { getGameById } from '../data/nexonGames'

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
  const game = post.game_id ? getGameById(post.game_id) : null

  const handleLike = async () => {
    if (!profile || liking) return
    setLiking(true)
    if (liked) {
      await supabase.from('sns_likes').delete().eq('user_id', profile.id).eq('post_id', post.id)
      setLiked(false)
      setLikesCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('sns_likes').insert({ user_id: profile.id, post_id: post.id })
      setLiked(true)
      setLikesCount((c) => c + 1)
    }
    setLiking(false)
  }

  return (
    <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, mb: 1.5, overflow: 'hidden' }}>
      {/* 게임 뱃지 */}
      {game && (
        <Box
          onClick={() => navigate(`/game/${game.id}`)}
          sx={{ px: 2, pt: 1.2, pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
        >
          <SportsEsportsIcon sx={{ fontSize: '0.9rem', color: game.accentColor }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: game.accentColor }}>{game.title}</Typography>
        </Box>
      )}

      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.2, gap: 1.5 }}>
        <Avatar
          src={author?.avatar_url}
          sx={{ width: 34, height: 34, cursor: 'pointer', bgcolor: '#2a475e', border: '2px solid #3d6b8e' }}
          onClick={() => navigate(`/profile/${author?.id}`)}
        >
          {author?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#c6d4df', cursor: 'pointer', flex: 1, '&:hover': { color: '#66c0f4' } }}
          onClick={() => navigate(`/profile/${author?.id}`)}
        >
          {author?.username}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>{timeAgo(post.created_at)}</Typography>
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
        <IconButton onClick={handleLike} size="small" sx={{ color: liked ? '#ed4956' : '#8fa4b9', '&:hover': { color: '#ed4956' } }}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <IconButton size="small" onClick={() => navigate(`/post/${post.id}`)} sx={{ color: '#8fa4b9', '&:hover': { color: '#66c0f4' } }}>
          <ChatBubbleOutlineRoundedIcon />
        </IconButton>
      </Box>

      {likesCount > 0 && (
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', px: 2, color: '#c6d4df' }}>
          좋아요 {likesCount.toLocaleString()}개
        </Typography>
      )}

      {post.caption && (
        <Box sx={{ px: 2, pb: 0.5, mt: 0.25 }}>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.88rem', mr: 1, color: '#c6d4df' }}>{author?.username}</Typography>
          <Typography component="span" sx={{ fontSize: '0.88rem', color: '#a8cfe8' }}>{post.caption}</Typography>
        </Box>
      )}

      {post.comment_count > 0 && (
        <Typography
          sx={{ fontSize: '0.82rem', color: '#8fa4b9', px: 2, pb: 1.2, cursor: 'pointer', '&:hover': { color: '#66c0f4' } }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          댓글 {post.comment_count}개 모두 보기
        </Typography>
      )}
    </Box>
  )
}
