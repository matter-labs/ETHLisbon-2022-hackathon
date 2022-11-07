import { utils, Wallet, Provider } from "zksync-web3";
import hre from "hardhat";
import * as ethers from "ethers";

import * as dotenv from "dotenv";

dotenv.config();

const ACCOUNT_OWNER_PRIVATE_KEY = process.env
  .ACCOUNT_OWNER_PRIVATE_KEY as string;
const SESSION_OWNER_PRIVATE_KEY = process.env
  .SESSION_OWNER_PRIVATE_KEY as string;
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS as string;

async function main() {
  const provider = new Provider((hre.config as any).zkSyncDeploy.zkSyncNetwork);
  const wallet = new Wallet(ACCOUNT_OWNER_PRIVATE_KEY).connect(provider);
  const sessionWallet = new Wallet(SESSION_OWNER_PRIVATE_KEY);
  const accountArtifact = await hre.artifacts.readArtifact("Account");

  const account = new ethers.Contract(
    ACCOUNT_ADDRESS,
    accountArtifact.abi,
    wallet
  );

  const tx = await account.createSession(sessionWallet.address, []);
  await tx.wait();

  console.log(`Successfully session created! Tx URL: https://explorer.zksync.io/tx/${tx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
