#!/bin/bash

yarn hardhat clean
yarn hardhat compile
yarn hardhat deploy-zksync --script deploy-paymaster-modified.ts
