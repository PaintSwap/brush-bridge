import { createTheme } from '@mui/material/styles'
import { orange, red } from '@mui/material/colors'
import { Manrope } from 'next/font/google'

const orbitron = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

declare module '@mui/material/styles' {
  interface Palette {
    subtle: Palette['primary']
  }
  interface PaletteOptions {
    subtle: PaletteOptions['primary']
  }
}

const theme = createTheme({
  typography: {
    fontFamily: orbitron.style.fontFamily,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#164ba8',
      contrastText: '#FFFFFFFF',
    },
    secondary: {
      main: 'rgb(250, 250, 250)',
      contrastText: '#FFFFFFFF',
    },
    subtle: {
      main: '#7d8fd1',
    },
    error: {
      main: red[600],
    },
    warning: {
      main: orange[600],
    },
  },
})

export default theme