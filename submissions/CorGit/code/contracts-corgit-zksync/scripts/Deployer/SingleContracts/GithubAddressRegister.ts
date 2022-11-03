import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {GithubAddressRegister} from "../../../typechain-types";
import {ethers} from "hardhat";
import {Deployer} from "@matterlabs/hardhat-zksync-deploy";

/**
 * Deploy an instance of GithubAddressRegister
 * @param signer - who's going to sign the transaction
 * @param [nonce] - if we want to pass a nonce, rather than having the code to evaluate it
 */
export async function deployGithubAddressRegister(
  signer: SignerWithAddress,
  nonce: number = -1
): Promise<GithubAddressRegister> {
  let next_nonce = nonce >= 0 ? nonce : await signer.getTransactionCount();
  const contractFactory = await ethers.getContractFactory("GithubAddressRegister", signer);
  return await contractFactory.deploy(
    { nonce: next_nonce }
  ) as GithubAddressRegister;
}

/**
 * Deploy an instance of GithubAddressRegister on zkSync
 * @param deployer - entity able to deploy on zkSync
 * @param [nonce] - if we want to pass a nonce, rather than having the code to evaluate it
 */
export async function zkDeployGithubAddressRegister(
  deployer: Deployer
): Promise<GithubAddressRegister> {
  const artifact = await deployer.loadArtifact("GithubAddressRegister");
  const contract = await deployer.deploy(artifact, []);
  return contract as GithubAddressRegister;
}
