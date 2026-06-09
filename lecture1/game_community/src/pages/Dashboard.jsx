import { Container, Typography, Paper, Grid, LinearProgress, Box } from '@mui/material'

const stats = [
  { label: '방문자', value: 1284, progress: 72 },
  { label: '매출', value: '₩3.2M', progress: 55 },
  { label: '주문', value: 348, progress: 88 },
  { label: '리뷰', value: 91, progress: 40 },
]

export default function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>대시보드</Typography>
      <Grid container spacing={3}>
        {stats.map(({ label, value, progress }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="h5" sx={{ my: 1 }}>{value}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1 }} />
                <Typography variant="caption">{progress}%</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, minHeight: 200 }} elevation={1}>
            <Typography variant="h6" gutterBottom>통계 차트 영역</Typography>
            <Typography variant="body2" color="text.secondary">차트를 여기에 추가할 수 있습니다.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
