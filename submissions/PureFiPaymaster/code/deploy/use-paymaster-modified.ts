import { Provider, utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import EthCrypto from 'eth-crypto';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

import { infuraApiKey, privateKey, mnemonic, etherscanApiKey, bscnode } from "../network_keys/secrets.json";

// Put the address of the deployed paymaster here
const PAYMASTER_ADDRESS = '0x8B1b629c848f2b4B430cf57049Ecb346CF099021';

// Put the address of the deployed paymaster here
const TESTCONTRACT_ADDRESS = '0xD28D11baAEdbF1a147aCE0f89347Cf738c2E2E16';

// Put the address of the ERC20 token here:
const TOKEN_ADDRESS = '0xd875518f4C74e3fa45B59d29440A964221Bb6ffc';

// Wallet private key
const EMPTY_WALLET_PRIVATE_KEY = '0x470a9213c65ea278134ed1643100b79269754091ade182035b15c216a19926ea';

// DON'T TOUCH THIS. Test issuer private key, address of which is hardcoded in PureFI smart contract
const privateKeyIssuer = 'e3ad95aa7e9678e96fb3d867c789e765db97f9d2018fca4068979df0832a5178';

let pureFiSessionID = 1;

const signMessage = async (message, privateKeyWallet) => {

  const publicKeySigner = EthCrypto.publicKeyByPrivateKey(privateKeyWallet);
  const signerAddress = EthCrypto.publicKey.toAddress(publicKeySigner);

  const signerIdentity = {
      privateKey: privateKeyWallet,
      publicKey: publicKeySigner,
      address: signerAddress
  }

  const publicKey = EthCrypto.publicKeyByPrivateKey(signerIdentity.privateKey);
  const magicAddress = EthCrypto.publicKey.toAddress(publicKey);
  // console.log("Magic address: ", magicAddress);
  const messageHash = EthCrypto.hash.keccak256(message);
  const signature = EthCrypto.sign(signerIdentity.privateKey, messageHash);
  return signature;
}

const preparePureFiPaymasterParams = async (ruleID:number, senderAddress:string) => {

    //prepare package
    let currentTime = Math.round((new Date()).getTime()/1000);
      //     @param data - signed data package from the off-chain verifier
    //   data[0] - verification session ID
    //   data[1] - circuit ID (if required)
    //   data[2] - verification timestamp
    //   data[3] - verified wallet - to be the same as msg.sender
    console.log(`Input: ruleID = ${ruleID} senderAddress = ${senderAddress}`)
    let ardata = [ethers.BigNumber.from(pureFiSessionID++), ethers.BigNumber.from(ruleID), ethers.BigNumber.from(currentTime), ethers.BigNumber.from(senderAddress)];
    let addrNumber = ethers.BigNumber.from(senderAddress);
    // console.log("addrNumber",addrNumber.toHexString());
    
    let message = [{
            type: "uint256",
            value: ardata[0].toString()
        },
        {
            type: "uint256",
            value: ardata[1].toString()
        },
        {
            type: "uint256",
            value: ardata[2].toString()
        },
        {
            type: "uint256",
            value: ardata[3].toString()
        }
    ];

    let signature = await signMessage(message, privateKeyIssuer);
    let publicKeySigner = EthCrypto.publicKeyByPrivateKey(privateKeyIssuer);
    let signerAddress = EthCrypto.publicKey.toAddress(publicKeySigner);
    // console.log("signerAddress=",signerAddress);
    // console.log("signature=",signature.toString());

    let pureFiParamsPacked = ethers.utils.defaultAbiCoder.encode([ "uint[4]", "bytes" ], [ ardata, signature ]);
    let decodedData = ethers.utils.defaultAbiCoder.decode([ "uint[4]", "bytes" ], pureFiParamsPacked);
    console.log(`Decoded: ${decodedData[0][0].toString()} ${decodedData[0][1].toString()} ${decodedData[0][2].toString()} ${decodedData[0][3].toHexString()} ${decodedData[1].toString()}`)
    // console.log(`pureFiParamsPacked = ${pureFiParamsPacked}`);

    let paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: 'General',
      innerInput: pureFiParamsPacked,
    });

    // console.log(`paymasterParams1 = ${paymasterParams.paymaster}`);
    // console.log(`paymasterParams2 = ${paymasterParams.paymasterInput}`);
  return paymasterParams;
}

const fundPaymaster = async (hre: HardhatRuntimeEnvironment, provider, valueToSend) => {

  console.log(`Funding Paymaster for ${ethers.utils.formatEther(valueToSend)} ETH`);
  const wallet = new Wallet(privateKey, provider);
  const deployer = new Deployer(hre, wallet);
  await (
    await deployer.zkWallet.sendTransaction({
      to: PAYMASTER_ADDRESS,
      value: valueToSend,
    })
  ).wait();
}

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider(hre.config.zkSyncDeploy.zkSyncNetwork);
  // const wallet = new Wallet(privateKey, provider);
  const emptyWallet = new Wallet(EMPTY_WALLET_PRIVATE_KEY, provider);

  console.log("emptyWallet = ",emptyWallet.address);

  // Obviously this step is not required, but it is here purely to demonstrate
  // that indeed the wallet has no ether.
  const ethBalance = await emptyWallet.getBalance();
  if (!ethBalance.eq(0)) {
    throw new Error('The wallet is not empty');
  }

  
  const artifact = hre.artifacts.readArtifactSync('MyERC20');
  const erc20 = new ethers.Contract(TOKEN_ADDRESS, artifact.abi, emptyWallet);

  const paymasterArtifact = await hre.artifacts.readArtifactSync('PureFiPaymaster');
  const wallet = new Wallet(privateKey, provider);
  const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, paymasterArtifact.abi, emptyWallet);

  const testContractArtifact = await hre.artifacts.readArtifactSync('FilteredPool');
  const testContract = new ethers.Contract(TESTCONTRACT_ADDRESS, testContractArtifact.abi, emptyWallet);
   
  //*****************************************************  
  //config test contract
  if(false){
    const testContractConfig = new ethers.Contract(TESTCONTRACT_ADDRESS, testContractArtifact.abi, wallet);
    await(await testContractConfig.toggleTestMode()).wait();
  }
  const testMode = await testContract.testMode.call();
  console.log(`testContract testMode = ${testMode.toString()}`);
  if(false){
    const paymasterConfig = new ethers.Contract(PAYMASTER_ADDRESS, paymasterArtifact.abi, wallet);
    await (await paymasterConfig.setTestMode(2)).wait();
  }
  console.log(`paymaster version: `+ (await paymaster.version()).toString());
  console.log(`paymaster testMode: `+ (await paymaster.testMode()).toString());

  console.log('******************* end *******************');
  console.log("TEST DATA FROM PAYMASTER:")
  {
    console.log("erc20 contract:")
    let pmData = await paymaster.pureFiContextDataX(erc20.address);
    console.log(`paymaster data[0] ${pmData[0]}`);
    console.log(`paymaster data[1] ${pmData[1]}`);
    console.log(`paymaster data[2] ${pmData[2]}`);
    console.log(`paymaster data[3] ${pmData[3]}`);
    console.log(`paymaster data[4] ${pmData[4]}`);
  }
  {
    console.log("testContract contract:")
    let pmData = await paymaster.pureFiContextDataX(testContract.address);
    console.log(`paymaster data[0] ${pmData[0]}`);
    console.log(`paymaster data[1] ${pmData[1]}`);
    console.log(`paymaster data[2] ${pmData[2]}`);
    console.log(`paymaster data[3] ${pmData[3]}`);
    console.log(`paymaster data[4] ${pmData[4]}`);
  }
  
  if(true){
    
    const depositAmount = ethers.utils.parseEther('1');
    const withdrawAmount = ethers.utils.parseEther('1');
    //*****************************************************
    if(true){
      console.log('******************* Issuing approve tx *******************');
      const paymasterParams = await preparePureFiPaymasterParams(0, emptyWallet.address);
      // Estimate gas for approve transaction
      const gasPrice = await provider.getGasPrice();
      console.log(`Approve gasPrice = ${gasPrice}`);

      // Estimate gas fee for approve transaction
      const gasLimit = await erc20.estimateGas.approve(testContract.address, depositAmount, {
        customData: {
          ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          paymasterParams: {
            paymaster: paymasterParams.paymaster,
            paymasterInput: paymasterParams.paymasterInput,
          },
        },
      });
      console.log(`Approve gasLimit = ${gasLimit}`);
    
      const fee = gasPrice.mul(gasLimit.toString());
      console.log("approve fee = ", ethers.utils.formatEther(fee));
      const valueToSend = fee.add(ethers.utils.parseEther('0.0001'));
      // fund paymaster
      await fundPaymaster(hre, provider, valueToSend);
      
      // issue approve tx
      await (
        await erc20.approve(testContract.address, depositAmount, {
          // provide gas params manually
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: gasPrice,
          gasLimit,
    
          // paymaster info
          customData: {
            paymasterParams,
            ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          },
        })
      ).wait();
    }
    //*****************************************************

    //deposit test tx
    if(true){
      console.log('******************* Issuing deposit tx *******************');
      // Estimate gas for deposit transaction
      const gasPrice = await provider.getGasPrice();
      // this is the purefi rule ID, expexted by the pureFi customer smart contract for Deposit operation
      const DepositRuleID = (await testContract.expectedDepositRuleID.call()).toNumber();
      console.log(`DepositRuleID = ${DepositRuleID}`);

      const paymasterParams = await preparePureFiPaymasterParams(DepositRuleID, emptyWallet.address);

      /**
       * MIHA: when estimateGas is called, paymaster storage changes are not applied. this results in incorrect "revert" call in target (testContract) 
       * when it attempts to query context and validate ruleID. Had to hardcode gasLimit here so that it passes through
       */

      // const gasLimit = await testContract.estimateGas.depositTo(depositAmount, emptyWallet.address, {
      //   customData: {
      //     ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      //     paymasterParams: {
      //       paymaster: paymasterParams.paymaster,
      //       paymasterInput: paymasterParams.paymasterInput
      //     },
      //   },
      // });
      const gasLimit = 17591140+4000000;

      //fund paymaster
      const fee = gasPrice.mul(gasLimit.toString());
      console.log(`Deposit Fee ${ethers.utils.formatEther(fee)}`);
      const valueToSend = fee.add(ethers.utils.parseEther('0.0001'));
      await fundPaymaster(hre, provider, valueToSend);

      //issue deposit transaction
      await (
        await testContract.depositTo(depositAmount, emptyWallet.address, {
          // provide gas params manually
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: gasPrice,
          gasLimit,

          // paymaster info
          customData: {
            paymasterParams,
            ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          },
        })
      ).wait();
      console.log("After Deposit state: ")
      console.log(`testContract totalCap: `+ (await testContract.totalCap.call()).toString());
      console.log(`testContract ERC20 token balance: `+ (await erc20.balanceOf(testContract.address)).toString());
      console.log(`testContract contextSessionID: `+ (await testContract.contextSessionID.call()).toString());
      console.log(`testContract contextRuleID: `+ (await testContract.contextRuleID.call()).toString());
      console.log(`testContract contextVerifiedUser: `+ (await testContract.contextVerifiedUser.call()).toString());
    }
  

    if(true){
      console.log('******************* Issuing withdraw tx *******************');
      // Estimate gas for deposit transaction
      const gasPrice = await provider.getGasPrice();
      // this is the purefi rule ID, expexted by the pureFi customer smart contract for Withdraw operation
      const withdrawRuleID = (await testContract.expectedWithdrawRuleID.call()).toNumber();
      console.log(`withdrawRuleID = ${withdrawRuleID}`);
      const paymasterParams = await preparePureFiPaymasterParams(withdrawRuleID, emptyWallet.address);

      /**
       * MIHA: when estimateGas is called, paymaster storage changes are not applied. this results in incorrect "revert" call in target (testContract) 
       * when it attempts to query context and validate ruleID. Had to hardcode gasLimit here so that it passes through
       */
      // const gasLimit = await testContract.estimateGas.withdrawTo(withdrawAmount, emptyWallet.address, {
      //   customData: {
      //     ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
      //     paymasterParams: {
      //       paymaster: paymasterParams.paymaster,
      //       paymasterInput: paymasterParams.paymasterInput
      //     },
      //   },
      // });

      const gasLimit = 17591140+4000000;

      //fund paymaster
      const fee = gasPrice.mul(gasLimit.toString());
      console.log(`Withdraw Fee ${ethers.utils.formatEther(fee)}`);
      const valueToSend = fee.add(ethers.utils.parseEther('0.0001'));
      await fundPaymaster(hre, provider, valueToSend);

      //issue deposit transaction
      await (
        await testContract.withdrawTo(withdrawAmount, emptyWallet.address, {
          // provide gas params manually
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: gasPrice,
          gasLimit,

          // paymaster info
          customData: {
            paymasterParams,
            ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
          },
        })
      ).wait();
      console.log("After Withdraw state: ")
      console.log(`testContract totalCap: `+ (await testContract.totalCap.call()).toString());
      console.log(`testContract ERC20 token balance: `+ (await erc20.balanceOf(testContract.address)).toString());
      console.log(`testContract contextSessionID: `+ (await testContract.contextSessionID.call()).toString());
      console.log(`testContract contextRuleID: `+ (await testContract.contextRuleID.call()).toString());
      console.log(`testContract contextVerifiedUser: `+ (await testContract.contextVerifiedUser.call()).toString());

      
    }
  }

  console.log('******************* end *******************');
  console.log("TEST DATA FROM PAYMASTER:")
  {
    console.log("erc20 contract:")
    let pmData = await paymaster.pureFiContextDataX(erc20.address);
    console.log(`paymaster data[0] ${pmData[0]}`);
    console.log(`paymaster data[1] ${pmData[1]}`);
    console.log(`paymaster data[2] ${pmData[2]}`);
    console.log(`paymaster data[3] ${pmData[3]}`);
    console.log(`paymaster data[4] ${pmData[4]}`);
  }
  {
    console.log("testContract contract:")
    let pmData = await paymaster.pureFiContextDataX(testContract.address);
    console.log(`paymaster data[0] ${pmData[0]}`);
    console.log(`paymaster data[1] ${pmData[1]}`);
    console.log(`paymaster data[2] ${pmData[2]}`);
    console.log(`paymaster data[3] ${pmData[3]}`);
    console.log(`paymaster data[4] ${pmData[4]}`);
  }

}
