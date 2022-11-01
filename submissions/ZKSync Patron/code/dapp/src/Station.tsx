import React, { useEffect, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import background from './images/background.jpg'
import { BigNumber, constants, Contract, utils } from 'ethers'
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

const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_n',
        type: 'uint256',
      },
    ],
    name: 'sponsorTheAddress',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

function bnStrToNumber(bnStr: string): number {
  return BigNumber.from(bnStr).toNumber()
}

function formatEther(bignum: BigNumber | null): string | null {
  return bignum && Number(utils.formatEther(bignum)).toFixed(2)
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

function Station() {
  const { active, account, library, connector, activate } = useWeb3React()

  const [input, setInput] = React.useState<number | undefined>(undefined)
  const [nInput, setNInput] = React.useState<number | undefined>(undefined)
  const [addressInput, setAddressInput] = React.useState<string | undefined>(
    undefined
  )
  const [balanceEth, setBalanceEth] = React.useState<BigNumber>(constants.Zero)
  const [paymasterBalance, setPaymasterBalance] = React.useState<BigNumber>(
    constants.Zero
  )
  const [contract, setContract] = React.useState<Contract | null>(null)
  // UI elements
  const [tab, setTab] = React.useState<'n-free' | 'coupons'>('n-free')

  const switchTab = (tab: 'n-free' | 'coupons') => {
    setTab(tab)
  }

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
    console.debug('account', account)
    const balance = await library?.getBalance(account || '')
    console.debug('balance', balance)
    setBalanceEth(balance || constants.Zero)
    const c = new Contract(
      PAYMASTER_ADDRESS,
      ABI,
      library?.getSigner()
    ) as Contract
    setContract(c)

    const pBalance = await library?.getBalance(PAYMASTER_ADDRESS)
    setPaymasterBalance(pBalance || constants.Zero)
  }, [account, library])

  useEffect(() => {
    if (!active) {
      return
    }

    getBalance()
  }, [active, account, library, connector, getBalance])

  const onClick = async () => {
    if (!contract) {
      return
    }

    if (!input || input === 0) {
      notify('Error', 'Please enter a valid amount', 'danger')
      return
    }

    try {
      const tx = await contract.sponsorTheAddress(addressInput, nInput, {
        value: utils.parseEther(input.toString()),
      })
      await tx.wait()
      console.debug('tx', tx.hash)
      notify(
        'Bravo!',
        'You just sent us your moneyz!! Hash: ' + tx.hash,
        'success'
      )
      getBalance()
    } catch (ex: any) {
      console.debug(ex)
      notify('Oops!', 'Something went wrong. ' + ex.message, 'danger')
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(Number(e.target.value))
  }

  const handleNInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNInput(Number(e.target.value))
  }

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value)
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
          <Box className={'title'}>ZKSync Patron Dapp</Box>
          <Box className="stats">
            <Box className={'stat'}>
              <Box className={'stat-title'}>Paymaster Balance</Box>
              <Box className={'stat-value'}>
                {formatEther(paymasterBalance)} ETH
              </Box>
            </Box>
            <Box className={'stat'}>
              <Box className={'stat-title'}>Your Balance</Box>
              <Box className={'stat-value'}>
                <span>{formatEther(balanceEth)} ETH</span>
              </Box>
            </Box>
          </Box>

          <Box className={'title'}>Pick your free strategy</Box>

          <Box className="control-tabs">
            <Box className="tabs">
              <Button
                variant={tab === 'n-free' ? 'contained' : 'outlined'}
                component="label"
                className="button-tab"
                onClick={() => switchTab('n-free')}
              >
                Free first N transactions
              </Button>
              <Button
                variant={tab === 'coupons' ? 'contained' : 'outlined'}
                component="label"
                className="button-tab"
                onClick={() => switchTab('coupons')}
              >
                Free Coupons
              </Button>
            </Box>
          </Box>

          {tab === 'n-free' && (
            <Box className="contribution">
              <Input
                className={'input'}
                value={addressInput}
                onChange={handleAddressInput}
                placeholder={'Enter address'}
              />
              <Input
                className={'input'}
                type="number"
                value={nInput}
                onChange={handleNInput}
                placeholder={'Enter N'}
              />
              <Input
                className={'input'}
                type="number"
                value={input}
                onChange={handleInput}
                placeholder={'Enter ETH'}
              />
              {active ? (
                <Button
                  variant="contained"
                  component="label"
                  className="button"
                  onClick={onClick}
                >
                  FUND
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
          )}

          {tab === 'coupons' && (
            <Box className="contribution">
              <Input
                className={'input'}
                value={addressInput}
                onChange={handleAddressInput}
                placeholder={'Enter address'}
              />
              <Input
                className={'input'}
                value={nInput}
                onChange={handleNInput}
                placeholder={'Enter Coupons'}
              />
              <Input
                className={'input'}
                type="number"
                value={input}
                onChange={handleInput}
                placeholder={'Enter ETH'}
              />
              {active ? (
                <Button
                  variant="contained"
                  component="label"
                  className="button"
                  onClick={onClick}
                >
                  FUND
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
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Station
