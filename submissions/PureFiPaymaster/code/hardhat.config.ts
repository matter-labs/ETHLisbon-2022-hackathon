require('@matterlabs/hardhat-zksync-deploy');
require('@matterlabs/hardhat-zksync-solc');
require('hardhat-abi-exporter');
import { infuraApiKey } from "./network_keys/secrets.json";

module.exports = {
  zksolc: {
    version: '1.2.0',
    compilerSource: 'binary',
    settings: {
      optimizer: {
        enabled: true,
      },
      experimental: {
        dockerImage: 'matterlabs/zksolc',
        tag: 'v1.2.0',
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: 'https://zksync2-testnet.zksync.dev',
    ethNetwork: 'https://goerli.infura.io/v3/'+infuraApiKey
  },
  networks: {
    hardhat: {
      zksync: true,
    },
  },
  solidity: {
    version: '0.8.16',
  },
  // abiExporter: {
  //   path: './data/abi',
  //   runOnCompile: true,
  //   clear: true,
  //   only: ['IPaymasterFlowModified'],
  //   flat: true,
  //   spacing: 2,
  //   format: "json",
  // }
};
