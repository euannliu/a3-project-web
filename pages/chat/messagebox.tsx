import { useMemo } from 'react'
import moment from 'moment'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import { blue, green } from '@mui/material/colors'

import { Message } from './types'


export default function MessageBox({ role, content, datetime }: Message) {
  const direction = useMemo(() => role === 'user' ? 'row-reverse' : 'row', [role])
  const closeTheGap = '-20px'
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', marginTop: closeTheGap, border: 'none', boxShadow: 'none' }}>
      <div style={{ display: 'flex', flexDirection: direction }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: role === 'user' ? green[500] : blue[500] }} aria-label={role} >
              {role[0]}
            </Avatar>
          }
          subheader={moment(datetime).format('hh:mm a')}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: direction }}>
        <CardContent>
          <Card sx={{ backgroundColor: '#282828', padding: '12px', marginTop: closeTheGap, borderRadius: '16px' }}>
            <Typography variant="body1" color="text.secondary">
              {content}
            </Typography>
          </Card>
        </CardContent>
      </div>
    </Card>
  )
}