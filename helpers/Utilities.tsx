import ReactGA from "react-ga4"
import { IStringifyOptions } from 'qs'
import { isAddress } from 'viem'
import BigNumber from 'bignumber.js'

export const firstFew = (address: string, end = 5) => {
  return address.substring(0, end)
}

export const lastFew = (address: string, last = 4) => {
  return address.slice(-last)
}


export const abbreviateAddressAsString = (address: string, numChars = 4) => {
  try {
    return `${firstFew(address, numChars + 1)}...${lastFew(address, numChars)}`
  } catch {
    return null
  }
}

export function trackEvent(action: string, category?: string, label?: string, value?: number) {
  ReactGA.event({
    action,
    category: category ?? 'event', // Must be manually set in GA4 custom properties
    label: label ?? 'event',  // Must be manually set in GA4 custom properties
    value: value ?? 0,
  })
}

export function trackCustomEvent(action: string, value?: string) {
  ReactGA.gtag('event', action, {
    value: value ?? 0,
  })
}

// eslint-disable-next-line
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getBaseAPIQueryOptions = (refresh: number | null) => ({
  staleTime: refresh ? 2000 : Infinity, // prevents refetching too fast
  refetchInterval: refresh ?? 0, // refetch when in focus if refresh is on
  refetchIntervalInBackground: false, // do not refetch while not in focus
  retry: 5, // number of times to retry if error, resets on re-focus
  retryOnMount: true, // default, if retries are exhausted this resets the retries on window refocus for example
  retryDelay: (attempt: number) => (1 + 2 ** attempt) * 1000, // exponential backoff for retries
})

export const baseQueryStringifyOptions: IStringifyOptions = {
  skipNulls: true,
}

// Remove null and undefined values from an object
export const filterParams = (params: Record<string, any>) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
}

// Wrapper for isAddress that is case/checksum-insensitive
export function isValidAddressNonStrict(address: string): boolean {
  return isAddress(address, { strict: false })
}

export type formatNumberProps = {
  number?: number | string | BigNumber
  minPrecision?: number
  maxPrecision?: number
  isWei?: boolean
}
export const formatNumber = (
  number: number | string | BigNumber,
  minPrecision = 2,
  maxPrecision = 2,
  isWei = false,
) => {
  if ((number as any)?.toString() === '0') return '0'
  const num = isWei ? new BigNumber(number ?? '0').div('1000000000000000000').toNumber() : new BigNumber(number ?? '0')
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  // force english locale to prevent comma separators
  return Number(num).toLocaleString('en-US', options)
}