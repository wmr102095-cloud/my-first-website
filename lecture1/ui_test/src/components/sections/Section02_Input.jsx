import { useState } from 'react'
import { Box, TextField, Typography, Divider, Stack, Paper } from '@mui/material'

const fields = [
  { variant: 'standard', label: 'Standard', placeholder: '텍스트를 입력하세요' },
  { variant: 'outlined', label: 'Outlined', placeholder: '텍스트를 입력하세요' },
  { variant: 'filled',   label: 'Filled',   placeholder: '텍스트를 입력하세요' },
]

export default function Section02_Input() {
  const [values, setValues] = useState({ standard: '', outlined: '', filled: '' })

  const handleChange = (variant) => (e) => {
    setValues((prev) => ({ ...prev, [variant]: e.target.value }))
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        02. Input
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={4}>
        {fields.map(({ variant, label, placeholder }) => (
          <Box key={variant}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase' }}>
              {variant}
            </Typography>
            <TextField
              variant={variant}
              label={label}
              placeholder={placeholder}
              value={values[variant]}
              onChange={handleChange(variant)}
              fullWidth
            />
          </Box>
        ))}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            실시간 입력값
          </Typography>
          {fields.map(({ variant, label }) => (
            <Typography key={variant} variant="body2" sx={{ mt: 0.5 }}>
              <Box component="span" fontWeight={600}>{label}:</Box>{' '}
              {values[variant] || <Box component="span" color="text.disabled">(없음)</Box>}
            </Typography>
          ))}
        </Paper>
      </Stack>
    </Box>
  )
}
