import { Config, useWriteContract } from 'wagmi'
import { WriteContractMutateAsync } from 'wagmi/query'
import { waitForTransactionReceipt } from '@wagmi/core'
import { TransactionReceipt, parseEventLogs } from 'viem'
import { wagmiConfig } from '@/pages/_app'
import { tryParseFromEthjsQuery } from '@/helpers/transactionHelpers'
import { sleep } from '@/helpers/Utilities'
import useMaterialToastExtra from '@/hooks/useMaterialToastExtra'

interface UseEstimateGasAndSendProps {
  abi: any
  address: string | undefined
  method: string
}

interface WriteDataProps {
  abi: any
  address: string | undefined
  functionName: string
  args: any[]
  value?: bigint
}

export const getEvents = (abi: any, reciept: TransactionReceipt | undefined) => {
  if (!reciept) return {}
  const decodedLogs = parseEventLogs({
    abi,
    logs: reciept?.logs,
  })
  return Object.fromEntries(decodedLogs.map((log) => [(log as any).eventName, log]))
}

interface createSendTxProps {
  abi: any
  writeContractAsync: WriteContractMutateAsync<Config, unknown>
  onErrorMessage: (message: string) => void
  writeData: any
}

// Send transaction and wait for success or an error
const createSendTx = async ({ abi, writeContractAsync, onErrorMessage, writeData }: createSendTxProps) => {
  try {
    const hash = await writeContractAsync(writeData)

    // Some networks (e.g Kava) don't seem to have the hash ready immediately
    let receipt
    for (let i = 0; i < 10; ++i) {
      try {
        receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: hash,
          onReplaced: (replacement) => console.info('Tx replaced:', replacement),
        })
        break
      } catch (e) {
        if (i === 9) {
          throw e
        }
      }
      await sleep((i + 1) * 1000)
    }
    if (!hash && !receipt) {
      throw new Error('No hash and receipt returned')
    }
    return { receipt, events: getEvents(abi, receipt) }
  } catch (err: any) {
    console.info(err?.code, err?.message, err?.details, err?.shortMessage)
    // Try to parse the details first, otherwise use its shortMessage (from viem)
    const message = tryParseFromEthjsQuery(err?.details) ?? err?.shortMessage
    if (onErrorMessage && message) {
      onErrorMessage(message)
    }
    throw err
  }
}

// Hook for unprepared arguments
export const useEstimateGasAndSend = ({ abi, address, method }: UseEstimateGasAndSendProps) => {
  const { writeContractAsync } = useWriteContract()
  const toastInfo = useMaterialToastExtra()
  const toastInfoGame = toastInfo?.toastInfo

  const sendTx = async (args: any[], value?: string | bigint) => {
    // Include value if it exists, but parameter can't be included otherwise
    const writeData: WriteDataProps = {
      ...{
        abi,
        address,
        functionName: method,
        args,
      },
      ...(value ? { value: BigInt(value.toString()) } : {}),
    }

    return await createSendTx({ abi, writeContractAsync, onErrorMessage: toastInfoGame ?? (() => {}), writeData })
  }

  return sendTx
}

export default useEstimateGasAndSend
