import '@/styles/globals.css'
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
  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ height: '100vh', backgroundColor: 'black' }}>
        <Navbar/>
        <MainCard>
          <Component {...pageProps} />
        </MainCard>
      </div>
    </ThemeProvider>
  )
}
