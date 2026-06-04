import { useState } from 'react'
import { Box, Typography, Divider, Paper, Chip } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

const initialItems = [
  { id: 1, label: 'React',      color: '#61dafb' },
  { id: 2, label: 'TypeScript', color: '#3178c6' },
  { id: 3, label: 'MUI',        color: '#007fff' },
  { id: 4, label: 'Vite',       color: '#646cff' },
  { id: 5, label: 'Node.js',    color: '#68a063' },
]

export default function Section09_DragDrop() {
  const [pool, setPool]     = useState(initialItems)
  const [dropped, setDropped] = useState([])
  const [dragging, setDragging] = useState(null)
  const [overZone, setOverZone] = useState(null)

  const handleDragStart = (item, from) => {
    setDragging({ item, from })
  }

  const handleDrop = (to) => {
    if (!dragging || dragging.from === to) return
    const { item, from } = dragging

    if (from === 'pool') {
      setPool((prev) => prev.filter((i) => i.id !== item.id))
      setDropped((prev) => [...prev, item])
    } else {
      setDropped((prev) => prev.filter((i) => i.id !== item.id))
      setPool((prev) => [...prev, item])
    }
    setDragging(null)
    setOverZone(null)
  }

  const zoneStyle = (zone) => ({
    flex: 1,
    minHeight: 180,
    p: 2,
    borderRadius: 2,
    border: '2px dashed',
    borderColor: overZone === zone ? 'primary.main' : 'divider',
    backgroundColor: overZone === zone ? 'primary.50' : 'grey.50',
    transition: 'all 0.15s',
  })

  const itemStyle = (isDragged) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1.5,
    mb: 1,
    borderRadius: 1.5,
    backgroundColor: 'white',
    boxShadow: isDragged ? 4 : 1,
    opacity: isDragged ? 0.5 : 1,
    cursor: 'grab',
    userSelect: 'none',
    transition: 'box-shadow 0.15s, opacity 0.15s',
  })

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        09. Drag &amp; Drop
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* 아이템 풀 */}
        <Box
          sx={zoneStyle('pool')}
          onDragOver={(e) => { e.preventDefault(); setOverZone('pool') }}
          onDragLeave={() => setOverZone(null)}
          onDrop={() => handleDrop('pool')}
        >
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
            기술 목록 ({pool.length})
          </Typography>
          {pool.map((item) => (
            <Box
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item, 'pool')}
              onDragEnd={() => setDragging(null)}
              sx={itemStyle(dragging?.item.id === item.id)}
            >
              <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Chip
                label={item.label}
                size="small"
                sx={{ backgroundColor: item.color, color: 'white', fontWeight: 600 }}
              />
            </Box>
          ))}
          {pool.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              아이템을 되돌려 놓으세요
            </Typography>
          )}
        </Box>

        {/* 드롭 영역 */}
        <Box
          sx={zoneStyle('dropped')}
          onDragOver={(e) => { e.preventDefault(); setOverZone('dropped') }}
          onDragLeave={() => setOverZone(null)}
          onDrop={() => handleDrop('dropped')}
        >
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
            선택한 기술 ({dropped.length})
          </Typography>
          {dropped.map((item) => (
            <Box
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item, 'dropped')}
              onDragEnd={() => setDragging(null)}
              sx={itemStyle(dragging?.item.id === item.id)}
            >
              <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Chip
                label={item.label}
                size="small"
                sx={{ backgroundColor: item.color, color: 'white', fontWeight: 600 }}
              />
            </Box>
          ))}
          {dropped.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              여기로 드래그하세요
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
