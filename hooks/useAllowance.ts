import { useBrush } from '@/hooks/useContract'
import { FAST_INTERVAL } from '@/config/constants'
import { useAccount, useReadContract } from 'wagmi'
import { useCallback, useMemo } from 'react'
import { isAddress } from 'viem'

// Retrieve brush allowance
export const useBrushAllowance = (spenderAddress: string, startAsNull?: boolean) => {
  const { address: account } = useAccount()
  const brush = useBrush()

  const isValidSpenderAddress = useMemo(() => isAddress(spenderAddress, { strict: false }), [spenderAddress])
  const isValidAccount = useMemo(() => isAddress(account ?? '', { strict: false }), [account])
  const isValidBrushAddress = useMemo(() => isAddress(brush.address, { strict: false }), [brush.address])

  const {
    data: allowance,
    refetch,
    isLoading,
    isError,
    error,
  } = useReadContract({
    address: isValidBrushAddress ? (brush.address as `0x${string}`) : undefined,
    abi: brush.abi,
    functionName: 'allowance',
    args: isValidAccount && isValidSpenderAddress ? [account, spenderAddress] : undefined,
    query: {
      enabled: !!isValidAccount && !!isValidSpenderAddress && !!isValidBrushAddress,
      refetchInterval: FAST_INTERVAL,
      staleTime: 100,
    },
  })

  const formattedAllowance = useMemo(() => {
    if (allowance !== undefined && allowance !== null) {
      try {
        return BigInt(allowance.toString())
      } catch (e) {
        console.error('Error formatting BRUSH allowance:', e)
        return startAsNull ? null : 0n
      }
    }
    return startAsNull ? null : 0n
  }, [allowance, startAsNull])

  const manualRefetch = useCallback(() => {
    if (isValidAccount && isValidSpenderAddress && isValidBrushAddress) {
      refetch()
    }
  }, [refetch, isValidAccount, isValidSpenderAddress, isValidBrushAddress])

  const errorMessage = useMemo(() => {
    if (!isValidAccount) return 'Invalid account address'
    if (!isValidSpenderAddress) return 'Invalid spender address'
    if (!isValidBrushAddress) return 'Invalid BRUSH token address'
    if (isError) return error?.message || 'Error fetching BRUSH allowance'
    return ''
  }, [isValidAccount, isValidSpenderAddress, isValidBrushAddress, isError, error])

  return {
    data: formattedAllowance,
    refetch: manualRefetch,
    isLoading,
    isError: isError || !isValidAccount || !isValidSpenderAddress || !isValidBrushAddress,
    errorMessage,
  }
}
