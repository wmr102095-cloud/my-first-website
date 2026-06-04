import { Container, Typography, Paper, Grid } from '@mui/material'

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>홈</Typography>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((n) => (
          <Grid item xs={12} sm={6} md={3} key={n}>
            <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
              <Typography variant="h5" color="primary">{n * 128}</Typography>
              <Typography variant="body2" color="text.secondary">카드 {n}</Typography>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>환영합니다!</Typography>
            <Typography variant="body1" color="text.secondary">
              사이드바 메뉴를 클릭하면 각 페이지로 이동합니다.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
