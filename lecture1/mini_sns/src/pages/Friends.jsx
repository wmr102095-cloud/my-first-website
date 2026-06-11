import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Avatar, TextField, InputAdornment, Button, CircularProgress, Tabs, Tab, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import CheckIcon from '@mui/icons-material/Check'
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
  const [allUsers, setAllUsers] = useState([])
  const [followingIds, setFollowingIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const fetchData = useCallback(async () => {
    if (!profile) return
    setLoading(true)

    const [{ data: users }, { data: follows }] = await Promise.all([
      supabase.from('sns_users').select('id, username, display_name, avatar_url, bio').neq('id', profile.id).order('display_name'),
      supabase.from('sns_follows').select('following_id').eq('follower_id', profile.id),
    ])

    setAllUsers(users || [])
    setFollowingIds(new Set((follows || []).map((f) => f.following_id)))
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleFollow = async (userId) => {
    if (!profile || toggling === userId) return
    setToggling(userId)

    if (followingIds.has(userId)) {
      await supabase.from('sns_follows').delete()
        .eq('follower_id', profile.id).eq('following_id', userId)
      setFollowingIds((prev) => { const s = new Set(prev); s.delete(userId); return s })
    } else {
      await supabase.from('sns_follows').insert({ follower_id: profile.id, following_id: userId })
      setFollowingIds((prev) => new Set([...prev, userId]))
    }
    setToggling(null)
  }

  const filteredUsers = allUsers.filter((u) =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  const followingUsers = filteredUsers.filter((u) => followingIds.has(u.id))
  const listToShow = tab === 0 ? followingUsers : filteredUsers

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* 헤더 */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PeopleIcon sx={{ fontSize: '1.4rem', color: '#66c0f4' }} />
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#c6d4df' }}>친구 목록</Typography>
          <Chip
            label={`팔로잉 ${followingIds.size}`}
            size="small"
            sx={{ bgcolor: '#2a475e', color: '#66c0f4', fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', mb: 2.5 }}>
          StyX 멤버들과 친구가 되어보세요
        </Typography>

        {/* 검색 */}
        <TextField
          placeholder="이름 또는 아이디 검색..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8fa4b9', fontSize: '1.1rem' }} /></InputAdornment> }}
          sx={{ mb: 0, maxWidth: 360 }}
        />
      </Box>

      {/* 탭 */}
      <Box sx={{ borderBottom: '1px solid #2a475e', px: { xs: 2, md: 4 } }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: '#8fa4b9', fontWeight: 600, fontSize: '0.88rem', minHeight: 44, px: 2 },
            '& .Mui-selected': { color: '#66c0f4 !important' },
            '& .MuiTabs-indicator': { bgcolor: '#66c0f4' },
          }}
        >
          <Tab label={`팔로잉 (${followingIds.size})`} />
          <Tab label={`전체 멤버 (${allUsers.length})`} />
        </Tabs>
      </Box>

      {/* 목록 */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
          </Box>
        ) : listToShow.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}>
            <PeopleIcon sx={{ fontSize: '3rem', color: '#2a475e', mb: 1 }} />
            <Typography sx={{ color: '#8fa4b9', mb: 0.5 }}>
              {tab === 0 ? '아직 팔로잉한 멤버가 없습니다.' : '검색 결과가 없습니다.'}
            </Typography>
            {tab === 0 && (
              <Button onClick={() => setTab(1)} sx={{ color: '#66c0f4', mt: 1, fontSize: '0.85rem' }}>
                전체 멤버 보기
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {listToShow.map((user) => {
              const isFollowing = followingIds.has(user.id)
              const isToggling = toggling === user.id
              return (
                <Box
                  key={user.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1,
                    px: 2, py: 1.5,
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: isFollowing ? '#66c0f4' : '#3d6b8e' },
                  }}
                >
                  {/* 아바타 */}
                  <Avatar
                    src={user.avatar_url}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    sx={{
                      width: 44, height: 44, flexShrink: 0,
                      bgcolor: '#2a475e', cursor: 'pointer',
                      border: isFollowing ? '2px solid #66c0f4' : '2px solid #3d6b8e',
                      fontSize: '1rem', color: isFollowing ? '#66c0f4' : '#8fa4b9',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {user.display_name?.[0]?.toUpperCase()}
                  </Avatar>

                  {/* 유저 정보 */}
                  <Box
                    sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#c6d4df', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.display_name}
                      </Typography>
                      {isFollowing && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#5ba32b' }} />
                          <Typography sx={{ fontSize: '0.68rem', color: '#5ba32b' }}>팔로잉</Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.76rem', color: '#8fa4b9' }}>@{user.username}</Typography>
                    {user.bio && (
                      <Typography sx={{ fontSize: '0.76rem', color: '#8fa4b9', mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.bio}
                      </Typography>
                    )}
                  </Box>

                  {/* DM 버튼 */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      const minId = Math.min(profile.id, user.id)
                      const maxId = Math.max(profile.id, user.id)
                      let { data: conv } = await supabase
                        .from('sns_conversations')
                        .select('id')
                        .eq('user1_id', minId)
                        .eq('user2_id', maxId)
                        .maybeSingle()
                      if (!conv) {
                        const { data: created } = await supabase
                          .from('sns_conversations')
                          .insert({ user1_id: minId, user2_id: maxId })
                          .select('id')
                          .single()
                        conv = created
                      }
                      if (conv) navigate(`/messages/${conv.id}`)
                    }}
                    sx={{
                      flexShrink: 0, height: 32, minWidth: 'auto', px: 1.2,
                      borderColor: '#2a475e', color: '#66c0f4',
                      '&:hover': { borderColor: '#66c0f4', bgcolor: 'rgba(102,192,244,0.06)' },
                    }}
                  >
                    <ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem' }} />
                  </Button>

                  {/* 팔로우 버튼 */}
                  <Button
                    size="small"
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={() => toggleFollow(user.id)}
                    disabled={isToggling}
                    startIcon={isToggling
                      ? <CircularProgress size={12} sx={{ color: 'inherit' }} />
                      : isFollowing
                        ? <CheckIcon sx={{ fontSize: '0.9rem !important' }} />
                        : <PersonAddIcon sx={{ fontSize: '0.9rem !important' }} />
                    }
                    sx={{
                      flexShrink: 0, height: 32, fontSize: '0.78rem', px: 1.5,
                      ...(isFollowing
                        ? { borderColor: '#2a475e', color: '#8fa4b9', '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' } }
                        : { bgcolor: '#2a5f8f', color: '#c6d4df', '&:hover': { bgcolor: '#3572a8' }, boxShadow: 'none' }
                      ),
                    }}
                  >
                    {isToggling ? '' : isFollowing ? '팔로잉' : '팔로우'}
                  </Button>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}
