import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, Avatar, IconButton, TextField, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function timeLabel(d) {
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const hhmm = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  return isToday ? hhmm : `${date.getMonth() + 1}/${date.getDate()} ${hhmm}`
}

export default function Conversation() {
  const { id: convId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('sns_messages')
      .select('*, sns_users!sender_id(id, username, display_name, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }, [convId])

  const fetchOtherUser = useCallback(async () => {
    if (!profile) return
    const { data: conv } = await supabase
      .from('sns_conversations')
      .select('user1_id, user2_id')
      .eq('id', convId)
      .single()
    if (!conv) return
    const otherId = conv.user1_id === profile.id ? conv.user2_id : conv.user1_id
    const { data: user } = await supabase
      .from('sns_users')
      .select('id, username, display_name, avatar_url')
      .eq('id', otherId)
      .single()
    setOtherUser(user)
  }, [convId, profile])

  useEffect(() => {
    Promise.all([fetchOtherUser(), fetchMessages()]).then(() => setLoading(false))
  }, [fetchOtherUser, fetchMessages])

  // 읽음 처리
  useEffect(() => {
    if (!profile || !messages.length) return
    supabase.from('sns_messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', profile.id)
      .eq('is_read', false)
      .then(() => {})
  }, [messages, convId, profile])

  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel(`conv:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sns_messages',
        filter: `conversation_id=eq.${convId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('sns_messages')
          .select('*, sns_users!sender_id(id, username, display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages((prev) => [...prev, data])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [convId])

  // 새 메시지 → 하단 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !profile || sending) return
    setSending(true)
    setInput('')
    await supabase.from('sns_messages').insert({
      conversation_id: Number(convId),
      sender_id: profile.id,
      content: text,
    })
    await supabase
      .from('sns_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', convId)
    setSending(false)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#1b2838' }}>
      <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* 고정 헤더 */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1,
        bgcolor: 'rgba(22,32,45,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #2a475e',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <IconButton onClick={() => navigate('/messages')} sx={{ color: '#c6d4df' }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar
          src={otherUser?.avatar_url}
          onClick={() => otherUser && navigate(`/profile/${otherUser.id}`)}
          sx={{ width: 36, height: 36, bgcolor: '#2a475e', border: '2px solid #3d6b8e', cursor: 'pointer', color: '#66c0f4', fontSize: '0.9rem', flexShrink: 0 }}
        >
          {otherUser?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ cursor: 'pointer' }} onClick={() => otherUser && navigate(`/profile/${otherUser.id}`)}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#c6d4df', lineHeight: 1.2 }}>
            {otherUser?.display_name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>@{otherUser?.username}</Typography>
        </Box>
      </Box>

      {/* 메시지 목록 */}
      <Box sx={{ px: 2, pt: 2, pb: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography sx={{ color: '#8fa4b9', fontSize: '0.85rem' }}>
              {otherUser?.display_name}님과 대화를 시작해보세요 👋
            </Typography>
          </Box>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === profile?.id
          const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id)
          return (
            <Box key={msg.id} sx={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1 }}>
              {!isMine && (
                <Avatar
                  src={msg.sns_users?.avatar_url}
                  sx={{
                    width: 28, height: 28, flexShrink: 0,
                    bgcolor: '#2a475e', fontSize: '0.72rem', color: '#66c0f4',
                    opacity: showAvatar ? 1 : 0,
                  }}
                >
                  {msg.sns_users?.display_name?.[0]?.toUpperCase()}
                </Avatar>
              )}
              <Box sx={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', gap: 0.3 }}>
                <Box sx={{
                  px: 1.5, py: 0.9, wordBreak: 'break-word',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: isMine ? '#2a5f8f' : '#16202d',
                  border: isMine ? 'none' : '1px solid #2a475e',
                }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#c6d4df', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#8fa4b9', px: 0.5 }}>
                  {timeLabel(msg.created_at)}
                </Typography>
              </Box>
            </Box>
          )
        })}
        <div ref={bottomRef} />
      </Box>

      {/* 입력창 — 하단 고정 (PostDetail과 동일 패턴) */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: '220px', right: 0,
        display: 'flex', alignItems: 'flex-end', gap: 1,
        px: 2, py: 1.2,
        bgcolor: 'rgba(22,32,45,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #2a475e',
        zIndex: 50,
      }}>
        <Avatar sx={{ width: 30, height: 30, flexShrink: 0, bgcolor: '#2a475e', fontSize: '0.8rem', border: '2px solid #3d6b8e', color: '#66c0f4' }}>
          {profile?.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <TextField
          fullWidth size="small"
          placeholder="메시지 보내기..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          multiline maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2a475e', borderRadius: 2.5,
              '& fieldset': { border: 'none' },
              '& textarea': { color: '#c6d4df', fontSize: '0.88rem', py: 0.8 },
              '& textarea::placeholder': { color: '#8fa4b9' },
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          sx={{
            bgcolor: input.trim() ? '#2a5f8f' : '#2a475e',
            color: input.trim() ? '#66c0f4' : '#4c7b9a',
            width: 38, height: 38, flexShrink: 0,
            transition: 'all 0.15s',
            '&:hover': { bgcolor: '#3572a8' },
            '&:disabled': { bgcolor: '#2a475e', color: '#4c7b9a' },
          }}
        >
          {sending ? <CircularProgress size={16} sx={{ color: '#66c0f4' }} /> : <SendIcon sx={{ fontSize: '1rem' }} />}
        </IconButton>
      </Box>
    </Box>
  )
}
