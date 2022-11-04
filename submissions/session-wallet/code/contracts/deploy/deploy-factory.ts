import { utils, Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as string;

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);
  const factoryArtifact = await deployer.loadArtifact("AccountFactory");
  const aaArtifact = await deployer.loadArtifact("Account");

  const bytecodeHash = utils.hashBytecode(aaArtifact.bytecode);

  const factory = await deployer.deploy(
    factoryArtifact,
    [bytecodeHash],
    undefined,
    [
      aaArtifact.bytecode,
    ]
  );

  console.log(`Deployment AccountFactory succeeded! ACCOUNT_FACTORY_ADDRESS: ${factory.address}`);
}
