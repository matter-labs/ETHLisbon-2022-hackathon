import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {CgFactory, GithubAddressRegister} from "../../../typechain-types";
import {ethers} from "hardhat";
import {Deployer} from "@matterlabs/hardhat-zksync-deploy";

/**
 * Deploy an instance of cgFactory
 * @param signer - who's going to sign the transaction
 * @param {string} githubAddressRegisterAddress - address of Github Address Register
 * @param [nonce] - if we want to pass a nonce, rather than having the code to evaluate it
 */
export async function deployCgFactory(
  signer: SignerWithAddress,
  githubAddressRegisterAddress: string,
  nonce: number = -1
): Promise<CgFactory> {
  let next_nonce = nonce >= 0 ? nonce : await signer.getTransactionCount();
  const contractFactory = await ethers.getContractFactory("cgFactory", signer);
  return await contractFactory.deploy(
    githubAddressRegisterAddress,
    { nonce: next_nonce }
  ) as CgFactory;

}


/**
 * Deploy an instance of cgFactory on zkSync
 * @param deployer - entity able to deploy on zkSync
 * @param {string} githubAddressRegisterAddress - address of Github Address Register
 * @param [nonce] - if we want to pass a nonce, rather than having the code to evaluate it
 */
export async function zkDeployCgFactory(
  deployer: Deployer,
  githubAddressRegisterAddress: string
): Promise<CgFactory> {
  const artifact = await deployer.loadArtifact("cgFactory");
  const contract = await deployer.deploy(artifact, [githubAddressRegisterAddress]);
  return contract as CgFactory;
}
