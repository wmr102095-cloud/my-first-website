import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Paper, Button,
  InputBase, ToggleButtonGroup, ToggleButton,
  Avatar, CircularProgress, Divider, Chip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CommentIcon from '@mui/icons-material/Comment'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { supabase } from '../supabaseClient'

const BRANDS = [
  { key: 'all',  label: '전체',  logo: null },
  { key: 'benz', label: 'BENZ', logo: `${import.meta.env.BASE_URL}logos/mercedes.webp` },
  { key: 'audi', label: 'AUDI', logo: `${import.meta.env.BASE_URL}logos/audi.svg`      },
  { key: 'bmw',  label: 'BMW',  logo: `${import.meta.env.BASE_URL}logos/bmw.svg`       },
]

const BRAND_COLORS = {
  benz: '#e8e8e8',
  audi: '#e30613',
  bmw:  '#1c69d4',
}

function BrandFilterChip({ brand, selected, onClick }) {
  const color = brand.key === 'all' ? '#e8e8e8' : BRAND_COLORS[brand.key]
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 0.8,
        px: 1.5, py: 0.6,
        border: `1px solid ${selected ? color : 'rgba(232,232,232,0.15)'}`,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: selected ? `${color}18` : 'transparent',
        transition: 'all 0.15s',
        '&:hover': { borderColor: color, bgcolor: `${color}10` },
      }}
    >
      {brand.logo && (
        <img
          src={brand.logo}
          alt={brand.label}
          style={{ width: 16, height: 16, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
        />
      )}
      <Typography variant="caption" fontWeight={700} sx={{ color: selected ? color : 'text.secondary' }}>
        {brand.label}
      </Typography>
    </Box>
  )
}

export default function PostList({ profile }) {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('all')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, brand, created_at, users(username), likes(id), comments(id)')
      .order('created_at', { ascending: false })
    if (!error) setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts
    .filter(p => brand === 'all' || p.brand === brand)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0)
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR')

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 3, mt: '64px' }}>
      {/* 헤더 배너 */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(232,232,232,0.05) 0%, rgba(136,136,136,0.05) 100%)',
        border: '1px solid rgba(232,232,232,0.1)',
        borderRadius: 3, p: 3, mb: 3,
      }}>
        {/* 브랜드 로고 3개 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          {BRANDS.filter(b => b.key !== 'all').map((b) => (
            <Box
              key={b.key}
              onClick={() => setBrand(brand === b.key ? 'all' : b.key)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                cursor: 'pointer', opacity: (brand === 'all' || brand === b.key) ? 1 : 0.35,
                transition: 'opacity 0.2s',
              }}
            >
              <img
                src={b.logo}
                alt={b.label}
                style={{
                  width: 44, height: 44,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <Typography variant="caption" fontWeight={700} sx={{
                color: brand === b.key ? BRAND_COLORS[b.key] : 'text.secondary',
                letterSpacing: 1,
              }}>
                {b.label}
              </Typography>
            </Box>
          ))}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              벤츠 · 아우디 · BMW 오너들의 소통 공간
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">{posts.length}</Typography>
            <Typography variant="caption" color="text.secondary">게시글</Typography>
          </Box>
        </Box>
      </Box>

      {/* 검색 + 글쓰기 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Paper sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 2, py: 0.5 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="게시글 제목 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ color: 'text.primary' }}
          />
        </Paper>
        {profile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/write')}
            sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
          >
            글쓰기
          </Button>
        )}
      </Box>

      {/* 브랜드 필터 + 정렬 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {BRANDS.map(b => (
            <BrandFilterChip
              key={b.key}
              brand={b}
              selected={brand === b.key}
              onClick={() => setBrand(b.key)}
            />
          ))}
        </Box>
        <ToggleButtonGroup value={sort} exclusive onChange={(_, v) => v && setSort(v)} size="small">
          <ToggleButton value="latest" sx={{ px: 1.5 }}>
            <NewReleasesIcon sx={{ fontSize: 16, mr: 0.5 }} />최신
          </ToggleButton>
          <ToggleButton value="likes" sx={{ px: 1.5 }}>
            <WhatshotIcon sx={{ fontSize: 16, mr: 0.5 }} />인기
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 게시글 목록 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filtered.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary" mb={1}>
              {search ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
            </Typography>
            {!search && profile && (
              <Button variant="outlined" onClick={() => navigate('/write')}
                sx={{ borderColor: 'rgba(232,232,232,0.2)', color: 'text.secondary' }}>
                첫 글 작성하기
              </Button>
            )}
          </Paper>
        ) : (
          filtered.map(post => {
            const brandColor = post.brand ? BRAND_COLORS[post.brand] : null
            const brandInfo = BRANDS.find(b => b.key === post.brand)
            return (
              <Paper
                key={post.id}
                sx={{
                  p: 2.5, cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': {
                    border: `1px solid ${brandColor ? brandColor + '44' : 'rgba(232,232,232,0.25)'}`,
                    boxShadow: brandColor ? `0 0 15px ${brandColor}10` : '0 0 15px rgba(232,232,232,0.05)',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {brandInfo && brandInfo.logo && (
                    <img
                      src={brandInfo.logo}
                      alt={brandInfo.label}
                      style={{ width: 14, height: 14, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.6 }}
                    />
                  )}
                  {brandInfo && (
                    <Typography variant="caption" sx={{ color: brandColor || 'text.secondary', fontWeight: 700, letterSpacing: 0.5 }}>
                      {brandInfo.label}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" fontWeight={600} sx={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary',
                }}>
                  {post.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 11, bgcolor: 'secondary.dark', fontWeight: 700 }}>
                      {post.users?.username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {post.users?.username || '알 수 없음'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{formatDate(post.created_at)}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <FavoriteIcon sx={{ fontSize: 13, color: '#ff6b6b' }} />
                      <Typography variant="caption" color="text.secondary">{post.likes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <CommentIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">{post.comments?.length || 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )
          })
        )}
      </Box>
    </Container>
  )
}
