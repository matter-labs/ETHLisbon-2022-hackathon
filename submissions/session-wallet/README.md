# Session Wallet
## Overview

In most cases, the wallet must be opened when sending a transaction.

With an app that requires only a few transaction sends, such as DeFi, the operation of opening the wallet is not stressful.
However, if it is an app that sends transactions frequently, such as gaming or social media, it becomes a big problem. You need to open the wallet frequently and cannot fully use the app.

It is the worst UX in the world.

To solve this problem, I created a wallet that can issue session keys.
You give the issued session key to a trusted institution (e.g., a gaming company) to send transactions on your behalf.
In other words, your wallet is temporarily under the control of that institution.
However, you do not need to give them your private key, you just need to give them your session key.
Of course, you can deactivate the session key.

Now you can open your wallet once and focus on your game the rest of the time.

## Deploy contracts

Execute the following command to setup

```
yarn install
yarn workspace contracts setup
yarn workspace contracts hardhat compile
```

Then, set the following environment variables
* INFURA_API_KEY
* DEPLOYER_PRIVATE_KEY
* ACCOUNT_OWNER_ADDRESS

Deploy the AccountFactory contract with the following command

```
yarn workspace contracts deploy:factory
```

The address of the deployed AccountFactory contract will be displayed on your terminal, copy it to ACCOUNT_FACTORY_ADDRESS in the .env file.

Deploy the Account contract with the following command

```
yarn workspace contracts deploy:account
```

The address of the deployed Account contract will be displayed on your terminal, copy it to ACCOUNT_ADDRESS in the .env file.

## Running Sample Scripts

After deployment is complete, you can run the following sample script to create a session and send transactions by the session.

ACCOUNT_OWNER_PRIVATE_KEY and SESSION_OWNER_PRIVATE_KEY must be specified in the .env file

```
yarn workspace contracts hardhat run scripts/create-session.ts
yarn workspace contracts hardhat run scripts/transfer-by-session.ts
```

Finally, delete the session.

```
yarn workspace contracts hardhat run scripts/delete-session.ts
```

If you retransfer by old session, some error will occur.

```
yarn workspace contracts hardhat run scripts/transfer-by-session.ts
```
