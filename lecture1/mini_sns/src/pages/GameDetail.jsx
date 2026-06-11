import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Button, Chip, Divider, Tabs, Tab, CircularProgress, Fab } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DownloadIcon from '@mui/icons-material/Download'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import WindowIcon from '@mui/icons-material/Window'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { NEXON_GAMES } from '../data/nexonGames'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import GameCard from '../components/GameCard'
import PostCard from '../components/PostCard'

const INSTALLED_IDS = ['first-descendant', 'maplestory', 'dungeon-fighter', 'fifa-online-4', 'kartrider-drift']
const PLATFORM_ICON = {
  Windows: <WindowIcon sx={{ fontSize: '0.9rem' }} />,
  Mobile: <PhoneAndroidIcon sx={{ fontSize: '0.9rem' }} />,
  Console: <SportsEsportsIcon sx={{ fontSize: '0.9rem' }} />,
  'PC(에뮬)': <WindowIcon sx={{ fontSize: '0.9rem' }} />,
  Mac: <WindowIcon sx={{ fontSize: '0.9rem' }} />,
}

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const game = NEXON_GAMES.find((g) => g.id === id)

  const [tab, setTab] = useState(location.state?.tab === 'community' ? 1 : 0)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postCount, setPostCount] = useState(0)

  const fetchGamePosts = useCallback(async () => {
    if (!game) return
    setPostsLoading(true)
    const { data } = await supabase
      .from('sns_posts')
      .select('*, sns_users(id, username, display_name, avatar_url)')
      .eq('game_id', game.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (!data) { setPostsLoading(false); return }

    if (profile) {
      const postIds = data.map((p) => p.id)
      if (postIds.length > 0) {
        const { data: myLikes } = await supabase.from('sns_likes').select('post_id').eq('user_id', profile.id).in('post_id', postIds)
        const likedSet = new Set((myLikes || []).map((l) => l.post_id))
        setPosts(data.map((p) => ({ ...p, user_liked: likedSet.has(p.id) })))
      } else {
        setPosts([])
      }
    } else {
      setPosts(data.map((p) => ({ ...p, user_liked: false })))
    }
    setPostCount(data.length)
    setPostsLoading(false)
  }, [game, profile])

  useEffect(() => {
    if (tab === 1) fetchGamePosts()
  }, [tab, fetchGamePosts])

  if (!game) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#8fa4b9' }}>게임을 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2, color: '#66c0f4' }}>스토어로 돌아가기</Button>
      </Box>
    )
  }

  const isInstalled = INSTALLED_IDS.includes(game.id)
  const similar = NEXON_GAMES.filter((g) => g.id !== game.id && g.genre.some((genre) => game.genre.includes(genre))).slice(0, 4)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* Hero */}
      <Box sx={{ position: 'relative', height: { xs: 200, md: 340 }, overflow: 'hidden' }}>
        {game.heroImg ? (
          <Box component="img" src={game.heroImg} alt={game.title} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: game.gradient }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,40,56,1) 0%, rgba(27,40,56,0.2) 60%, transparent 100%)' }} />
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: '#c6d4df', bgcolor: 'rgba(0,0,0,0.45)', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' }, borderRadius: 1 }}>
            뒤로
          </Button>
        </Box>
        {/* Game title overlay on hero */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: { xs: 2, md: 3 } }}>
          <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {game.title}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#16202d', borderBottom: '1px solid #2a475e' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            '& .MuiTab-root': { color: '#8fa4b9', fontWeight: 600, fontSize: '0.9rem', minHeight: 48 },
            '& .Mui-selected': { color: '#66c0f4 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#66c0f4' },
          }}
        >
          <Tab label="게임 정보" />
          <Tab label={postCount > 0 ? `커뮤니티 (${postCount})` : '커뮤니티'} />
        </Tabs>
      </Box>

      {/* ── Tab 0: 게임 정보 ── */}
      {tab === 0 && (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Left */}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography sx={{ fontSize: '0.9rem', color: '#8fa4b9', mb: 2 }}>
                {game.titleEn} · {game.developer}
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2.5 }}>
                {game.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#2a475e', color: '#8fa4b9', border: '1px solid #3d6b8e', fontSize: '0.72rem' }} />
                ))}
              </Box>

              <Typography sx={{ fontSize: '0.9rem', color: '#a8cfe8', lineHeight: 1.85, mb: 3 }}>
                {game.description}
              </Typography>

              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <MetaRow label="개발사" value={game.developer} />
                <MetaRow label="퍼블리셔" value={game.publisher} />
                <MetaRow label="출시일" value={game.releaseDate} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', width: 80 }}>플랫폼</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {game.platforms.map((p) => (
                      <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#c6d4df' }}>
                        {PLATFORM_ICON[p] || <SportsEsportsIcon sx={{ fontSize: '0.9rem' }} />}
                        <Typography sx={{ fontSize: '0.78rem' }}>{p}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right: Purchase box */}
            <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
              <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 2.5 }}>
                <Box sx={{ aspectRatio: '460/215', borderRadius: 0.5, overflow: 'hidden', mb: 2, bgcolor: '#0e1620' }}>
                  {game.headerImg ? (
                    <Box component="img" src={game.headerImg} alt={game.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', background: game.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontWeight: 900, color: game.accentColor, textAlign: 'center', px: 1, fontSize: '0.9rem' }}>{game.title}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Rating stars */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Typography key={i} sx={{ fontSize: '0.9rem', color: i <= Math.round(game.rating / 20) ? '#66c0f4' : '#2a475e' }}>★</Typography>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9' }}>{game.reviewCount}개 평가</Typography>
                </Box>

                {/* Price */}
                <Box sx={{ mb: 2 }}>
                  {game.discount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={`-${game.discount}%`} size="small" sx={{ bgcolor: '#4c6b22', color: '#d9f5a5', fontWeight: 800 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#8fa4b9', textDecoration: 'line-through' }}>{game.originalPrice}</Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: game.price === '무료' ? '#5ba32b' : '#c6d4df' }}>
                    {game.price}
                  </Typography>
                </Box>

                {isInstalled ? (
                  <Button fullWidth variant="contained" color="success" startIcon={<PlayArrowIcon />} sx={{ height: 46, fontSize: '0.95rem', mb: 1 }}>
                    지금 플레이
                  </Button>
                ) : game.price === '무료' ? (
                  <Button fullWidth variant="contained" color="success" startIcon={<DownloadIcon />} sx={{ height: 46, fontSize: '0.95rem', mb: 1 }}>
                    무료 설치
                  </Button>
                ) : (
                  <Button fullWidth variant="contained" color="primary" sx={{ height: 46, fontSize: '0.95rem', mb: 1 }}>
                    장바구니에 추가
                  </Button>
                )}
                <Button fullWidth variant="outlined" size="small" sx={{ borderColor: '#4c7b9a', color: '#8fa4b9', '&:hover': { borderColor: '#66c0f4', color: '#c6d4df' } }}>
                  위시리스트 추가
                </Button>

                <Divider sx={{ my: 2 }} />

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => setTab(1)}
                  sx={{ borderColor: game.accentColor + '60', color: game.accentColor, '&:hover': { borderColor: game.accentColor, bgcolor: game.accentColor + '10' } }}
                >
                  게임 커뮤니티 보기
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Similar games */}
          {similar.length > 0 && (
            <Box sx={{ mt: 5 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#c6d4df', mb: 2 }}>비슷한 게임</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {similar.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ── Tab 1: 커뮤니티 ── */}
      {tab === 1 && (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#c6d4df' }}>{game.title} 커뮤니티</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#8fa4b9', mt: 0.3 }}>이 게임에 대한 이야기를 나눠보세요</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/write', { state: { gameId: game.id, gameName: game.title } })}
              sx={{ borderColor: game.accentColor + '60', color: game.accentColor, '&:hover': { borderColor: game.accentColor } }}
            >
              글쓰기
            </Button>
          </Box>

          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} sx={{ color: '#66c0f4' }} />
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SportsEsportsIcon sx={{ fontSize: '3rem', color: '#2a475e', mb: 1 }} />
              <Typography sx={{ color: '#8fa4b9', mb: 0.5 }}>아직 게시물이 없습니다.</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', mb: 2 }}>이 게임의 첫 게시물을 작성해보세요!</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/write', { state: { gameId: game.id, gameName: game.title } })}
                sx={{ fontSize: '0.88rem' }}
              >
                첫 게시물 작성하기
              </Button>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 600 }}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onRefresh={fetchGamePosts} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* FAB for community write (tab 1) */}
      {tab === 1 && (
        <Fab
          color="primary"
          onClick={() => navigate('/write', { state: { gameId: game.id, gameName: game.title } })}
          sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: game.accentColor, '&:hover': { bgcolor: game.accentColor } }}
        >
          <EditIcon />
        </Fab>
      )}
    </Box>
  )
}

function MetaRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', width: 80, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#c6d4df' }}>{value}</Typography>
    </Box>
  )
}
