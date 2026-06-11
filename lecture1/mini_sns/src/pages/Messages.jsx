import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Avatar, CircularProgress, Divider } from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return '방금'
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  return `${Math.floor(s / 86400)}일 전`
}

export default function Messages() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [convs, setConvs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConvs = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    const { data: rows } = await supabase
      .from('sns_conversations')
      .select('id, last_message_at, user1_id, user2_id')
      .order('last_message_at', { ascending: false })

    if (!rows?.length) { setConvs([]); setLoading(false); return }

    const otherIds = rows.map((r) => r.user1_id === profile.id ? r.user2_id : r.user1_id)
    const { data: users } = await supabase
      .from('sns_users')
      .select('id, username, display_name, avatar_url')
      .in('id', otherIds)

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))

    const convIds = rows.map((r) => r.id)
    const { data: lastMsgs } = await supabase
      .from('sns_messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })

    const lastMsgMap = {}
    for (const m of lastMsgs || []) {
      if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m
    }

    setConvs(rows.map((r) => {
      const otherId = r.user1_id === profile.id ? r.user2_id : r.user1_id
      return { ...r, otherUser: userMap[otherId], lastMsg: lastMsgMap[r.id] }
    }))
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchConvs() }, [fetchConvs])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: '1.3rem', color: '#66c0f4' }} />
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#c6d4df' }}>메시지</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9' }}>친구와 나눈 대화</Typography>
      </Box>

      <Divider sx={{ borderColor: '#2a475e' }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
        </Box>
      ) : convs.length === 0 ? (
        <Box sx={{ textAlign: 'center', pt: 10 }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: '3rem', color: '#2a475e', mb: 1 }} />
          <Typography sx={{ color: '#8fa4b9' }}>아직 대화가 없습니다.</Typography>
          <Typography sx={{ color: '#66c0f4', fontSize: '0.82rem', mt: 0.5, cursor: 'pointer' }}
            onClick={() => navigate('/friends')}>
            친구 목록에서 DM을 시작해보세요
          </Typography>
        </Box>
      ) : (
        <Box>
          {convs.map((conv) => (
            <Box
              key={conv.id}
              onClick={() => navigate(`/messages/${conv.id}`)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                px: { xs: 2, md: 4 }, py: 1.8,
                cursor: 'pointer', borderBottom: '1px solid #2a475e',
                transition: 'background 0.12s',
                '&:hover': { bgcolor: '#16202d' },
              }}
            >
              <Avatar
                src={conv.otherUser?.avatar_url}
                sx={{ width: 46, height: 46, bgcolor: '#2a475e', border: '2px solid #3d6b8e', color: '#66c0f4', fontSize: '1.1rem', flexShrink: 0 }}
              >
                {conv.otherUser?.display_name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#c6d4df' }}>
                    {conv.otherUser?.display_name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9', flexShrink: 0, ml: 1 }}>
                    {conv.lastMsg ? timeAgo(conv.lastMsg.created_at) : timeAgo(conv.last_message_at)}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#8fa4b9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMsg?.content || '대화를 시작해보세요'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
