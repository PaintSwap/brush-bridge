import { useEffect, useMemo, useState } from "react"
import { Manrope } from "next/font/google"
import styles from "@/styles/Home.module.css"
import type { NextPage } from 'next'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { fallback, useAccount, useWriteContract } from 'wagmi'
import { abbreviateAddressAsString, formatNumber, sleep, trackEvent } from '@/helpers/Utilities'
import { Button, Divider, Box, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { TextNormal } from '@/Components/StyledComps'
import Head from "next/head"
import { createHttpTransports, wagmiConfig } from "@/pages/_app"
import NetworkButton from "@/Components/NetworkButton"
import { SONIC_CHAIN_ID, FANTOM_CHAIN_ID, FANTOM_RPC_URLS, SONIC_RPC_URLS, fantomCustom, sonic, brushAddress, mediaQueries } from "@/config/constants"
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

const manrope = Manrope({ subsets: ["latin"] })

const noFantom = (isFantom: boolean) => {
  return (
    <>
      {!isFantom && (
        <>
          <Stack width="100%" spacing={2} alignItems="center">
            <SuperText textAlign="center" width="100%" fontSize="14px" color="warning">
              {`Switch to Fantom Network`}
            </SuperText>
          </Stack>
        </>
      )}
    </>
  )
}

const noSonic = (isSonic: boolean) => {
  return (
    <>
      {!isSonic && (
        <>
          <Stack width="100%" spacing={2} alignItems="center">
            <SuperText textAlign="center" width="100%" fontSize="14px" color="warning">
              {`Switch to Sonic Network`}
            </SuperText>
          </Stack>
        </>
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
  // Start with a high number to avoid flashing text
  const [brushAllowance, setBrushAllowance] = useState<bigint>(1000000000000000000000000n)

  const { address: account, chain } = useAccount()
  const { open } = useWeb3Modal()
  const { writeContractAsync } = useWriteContract()

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

  const {
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUseNativeValidation: false,
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
    tokenAddress: brushAddress,
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
    if (brushAllowanceFetched !== null) {
      setBrushAllowance(brushAllowanceFetched ?? 0n)
    }
  }, [brushAllowanceFetched])

  // Set setIsApproved to false if account changes to reset the approval step
  useEffect(() => {
    setIsApproved(false)
    setValue('address', account)
  }, [account, setValue])

  // If direction is 0 but isSonic, switch to fantom
  // If direction is 1 but isFantom, switch to sonic
  /**
  useEffect(() => {
    if (direction === 0 && !isFantom) {
      switchChain({chainId: 250})
    } else if (direction === 1 && !isSonic) {
      switchChain({ chainId: IS_BETA ? SONIC_TESTNET_CHAIN_ID : SONIC_CHAIN_ID })
    }
  }, [direction, isSonic, isFantom, switchChain])
  */

  const needApproval = useMemo(
    () => brushAllowance < parseEther(validInputValue) && !isApproved && direction === 0,
    [brushAllowance, isApproved, validInputValue, direction],
  )

  const toggleDirection = (direction: number) => {
    setDirection(direction)
  }

  const onBridge = async (data: FieldValues) => {
    const amountToBridge = parseEther(data.amount ?? '0')
    const bridgeToAddress = data.address
    if (
      !account ||
      !amountToBridge ||
      !bridgeToAddress ||
      !isAddress(bridgeToAddress, { strict: false }) ||
      bridgeToAddress.toLowerCase() !== inputAddress.toLowerCase() ||
      data.amount !== inputValue
    )
      return
    const fromFantom = direction === 0

    if (fromFantom) {
      // Approve brush if sending from fantom
      if (needApproval) {
        setIsApproving(true)
        try {
          await estimateGasAndSendBrushApprove([bridgeFromFantom.address, amountToBridge])
          toastSuccess && toastSuccess(`Approved BRUSH!`, 'Success')
        } catch (e) {
          console.error('Failed approving BRUSH:', e)
          toastError && toastError(`Could not approve BRUSH. Please try again.`, 'Failed')
          return
        } finally {
          // Give some time for rpc to update
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

    try {
      // Construct send parameters
      const options = Options.newOptions().addExecutorLzReceiveOption(200_000, 0).toHex().toString()

      const sendParams = {
        // TODO sonic: change to sonic (I think)
        dstEid: fromFantom ? 30112 : 30112, // Fantom or sonic
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
        toastSuccess && toastSuccess(`Bridged ${data.amount} BRUSH to Sonic!`, 'Success')
      } else {
        toastSuccess && toastSuccess(`Bridged ${data.amount} BRUSH to Fantom!`, 'Success')
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

  return (
    <>
      <Head>
        <title>$BRUSH Bridge</title>
        <meta name="description" content="Bridge $BRUSH between Fantom and Sonic" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta name="keywords" content="brush, $brush, bridge, fantom, sonic, $S" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="$BRUSH Bridge - Bridge $BRUSH between Fantom and Sonic" />
        <meta name="twitter:image" content="https://bridge.paintswap.io/og_v2.png" />
        <meta name="twitter:domain" content="bridge.paintswap.io" />
        <meta name="twitter:site" content="@paintoshi" />
        <meta name="twitter:creator" content="@paintoshi" />
        <meta name="twitter:description" content="Bridge $BRUSH between Fantom and Sonic" />

        <meta property="og:title" content="$BRUSH Bridge - Bridge $BRUSH between Fantom and Sonic" />
        <meta property="og:description" content="Bridge $BRUSH between Fantom and Sonic" />
        <meta property="og:image" content="https://bridge.paintswap.io/og.png" />
        <meta property="og:url" content="https://bridge.paintswap.io" />
      </Head>
      <main className={`${styles.main} ${manrope.className}`}>
        <div className={styles.center}>
          <div className={styles.mainPanel}>
            <h1 className={styles.title}>BRUSH Bridge</h1>
            <p className={styles.titleSub}>
              Move $BRUSH between Fantom and Sonic<br />
            </p>

            <Stack width="100%" spacing={2} alignItems="center" pt="16px">
              <Stack width="100%" direction={{xs: "column", sm: "row"}} alignItems="center" justifyContent="space-between" spacing={2}>
                {showAddress && (
                  <Button size="large" className={styles.mainButton} variant='contained' color="primary" onClick={() => open()}>{abbreviateAddressAsString(account ?? 'N/A')}</Button>
                )}
                {!showAddress && (
                  <Button size="large" className={styles.mainButton} variant='contained' color="primary" onClick={() => open()}>Connect Wallet</Button>
                )}
                <NetworkButton />
              </Stack>
              <Stack width="100%" spacing={2} alignItems="center">
                <ToggleButtonGroup
                  fullWidth={true}
                  value={direction}
                  size="medium"
                  exclusive
                  onChange={(event: any) => toggleDirection(Number(event.target.value))}
                >
                  <ToggleButton value={0} aria-label="fantom-to-sonic">
                    To Sonic
                  </ToggleButton>
                  <ToggleButton value={1} aria-label="sonic-to-fantom">
                    To Fantom
                  </ToggleButton>
                </ToggleButtonGroup>
                {direction === 0 && !isFantom && noFantom(isFantom)}
                {direction === 1 && !isSonic && noSonic(isSonic)}
                <Stack width="fit-content" spacing={1} alignItems="center">
                  <SuperText>BRUSH Balances</SuperText>
                  <Stack spacing={2} width="100%" justifyContent="center" direction="row">
                    <Stack spacing={1} alignItems="end" justifyContent="space-around">
                      <SuperText fontSize="14px" color="subtle">
                        On Fantom
                      </SuperText>
                      <SuperText fontSize="14px" color="subtle">
                        On Sonic
                      </SuperText>
                    </Stack>
                    <Stack spacing={1}  justifyContent="space-around">
                      <Stack spacing={1} direction="row">
                        <img src="/images/brush_dark.png" alt="$BRUSH" width="22px" height="22px" />
                        <SuperText>{formatNumber(fantomBrushBalance, 0, 6)}</SuperText>
                      </Stack>
                      <Stack spacing={1} direction="row">
                        <img src="/images/brush_dark.png" alt="$BRUSH" width="22px" height="22px" />
                        <SuperText>{formatNumber(sonicBrushBalance, 0, 6)}</SuperText>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
                <form onSubmit={handleSubmit(onBridge)} style={{ width: '100%' }}>
                  <Stack width="100%" spacing={2}>
                    <FormInputText
                      mode="text"
                      name="amount"
                      control={control}
                      label="BRUSH Amount"
                      placeholder={direction === 0 ? fantomBrushBalance : sonicBrushBalance}
                      autoComplete="off"
                      disabled={isApproving || isBridging}
                      disableReturn={true}
                      min={0}
                      max={direction === 0 ? Number(fantomBrushBalance) : Number(sonicBrushBalance)}
                      endAdornment={
                        <SuperButton
                          size="small"
                          variant="text"
                          onClick={() => {
                            setValue('amount', direction === 0 ? fantomBrushBalance : sonicBrushBalance)
                            trigger('amount')
                          }}
                          style={{ marginLeft: '8px', padding: '0px 8px', minWidth: '40px', maxHeight: '24px' }}
                          disableRipple
                          disableFocusRipple
                          disableTouchRipple
                        >
                          Max
                        </SuperButton>
                      }
                      rules={{
                        required: 'Required',
                        min: {
                          value: 0,
                          message: `Min ${0}`,
                        },
                        max: {
                          value: direction === 0 ? Number(fantomBrushBalance) : Number(sonicBrushBalance),
                          message: `Max ${direction === 0 ? fantomBrushBalance : sonicBrushBalance}`,
                        },
                        pattern: {
                          value: /^\d+\.*\d{0,18}$/,
                          message: 'Must be a number',
                        },
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
                      disabled={isApproving || isBridging}
                      disableReturn={true}
                      endAdornment={
                        <SuperButton
                          size="small"
                          variant="text"
                          onClick={() => {
                            setValue('address', account)
                            trigger('address')
                          }}
                          style={{ marginLeft: '8px', padding: '0px 8px', minWidth: '40px', maxHeight: '24px' }}
                          disableRipple
                          disableFocusRipple
                          disableTouchRipple
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
                    <SuperButton
                      size="large"
                      type="submit"
                      variant="contained"
                      width="100%"
                      loading={isApproving || isBridging}
                      disabled={isApproving || isBridging || isWrongNetwork}
                    >
                      {needApproval ? (isApproving ? 'Approving...' : 'Approve') : isBridging ? 'Bridging...' : 'Bridge'}
                    </SuperButton>
                  </Stack>
                </form>
              </Stack>
            </Stack>
            <Box width="100%" mt="16px" mb="16px">
              <Divider />
            </Box>
            <Box mb="0">
              <a href="https://paintswap.io" target="_blank" className={styles.linkContent}>
                <Stack width="100%" direction="row" justifyContent="center" spacing={1}>
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
