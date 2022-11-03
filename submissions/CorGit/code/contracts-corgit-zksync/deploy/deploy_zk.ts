import {ethers} from "hardhat";
import {CgFactory, GithubAddressRegister} from "../typechain-types";
import {deployGithubAddressRegister, zkDeployGithubAddressRegister} from "../scripts/Deployer/SingleContracts/GithubAddressRegister";
import {deployCgFactory, zkDeployCgFactory} from "../scripts/Deployer/SingleContracts/cgFactory";
import {Provider, Wallet} from "zksync-web3";
import secrets from "../.secrets.json";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {Deployer} from "@matterlabs/hardhat-zksync-deploy";

/**
 * Function to deploy all the contracts on a new chain. Must call this file with command `yarn hardhat deploy-zksync`
 *
 * @param hre {HardhatRuntimeEnvironment} - the hardhat runtime enviroment wrapped
 */
const deploy = async (
  hre: HardhatRuntimeEnvironment
): Promise<{
  cgFactory: CgFactory,
  githubAddressRegister: GithubAddressRegister
}> => {

  const provider = new Provider(hre.userConfig.zkSyncDeploy?.zkSyncNetwork);
  const wallet = new Wallet(secrets.privateKeys.zksync.deployer);
  const deployer = new Deployer(hre, wallet);


  // Deploy all the smart contracts
  const githubAddressRegister = await zkDeployGithubAddressRegister(deployer);
  console.log("githubAddressRegister deployed - " + githubAddressRegister.address);

  const cgFactory = await zkDeployCgFactory(deployer, githubAddressRegister.address);
  console.log("cgFactory deployed - " + cgFactory.address);

  return { githubAddressRegister: githubAddressRegister, cgFactory }
}

export default deploy;
