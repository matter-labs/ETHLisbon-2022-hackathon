# ZKSync Patron dApp

## Overview
All Ethereum transactions use gas, and the sender of each transaction must have enough Ether to pay for the gas spent. Even though these gas costs are low for basic transactions, getting Ether is a challenging task. Here we present the service that allows you to pay for the transactions of your customers using different strategies in order to simplify the onboarding of new users to any platform.


__zkSync Patron let’s you pay transaction fees for your users.__


In your strategies, you can set, for example, a specific number of transaction for each new user, that would be free for them, or give free transaction coupones. Moreover, you can easiliy add or delete “pre-paid” smart contracts as many as you like.

## See our Demo

[Video](https://www.loom.com/share/a0be318076d644a6ab2bf12cb76ca074)

## Open questions
1. How to prevent DoS attacks that drain toped-up balance?
* Use Patron Coupons
* Use 3rd party KYC


2. How to craft and submit transactions for the specific service?
- Use our NPM package to make contract calls
- OR, use “zksync-web3” package with our config





