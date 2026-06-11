import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Avatar, TextField, InputAdornment, Button, CircularProgress, Tabs, Tab, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PeopleIcon from '@mui/icons-material/People'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Friends() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const [incomingRequests, setIncomingRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [requestMap, setRequestMap] = useState({})

  const fetchAll = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    const [{ data: reqs }, { data: allUsersData }] = await Promise.all([
      supabase
        .from('sns_friend_requests')
        .select('id, sender_id, receiver_id, status')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`),
      supabase
        .from('sns_users')
        .select('id, username, display_name, avatar_url, bio')
        .neq('id', profile.id)
        .order('display_name'),
    ])

    const requests = reqs || []
    const userMap = Object.fromEntries((allUsersData || []).map((u) => [u.id, u]))

    // 받은 요청 (내가 receiver, pending)
    const incoming = requests
      .filter((r) => r.receiver_id === profile.id && r.status === 'pending')
      .map((r) => ({ ...r, user: userMap[r.sender_id] }))

    // 수락된 친구
    const accepted = requests
      .filter((r) => r.status === 'accepted')
      .map((r) => {
        const otherId = r.sender_id === profile.id ? r.receiver_id : r.sender_id
        return { ...r, user: userMap[otherId] }
      })

    // 요청 상태 맵 (전체 멤버 탭용)
    const rMap = {}
    for (const r of requests) {
      const otherId = r.sender_id === profile.id ? r.receiver_id : r.sender_id
      rMap[otherId] = { ...r, isSender: r.sender_id === profile.id }
    }

    setIncomingRequests(incoming)
    setFriends(accepted)
    setAllUsers(allUsersData || [])
    setRequestMap(rMap)
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchAll() }, [fetchAll])

  const goToMessage = async (userId) => {
    const minId = Math.min(profile.id, userId)
    const maxId = Math.max(profile.id, userId)
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

  const sendRequest = async (userId) => {
    setActionLoading(userId)
    const { data } = await supabase
      .from('sns_friend_requests')
      .insert({ sender_id: profile.id, receiver_id: userId })
      .select('id').single()
    if (data) {
      setRequestMap((prev) => ({ ...prev, [userId]: { id: data.id, sender_id: profile.id, receiver_id: userId, status: 'pending', isSender: true } }))
    }
    setActionLoading(null)
  }

  const cancelRequest = async (userId, reqId) => {
    setActionLoading(userId)
    await supabase.from('sns_friend_requests').delete().eq('id', reqId)
    setRequestMap((prev) => { const n = { ...prev }; delete n[userId]; return n })
    setActionLoading(null)
  }

  const acceptRequest = async (req) => {
    setActionLoading(req.sender_id)
    await supabase.from('sns_friend_requests').update({ status: 'accepted' }).eq('id', req.id)
    await fetchAll()
    setActionLoading(null)
  }

  const declineRequest = async (req) => {
    setActionLoading(req.sender_id)
    await supabase.from('sns_friend_requests').delete().eq('id', req.id)
    await fetchAll()
    setActionLoading(null)
  }

  const unfriend = async (userId, reqId) => {
    setActionLoading(userId)
    await supabase.from('sns_friend_requests').delete().eq('id', reqId)
    await fetchAll()
    setActionLoading(null)
  }

  const filteredAll = allUsers.filter((u) =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredFriends = friends.filter((f) =>
    f.user?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.user?.username?.toLowerCase().includes(search.toLowerCase())
  )

  // 유저 카드 (전체 멤버 탭용)
  const UserCard = ({ user }) => {
    const req = requestMap[user.id]
    const isBusy = actionLoading === user.id
    let friendBtn

    if (!req) {
      friendBtn = (
        <Button size="small" variant="contained" startIcon={isBusy ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <PersonAddIcon sx={{ fontSize: '0.85rem !important' }} />}
          onClick={() => sendRequest(user.id)} disabled={isBusy}
          sx={{ height: 30, fontSize: '0.76rem', px: 1.2, bgcolor: '#2a5f8f', boxShadow: 'none', '&:hover': { bgcolor: '#3572a8' }, flexShrink: 0 }}>
          친구 추가
        </Button>
      )
    } else if (req.status === 'accepted') {
      friendBtn = (
        <Button size="small" variant="outlined" startIcon={<CheckIcon sx={{ fontSize: '0.85rem !important' }} />}
          onClick={() => unfriend(user.id, req.id)} disabled={isBusy}
          sx={{ height: 30, fontSize: '0.76rem', px: 1.2, borderColor: '#3d6b8e', color: '#66c0f4', '&:hover': { borderColor: '#ef4444', color: '#ef4444' }, flexShrink: 0 }}>
          친구
        </Button>
      )
    } else if (req.isSender) {
      friendBtn = (
        <Button size="small" variant="outlined" startIcon={isBusy ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <HourglassEmptyIcon sx={{ fontSize: '0.85rem !important' }} />}
          onClick={() => cancelRequest(user.id, req.id)} disabled={isBusy}
          sx={{ height: 30, fontSize: '0.76rem', px: 1.2, borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444' }, flexShrink: 0 }}>
          요청 취소
        </Button>
      )
    } else {
      friendBtn = (
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          <Button size="small" variant="contained"
            onClick={() => acceptRequest(req)} disabled={isBusy}
            sx={{ height: 30, fontSize: '0.74rem', px: 1, bgcolor: '#2a5f8f', boxShadow: 'none', '&:hover': { bgcolor: '#3572a8' }, minWidth: 'auto' }}>
            수락
          </Button>
          <Button size="small" variant="outlined"
            onClick={() => declineRequest(req)} disabled={isBusy}
            sx={{ height: 30, fontSize: '0.74rem', px: 1, borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444' }, minWidth: 'auto' }}>
            거절
          </Button>
        </Box>
      )
    }

    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1,
        px: 2, py: 1.5, transition: 'border-color 0.15s',
        '&:hover': { borderColor: '#3d6b8e' },
      }}>
        <Avatar src={user.avatar_url} onClick={() => navigate(`/profile/${user.id}`)}
          sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: '#2a475e', cursor: 'pointer', border: req?.status === 'accepted' ? '2px solid #66c0f4' : '2px solid #3d6b8e', fontSize: '0.95rem', color: '#66c0f4' }}>
          {user.display_name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${user.id}`)}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c6d4df', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.display_name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>@{user.username}</Typography>
          {user.bio && <Typography sx={{ fontSize: '0.73rem', color: '#8fa4b9', mt: 0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.bio}</Typography>}
        </Box>
        <Button size="small" variant="outlined"
          onClick={() => goToMessage(user.id)}
          sx={{ height: 30, minWidth: 'auto', px: 1, borderColor: '#2a475e', color: '#66c0f4', flexShrink: 0, '&:hover': { borderColor: '#66c0f4' } }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: '0.85rem' }} />
        </Button>
        {friendBtn}
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* 헤더 */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PeopleIcon sx={{ fontSize: '1.4rem', color: '#66c0f4' }} />
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#c6d4df' }}>친구 목록</Typography>
          {incomingRequests.length > 0 && (
            <Chip label={`요청 ${incomingRequests.length}`} size="small"
              sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.72rem' }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', mb: 2.5 }}>StyX 멤버들과 친구가 되어보세요</Typography>
        <TextField
          placeholder="이름 또는 아이디 검색..."
          size="small" fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8fa4b9', fontSize: '1.1rem' }} /></InputAdornment> }}
          sx={{ mb: 0, maxWidth: 360 }}
        />
      </Box>

      {/* 탭 */}
      <Box sx={{ borderBottom: '1px solid #2a475e', px: { xs: 2, md: 4 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: '#8fa4b9', fontWeight: 600, fontSize: '0.85rem', minHeight: 44, px: 2 },
            '& .Mui-selected': { color: '#66c0f4 !important' },
            '& .MuiTabs-indicator': { bgcolor: '#66c0f4' },
          }}
        >
          <Tab label={incomingRequests.length > 0 ? `받은 요청 (${incomingRequests.length})` : '받은 요청'} />
          <Tab label={`친구 (${friends.length})`} />
          <Tab label={`전체 멤버 (${allUsers.length})`} />
        </Tabs>
      </Box>

      {/* 목록 */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
          </Box>
        ) : (
          <>
            {/* 받은 요청 탭 */}
            {tab === 0 && (
              incomingRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 8 }}>
                  <PeopleIcon sx={{ fontSize: '3rem', color: '#2a475e', mb: 1 }} />
                  <Typography sx={{ color: '#8fa4b9' }}>받은 친구 요청이 없습니다.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {incomingRequests.map((req) => (
                    <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#16202d', border: '1px solid #3d6b8e', borderRadius: 1, px: 2, py: 1.5 }}>
                      <Avatar src={req.user?.avatar_url} onClick={() => navigate(`/profile/${req.sender_id}`)}
                        sx={{ width: 42, height: 42, bgcolor: '#2a475e', cursor: 'pointer', border: '2px solid #66c0f4', fontSize: '0.95rem', color: '#66c0f4', flexShrink: 0 }}>
                        {req.user?.display_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${req.sender_id}`)}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c6d4df' }}>{req.user?.display_name}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>@{req.user?.username}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.8, flexShrink: 0 }}>
                        <Button size="small" variant="contained"
                          onClick={() => acceptRequest(req)}
                          disabled={actionLoading === req.sender_id}
                          startIcon={actionLoading === req.sender_id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <CheckIcon sx={{ fontSize: '0.85rem !important' }} />}
                          sx={{ height: 32, fontSize: '0.78rem', bgcolor: '#2a5f8f', boxShadow: 'none', '&:hover': { bgcolor: '#3572a8' } }}>
                          수락
                        </Button>
                        <Button size="small" variant="outlined"
                          onClick={() => declineRequest(req)}
                          disabled={actionLoading === req.sender_id}
                          sx={{ height: 32, fontSize: '0.78rem', borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}>
                          <CloseIcon sx={{ fontSize: '0.9rem' }} />
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )
            )}

            {/* 친구 탭 */}
            {tab === 1 && (
              filteredFriends.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 8 }}>
                  <PeopleIcon sx={{ fontSize: '3rem', color: '#2a475e', mb: 1 }} />
                  <Typography sx={{ color: '#8fa4b9', mb: 0.5 }}>
                    {search ? '검색 결과가 없습니다.' : '아직 친구가 없습니다.'}
                  </Typography>
                  {!search && <Button onClick={() => setTab(2)} sx={{ color: '#66c0f4', fontSize: '0.82rem' }}>전체 멤버 보기</Button>}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {filteredFriends.map((f) => (
                    <Box key={f.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, px: 2, py: 1.5, '&:hover': { borderColor: '#66c0f4' }, transition: 'border-color 0.15s' }}>
                      <Avatar src={f.user?.avatar_url} onClick={() => navigate(`/profile/${f.user?.id}`)}
                        sx={{ width: 42, height: 42, bgcolor: '#2a475e', cursor: 'pointer', border: '2px solid #66c0f4', fontSize: '0.95rem', color: '#66c0f4', flexShrink: 0 }}>
                        {f.user?.display_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${f.user?.id}`)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c6d4df', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.user?.display_name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#5ba32b' }} />
                            <Typography sx={{ fontSize: '0.66rem', color: '#5ba32b' }}>친구</Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9' }}>@{f.user?.username}</Typography>
                      </Box>
                      <Button size="small" variant="outlined"
                        onClick={() => goToMessage(f.user?.id)}
                        sx={{ height: 30, minWidth: 'auto', px: 1.2, borderColor: '#2a475e', color: '#66c0f4', flexShrink: 0, '&:hover': { borderColor: '#66c0f4' } }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: '0.85rem' }} />
                      </Button>
                    </Box>
                  ))}
                </Box>
              )
            )}

            {/* 전체 멤버 탭 */}
            {tab === 2 && (
              filteredAll.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 8 }}>
                  <Typography sx={{ color: '#8fa4b9' }}>검색 결과가 없습니다.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {filteredAll.map((user) => <UserCard key={user.id} user={user} />)}
                </Box>
              )
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
