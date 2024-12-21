import { useEffect, useMemo, useRef, useState } from "react"
import styles from "@/styles/Home.module.css"
import type { NextPage } from 'next'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { fallback, useAccount, useSwitchChain } from 'wagmi'
import { abbreviateAddressAsString, formatNumber, sleep, trackEvent } from '@/helpers/Utilities'
import { Divider, Box, Stack, ToggleButtonGroup, ToggleButton, IconButton, CircularProgress } from '@mui/material'
import Head from "next/head"
import { createHttpTransports, wagmiConfig } from "@/pages/_app"
import NetworkButton from "@/Components/NetworkButton"
import { SONIC_CHAIN_ID, FANTOM_CHAIN_ID, FANTOM_RPC_URLS, SONIC_RPC_URLS, fantomCustom, sonic, brushAddress } from "@/config/constants"
import { createPublicClient, formatEther, isAddress, pad, parseEther } from "viem"
import { FieldValues, useForm, useWatch } from 'react-hook-form'
import useMaterialToast from "@/hooks/useMaterialToast"
import { useTxHooksBrushBridge } from "@/hooks/useTxHooksBrushBridge"
import { useTxHooksBrush } from "@/hooks/useTxHooksBrush"
import { useBrushBridgeFromFantom, useBrushBridgeFromSonic } from "@/hooks/useContract"
import useMultichainTokenBalance from "@/hooks/useMultichainTokenBalance"
import { useBrushAllowance } from "@/hooks/useAllowance"
import { Options } from '@layerzerolabs/lz-v2-utilities'
import { readContract } from 'wagmi/actions'
import SuperText from "@/Components/SuperText"
import SuperButton from "@/Components/SuperButton"
import { FormInputText } from "@/Components/FormInputText"
import Image from "next/image"
import { manrope } from "@/config/fonts"

const noFantom = (isFantom: boolean, switchChain: ({chainId}: {chainId: number}) => void) => {
  return (
    <>
      {!isFantom && (
        <div className={styles.switchContent} onClick={() => switchChain({chainId: 250})}>
          <Stack spacing={1} alignItems="center" direction="row">
            <SuperText textAlign="center" width="100%" fontSize="14px" color="warning">
              {`Switch to Fantom Network`}
            </SuperText>
            <Image src="/images/fantom.png" alt="F" width={22} height={22} />
          </Stack>
        </div>
      )}
    </>
  )
}

const noSonic = (isSonic: boolean, switchChain: ({chainId}: {chainId: number}) => void) => {
  return (
    <>
      {!isSonic && (
        <div className={styles.switchContent} onClick={() => switchChain({chainId: SONIC_CHAIN_ID})}>
          <Stack spacing={1} alignItems="center" direction="row">
            <SuperText textAlign="center" width="100%" fontSize="14px" color="warning">
              {`Switch to Sonic Network`}
            </SuperText>
            <Image src="/images/sonic.png" alt="S" width={22} height={22} />
          </Stack>
        </div>
      )}
    </>
  )
}

interface MessagingFee {
  nativeFee: bigint
  lzTokenFee: bigint
}

const Home: NextPage = () => {
  const [showAddress, setShowAddress] = useState<`0x${string}` | undefined>(undefined)
  const [networkValue, setNetworkValue] = useState<number>(250)
  const [direction, setDirection] = useState(0)
  const [isApproving, setIsApproving] = useState(false)
  const [isBridging, setIsBridging] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isWaitingForFantomBalance, setIsWaitingForFantomBalance] = useState(false)
  const [isWaitingForSonicBalance, setIsWaitingForSonicBalance] = useState(false)
  
  // Start with a high number to avoid flashing text
  const [brushAllowance, setBrushAllowance] = useState<bigint>(1000000000000000000000000n)

  const { address: account, chain } = useAccount()
  const { open } = useWeb3Modal()
  const { switchChain, switchChainAsync } = useSwitchChain({
    config: wagmiConfig,
    mutation: {
      onSuccess() {
        console.info('Switch Network Success')
      },
    },
  })

  const directionRef = useRef(direction)
  const accountRef = useRef(account)

  const fantomClient: any = createPublicClient({
    chain: fantomCustom,
    transport: fallback([...createHttpTransports(FANTOM_RPC_URLS)], { rank: { interval: 60_000 } }),
  })

  const sonicClient: any = createPublicClient({
    chain: sonic,
    transport: fallback([...createHttpTransports(SONIC_RPC_URLS)], { rank: { interval: 60_000 } }),
  })

  const isFantom = chain?.id === FANTOM_CHAIN_ID
  const isSonic = chain?.id === SONIC_CHAIN_ID
  const isWrongNetwork = direction === 0 && !isFantom || direction === 1 && !isSonic

  const projectId = process.env?.NEXT_PUBLIC_WC_ID || ''

  const {
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { isValid, errors },
  } = useForm({
    mode: 'all',
    shouldUseNativeValidation: false,
    defaultValues: {
      amount: '',
      address: account ?? '',
    },
  })

  const inputValue = useWatch({
    control,
    name: 'amount',
  })

  const inputAddress = useWatch({
    control,
    name: 'address',
  })

  const validInputValue: string = useMemo(() => {
    return Number.isFinite(Number(inputValue)) ? inputValue?.toString() ?? '0' : '0'
  }, [inputValue])

  const disabledInputs = useMemo(() => {
    return isApproving || isBridging || !account || isWaitingForFantomBalance || isWaitingForSonicBalance
  }, [isApproving, isBridging, account, isWaitingForFantomBalance, isWaitingForSonicBalance])

  const mToast = useMaterialToast()
  const toastError = mToast?.toastError
  const toastSuccess = mToast?.toastSuccess
  const bridgeFromFantom = useBrushBridgeFromFantom()
  const bridgeFromSonic = useBrushBridgeFromSonic()
  const { estimateGasAndSendBrushBridgeSendFromFantom, estimateGasAndSendBrushBridgeSendFromSonic } =
    useTxHooksBrushBridge()
  const { estimateGasAndSendBrushApprove } = useTxHooksBrush()

  const { data: sonicBrushBalanceWei, refetch: refetchSonic } = useMultichainTokenBalance({
    client: sonicClient,
    tokenAddress: bridgeFromSonic.address,
    address: account,
    refresh: true,
  })
  const { data: fantomBrushBalanceWei, refetch: refetchFantom } = useMultichainTokenBalance({
    client: fantomClient,
    tokenAddress: brushAddress,
    address: account,
    refresh: true,
  })
  const sonicBrushBalance = formatEther(sonicBrushBalanceWei ?? 0n)
  const fantomBrushBalance = formatEther(fantomBrushBalanceWei ?? 0n)

  const { data: brushAllowanceFetched } = useBrushAllowance(bridgeFromFantom.address, true)

  useEffect(() => {
    console.info("WC", `${projectId?.slice(0, 4)}...`)
  }, [projectId])

  useEffect(() => {
    if (account) {
      setShowAddress(account)
    } else {
      setShowAddress(undefined)
    }
  }, [account])

  // When the network changes
  useEffect(() => {
    if (chain?.id && chain?.id !== networkValue) {
      setNetworkValue(chain.id)
    }
  }, [chain?.id, networkValue])

  useEffect(() => {
    if (brushAllowanceFetched !== null) {
      setBrushAllowance(brushAllowanceFetched ?? 0n)
    }
  }, [brushAllowanceFetched])

  // Set setIsApproved to false if account changes to reset the approval step
  useEffect(() => {
    if (accountRef.current !== account) {
      setIsApproved(false)
      setValue('address', account ?? '')
      trigger('address')
      trigger('amount')
    }
    accountRef.current = account
  }, [account, setValue, trigger])

  // If direction is 0 but isSonic, switch to fantom
  // If direction is 1 but isFantom, switch to sonic
  /**
  useEffect(() => {
    if (direction === 0 && !isFantom) {
      switchChain({chainId: 250})
    } else if (direction === 1 && !isSonic) {
      switchChain({ chainId: SONIC_CHAIN_ID })
    }
  }, [direction, isSonic, isFantom, switchChain])
  */

  // Revalidate inputs when direction changes
  useEffect(() => {
    if (directionRef.current !== direction) {
      trigger('amount')
      trigger('address')
    }
    directionRef.current = direction
  }, [direction, trigger])

  // Reset waiting for balances when balances updates
  useEffect(() => {
    if (fantomBrushBalanceWei !== undefined) {
      setIsWaitingForFantomBalance(false)
    }
  }, [fantomBrushBalanceWei])

  useEffect(() => {
    if (sonicBrushBalanceWei !== undefined) {
      setIsWaitingForSonicBalance(false)
    }
  }, [sonicBrushBalanceWei])

  const needApproval = useMemo(
    () => brushAllowance < parseEther(validInputValue) && !isApproved && direction === 0,
    [brushAllowance, isApproved, validInputValue, direction],
  )

  const toggleDirection = (direction: number) => {
    setDirection(direction)
  }

  /**
  const switchToFantom = useCallback(async () => {
    try {
      const res = await switchChainAsync({chainId: FANTOM_CHAIN_ID})
      if (res.id !== FANTOM_CHAIN_ID) {
        toastError && toastError(`Failed to switch to Fantom. Please try again.`, 'Failed')
        return false
      }
      return true
    } catch (e) {
      console.error('Failed switching to Fantom:', e)
      toastError && toastError(`Failed to switch to Fantom. Please try again.`, 'Failed')
      return false
    }
  }, [switchChainAsync, toastError])

  const switchToSonic = useCallback(async () => {
    try {
      const res = (await switchChainAsync({chainId: SONIC_CHAIN_ID})) as any // TODO: When sonic is supported, remove any
      if (res.id !== SONIC_CHAIN_ID) {
        toastError && toastError(`Failed to switch to Sonic. Please try again.`, 'Failed')
        return false
      }
      return true
    } catch (e) {
      console.error('Failed switching to Sonic:', e)
      toastError && toastError(`Failed to switch to Sonic. Please try again.`, 'Failed')
      return false
    }
  }, [switchChainAsync, toastError])
  */

  const onBridge = async (data: FieldValues) => {
    const amountToBridge = parseEther(data.amount ?? '0')
    const bridgeToAddress = data.address
    if (
      !account ||
      !amountToBridge ||
      !bridgeToAddress ||
      !isAddress(bridgeToAddress, { strict: false }) ||
      bridgeToAddress.toLowerCase() !== inputAddress.toLowerCase() ||
      data.amount !== inputValue ||
      isWrongNetwork
    )
      return
    const fromFantom = direction === 0

    if (fromFantom) {
      // Approve brush if sending from fantom

      if (needApproval) {
        setIsApproving(true)
        // Switch network if needed
        /**
        if (!switchToFantom()) {
          return
        }
        */
        try {
          const { receipt, events } = await estimateGasAndSendBrushApprove([bridgeFromFantom.address, amountToBridge])
          // Check if the actual approval amount set in the wallet is enough
          const approvalAmount = BigInt(events?.Approval.args['value'].toString())
          const enoughApproval = approvalAmount >= amountToBridge
          if (!enoughApproval) {
            toastError && toastError(`Approval amount is not enough. Please try again.`, 'Failed')
            return
          }
          toastSuccess && toastSuccess(`Approved BRUSH!`, 'Success')
        } catch (e) {
          console.error('Failed approving BRUSH:', e)
          toastError && toastError(`Could not approve BRUSH. Please try again.`, 'Failed')
          return
        } finally {
          // Give some extra time for rpc to update
          await sleep(2000)
          setIsApproving(false)
          setIsApproved(false)
          setIsBridging(false)
        }
      }
    }

    if (fromFantom) {
      console.info(`Bridging ${data.amount} BRUSH from Fantom to Sonic`)
    } else {
      console.info(`Bridging ${data.amount} BRUSH from Sonic to Fantom`)
    }
    setIsBridging(true)
    // Switch network if needed
    /**
    if (fromFantom && !switchToFantom()) {
      return
    }
    if (!fromFantom && !switchToSonic()) {
      return
    }
    */

    try {
      // Construct send parameters
      const options = Options.newOptions().addExecutorLzReceiveOption(200_000, 0).toHex().toString()

      const sendParams = {
        dstEid: fromFantom ? 30332 : 30112, // Fantom or sonic
        to: pad(bridgeToAddress, { size: 32 }), // Convert address to bytes32
        amountLD: amountToBridge,
        minAmountLD: amountToBridge,
        extraOptions: options,
        composeMsg: '0x',
        oftCmd: '0x',
      }

      // Get bridge fee
      const bridgeFee = (await readContract(wagmiConfig, {
        abi: fromFantom ? bridgeFromFantom.abi : bridgeFromSonic.abi,
        address: fromFantom ? bridgeFromFantom.address as `0x${string}` : bridgeFromSonic.address as `0x${string}`,
        functionName: 'quoteSend',
        args: [sendParams, false],
      })) as MessagingFee

      if (!bridgeFee || bridgeFee.nativeFee === 0n) {
        toastError && toastError(`Can't get bridge fee. Please try again.`, 'Failed')
        return
      }

      console.info(`Bridge fee:`, bridgeFee)

      const feeStruct = {
        nativeFee: bridgeFee.nativeFee,
        lzTokenFee: 0n,
      }

      // Execute bridge transaction
      const bridgeFunction = fromFantom
        ? estimateGasAndSendBrushBridgeSendFromFantom
        : estimateGasAndSendBrushBridgeSendFromSonic

      const { receipt, events } = await bridgeFunction([sendParams, feeStruct, account], bridgeFee.nativeFee)

      console.info(`Bridge receipt:`, receipt)
      if (fromFantom) {
        toastSuccess && toastSuccess(`Sent ${data.amount} BRUSH! Funds will arrive on Sonic shortly.`, 'Success')
        setIsWaitingForSonicBalance(true)
      } else {
        toastSuccess && toastSuccess(`Sent ${data.amount} BRUSH! Funds will arrive on Fantom shortly.`, 'Success')
        setIsWaitingForFantomBalance(true)
      }

      // Clear input after successful bridge
      setValue('amount', '')

      // Refresh balances
      await sleep(1000)
      refetchFantom()
      refetchSonic()

      trackEvent('BRUSH Bridging', `Bridged BRUSH to ${fromFantom ? 'Sonic' : 'Fantom'}`, `Bridge done`)
    } catch (e) {
      console.error('Failed bridging BRUSH:', e)
      toastError && toastError(`Could not bridge BRUSH. Please try again.`, 'Failed')
      const err: any = e
      trackEvent('BRUSH Bridging', `Failed: Bridging BRUSH to ${fromFantom ? 'Sonic' : 'Fantom'}`, `Contract Fail: ${err?.code}`)
    } finally {
      setIsBridging(false)
      setIsApproved(false)
    }
  }

  const toFixedNumberStringWithoutTrailingZeros = (value: string, decimals: number) => {
    const multiplier = Math.pow(10, decimals)
    const floored = Math.floor(Number(value) * multiplier) / multiplier
    return floored.toFixed(decimals).replace(/\.?0+$/, '')
  }

  return (
    <>
      <Head>
        <title>$BRUSH Bridge</title>
        <meta name="description" content="Bridge $BRUSH between Fantom and Sonic" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="keywords" content="brush, $brush, bridge, fantom, sonic, $S" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BRUSH Bridge" />
        <meta name="twitter:image" content="https://bridge.paintswap.io/og.png" />
        <meta name="twitter:domain" content="bridge.paintswap.io" />
        <meta name="twitter:site" content="@paintoshi" />
        <meta name="twitter:creator" content="@paintoshi" />
        <meta name="twitter:description" content="Bridge $BRUSH between Fantom and Sonic" />

        <meta property="og:title" content="BRUSH Bridge" />
        <meta property="og:description" content="Bridge $BRUSH between Fantom and Sonic" />
        <meta property="og:image" content="https://bridge.paintswap.io/og.png" />
        <meta property="og:url" content="https://bridge.paintswap.io" />
      </Head>
      <main className={`${manrope.className} ${styles.main}`}>
        <div className={styles.center}>
          <div className={styles.mainPanel}>
            <h1 className={styles.title}>BRUSH Bridge</h1>
            <p className={styles.titleSub}>
              Move $BRUSH between Fantom and Sonic<br />
            </p>

            <Stack width="100%" spacing={2} alignItems="center" pt="16px">
              <Stack width="100%" direction={{xs: "column", sm: "row"}} alignItems="center" justifyContent="space-between" spacing={2}>
                {showAddress && (
                  <SuperButton size="large" width="100%" variant="contained" onClick={() => open()}>{abbreviateAddressAsString(account ?? 'N/A')}</SuperButton>
                )}
                {!showAddress && (
                  <SuperButton size="large" width="100%" variant="contained" onClick={() => open()}>Connect Wallet</SuperButton>
                )}
                {/** <NetworkButton /> **/}
              </Stack>
              <Stack width="100%" spacing={2} alignItems="center">
                <Stack width="100%" spacing={1.5} alignItems="center">
                  <ToggleButtonGroup
                    fullWidth={true}
                    value={direction}
                    size="medium"
                    exclusive
                    onChange={(event: any) => toggleDirection(Number(event.target.value))}
                    disabled={disabledInputs}
                  >
                    <ToggleButton value={0} aria-label="fantom-to-sonic">
                      To Sonic
                    </ToggleButton>
                    <ToggleButton value={1} aria-label="sonic-to-fantom">
                      To Fantom
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {direction === 1 && (
                    <SuperText fontSize="12px" lineHeight={0.5} color="warning">Sonic to Fantom bridge ends on Mar 25th, 2025</SuperText>
                  )}
                </Stack>
                <Stack width="fit-content" spacing={0.5} alignItems="center">
                  <SuperText>BRUSH Balances</SuperText>
                  <Stack spacing={2} width="100%" justifyContent="center" direction="row">
                    <Stack spacing={1} alignItems="end" justifyContent="space-around">
                      <SuperText fontSize="14px" color="subtle">
                        <a href={`https://ftmscan.com/token/${brushAddress}?a=${account}`} target="_blank">On Fantom</a>
                      </SuperText>
                      <SuperText fontSize="14px" color="subtle">
                        <a href={`https://sonicscan.org/token/${bridgeFromSonic.address}?a=${account}`} target="_blank">On Sonic</a>
                      </SuperText>
                    </Stack>
                    <Stack spacing={1}  justifyContent="space-around">
                      <Stack spacing={1} direction="row" alignItems="center">
                        <Image src="/images/brush_dark.png" alt="$BRUSH" width={22} height={22} />
                        <SuperText>{formatNumber(toFixedNumberStringWithoutTrailingZeros(fantomBrushBalance, 6), 0, 6)}</SuperText>
                        {isWaitingForFantomBalance && <CircularProgress size={18} />}
                      </Stack>
                      <Stack spacing={1} direction="row" alignItems="center">
                        <Image src="/images/brush_dark.png" alt="$BRUSH" width={22} height={22} />
                        <SuperText>{formatNumber(toFixedNumberStringWithoutTrailingZeros(sonicBrushBalance, 6), 0, 6)}</SuperText>
                        {isWaitingForSonicBalance && <CircularProgress size={18} />}
                      </Stack>
                    </Stack>
                  </Stack>
                  {/**
                    <SuperText fontSize="12px" color="warning">Will take ~30sec to update after bridging</SuperText>
                  */}
                </Stack>
                <form onSubmit={handleSubmit(onBridge)} style={{ width: '100%' }}>
                  <Stack width="100%" spacing={2} alignItems="center">
                    <FormInputText
                      mode="text"
                      name="amount"
                      control={control}
                      label="BRUSH Amount"
                      placeholder={direction === 0 ? toFixedNumberStringWithoutTrailingZeros(fantomBrushBalance, 6) : toFixedNumberStringWithoutTrailingZeros(sonicBrushBalance, 6)}
                      autoComplete="off"
                      disabled={disabledInputs}
                      disableReturn={true}
                      min={0}
                      max={direction === 0 ? Number(toFixedNumberStringWithoutTrailingZeros(fantomBrushBalance, 6)) : Number(toFixedNumberStringWithoutTrailingZeros(sonicBrushBalance, 6))}
                      endAdornment={
                        <SuperButton
                          size="small"
                          variant="text"
                          onClick={() => {
                            setValue('amount', direction === 0 ? toFixedNumberStringWithoutTrailingZeros(fantomBrushBalance, 6) : toFixedNumberStringWithoutTrailingZeros(sonicBrushBalance, 6))
                            trigger('amount')
                          }}
                          style={{ marginLeft: '8px', padding: '0px 8px', minWidth: '40px', maxHeight: '24px' }}
                          disableRipple
                          disableFocusRipple
                          disableTouchRipple
                          disabled={disabledInputs || !account}
                        >
                          Max
                        </SuperButton>
                      }
                      rules={{
                        required: 'Required',
                        min: {
                          value: 0.000001,
                          message: `Must be at least ${0.000001}`,
                        },
                        max: {
                          value: direction === 0 ? Number(fantomBrushBalance) : Number(sonicBrushBalance),
                          message: `Max ${direction === 0 ? toFixedNumberStringWithoutTrailingZeros(fantomBrushBalance, 6) : toFixedNumberStringWithoutTrailingZeros(sonicBrushBalance, 6)}`,
                        },
                        validate: {
                          isNumber: (value: string) => /^\d+\.?\d*$/.test(value) || 'Must be a number',
                          maxDecimals: (value: string) => !value.includes('.') || value.split('.')[1].length <= 6 || 'Max 6 decimals'
                        }
                      }}
                    />
                    <FormInputText
                      mode="text"
                      name="address"
                      control={control}
                      label={
                        <span style={{ color: '#ffffffb3' }}>
                          Bridge To
                          {account?.toLowerCase() === inputAddress?.toLowerCase() ? (
                            <span style={{ color: '#66bb6a' }}>{` (Self)`}</span>
                          ) : (
                            <span style={{ color: '#ffa726' }}>{` (Other)`}</span>
                          )}
                        </span>
                      }
                      placeholder="0x..."
                      autoComplete="off"
                      disabled={disabledInputs}
                      disableReturn={true}
                      endAdornment={
                        <SuperButton
                          size="small"
                          variant="text"
                          onClick={() => {
                            setValue('address', account ?? '')
                            trigger('address')
                          }}
                          style={{ marginLeft: '8px', padding: '0px 8px', minWidth: '40px', maxHeight: '24px' }}
                          disableRipple
                          disableFocusRipple
                          disableTouchRipple
                          disabled={disabledInputs || !account}
                        >
                          Self
                        </SuperButton>
                      }
                      rules={{
                        required: 'Address is required',
                        validate: (value: string) => {
                          return isAddress(value, { strict: false }) ? null : 'Invalid Address'
                        },
                      }}
                    />
                    <Stack width="fit-content">
                      {direction === 0 && !isFantom && account && noFantom(isFantom, switchChain)}
                      {direction === 1 && !isSonic && account && noSonic(isSonic, switchChain)}
                    </Stack>
                    <SuperButton
                      size="large"
                      type="submit"
                      variant="contained"
                      width="100%"
                      loading={isApproving || isBridging || isWaitingForFantomBalance || isWaitingForSonicBalance}
                      disabled={disabledInputs || !isValid || isWrongNetwork}
                    >
                      {needApproval && !isBridging ? (isApproving ? 'Approving...' : 'Approve') : isBridging ? 'Bridging...' : `Bridge ${direction === 0 ? 'to Sonic' : 'to Fantom'}`}
                    </SuperButton>
                  </Stack>
                </form>
              </Stack>
            </Stack>
            <Box width="100%" mt="16px" mb="16px">
              <Divider />
            </Box>
            <Box mb="0">
              <SuperText fontSize="12px" color="subtle">No extra fees are added by us</SuperText>
              <a href="https://paintswap.finance" target="_blank" className={styles.linkContent}>
                <Stack width="100%" direction="row" justifyContent="center" spacing={1} mt="4px">
                  <Image src="/images/paintswap_logo.svg" alt="PaintSwap" width={24} height={24} />
                  <span>Visit PaintSwap</span>
                </Stack>
              </a>
            </Box>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
