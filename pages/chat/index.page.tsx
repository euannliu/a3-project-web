import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Paper,
  Typography
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TelegramIcon from '@mui/icons-material/Telegram'

import characters from '../../components/characterPrompts'

export default function CharacterSelect() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ width: '100%', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
      <Typography variant='h3'>Select A Character</Typography>
      <br/>
      { Object.keys(characters).map((character, index) => (
        <Accordion key={index} expanded={expanded === character} onChange={handleChange(character)} sx={{ width: '100%', backgroundColor: '#242424' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`a3-character-${character}-content`}
            id={`a3-character-${character}-header`}
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {character.toUpperCase()[0] + character.substring(1)}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Character Tagline</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              Character Description
            </Typography>
            <Button 
              size='medium' 
              color='primary'
              variant='contained'
              onClick={() => {
                router.push(`/chat/${character}`)
              }}
              sx={{ margin: '0 8px 0 8px' }}
            >
              <TelegramIcon fontSize='medium'/>
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  )
}