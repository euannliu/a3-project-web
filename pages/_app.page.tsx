import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import MainCard from '../components/MainCard'
import Navbar from '../components/Navbar'

import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [height, setHeight] = useState<string>('100vh')

  useEffect(() => {
    setHeight(`${window.innerHeight}px`)
  })

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ 
        height,
        backgroundColor: 'black' 
      }}>
        <Navbar/>
        <MainCard height={height}>
          <Component {...pageProps} />
        </MainCard>
      </div>
    </ThemeProvider>
  )
}
