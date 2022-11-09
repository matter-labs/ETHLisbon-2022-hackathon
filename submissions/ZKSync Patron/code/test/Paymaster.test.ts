import { expect } from 'chai'
import { Wallet, Provider, Contract, utils } from 'zksync-web3'
import * as hre from 'hardhat'
import { Deployer } from '@matterlabs/hardhat-zksync-deploy'
import { Paymaster } from '../typechain-types'
import { BigNumber, utils as eUtils, constants } from 'ethers'
import { TransactionReceipt } from '@ethersproject/providers'

const WALLET_ONE_PK = process.env.PRIVATE_KEY!
const WALLET_TWO_PK = process.env.PRIVATE_KEY_2!

async function deployPaymaster(deployer: Deployer): Promise<Paymaster> {
  const artifact = await deployer.loadArtifact('Paymaster')
  return (await deployer.deploy(artifact)) as Paymaster
}

async function deployGreeter(deployer: Deployer): Promise<Contract> {
  const artifact = await deployer.loadArtifact('Greeter')
  return await deployer.deploy(artifact, ['Hi'])
}

async function printBalance(provider: Provider, wallet: Wallet): Promise<void> {
  console.log(
    `balance of ${wallet.address} is`,
    eUtils.formatEther(await provider.getBalance(wallet.address))
  )
}

async function deploymentFixture() {
  const provider = new Provider(hre.config.zkSyncDeploy.zkSyncNetwork)
  const walletOne = new Wallet(WALLET_ONE_PK, provider)
  await printBalance(provider, walletOne)

  const deployer = new Deployer(hre, walletOne)

  const greeter = await deployGreeter(deployer)
  console.log('greeter address: ', greeter.address)

  const emptyWallet = Wallet.createRandom().connect(provider)
  console.log('random wallet address: ', emptyWallet.address)

  const paymaster = await deployPaymaster(deployer)

  // Estimate gas fee for mint transaction
  const gasLimit = await greeter.estimateGas.setGreeting('Hi, Lisbon!', {
    customData: {
      ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      paymasterParams: {
        paymaster: paymaster.address,
        paymasterInput: '0x',
      },
    },
  })

  const gasPrice = await provider.getGasPrice()
  // const fee = gasPrice.mul(gasLimit.toString());
  console.log('gasLimit', gasLimit.toString())

  console.log(
    'paymaster balance: ',
    (await provider.getBalance(paymaster.address)).toString()
  )

  console.log('paymaster address: ', paymaster.address)

  const paymasterParams = utils.getPaymasterParams(paymaster.address, {
    type: 'General',
    innerInput: '0x',
  })

  const txParams = {
    // Provide gas params manually
    maxFeePerGas: gasPrice,
    maxPriorityFeePerGas: gasPrice,
    gasLimit,

    // paymaster info
    customData: {
      paymasterParams,
      ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
    },
  }
  return {
    paymasterParams,
    greeter,
    emptyWallet,
    gasPrice,
    gasLimit,
    provider,
    walletOne,
    paymaster,
    txParams,
  }
}

async function fundContractAndSetN(
  paymaster: Paymaster,
  sponsor: Wallet,
  sponsoredContractAddress: string,
  value: BigNumber,
  n: number
): Promise<TransactionReceipt> {
  const tx = await paymaster
    .connect(sponsor)
    .sponsorTheAddress(sponsoredContractAddress, n, { value })
  return await tx.wait()
}

async function estimateGasForTx(
  provider: Provider,
  greeter: Contract,
  paymasterAddress: string
): Promise<BigNumber> {
  const gasPrice = await provider.getGasPrice()
  const gasLimit = await greeter.estimateGas.setGreeting('Hi, Lisbon!', {
    customData: {
      ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      paymasterParams: {
        paymaster: paymasterAddress,
        // empty input as our paymaster doesn't require additional data
        paymasterInput: '0x',
      },
    },
  })

  return gasPrice.mul(gasLimit.toString())
}

describe('Paymaster', async function () {
  describe('Free transactions', function () {
    it('empty wallet can send only N=2 free tx to sponsored address', async function () {
      const { greeter, emptyWallet, provider, walletOne, paymaster, txParams } =
        await deploymentFixture()

      const txCost = await estimateGasForTx(
        provider,
        greeter,
        paymaster.address
      )

      await fundContractAndSetN(
        paymaster,
        walletOne,
        greeter.address,
        txCost.mul(2),
        2
      )

      await (
        await greeter
          .connect(emptyWallet)
          .setGreeting('Hi, Lisbon again!', txParams)
      ).wait()

      await printBalance(provider, walletOne)

      expect(await greeter.greet()).to.eq('Hi, Lisbon again!')

      let txCount = (
        await paymaster.connect(emptyWallet).getMyCount(greeter.address)
      ).toString()

      expect(txCount).to.eq('1')

      await (
        await greeter
          .connect(emptyWallet)
          .setGreeting('Hi, Lisbon again!', txParams)
      ).wait()

      txCount = (
        await paymaster.connect(emptyWallet).getMyCount(greeter.address)
      ).toString()

      expect(txCount).to.eq('2')

      const tx = greeter
        .connect(emptyWallet)
        .setGreeting('Hi, Lisbon again!', txParams)

      try {
        await tx
      } catch (error: any) {
        expect(error.message.includes('you reached your free tx limit')).to.be
          .true
      }

      const emptyWalletTwo = Wallet.createRandom().connect(provider)

      try {
        await (
          await greeter
            .connect(emptyWalletTwo)
            .setGreeting('Hi, Lisbon once again!', txParams)
        ).wait()
        throw new Error("test didn't fail")
      } catch (error: any) {
        expect(
          error.message.includes('Failed to transfer funds to the bootloader')
        ).to.be.true
      }
    })
  })

  describe('Sponsoring', function () {
    it('sponsor cannot be changed', async function () {
      const { greeter, provider, walletOne, paymaster } =
        await deploymentFixture()
      await fundContractAndSetN(
        paymaster,
        walletOne,
        greeter.address,
        constants.Zero,
        2
      )

      const walletTwo = new Wallet(WALLET_TWO_PK, provider)

      try {
        await fundContractAndSetN(
          paymaster,
          walletTwo,
          greeter.address,
          constants.Zero,
          2
        )
        throw new Error("test didn't fail")
      } catch (error: any) {
        expect(error.message.includes('sponsor already set')).to.be.true
      }
    })

    it.only('sponsor stop sponsorship and withdraw funds', async function () {
      const { greeter, emptyWallet, walletOne, paymaster, txParams, provider } =
        await deploymentFixture()

      const txCost = await estimateGasForTx(
        provider,
        greeter,
        paymaster.address
      )

      await fundContractAndSetN(
        paymaster,
        walletOne,
        greeter.address,
        txCost.mul(3),
        2
      )

      await (
        await greeter
          .connect(emptyWallet)
          .setGreeting('Hi, Lisbon again!', txParams)
      ).wait()

      // const balanceBefore = await provider.getBalance(walletOne.address)

      await (
        await paymaster.connect(walletOne).stopSponsorship(greeter.address)
      ).wait()

      // const balanceAfter = await provider.getBalance(walletOne.address)

      expect(await paymaster.getSponsor(greeter.address)).be.eq(
        '0x0000000000000000000000000000000000000000'
      )
    })
  })
})
