import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { createConfig, WagmiProvider, fallback, unstable_connector, http } from 'wagmi'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import theme from '../config/theme'
import createEmotionCache from '../config/createEmotionCache'
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"
import ReactGA from "react-ga4"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fantomCustom, sonic } from '@/config/constants'
import { MaterialToastsProvider } from '@/contexts/MaterialToastContext'
import ToastSnacks from '@/Components/ToastSnacks'
import { MaterialToastsProviderExtra } from '@/contexts/MaterialToastContextExtra'
import ToastSnacksExtra from '@/Components/ToastSnacksExtra'
import dynamic from 'next/dynamic'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

// Generate HTTP transports from an array of URLs
export const createHttpTransports = (urls: string[]) => urls.map((url) => http(url))

// Wallet RPC
export const InjectedTransport = unstable_connector(injected, {
  key: 'injected',
})

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

// 1. Get projectId
const env = process.env
const projectId = env?.NEXT_PUBLIC_WC_ID || ''
const gaID = env?.NEXT_PUBLIC_GA_ID || ''

// 2. Create wagmiConfig
const metadata = {
  name: 'BRUSH Bridge',
  description: 'Bridge BRUSH between Fantom and Sonic',
  url: 'https://bridge.paintswap.io',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiConfig = createConfig({
  chains: [sonic, fantomCustom],
  transports: {
    [sonic.id]: fallback([InjectedTransport], {
      rank: { interval: 60_000 },
    }),
    [fantomCustom.id]: fallback([InjectedTransport], {
      rank: { interval: 60_000 },
    }),
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    })
  ],
  ssr: false,
  pollingInterval: 250,
})

// 3. Create modal
createWeb3Modal({ 
  wagmiConfig,
  projectId: projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#05228c',
    '--w3m-color-mix-strength': 20
  },
  chainImages: {
    [57054]: '/images/sonic.png',
  },
})

ReactGA.initialize(gaID)
const queryClient = new QueryClient()

const App = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <MaterialToastsProvider>
              <MaterialToastsProviderExtra>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <ToastSnacks />
                <ToastSnacksExtra />
                <Component {...pageProps} />
              </MaterialToastsProviderExtra>
            </MaterialToastsProvider>
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// To solve mui button get different server and client styles for some reason
// Set ssr: true if removing this
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
