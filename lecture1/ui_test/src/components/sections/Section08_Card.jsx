import { useState } from 'react'
import {
  Box, Typography, Divider, Grid,
  Card, CardMedia, CardContent, CardActions,
  Button, Chip,
} from '@mui/material'

const cards = [
  {
    id: 1,
    title: 'React 기초',
    description: 'React의 핵심 개념인 컴포넌트, Props, State를 학습합니다. 현대 웹 개발의 필수 라이브러리를 마스터하세요.',
    image: 'https://picsum.photos/seed/react/400/200',
    tag: 'Frontend',
    tagColor: 'primary',
  },
  {
    id: 2,
    title: 'Node.js 서버',
    description: 'Node.js와 Express로 RESTful API를 구축합니다. 백엔드 개발의 기본기를 다지는 실습 중심 강좌입니다.',
    image: 'https://picsum.photos/seed/node/400/200',
    tag: 'Backend',
    tagColor: 'success',
  },
  {
    id: 3,
    title: 'UI/UX 디자인',
    description: 'Figma를 활용한 와이어프레임과 프로토타입 제작법을 배웁니다. 사용자 중심 설계 원칙을 실무에 적용하세요.',
    image: 'https://picsum.photos/seed/design/400/200',
    tag: 'Design',
    tagColor: 'secondary',
  },
  {
    id: 4,
    title: 'DevOps 입문',
    description: 'Docker와 CI/CD 파이프라인 구성 방법을 학습합니다. 배포 자동화로 개발 효율을 극적으로 높여보세요.',
    image: 'https://picsum.photos/seed/devops/400/200',
    tag: 'Infra',
    tagColor: 'warning',
  },
]

function CourseCard({ card }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Card
      elevation={hovered ? 8 : 1}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'elevation 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'pointer',
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={card.image}
        alt={card.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Chip
          label={card.tag}
          color={card.tagColor}
          size="small"
          sx={{ mb: 1 }}
        />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {card.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {card.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={() => alert(`"${card.title}" 강좌를 시작합니다!`)}>
          수강 시작
        </Button>
        <Button size="small" onClick={() => alert(`"${card.title}" 상세 정보`)}>
          자세히 보기
        </Button>
      </CardActions>
    </Card>
  )
}

export default function Section08_Card() {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        08. Card
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <CourseCard card={card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
