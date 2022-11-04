import { Provider, utils, Wallet } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { infuraApiKey, privateKey, mnemonic, etherscanApiKey, bscnode } from "../network_keys/secrets.json";

export default async function (hre: HardhatRuntimeEnvironment) {
  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const provider = new Provider(hre.config.zkSyncDeploy.zkSyncNetwork);

  const wallet = new Wallet(privateKey, provider);

  // The wallet that will receive ERC20 tokens
  const emptyWallet = Wallet.createRandom();
  // const emptyWallet = new Wallet("0x51195f428af9f68bbfcc7184fd14d5a688926359fd368f5073f11e810602f404", provider);
  console.log(`Empty wallet's address: ${emptyWallet.address}`);
  console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`);

  const deployer = new Deployer(hre, wallet);

  // Deploying the ERC20 token
  const erc20Artifact = await deployer.loadArtifact('MyERC20');
  const erc20 = await deployer.deploy(erc20Artifact, [
    'MihaTestToken',
    'MTT',
    18,
  ]);
  // const erc20 = new ethers.Contract('0xd866884bc2Ac7BEe2d1842CBAb87E666dBe805A9', erc20Artifact.abi, wallet);
  console.log(`ERC20 address: ${erc20.address}`);

  // Deploying the paymaster
  const paymasterArtifact = await deployer.loadArtifact('PureFiPaymaster');
  const paymaster = await deployer.deploy(paymasterArtifact, [wallet.address, erc20.address]);
  // const paymaster = new ethers.Contract('0xE68d9af6CfF05A6F198164B26F1800938Aef414A', paymasterArtifact.abi, wallet);
  const ISSUER_ROLE = await paymaster.ISSUER_ROLE.call();
  const testIssuerAddress  = '0x84a5B4B863610989197C957c8816cF6a3B91adD2';
  await(await paymaster.grantRole(ISSUER_ROLE, testIssuerAddress)).wait(); //test issuer

  let isIssuer = await paymaster.hasRole(ISSUER_ROLE, testIssuerAddress);
  console.log(`Issuer Role for ${testIssuerAddress} = ${isIssuer.toString()}`);
  console.log(`Paymaster address: ${paymaster.address}`);

  // Deploying test contact
  const testContractArtifact = await deployer.loadArtifact('FilteredPool');
  const testContract = await deployer.deploy(testContractArtifact, [erc20.address, paymaster.address]);
  // const testContract = new ethers.Contract('0x6b91c4931237A8ACBeBD83022d8A268cd304DA82', testContractArtifact.abi, wallet);
  await (await testContract.setPureFiContext(paymaster.address)).wait();
  console.log(`testContract address: ${testContract.address}`);
  console.log(`testContract pureFiContext: ${(await testContract.contextHolder.call()).toString()}`);


  let balanceToken = await erc20.balanceOf(emptyWallet.address);
  if(balanceToken.isZero()){
    await (await erc20.mint(emptyWallet.address, ethers.utils.parseEther('100'))).wait();
    console.log('Minted 100 tokens to the wallet ',emptyWallet.address);
  }
  else{
    console.log("empty walle balance",balanceToken.toString());
  }

  console.log(`Done!`);
}
