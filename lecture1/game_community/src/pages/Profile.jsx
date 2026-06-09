import { Container, Typography, Paper, Avatar, Box, Divider, Chip } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'

export default function Profile() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>프로필</Typography>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5">홍길동</Typography>
          <Typography variant="body2" color="text.secondary">프론트엔드 개발자</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip label="React" size="small" color="primary" />
            <Chip label="MUI" size="small" color="secondary" />
            <Chip label="Vite" size="small" />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmailIcon color="action" />
            <Typography>hong@example.com</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PhoneIcon color="action" />
            <Typography>010-1234-5678</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
