import { useState } from 'react'
import {
  Box, Typography, Divider, Stack, Paper,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'

const options = [
  { value: 'react',      label: 'React' },
  { value: 'vue',        label: 'Vue' },
  { value: 'angular',   label: 'Angular' },
  { value: 'svelte',    label: 'Svelte' },
  { value: 'nextjs',    label: 'Next.js' },
  { value: 'nuxt',      label: 'Nuxt.js' },
]

export default function Section04_Dropdown() {
  const [selected, setSelected] = useState('')

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        04. Dropdown
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3} maxWidth={400}>
        <FormControl fullWidth>
          <InputLabel id="framework-label">프레임워크 선택</InputLabel>
          <Select
            labelId="framework-label"
            value={selected}
            label="프레임워크 선택"
            onChange={(e) => setSelected(e.target.value)}
          >
            {options.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            선택된 값
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {selected
              ? options.find((o) => o.value === selected)?.label
              : <Box component="span" color="text.disabled">(선택 없음)</Box>
            }
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
