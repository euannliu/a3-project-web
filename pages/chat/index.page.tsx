import {
  Button,
  Paper,
  TextField 
} from '@mui/material'

import MicIcon from '@mui/icons-material/Mic'

export default function Chat() {
  return (
    <Paper sx={{ width: '100%', padding: '8px', display: 'flex', flexDirection: 'column-reverse' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <TextField label="Type to chat... [ENTER] to send!" variant="filled" fullWidth/>
        <Button size='large' color='primary' variant="outlined" sx={{ margin: '0 8px 0 8px' }}>
          <MicIcon fontSize='large'/>
        </Button>
      </div>
    </Paper>
  )
}