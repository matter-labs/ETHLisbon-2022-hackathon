import { utils, Wallet, Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as string;
const ACCOUNT_OWNER_ADDRESS = process.env.ACCOUNT_OWNER_ADDRESS as string;
const ACCOUNT_FACTORY_ADDRESS = process.env.ACCOUNT_FACTORY_ADDRESS as string;
const ACCOUNT_DEPLOYMENT_SALT =
  process.env.ACCOUNT_DEPLOYMENT_SALT ?? (ethers.constants.HashZero as string);

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider((hre.config as any).zkSyncDeploy.zkSyncNetwork);
  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY).connect(provider);
  const ownerAddress = ACCOUNT_OWNER_ADDRESS;
  const factoryArtifact = await hre.artifacts.readArtifact("AccountFactory");

  const acccountFactory = new ethers.Contract(
    ACCOUNT_FACTORY_ADDRESS,
    factoryArtifact.abi,
    wallet
  );

  const tx = await acccountFactory.deployAccount(
    ACCOUNT_DEPLOYMENT_SALT,
    ownerAddress
  );
  await tx.wait();

  const abiCoder = new ethers.utils.AbiCoder();
  const accountAddress = utils.create2Address(
    ACCOUNT_FACTORY_ADDRESS,
    await acccountFactory.aaBytecodeHash(),
    ACCOUNT_DEPLOYMENT_SALT,
    abiCoder.encode(["address"], [ownerAddress])
  );

  console.log(`Deployment AccountFactory succeeded! ACCOUNT_ADDRESS: ${accountAddress}`);
}
