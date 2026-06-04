import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Box, Typography, Divider, IconButton, Stack } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const slides = [
  { id: 1, bg: '#1976d2', text: '첫 번째 슬라이드',    sub: '왼쪽으로 스와이프하세요 →' },
  { id: 2, bg: '#adadad', text: '두 번째 슬라이드',    sub: '터치 또는 마우스로 드래그' },
  { id: 3, bg: '#388e3c', text: '세 번째 슬라이드',    sub: '이전/다음 버튼도 사용 가능' },
  { id: 4, bg: '#f57c00', text: '네 번째 슬라이드',    sub: '마지막에서 처음으로 순환' },
  { id: 5, bg: '#7b1fa2', text: '다섯 번째 슬라이드',  sub: '← 오른쪽으로 스와이프' },
]

export default function Section15_Swipe() {
  const [index, setIndex] = useState(0)
  const [swipeDir, setSwipeDir] = useState(null)

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  const handlers = useSwipeable({
    onSwipedLeft:  () => { setSwipeDir('left');  next() },
    onSwipedRight: () => { setSwipeDir('right'); prev() },
    onSwiped:      () => setTimeout(() => setSwipeDir(null), 400),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  const slide = slides[index]

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        15. Swipe
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Box
          {...handlers}
          sx={{
            backgroundColor: slide.bg,
            borderRadius: 3,
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            userSelect: 'none',
            overflow: 'hidden',
            position: 'relative',
            transition: 'background-color 0.35s ease',
          }}
        >
          {swipeDir && (
            <Box
              sx={{
                position: 'absolute',
                fontSize: 48,
                opacity: 0.25,
                animation: 'fadeOut 0.4s ease forwards',
                '@keyframes fadeOut': { from: { opacity: 0.4 }, to: { opacity: 0 } },
              }}
            >
              {swipeDir === 'left' ? '→' : '←'}
            </Box>
          )}
          <Typography variant="h5" color="white" fontWeight={700}>
            {slide.text}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.75)" sx={{ mt: 1 }}>
            {slide.sub}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          <IconButton onClick={prev} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Stack direction="row" spacing={0.75}>
            {slides.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIndex(i)}
                sx={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === index ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </Stack>

          <IconButton onClick={next} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          {index + 1} / {slides.length}
        </Typography>
      </Box>
    </Box>
  )
}
