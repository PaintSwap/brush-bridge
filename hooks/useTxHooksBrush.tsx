import { useBrush } from "@/hooks/useContract"
import useEstimateGasAndSend from "@/hooks/useEstimateGasAndSend"

// Contract hooks
export const useTxHooksBrush = () => {
  const brush = useBrush()

  const estimateGasAndSendBrushApprove = useEstimateGasAndSend({
    abi: brush.abi,
    address: brush.address,
    method: 'approve',
  })

  const estimateGasAndSendBrush = useEstimateGasAndSend({
    abi: brush.abi,
    address: brush.address,
    method: 'transfer',
  })

  return {
    estimateGasAndSendBrushApprove,
    estimateGasAndSendBrush,
  }
}
