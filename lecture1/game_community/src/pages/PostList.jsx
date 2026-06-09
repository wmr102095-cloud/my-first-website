import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Paper, Button,
  InputBase, ToggleButtonGroup, ToggleButton,
  Avatar, CircularProgress, Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CommentIcon from '@mui/icons-material/Comment'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { supabase } from '../supabaseClient'

export default function PostList({ profile }) {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, users(username), likes(id), comments(id)')
      .order('created_at', { ascending: false })

    if (!error) setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0)
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR')

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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{
            color: 'primary.main',
            textShadow: '0 0 8px rgba(232,232,232,0.2)',
          }}>
            BENZ 커뮤니티 게시판
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            벤츠 오너들의 소통 공간
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, textAlign: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">{posts.length}</Typography>
            <Typography variant="caption" color="text.secondary">게시글</Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="h6" fontWeight={700} color="secondary.main">
              {posts.reduce((s, p) => s + (p.comments?.length || 0), 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">댓글</Typography>
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

      {/* 정렬 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={sort}
          exclusive
          onChange={(_, v) => v && setSort(v)}
          size="small"
        >
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
              <Button variant="outlined" onClick={() => navigate('/write')} sx={{ borderColor: 'rgba(232,232,232,0.2)', color: 'text.secondary' }}>
                첫 글 작성하기
              </Button>
            )}
          </Paper>
        ) : (
          filtered.map(post => (
            <Paper
              key={post.id}
              sx={{
                p: 2.5, cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': {
                  border: '1px solid rgba(232,232,232,0.25)',
                  boxShadow: '0 0 15px rgba(232,232,232,0.05)',
                  transform: 'translateY(-1px)',
                },
              }}
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <Typography variant="body1" fontWeight={600} sx={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'text.primary',
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
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.created_at)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <FavoriteIcon sx={{ fontSize: 13, color: '#ff6b6b' }} />
                    <Typography variant="caption" color="text.secondary">
                      {post.likes?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <CommentIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      {post.comments?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Container>
  )
}
