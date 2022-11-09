import {Contract, Provider, Wallet} from "zksync-web3";
import secrets from "../.secrets.json";
import githubAddressRegister from "../artifacts-zk/contracts/GithubAddressRegister.sol/GithubAddressRegister.json";

const GITHUB_REGISTER_ADDRESS = "0xa5B07286eA9a9f7deC44104Cb621f1cf55AA9634";

// const GITHUB_ID = 12898752;
// const WALLET_ADDRESS_TO_ASSOCIATE = "0x349F4A96a44fcd83338b90DC37Fb7F5FeEc8AdE1";
const GITHUB_ID = 31770652;
const WALLET_ADDRESS_TO_ASSOCIATE = "0x6cA960968E33F9350a3B4522a673f5d8438c9aAf";

export const associateGithubToWallet = async (
  githubAddressRegisterContract: string,
  githubId: number,
  walletAddress: string
): Promise<{

}> => {
  const provider = new Provider('https://zksync2-testnet.zksync.dev');
  const signer = new Wallet(secrets.privateKeys.zksync.deployer, provider);

  const githubContract = new Contract(
    githubAddressRegisterContract,
    githubAddressRegister.abi,
    signer
  );

  const transaction = await githubContract.connect(signer).addAddress(githubId, walletAddress);
  console.log(transaction);

  return {};
}

if (typeof require !== 'undefined' && require.main === module) {
  associateGithubToWallet(
    GITHUB_REGISTER_ADDRESS,
      GITHUB_ID,
      WALLET_ADDRESS_TO_ASSOCIATE
  )
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}



