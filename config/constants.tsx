import { Chain, fantom} from 'wagmi/chains'
export const SONIC_CHAIN_ID = 146
export const FANTOM_CHAIN_ID = 250

export const brushBridgeFromFantomAddress = '0x9D92cD1A5Cea3147e5Bf47EfF2D2C632C9839267'
export const brushBridgeFromSonicAddress = '0xE51EE9868C1f0d6cd968A8B8C8376Dc2991BFE44'
export const brushAddress = '0x85dec8c4B2680793661bCA91a8F129607571863d'

export const layerZeroAPI = 'https://scan.layerzero-api.com/v1/messages/tx/'
export const layerZeroTX = 'https://layerzeroscan.com/tx/'

export const FAST_INTERVAL = 3000
export const MEDIUM_INTERVAL = 10000
export const MEDIUM_PLUS_INTERVAL = 30000
export const SLOW_INTERVAL = 60000

export const FANTOM_RPC_URLS = [
  'https://rpcapi.fantom.network',
  'https://rpc.fantom.network',
  'https://rpc2.fantom.network',
  'https://rpc.ankr.com/fantom',
]

export const SONIC_RPC_URLS = (() => {
  const rpcs = ['https://rpc.soniclabs.com']
  return rpcs
})()

export const sonic: Chain = {
  ...fantom,
  id: 146,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 60,
    },
  },
  name: 'Sonic',
  rpcUrls: {
   default: {http: ['https://rpc.soniclabs.com'] as const},
   public: {http: ['https://rpc.soniclabs.com'] as const}
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://sonicscan.org/',
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