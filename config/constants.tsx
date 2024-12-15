import { Chain, fantom} from 'wagmi/chains'
export const SONIC_CHAIN_ID = 57054
export const FANTOM_CHAIN_ID = 250

export const brushBridgeFromFantomAddress = '0x79BA5e879e14577061813D38d3d3927Fd29b2861'
export const brushBridgeFromSonicAddress = '0x12123e66A46246F616cE4B10ca24f95FA7c41C56'
export const brushAddress = '0x85dec8c4B2680793661bCA91a8F129607571863d'

export const FAST_INTERVAL = 3000
export const MEDIUM_INTERVAL = 10000
export const MEDIUM_PLUS_INTERVAL = 30000
export const SLOW_INTERVAL = 60000

export const FANTOM_RPC_URLS = [
  'https://rpcapi.fantom.network',
  'https://fantom-rpc.publicnode.com',
  'https://rpc.fantom.network',
  'https://rpc2.fantom.network',
  'https://fantom.blockpi.network/v1/rpc/public',
  'https://rpc.ankr.com/fantom',
  'https://fantom-mainnet.public.blastapi.io',
  'https://rpc.ftm.tools',
  'https://fantom.publicnode.com',
  'https://endpoints.omniatech.io/v1/fantom/mainnet/public',
  'https://fantom.rpc.thirdweb.com',
]

export const SONIC_RPC_URLS = (() => {
  const rpcs = ['https://rpc.blaze.soniclabs.com']
  return rpcs
})()

export const sonic: Chain = {
  ...fantom,
  id: 57054,
  contracts: {
    multicall3: {
      address: '0xF0c9d803C109518363cffa0319edA897E06d0230',
      blockCreated: 16825253,
    },
  },
  name: 'Sonic Testnet',
  rpcUrls: {
   default: {http: ['https://rpc.blaze.soniclabs.com'] as const},
   public: {http: ['https://rpc.blaze.soniclabs.com'] as const}
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://blaze.soniclabs.com/',
    },
  },
  nativeCurrency: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18,
  },
}

export const fantomCustom = {
  ...fantom,
  rpcUrls: {
    default: {http: ['https://rpcapi.fantom.network/'] as const},
    public: {http: ['https://rpcapi.fantom.network/'] as const}
   },
}

export const breakpoints = {
  xs: 0,
  xsh: 370, // tiny mobile (ant)
  sm: 576,
  sml: 720,
  smh: 852, // common for full width buttons
  md: 968,
  mdh: 1080, // useIsMobile
  lg: 1280, // useIsTablet
  lgh: 1440,
  lghh: 1700,
  xl: 1920,
  xlh: 2300,
  xxl: 2560,
}

export const mediaQueries = {
  xs: `@media screen and (min-width: ${breakpoints.xs}px)`,
  xsh: `@media screen and (min-width: ${breakpoints.xsh}px)`,
  sm: `@media screen and (min-width: ${breakpoints.sm}px)`,
  sml: `@media screen and (min-width: ${breakpoints.sml}px)`,
  smh: `@media screen and (min-width: ${breakpoints.smh}px)`,
  md: `@media screen and (min-width: ${breakpoints.md}px)`,
  mdh: `@media screen and (min-width: ${breakpoints.mdh}px)`,
  lg: `@media screen and (min-width: ${breakpoints.lg}px)`,
  lgh: `@media screen and (min-width: ${breakpoints.lgh}px)`,
  lghh: `@media screen and (min-width: ${breakpoints.lghh}px)`,
  xl: `@media screen and (min-width: ${breakpoints.xl}px)`,
  xlh: `@media screen and (min-width: ${breakpoints.xlh}px)`,
  xxl: `@media screen and (min-width: ${breakpoints.xxl}px)`,
}