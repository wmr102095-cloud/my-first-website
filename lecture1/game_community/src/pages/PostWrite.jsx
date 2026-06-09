import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Paper, TextField,
  Button, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import { supabase } from '../supabaseClient'

export default function PostWrite({ profile }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('posts')
      .insert({ title: title.trim(), content: content.trim(), user_id: profile.id })
      .select('id')
      .single()

    if (error) {
      setError('게시글 작성에 실패했습니다.')
      setLoading(false)
    } else {
      navigate(`/post/${data.id}`)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3, mt: '64px' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        게시판으로
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'primary.main' }}>
          새 게시글 작성
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="제목"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            fullWidth
            placeholder="제목을 입력하세요"
            inputProps={{ maxLength: 100 }}
            helperText={`${title.length}/100`}
          />

          <TextField
            label="내용"
            value={content}
            onChange={(e) => { setContent(e.target.value); setError('') }}
            fullWidth
            multiline
            minRows={10}
            placeholder="내용을 입력하세요..."
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ borderColor: 'rgba(232,232,232,0.2)', color: 'text.secondary' }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ fontWeight: 700, minWidth: 100 }}
            >
              {loading ? '등록 중...' : '게시'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
