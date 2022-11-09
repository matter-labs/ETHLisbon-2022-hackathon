# CorGit dApp

## Overview
Open Source projects have always problems in managing their funds, especially when it comes to proportionally distribute them among previous and future holders. CorGit is an OpenSource Project Tokenization solution that aims to fix this problem. 

Each project can create its own token, and distribute to anyone included within a project. The token can be immediately, or later, collateralized. In this way projects are able to proportionally reward past, present and future contributors, by transparently manage funds collected.

## See our Demo

Video has been made connecting to Goerli, but the exact same functionalities are available on ZkSync (See contract addresses and instructions on how to run below)

[Video](https://youtu.be/kUXQLmH7JBY)

[Slides](https://drive.google.com/file/d/1QUoel0iwXg0FsOXTrtr1nlGrha1dh2_l/view)

## Smart Contracts

Currently our smart contracts have been deployed on ZkSync 2.0
* GithubAddressRegister - 0xa5B07286eA9a9f7deC44104Cb621f1cf55AA9634
* ContractTokenFactory - 0x84360Fc81b1be9860A37859Be3b48e505D494F38

**GithubAddressRegister** works as an Oracle and creates the match between a Github ID and a wallet address. This is required to claim rewards based on Github pull requests. Only admin can write to that contract, so if a new Github ID needs to be added, please open an issue with githubID + wallet address to associate

**ContractTokenFactory** is the contract called to deploy a custom Corgit contract. Each project will have its own token.


## How to deploy smart contracts

This step is optional as SCs are already deployed

Folder `/contracts-corgit-zksync` contains the smart contracts. If you want to deploy them, to create a second deployment, you need to create a file `.secrets.json` (See the `.secrets.example.json`). This file contains the RPC endpoints and the private keys of the wallets.

Then you need to run

```
yarn install
yarn hardhat compile
yarn hardhat deploy-zksync
```

Finally, to enable the match between githubID and a wallet address, run `ts-node scripts/associateGithubToWallet.ts` (After having correctly set the variables `GITHUB_ID` and `WALLET_ADDRESS_TO_ASSOCIATE` on top of the same file)

## How to run dApp

Enter in folder `/webapp`. To quick run the app just use the following commands

```
yarn install
yarn run start
```

You will find in the CorGit homepage. If you have deployed a new set of contracts, make sure to update their address in `src/utils/constants.ts` file

