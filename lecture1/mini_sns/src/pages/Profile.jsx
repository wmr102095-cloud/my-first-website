import { useState, useEffect, useCallback } from 'react'
import { Box, IconButton, Typography, Avatar, CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GridOnIcon from '@mui/icons-material/GridOn'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

// none | i_sent | they_sent | friends
const FRIEND_NONE = 'none'
const FRIEND_I_SENT = 'i_sent'
const FRIEND_THEY_SENT = 'they_sent'
const FRIEND_ACCEPTED = 'friends'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile: myProfile, refreshProfile } = useAuth()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' })
  const [friendStatus, setFriendStatus] = useState(FRIEND_NONE)
  const [friendReqId, setFriendReqId] = useState(null)
  const [friendActionLoading, setFriendActionLoading] = useState(false)

  const isMe = myProfile && String(myProfile.id) === String(id)

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.from('sns_users').select('*').eq('id', id).single()
    setUser(data)
  }, [id])

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('sns_posts')
      .select('id, image_url, likes_count, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }, [id])

  const fetchFriendStatus = useCallback(async () => {
    if (!myProfile || isMe) return
    const myId = myProfile.id
    const theirId = Number(id)
    const { data } = await supabase
      .from('sns_friend_requests')
      .select('id, sender_id, receiver_id, status')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${theirId}),and(sender_id.eq.${theirId},receiver_id.eq.${myId})`)
      .maybeSingle()

    if (!data) { setFriendStatus(FRIEND_NONE); setFriendReqId(null) }
    else if (data.status === 'accepted') { setFriendStatus(FRIEND_ACCEPTED); setFriendReqId(data.id) }
    else if (String(data.sender_id) === String(myId)) { setFriendStatus(FRIEND_I_SENT); setFriendReqId(data.id) }
    else { setFriendStatus(FRIEND_THEY_SENT); setFriendReqId(data.id) }
  }, [myProfile, id, isMe])

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUser(), fetchPosts(), fetchFriendStatus()])
      setLoading(false)
    }
    init()
  }, [fetchUser, fetchPosts, fetchFriendStatus])

  const sendFriendRequest = async () => {
    setFriendActionLoading(true)
    const { data } = await supabase
      .from('sns_friend_requests')
      .insert({ sender_id: myProfile.id, receiver_id: Number(id) })
      .select('id').single()
    if (data) { setFriendStatus(FRIEND_I_SENT); setFriendReqId(data.id) }
    setFriendActionLoading(false)
  }

  const cancelRequest = async () => {
    setFriendActionLoading(true)
    await supabase.from('sns_friend_requests').delete().eq('id', friendReqId)
    setFriendStatus(FRIEND_NONE); setFriendReqId(null)
    setFriendActionLoading(false)
  }

  const acceptRequest = async () => {
    setFriendActionLoading(true)
    await supabase.from('sns_friend_requests').update({ status: 'accepted' }).eq('id', friendReqId)
    setFriendStatus(FRIEND_ACCEPTED)
    setFriendActionLoading(false)
  }

  const declineRequest = async () => {
    setFriendActionLoading(true)
    await supabase.from('sns_friend_requests').delete().eq('id', friendReqId)
    setFriendStatus(FRIEND_NONE); setFriendReqId(null)
    setFriendActionLoading(false)
  }

  const unfriend = async () => {
    setFriendActionLoading(true)
    await supabase.from('sns_friend_requests').delete().eq('id', friendReqId)
    setFriendStatus(FRIEND_NONE); setFriendReqId(null)
    setFriendActionLoading(false)
  }

  const goToMessage = async () => {
    const minId = Math.min(myProfile.id, Number(id))
    const maxId = Math.max(myProfile.id, Number(id))
    let { data: conv } = await supabase
      .from('sns_conversations').select('id')
      .eq('user1_id', minId).eq('user2_id', maxId).maybeSingle()
    if (!conv) {
      const { data: created } = await supabase
        .from('sns_conversations')
        .insert({ user1_id: minId, user2_id: maxId })
        .select('id').single()
      conv = created
    }
    if (conv) navigate(`/messages/${conv.id}`)
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

        {/* 내 프로필: 편집 + 로그아웃 */}
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

        {/* 상대 프로필: 메시지 + 친구 요청 버튼 */}
        {!isMe && myProfile && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {/* 메시지 버튼 */}
            <Button
              variant="outlined" size="small"
              startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem' }} />}
              onClick={goToMessage}
              sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, borderColor: '#2a475e', color: '#66c0f4', '&:hover': { borderColor: '#66c0f4', bgcolor: 'rgba(102,192,244,0.06)' } }}
            >
              메시지
            </Button>

            {/* 친구 없음 → 친구 추가 */}
            {friendStatus === FRIEND_NONE && (
              <Button
                variant="contained" size="small"
                startIcon={friendActionLoading ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <PersonAddIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={sendFriendRequest}
                disabled={friendActionLoading}
                sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, bgcolor: '#2a5f8f', boxShadow: 'none', '&:hover': { bgcolor: '#3572a8' } }}
              >
                친구 추가
              </Button>
            )}

            {/* 내가 요청 보냄 → 요청 취소 */}
            {friendStatus === FRIEND_I_SENT && (
              <Button
                variant="outlined" size="small"
                startIcon={friendActionLoading ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <HourglassEmptyIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={cancelRequest}
                disabled={friendActionLoading}
                sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}
              >
                요청 취소
              </Button>
            )}

            {/* 상대가 요청 보냄 → 수락 / 거절 */}
            {friendStatus === FRIEND_THEY_SENT && (
              <>
                <Button
                  variant="contained" size="small"
                  startIcon={friendActionLoading ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <CheckIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={acceptRequest}
                  disabled={friendActionLoading}
                  sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, bgcolor: '#2a5f8f', boxShadow: 'none', '&:hover': { bgcolor: '#3572a8' } }}
                >
                  수락
                </Button>
                <Button
                  variant="outlined" size="small"
                  startIcon={<CloseIcon sx={{ fontSize: '0.9rem' }} />}
                  onClick={declineRequest}
                  disabled={friendActionLoading}
                  sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}
                >
                  거절
                </Button>
              </>
            )}

            {/* 이미 친구 */}
            {friendStatus === FRIEND_ACCEPTED && (
              <Button
                variant="outlined" size="small"
                startIcon={<CheckIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={unfriend}
                disabled={friendActionLoading}
                sx={{ flex: 1, height: 34, fontSize: '0.82rem', fontWeight: 600, borderColor: '#3d6b8e', color: '#66c0f4', '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' } }}
              >
                친구
              </Button>
            )}
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
                <Box component="img" src={post.image_url} alt=""
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
        open={editOpen} onClose={() => setEditOpen(false)}
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
