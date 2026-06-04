import {
  Container, Typography, Paper, List, ListItem, ListItemText,
  Switch, Divider, Box,
} from '@mui/material'
import { useState } from 'react'

const initialSettings = [
  { label: '알림 허용', description: '푸시 알림을 받습니다', key: 'notifications', value: true },
  { label: '다크 모드', description: '어두운 테마를 사용합니다', key: 'darkMode', value: false },
  { label: '자동 저장', description: '변경사항을 자동으로 저장합니다', key: 'autoSave', value: true },
  { label: '이메일 수신', description: '마케팅 이메일을 수신합니다', key: 'email', value: false },
]

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings)

  const toggle = (key) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: !s.value } : s))
    )
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>설정</Typography>
      <Paper elevation={2}>
        <List disablePadding>
          {settings.map(({ label, description, key, value }, idx) => (
            <Box key={key}>
              <ListItem sx={{ py: 2 }}>
                <ListItemText primary={label} secondary={description} />
                <Switch checked={value} onChange={() => toggle(key)} />
              </ListItem>
              {idx < settings.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
    </Container>
  )
}
