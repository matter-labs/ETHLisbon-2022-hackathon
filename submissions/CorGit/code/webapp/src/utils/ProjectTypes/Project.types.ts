import {Chain, FileMIMEType, ProofVerificationStatus, StorageType} from "./Project.enum";
import Web3 from "web3";
import {AbiItem} from "web3-utils";

export type address = string;

export type GithubCommit = {
  sha: string,
  url: string,
  message: string
};

export enum PullRequestState {
  CLOSED = "closed",
  OPEN = "open"
};

export type PullRequest = {
  id: number,
  title: string,
  state: PullRequestState,
  closedAt: number,
  contributors: PullRequestContributor[]
};

export type PullRequestContributor = {
  id: number,
  avatarUrl: string,
  username: string,
  profileUrl: string,
  commits: GithubCommit[]
};

/**
 * Object of a proof already minted
 *
 * @param {string} id - the full tokenId represented by a string
 * @param {Chain} chain
 * @param {number} nftNum - the number of NFT on that chain
 * @param {string} title
 * @param {string} description
 * @param {string} hash
 * @param {ProofVerificationStatus} verificationStatus
 * @param {number} createdAt
 * @param {StorageType?} storageType
 * @param {string?} fileUrl
 * @param {FileMIMEType?} MIMEType
 */
export type Proof = {
  id: string,
  chain: Chain,
  nftNum: number,
  title: string,
  description: string,
  hash: string,
  verificationStatus: ProofVerificationStatus,
  createdAt: number,
  storageType?: StorageType,
  fileUrl?: string,
  MIMEType?: FileMIMEType,
  verificationFailed: boolean
};

/**
 * Object of a proof the user is creating and will be minted
 *
 * @param {string} id - the id of the file
 * @param {string} title - the title of Proof (empty by default)
 * @param {string} fileName - name of the file on the machine host
 * @param {number} size - size in byte of the file
 * @param {string} hash - hash of the file
 * @param {boolean} toBeVerified - true if the file has to be verified, false otherwise
 * @param {number} uploadPerc - in case of upload, the perc of upload
 */
export type ProofToMint = {
  id: string,
  title: string,
  fileName: string,
  size: number,
  hash: string,
  toBeVerified: boolean,
  uploadPerc: number
};

/**
 * Params for the redux action to generate the params (aka, make the mint transaction)
 *
 * @param {address} address - who's making the transaction (and will receive the NFT too)
 * @param {Web3} web3 - web3 instance
 * @param {ProofToMint[]} proofs - list of the proofs to mint
 * @param {AbiItem} routerAbi - ABI of the router
 * @param {address} routerAddress - address of the router
 * @param {AbiItem} nftAbi - ABI of the NFT Factory
 * @param {address} nftAddress - address of the NFT factory
 */
export type GenerateProofActionParams = {
  address: address,
  web3: Web3,
  proofs: ProofToMint[],
  delegatorAddress: address,
  routerAbi: AbiItem,
  routerAddress: address,
  nftAbi: AbiItem,
  nftAddress: address,
  price: Prices
};

/**
 * Represents the prices of the service in wei
 *
 * @param {number} mint - price for just minting (in ETH or equivalent)
 * @param {number} verification - price to publish and certify the file (in ETH or equivalent)
 */
export type Prices = {
  mint: number,
  verification: number
};

/**
 * Represent the core details for a given deployment, and all its contracts we have to interact
 */
export type DeploymentContractsDetails = {
  CG_FACTORY: address,
  GITHUB_ADDRESS_REGISTER: address,
  CG_FACTORY_ABI: any,
  GITHUB_ADDRESS_REGISTER_ABI: any,
  CG_PROJECT_ABI: any
};

/**
 * Core details of each chain we're on
 *
 * @param {number} ID - the ID of the chain
 * @param {string} EXPLORER_URL - the initial part of the explorer url (ex.  "https://etherscan.io")
 * @param {string} OPENSEA_CHAIN_NAME - the name of the chain in the URL of opensea
 * @param {boolean} IS_TESTNET - true if it's a testnet, false otherwise
 */
export type ChainDetails = {
  ID: number,
  EXPLORER_URL: string,
  OPENSEA_CHAIN_NAME: string,
  IS_TESTNET: boolean
};
