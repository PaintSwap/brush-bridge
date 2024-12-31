import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiProvider, http } from 'wagmi'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import theme from '../config/theme'
import createEmotionCache from '../config/createEmotionCache'
import ReactGA from "react-ga4"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fantomCustom,  } from '@/config/constants'
import { MaterialToastsProvider } from '@/contexts/MaterialToastContext'
import ToastSnacks from '@/Components/ToastSnacks'
import { MaterialToastsProviderExtra } from '@/contexts/MaterialToastContextExtra'
import ToastSnacksExtra from '@/Components/ToastSnacksExtra'
import StyledComponentsRegistry from '@/pages/registry'
import { sonic } from 'viem/chains'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { AppKitNetwork } from '@reown/appkit/networks'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

// Generate HTTP transports from an array of URLs
export const createHttpTransports = (urls: string[]) => urls.map((url) => http(url))

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

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [fantomCustom, sonic]

const wagmiAdapter = new WagmiAdapter({
  /** For later when we have more RPCs
  * [sonic.id]: fallback([...createHttpTransports(SONIC_RPC_URLS)], {
    rank: { interval: 60_000 },
  }),
  */
  transports: {
    [fantomCustom.id]: http(),
    [sonic.id]: http(),
  },
  // connectors,
  projectId,
  networks,
  ssr: true,
  pollingInterval: 500,
})

export const { wagmiConfig } = wagmiAdapter

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: undefined,
    onramp: true,
    swaps: true,
  },
  defaultNetwork: fantomCustom,
  allowUnsupportedChain: true,
  tokens: {
    'eip155:146': {
      address: '0xe51ee9868c1f0d6cd968a8b8c8376dc2991bfe44',
      image: 'https://estfor.com/images/icons/brush_dark.png', //optional
    },
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 9999,
  },
  chainImages: {
    146: '/images/sonic.png',
  },
})

ReactGA.initialize(gaID)
const queryClient = new QueryClient()

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <StyledComponentsRegistry>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <MaterialToastsProvider>
                <MaterialToastsProviderExtra>
                  <CssBaseline />
                  <ToastSnacks />
                  <ToastSnacksExtra />
                  <Component {...pageProps} />
                </MaterialToastsProviderExtra>
              </MaterialToastsProvider>
            </ThemeProvider>
          </CacheProvider>
        </StyledComponentsRegistry>
      </QueryClientProvider>
    </WagmiProvider>
  )
}