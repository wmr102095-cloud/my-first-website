import { useState } from 'react'
import {
  Box, Typography, Divider, Stack, Paper,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
} from '@mui/material'

const options = [
  { value: 'beginner',      label: '입문자',    desc: '코딩을 처음 시작하는 단계' },
  { value: 'junior',        label: '주니어',    desc: '1~3년 경력의 개발자' },
  { value: 'mid',           label: '미드레벨',  desc: '3~5년 경력의 개발자' },
  { value: 'senior',        label: '시니어',    desc: '5년 이상 경력의 개발자' },
]

export default function Section06_Radio() {
  const [selected, setSelected] = useState('')

  const selectedOption = options.find((o) => o.value === selected)

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        06. Radio
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3} maxWidth={400}>
        <FormControl>
          <FormLabel sx={{ mb: 1, fontWeight: 600 }}>개발자 레벨 선택</FormLabel>
          <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value)}>
            {options.map(({ value, label, desc }) => (
              <FormControlLabel
                key={value}
                value={value}
                label={
                  <Box>
                    <Typography variant="body1">{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  </Box>
                }
                control={<Radio />}
                sx={{ alignItems: 'flex-start', mt: 0.5, '& .MuiRadio-root': { pt: 0.5 } }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            선택된 옵션
          </Typography>
          {selectedOption ? (
            <>
              <Typography variant="body1" fontWeight={600}>{selectedOption.label}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOption.desc}</Typography>
            </>
          ) : (
            <Typography variant="body1" color="text.disabled">(선택 없음)</Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  )
}
