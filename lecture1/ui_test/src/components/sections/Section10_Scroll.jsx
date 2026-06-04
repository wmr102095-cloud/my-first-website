import { useRef, useState } from 'react'
import { Box, Typography, Divider, Paper, Fab, Fade } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const ITEMS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `아이템 ${i + 1}`,
  body: `이것은 ${i + 1}번째 콘텐츠입니다. 스크롤을 내려서 더 많은 내용을 확인해 보세요.`,
}))

export default function Section10_Scroll() {
  const containerRef = useRef(null)
  const [showTop, setShowTop] = useState(false)

  const handleScroll = () => {
    setShowTop(containerRef.current.scrollTop > 100)
  }

  const scrollToTop = () => {
    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        10. Scroll
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ position: 'relative' }}>
        <Paper
          ref={containerRef}
          variant="outlined"
          onScroll={handleScroll}
          sx={{
            height: 300,
            overflowY: 'auto',
            p: 2,
            borderRadius: 2,
          }}
        >
          {ITEMS.map(({ id, title, body }) => (
            <Box
              key={id}
              sx={{
                py: 1.5,
                borderBottom: id < ITEMS.length ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {body}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Fade in={showTop}>
          <Fab
            size="small"
            color="primary"
            onClick={scrollToTop}
            sx={{ position: 'absolute', bottom: 12, right: 12 }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </Fade>
      </Box>
    </Box>
  )
}
