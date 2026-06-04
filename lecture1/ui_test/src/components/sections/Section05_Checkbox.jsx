import { useState } from 'react'
import {
  Box, Typography, Divider, Stack, Paper,
  Checkbox, FormControlLabel, FormGroup,
} from '@mui/material'

const items = [
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react',      label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
]

export default function Section05_Checkbox() {
  const [checked, setChecked] = useState([])

  const isAllChecked = checked.length === items.length
  const isIndeterminate = checked.length > 0 && checked.length < items.length

  const handleAll = () => {
    setChecked(isAllChecked ? [] : items.map((i) => i.value))
  }

  const handleItem = (value) => {
    setChecked((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        05. Checkbox
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3} maxWidth={400}>
        <FormGroup>
          <FormControlLabel
            label={
              <Typography fontWeight={600}>
                전체 선택
              </Typography>
            }
            control={
              <Checkbox
                checked={isAllChecked}
                indeterminate={isIndeterminate}
                onChange={handleAll}
              />
            }
          />
          <Divider sx={{ my: 1 }} />
          {items.map(({ value, label }) => (
            <FormControlLabel
              key={value}
              label={label}
              control={
                <Checkbox
                  checked={checked.includes(value)}
                  onChange={() => handleItem(value)}
                />
              }
            />
          ))}
        </FormGroup>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            선택된 항목
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {checked.length > 0
              ? `${checked.map((v) => items.find((i) => i.value === v)?.label).join(', ')} (${checked.length}개)`
              : <Box component="span" color="text.disabled">(선택 없음)</Box>
            }
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
