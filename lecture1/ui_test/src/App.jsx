import { Box, Container } from '@mui/material'
import Section01_Button from './components/sections/Section01_Button'
import Section02_Input from './components/sections/Section02_Input'
import Section03_Navigation from './components/sections/Section03_Navigation'
import Section04_Dropdown from './components/sections/Section04_Dropdown'
import Section05_Checkbox from './components/sections/Section05_Checkbox'
import Section06_Radio from './components/sections/Section06_Radio'
import Section07_Slider from './components/sections/Section07_Slider'
import Section08_Card from './components/sections/Section08_Card'
import Section09_DragDrop from './components/sections/Section09_DragDrop'
import Section10_Scroll from './components/sections/Section10_Scroll'
import Section11_Animation from './components/sections/Section11_Animation'
import Section12_Menu from './components/sections/Section12_Menu'
import Section13_Sidebar from './components/sections/Section13_Sidebar'
import Section14_Hover from './components/sections/Section14_Hover'
import Section15_Swipe from './components/sections/Section15_Swipe'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Section01_Button />
        <Section02_Input />
        <Section03_Navigation />
        <Section04_Dropdown />
        <Section05_Checkbox />
        <Section06_Radio />
        <Section07_Slider />
        <Section08_Card />
        <Section09_DragDrop />
        <Section10_Scroll />
        <Section11_Animation />
        <Section12_Menu />
        <Section13_Sidebar />
        <Section14_Hover />
        <Section15_Swipe />
      </Container>
    </Box>
  )
}
