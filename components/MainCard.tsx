
import { ReactNode } from 'react';
import { Card } from '@mui/material'

interface MainCardProps {
  children?: ReactNode;
}

export default function MainCard({ children }: MainCardProps) {
  return (
    <div style={{ 
      height: 'calc(100vh - 72px)',
      padding: '3% 10% 3% 10%' 
    }}>
      <Card sx={{ 
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#121212',
        borderRadius: '16px',
        boxShadow: '10px 10px #121212, -10px 10px #121212'
      }}>
        {children}
      </Card>
    </div>
  )
}