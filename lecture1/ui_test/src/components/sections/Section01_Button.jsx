import { Box, Button, Typography, Divider, Stack } from '@mui/material'

const variants = ['contained', 'outlined', 'text']
const colors = ['primary', 'secondary', 'error']

export default function Section01_Button() {
  const handleClick = (variant, color) => {
    alert(`variant: ${variant} / color: ${color}`)
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        01. Button
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {variants.map((variant) => (
        <Box key={variant} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase' }}>
            {variant}
          </Typography>
          <Stack direction="row" spacing={2}>
            {colors.map((color) => (
              <Button
                key={color}
                variant={variant}
                color={color}
                onClick={() => handleClick(variant, color)}
              >
                {color}
              </Button>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}
