import React, { useEffect, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import background from './images/background.jpg'
import { BigNumber, constants, utils as eUtils } from 'ethers'
import { Contract, Web3Provider, Provider, utils } from 'zksync-web3'
import { Button, Box, Input } from '@mui/material'
import { InjectedConnector } from '@web3-react/injected-connector'
import './App.scss'
import { ReactNotifications } from 'react-notifications-component'
import { Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

const injected = new InjectedConnector({
  supportedChainIds: [280],
})

const PAYMASTER_ADDRESS = '0x7937A6bff6a4a519E7c2Db751c120636dc97826d'
const GREETER_ADDRESS = '0xa6FB3CA37B0238FBea536947738D4B3C26f362FF'

const PAYMASTER_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_spnosorredAddr',
        type: 'address',
      },
    ],
    name: 'getMyCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_spnosorredAddr',
        type: 'address',
      },
    ],
    name: 'getNFirst',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

const GREETER_ABI = [
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

function bnStrToNumber(bnStr: string): number {
  return BigNumber.from(bnStr).toNumber()
}

function formatEther(bignum: BigNumber | null): string | null {
  return bignum && Number(eUtils.formatEther(bignum)).toFixed(2)
}

function notify(title: string, message: string, type: 'success' | 'danger') {
  Store.addNotification({
    title,
    message,
    type,
    insert: 'top',
    container: 'top-center',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: 3000,
      onScreen: true,
    },
  })
}

function Greeter() {
  const { active, account, library, connector, activate } = useWeb3React()

  const [txCount, setTxCount] = React.useState<number>(0)
  const [balanceEth, setBalanceEth] = React.useState<BigNumber>(constants.Zero)
  const [contract, setContract] = React.useState<Contract | null>(null)
  const [greeterContract, setGreeterContract] = React.useState<Contract | null>(
    null
  )

  const [greeting, setGreeting] = React.useState<string | null>(null)
  const [greetingInContract, setGreetingInContrat] = React.useState<
    string | null
  >(null)

  async function connect() {
    try {
      await activate(injected)
      notify('Connected', 'You are connected to the blockchain', 'success')
    } catch (ex) {
      console.debug(ex)
    }
  }

  // async function getBalance() {
  const getBalance = useCallback(async () => {
    const provider = new Provider('https://zksync2-testnet.zksync.dev')
    const signer = new Web3Provider(window.ethereum).getSigner()

    const balance = await library.getBalance(account)
    setBalanceEth(balance || constants.Zero)

    const c = new Contract(PAYMASTER_ADDRESS, PAYMASTER_ABI, signer) as Contract
    setContract(c)

    console.debug('paymaster contract', c)
    const txCount = await c.getMyCount(GREETER_ADDRESS)
    console.debug('txCount:', txCount)
    setTxCount(bnStrToNumber(txCount))

    const greeter = new Contract(GREETER_ADDRESS, GREETER_ABI, signer)
    setGreeterContract(greeter)
    const greeting = await greeter.greet()
    setGreetingInContrat(greeting)
  }, [account, library])

  useEffect(() => {
    if (!active) {
      return
    }

    getBalance()
  }, [active, account, library, connector, getBalance])

  const onClick = async () => {
    if (!greeterContract) {
      return
    }

    if (!contract) {
      return
    }

    try {
      const gasPrice = await library.getGasPrice()
      console.debug('gasPrice', gasPrice.toString())
      const gasLimit = await greeterContract.estimateGas.setGreeting(greeting, {
        customData: {
          ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          paymasterParams: {
            paymaster: contract.address,
            paymasterInput: '0x',
          },
        },
      })

      console.debug('gasLimit', gasLimit.toString())

      const paymasterParams = utils.getPaymasterParams(contract.address, {
        type: 'General',
        innerInput: '0x',
      })

      const txParams = {
        // Provide gas params manually
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: constants.Zero,
        gasLimit,

        // paymaster info
        customData: {
          ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      }

      let tx;
      const nFirst = await contract.getNFirst(GREETER_ADDRESS)
      if (nFirst <= txCount) {
        tx = await greeterContract.setGreeting(greeting)
        await tx.wait()
        console.debug('tx', tx.hash)
        getBalance()
      } else {
        tx = await greeterContract.setGreeting(greeting, txParams)
        await tx.wait()
        console.debug('tx', tx.hash)
      }

      notify(
        'Bravo!',
        'You just sent us your moneyz!! Hash: ' + tx.hash,
        'success'
      )
      getBalance()
      // setTxCount(txCount + 1)
    } catch (ex: any) {
      try {
      } catch (error) {
        console.debug(ex)
        notify('Oops!', 'You have insufficient funds' + ex.message, 'danger')
      }
    }
  }

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGreeting(e.target.value)
  }

  return (
    <Box className="App">
      <ReactNotifications />
      <Box
        className="App-header"
        sx={{
          backgroundImage: `url(${background})`,
        }}
      >
        <Box className="content">
          <Box className={'title'}>Greeter Dapp</Box>
          <Box className="stats">
            <Box className={'stat'}>
              <Box className={'stat-title'}>Greeting</Box>
              <Box className={'stat-value'}>{greetingInContract}</Box>
            </Box>
            <Box className={'stat'}>
              <Box className={'stat-title'}>Your Balance</Box>
              <Box className={'stat-value'}>
                <span>{formatEther(balanceEth)} ETH</span>
              </Box>
            </Box>
            <Box className={'stat'}>
              <Box className={'stat-title'}>My TX Count</Box>
              <Box className={'stat-value'}>
                <span>{txCount}</span>
              </Box>
            </Box>
          </Box>
          <Box className="stats"></Box>
          <Box className="contribution">
            <Input
              className={'input'}
              value={greeting}
              onChange={handleAddressInput}
              placeholder={'Enter Greeting'}
            />
            {active ? (
              <Button
                variant="contained"
                component="label"
                className="button"
                onClick={onClick}
              >
                SET GREETING
              </Button>
            ) : (
              <Button
                variant="contained"
                component="label"
                className="button"
                onClick={connect}
              >
                Connect
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Greeter
