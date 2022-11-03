import {useState} from "react";
import {useAppDispatch} from "./reduxHooks";
import {useContract} from "wagmi";
import {CONTRACTS_DETAILS} from "../utils/constants";
import {Signer} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import {Contract, Web3Provider} from "zksync-web3";

export interface CreateRewardContributionsInterface {
  githubIds: number[],
  amountList: BigNumber[],
  name: string,
  signer: Signer
}

export const useCreateRewardContributions = (params: {cgTokenAddress: string}) => {
  const [status, setStatus] = useState<{
    completed: boolean,
    transactionHash: string,
    error: string
  }>({completed: false, transactionHash: "", error: ""});
  const dispatch = useAppDispatch();

  // const contract = useContract({
  //   address: params.cgTokenAddress,
  //   abi: CONTRACTS_DETAILS[5].CG_PROJECT_ABI
  // });
  let contract = new Contract(
    params.cgTokenAddress,
    CONTRACTS_DETAILS[280].CG_PROJECT_ABI
  );

  const checkNow = (params: CreateRewardContributionsInterface) => {
    setStatus({transactionHash: "", error: "", completed: false});
    // call the contract function to create rewards
    let signer = (new Web3Provider(window.ethereum)).getSigner();
    contract.connect(signer).pay(params.githubIds, params.amountList, params.name)
      .then(tx => {
        console.log(tx);
        setStatus({completed: false, transactionHash: tx.hash, error: ""});
        return tx.wait();
      })
      .then(rc => {
        setStatus({completed: true, transactionHash: "", error: ""});
      })
      .catch(error => {
        setStatus({completed: true, error: "Transaction error", transactionHash: ""});
      });
  };
  return {
    ...status, checkNow
  };
}
