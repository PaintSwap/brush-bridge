import { useMemo } from 'react'
import brushAbi from '@/config/abis/Brush.json'
import brushBridgeAbi from '@/config/abis/BrushBridge.json'
import { brushBridgeFromFantomAddress, brushBridgeFromSonicAddress, brushAddress } from '@/config/constants'

/**
 * Helper hooks to get specific contracts (by ABI)
 */

export const useBrush = () => {
  return useMemo(
    () => ({
      abi: brushAbi,
      address: brushAddress,
    }),
    [],
  )
}

export const useBrushBridgeFromFantom = () => {
  return useMemo(
    () => ({
      abi: brushBridgeAbi,
      address: brushBridgeFromFantomAddress,
    }),
    [],
  )
}

export const useBrushBridgeFromSonic = () => {
  return useMemo(
    () => ({
      abi: brushBridgeAbi,
      address: brushBridgeFromSonicAddress,
    }),
    [],
  )
}
