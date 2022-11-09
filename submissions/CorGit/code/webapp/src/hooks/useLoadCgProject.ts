import {useState} from "react";
import {useAppDispatch} from "./reduxHooks";
import {CONTRACTS_DETAILS} from "../utils/constants";
import {Contract, ethers, providers, Signer} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import {cgProjectReducerActions} from "../store/reducers/cgProject";
import {useContract} from "wagmi";
import {Web3Provider} from "zksync-web3";

const getCgTokenInformation = async (contract: Contract, signer: Signer, provider: providers.Provider, userAddress: string): Promise<{
  tokenSymbol: string,
  distributionReward: number,
  name: string,
  isPayer: boolean,
  totalSupply: number,
  unclaimedRewards: number,
  treasuryBalance: number,
  collectedRewards: number,
  tokenValue: number
}> => {

  let roleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAYER"));
  let promises = [];
  promises.push(contract.connect(signer).symbol());
  promises.push(contract.connect(signer).percFundingDistributed());
  promises.push(contract.connect(signer).name());
  promises.push(contract.connect(signer).hasRole(roleHash, userAddress));
  promises.push(contract.connect(signer).totalSupply());
  promises.push(contract.connect(signer).lockedTokensForPayments())
  promises.push(contract.connect(signer).balanceOf(contract.address));
  // balance del contratto
  promises.push(provider.getBalance(contract.address));

  let responses = await Promise.all(promises);
  const tokenSymbol = responses[0];
  const distributionReward = responses[1];
  const name = responses[2];
  const isPayer = responses[3];
  const totalSupplyBigNumber = (responses[4] as BigNumber);
  const totalSupply = totalSupplyBigNumber.div(BigNumber.from(10).pow(18)).toNumber();
  const unclaimedRewards = (responses[5] as BigNumber).div(BigNumber.from(10).pow(18)).toNumber();
  const treasuryBalance =
      (responses[6] as BigNumber).div(BigNumber.from(10).pow(18)).toNumber() - unclaimedRewards;
  const collectedRewards = totalSupply - treasuryBalance - unclaimedRewards;
  const balance = (responses[7] as BigNumber);
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log("balance.toHexString", balance.toHexString());
  console.log("totalSupplyBigNumber", totalSupplyBigNumber.toHexString());
  const tokenValue = parseFloat(ethers.utils.formatEther(balance)) / parseFloat(ethers.utils.formatEther(totalSupplyBigNumber));

  return {
    tokenSymbol, distributionReward, name, isPayer, totalSupply, unclaimedRewards, treasuryBalance, collectedRewards,
    tokenValue: tokenValue
  };
};

export const useLoadCgProject = (cgTokenAddress: string) => {
  const [status, setStatus] = useState<{
    loading: boolean,
    error: string
  }>({loading: false, error: ""});
  const dispatch = useAppDispatch();
  // const contract = useContract({
  //   address: cgTokenAddress,
  //   abi: CONTRACTS_DETAILS[5].CG_PROJECT_ABI
  // });
  let contract = new Contract(
    cgTokenAddress,
    CONTRACTS_DETAILS[280].CG_PROJECT_ABI
  );

  const checkNow = (signer: Signer, provider: providers.Provider, userAddress: string,) => {
    setStatus({loading: true, error: ""});
    let signerZk = (new Web3Provider(window.ethereum)).getSigner();
    if (!ethers.utils.isAddress(cgTokenAddress)) setStatus({loading: false, error: "Invalid Ethereum address"});
    else {
      getCgTokenInformation(contract, signerZk, provider, userAddress).then(cgTokenInformation => {
        dispatch(cgProjectReducerActions.setCgProjectInformation({
          tokenAddress: cgTokenAddress,
          tokenSymbol: cgTokenInformation.tokenSymbol,
          tokenTotalSupply: cgTokenInformation.totalSupply,
          tokenName: cgTokenInformation.name,
          tokenValue: cgTokenInformation.tokenValue,
          isPayer: cgTokenInformation.isPayer,
          treasuryBalance: cgTokenInformation.treasuryBalance,
          unclaimedRewards: cgTokenInformation.unclaimedRewards,
          distributionReward: cgTokenInformation.distributionReward,
          collectedRewards: cgTokenInformation.collectedRewards
        }))
        setStatus({loading: false, error: ""});
      })
    }
  };

  return {
    ...status, checkNow
  };
};
