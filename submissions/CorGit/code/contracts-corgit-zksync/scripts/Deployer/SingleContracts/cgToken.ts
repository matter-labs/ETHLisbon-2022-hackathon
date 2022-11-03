import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ethers} from "hardhat";

/**
 * Deploy an instance of cgToken
 * @param signer - who's going to sign the transaction
 * @param cgTokenAddress - address of the cgToken deployed
 * @param newPayerAddress - address to be added as a payer
 * @param [nonce] - if we want to pass a nonce, rather than having the code to evaluate it
 */
export async function cgToken_setPayerRole(
  signer: SignerWithAddress,
  cgTokenAddress: string,
  newPayerAddress: string,
  nonce: number = -1
): Promise<void> {
  let next_nonce = nonce >= 0 ? nonce : await signer.getTransactionCount();
  const contractFactory = await ethers.getContractFactory("cgToken", signer);
  return await contractFactory
    .attach(cgTokenAddress)
    .grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAYER")),
      newPayerAddress,
      { nonce: next_nonce }
    );
}
