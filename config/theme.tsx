import { createTheme } from '@mui/material/styles'
import { orange, red } from '@mui/material/colors'

declare module '@mui/material/styles' {
  interface Palette {
    subtle: Palette['primary']
  }
  interface PaletteOptions {
    subtle: PaletteOptions['primary']
  }
}

// Create a theme instance.
const theme = createTheme({
palette: {
    mode: 'dark', //default theme
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