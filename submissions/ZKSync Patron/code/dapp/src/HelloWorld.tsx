import { Box, Button, Input } from '@mui/material'
import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Provider, utils, Web3Provider, Contract } from 'zksync-web3'

const GREETER_CONTRACT_ADDRESS = '0xd22D1FF709E7C220eCDa6F3c98dBd3863Cd2e661'
const GREETER_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_greeting',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'greet',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_greeting',
        type: 'string',
      },
    ],
    name: 'setGreeting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
const PAYMASTER_ADDRESS = '0x9Bed867F16DA79FE1Ac9eB516498649901aEF776'

const HelloWorld = () => {
  const { address } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const { provider, contract } = useMemo(() => {
    const provider = new Provider('https://zksync2-testnet.zksync.dev')
    const signer = new Web3Provider(window.ethereum).getSigner()
    const contract = new Contract(
      GREETER_CONTRACT_ADDRESS,
      GREETER_CONTRACT_ABI,
      signer
    )
    return { provider, contract }
  }, [])

  const [greeting, setGreeting] = useState('')
  const newGreetingRef = useRef()

  const handleTextChange = useCallback((event: any) => {
    newGreetingRef.current = event.target.value
  }, [])

  const handleUpdateGreeting = useCallback(async () => {
    if (!newGreetingRef.current || !contract) return

    const gasPrice = await provider.getGasPrice()

    // Estimate gas fee
    const gasLimit = await contract.estimateGas.setGreeting(
      newGreetingRef.current,
      {
        customData: {
          ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          paymasterParams: {
            paymaster: PAYMASTER_ADDRESS,
            paymasterInput: '0x',
          },
        },
      }
    )

    // Encoding the "ApprovalBased" paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: 'General',
      innerInput: '0x',
    })

    const tx = await contract.setGreeting(newGreetingRef.current, {
      // Provide gas params manually
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice,
      gasLimit,

      // paymaster info
      customData: {
        paymasterParams,
        ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      },
    })
    await tx.wait()

    setGreeting(newGreetingRef.current)
  }, [contract, provider])

  useEffect(() => {
    if (contract && provider) {
      contract?.greet().then(setGreeting)
    }
  }, [contract, provider])

  console.log({ contract, greeting, provider })

  return (
    <Box>
      <Box>{greeting} World</Box>
      <Input onChange={handleTextChange} />
      <Button onClick={handleUpdateGreeting}>Set Greeting</Button>
      {address ? (
        <Box>
          Connected to {address}
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </Box>
      ) : (
        <Button onClick={() => connect()}>Connect Wallet</Button>
      )}
    </Box>
  )
}

export default HelloWorld
