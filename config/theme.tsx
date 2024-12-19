import { createTheme } from '@mui/material/styles'
import { orange, red } from '@mui/material/colors'
import { manrope } from '@/config/fonts'

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
    fontFamily: manrope.style.fontFamily,
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "3px solid #2b2b2b",
          },
        },
      },
    },
  },
})

export default theme