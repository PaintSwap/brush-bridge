import { useBrushBridgeFromFantom, useBrushBridgeFromSonic } from "@/hooks/useContract"
import useEstimateGasAndSend from "@/hooks/useEstimateGasAndSend"

// Contract hooks
export const useTxHooksBrushBridge = () => {
  const bridgeFromFantom = useBrushBridgeFromFantom()
  const bridgeFromSonic = useBrushBridgeFromSonic()

  const estimateGasAndSendBrushBridgeSendFromFantom = useEstimateGasAndSend({
    abi: bridgeFromFantom.abi,
    address: bridgeFromFantom.address,
    method: 'send',
  })

  const estimateGasAndSendBrushBridgeSendFromSonic = useEstimateGasAndSend({
    abi: bridgeFromSonic.abi,
    address: bridgeFromSonic.address,
    method: 'send',
  })

  return {
    estimateGasAndSendBrushBridgeSendFromFantom,
    estimateGasAndSendBrushBridgeSendFromSonic,
  }
}
