import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { erc20Abi, PublicClient } from 'viem'
import { useAccount } from 'wagmi'
import { FAST_INTERVAL } from '@/config/constants'
import { getBaseAPIQueryOptions, isValidAddressNonStrict } from '@/helpers/Utilities'
import useMultichainCalls from '@/hooks/useMultichainCalls'

interface Props {
  client: PublicClient
  tokenAddress: string
  address?: string | undefined
  refresh?: boolean
}

/** Listens for the balance for an address on a chain for any token
 * If address is not provided, the user's address will be used
 * @param client - The client to get the balance from
 * @param tokenAddress - The address of the token to get the balance for
 * @param address - The address to get the balance for (optional)
 * @param refresh - Whether to refresh the balance (optional)
 * @returns The token balance as a UseQueryResult
 */
const useMultichainTokenBalance = ({
  client,
  tokenAddress,
  address,
  refresh = true,
}: Props): UseQueryResult<bigint | null, Error> => {
  const { readContractSingle } = useMultichainCalls({ client })
  const { address: account } = useAccount()
  const accountToUse = address || account

  const fetchNFTBalance = async (): Promise<bigint | null> => {
    if (
      !client?.chain?.id ||
      !tokenAddress ||
      !isValidAddressNonStrict(tokenAddress) ||
      (!!accountToUse && !isValidAddressNonStrict(accountToUse))
    ) {
      return null
    }
    try {
      const readParams = {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [accountToUse as `0x${string}`],
      }
      const data = await readContractSingle(readParams)
      return data ? BigInt(data) : 0n
    } catch (error) {
      console.error('Error fetching NFT balance:', error)
      return null
    }
  }

  const queryHook = useQuery({
    queryKey: ['useMultichainTokenBalance', client?.chain?.id, tokenAddress, accountToUse, refresh],
    queryFn: fetchNFTBalance,
    enabled:
      !!client?.chain?.id &&
      !!tokenAddress &&
      isValidAddressNonStrict(tokenAddress) &&
      !!accountToUse &&
      isValidAddressNonStrict(accountToUse),
    ...getBaseAPIQueryOptions(refresh ? FAST_INTERVAL : null),
  })

  return queryHook
}

export default useMultichainTokenBalance
