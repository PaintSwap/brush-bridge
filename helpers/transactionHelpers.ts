import { wagmiConfig } from '@/pages/_app'
import { isAddress } from 'viem'
import { readContract } from 'wagmi/actions'

/**
 * Parses and returns the error message
 * Returns undefined if unable to parse
 */
export const tryParseFromEthjsQuery = (raw: string) => {
  try {
    console.info('Raw message', raw)
    const regex = /message(?:':\s+'|":\s+")([^'"]+)/
    const match = raw.match(regex)
    let message = match ? match[1] : null

    if (!message) {
      try {
        const startIndex = raw.indexOf('{')
        const endIndex = raw.lastIndexOf('}')
        const jsonString = raw.substring(startIndex, endIndex + 1)
        const jsonObject = JSON.parse(jsonString)
        const traverse = (obj: any) => {
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key])
            } else if (key === 'message') {
              message = obj[key]
              break
            }
          }
        }
        traverse(jsonObject)
      } catch (error) {
        // JSON parsing failed
        console.error('JSON parsing failed', error)
        return undefined
      }
    }
    const capitalized = `${message?.[0]?.toUpperCase() ?? ''}${message?.slice(1) ?? ''}`
    return capitalized
  } catch (e) {
    return undefined
  }
}

/**
 * Reads a contract from the provider
 * @param address - The address of the contract
 * @param abi - The ABI of the contract
 * @param functionName - The function name to call
 * @param args - The arguments to pass to the function
 * @param caller - The component that is calling (for error handling)
 */
export const readContractFromProvider = async ({
  address,
  abi,
  functionName,
  args,
  caller,
}: {
  address: `0x${string}`
  abi: any
  functionName: string
  args: any[]
  caller: string
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isAddress(address, { strict: false })) {
      reject(new Error('Invalid address'))
    }
    // console.log(`Reading contract for ${caller}`, address, functionName, args)
    readContract(wagmiConfig, { address, abi, functionName, args })
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        console.error(`Failed reading contract data for ${caller}`, error)
        reject(error)
      })
  })
}
