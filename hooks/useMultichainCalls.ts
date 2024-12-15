import { useCallback } from 'react'
import { PublicClient } from 'viem'

export interface MultichainProps {
  client: PublicClient
}

const useMultichainCalls = ({ client }: MultichainProps) => {
  /* Make a single contract call
  / @param address - The address of the contract
  / @param abi - The ABI of the contract
  / @param functionName - The function name to call
  / @param args - The arguments to pass to the function
  / @returns The data returned by the function
  */
  const readContractSingle = useCallback(
    async ({
      address,
      abi,
      functionName,
      args,
    }: {
      address: `0x${string}`
      abi: any
      functionName: string
      args: any[]
    }): Promise<any> => {
      return new Promise((resolve, reject) => {
        client
          .readContract({ address, abi, functionName, args })
          .then((data) => {
            if (data !== null && data !== undefined) {
              resolve(data)
            } else {
              reject(new Error('No contract data found'))
            }
          })
          .catch((error) => {
            console.error('Failed reading contract data', error)
            reject(error)
          })
      })
    },
    [client],
  )

  /* Get a transaction receipt
  / @param txHash - The hash of the transaction
  / @returns The transaction receipt
  */
  const getTransactionReceipt = useCallback(
    async ({ txHash }: { txHash: `0x${string}` }): Promise<any> => {
      return new Promise((resolve, reject) => {
        client
          .getTransactionReceipt({ hash: txHash })
          .then((receipt) => {
            if (receipt) {
              resolve(receipt)
            } else {
              reject(new Error('Transaction receipt not found'))
            }
          })
          .catch((error) => {
            console.error('Error getting transaction receipt:', error)
            reject(error)
          })
      })
    },
    [client],
  )

  /* Get the balance of an account
  / @param address - The address of the account
  / @returns The balance of the account in wei
  */
  const getAccountBalance = useCallback(
    async ({ address }: { address: `0x${string}` }): Promise<bigint> => {
      return new Promise((resolve, reject) => {
        client
          .getBalance({ address })
          .then((balance) => {
            resolve(balance)
          })
          .catch((error) => {
            console.error('Error getting account balance:', error)
            reject(error)
          })
      })
    },
    [client],
  )

  return { readContractSingle, getTransactionReceipt, getAccountBalance }
}

export default useMultichainCalls
