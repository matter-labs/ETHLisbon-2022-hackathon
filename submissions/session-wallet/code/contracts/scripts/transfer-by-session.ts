import { utils, Wallet, Provider, EIP712Signer, types } from "zksync-web3";
import hre from "hardhat";
import * as ethers from "ethers";

import * as dotenv from "dotenv";

dotenv.config();

const SESSION_OWNER_PRIVATE_KEY = process.env
  .SESSION_OWNER_PRIVATE_KEY as string;
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS as string;

async function main() {
  const provider = new Provider((hre.config as any).zkSyncDeploy.zkSyncNetwork);
  const sessionWallet = new Wallet(SESSION_OWNER_PRIVATE_KEY, provider);

  await(
    await sessionWallet.sendTransaction({
      to: ACCOUNT_ADDRESS,
      value: ethers.utils.parseEther("0.02"),
    })
  ).wait();

  const aaTx: types.TransactionRequest = {
    from: ACCOUNT_ADDRESS,
    to: sessionWallet.address,
    chainId: (await provider.getNetwork()).chainId,
    nonce: await provider.getTransactionCount(ACCOUNT_ADDRESS),
    type: 113,
    customData: {      
      ergsPerPubdata: utils.DEFAULT_ERGS_PER_PUBDATA_LIMIT,
    } as types.Eip712Meta,
    value: ethers.utils.parseEther("0.01"),
    data: '0x'
  };
  
  const gasLimit = await provider.estimateGas(aaTx);
  const gasPrice = await provider.getGasPrice();
  aaTx.gasLimit = gasLimit;
  aaTx.gasPrice = gasPrice;

  const signedTxHash = EIP712Signer.getSignedDigest(aaTx);

  const signature = ethers.utils.joinSignature(sessionWallet._signingKey().signDigest(signedTxHash))

  aaTx.customData = {
    ...aaTx.customData,
    customSignature: signature,
  };

  const sentTx = await provider.sendTransaction(utils.serialize(aaTx));
  await sentTx.wait();

  console.log(`Successfully ETH transfer! Tx URL: https://explorer.zksync.io/tx/${sentTx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
