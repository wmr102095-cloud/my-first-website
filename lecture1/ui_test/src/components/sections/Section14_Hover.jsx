import { Box, Typography, Divider, Grid, Paper } from '@mui/material'

const effects = [
  {
    label: '색상 변화',
    desc: 'background-color transition',
    base: { backgroundColor: 'grey.100' },
    hover: { backgroundColor: 'primary.main', color: 'white' },
  },
  {
    label: '크기 확대',
    desc: 'transform: scale()',
    base: {},
    hover: { transform: 'scale(1.08)' },
  },
  {
    label: '그림자 강화',
    desc: 'box-shadow elevation',
    base: { boxShadow: 1 },
    hover: { boxShadow: 12 },
  },
  {
    label: '테두리 강조',
    desc: 'border-color transition',
    base: { border: '2px solid', borderColor: 'divider' },
    hover: { border: '2px solid', borderColor: 'secondary.main' },
  },
  {
    label: '위로 부상',
    desc: 'translateY + shadow',
    base: { boxShadow: 1 },
    hover: { transform: 'translateY(-8px)', boxShadow: 8 },
  },
  {
    label: '흐림 → 선명',
    desc: 'opacity transition',
    base: { opacity: 0.45 },
    hover: { opacity: 1 },
  },
]

export default function Section14_Hover() {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        14. Hover
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {effects.map(({ label, desc, base, hover }) => (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                ...base,
                '&:hover': hover,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {label}
              </Typography>
              <Typography variant="caption" color="inherit">
                {desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
