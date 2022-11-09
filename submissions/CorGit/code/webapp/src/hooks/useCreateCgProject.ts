import {useState} from "react";
import {useAppDispatch} from "./reduxHooks";
import {Signer} from "ethers";
import {useContract, useProvider} from "wagmi";
import {CONTRACTS_DETAILS} from "../utils/constants";
import { Contract, Web3Provider } from "zksync-web3";


export interface CreateCgProjectInterface {
  fromAddress: string,
  tokenName: string,
  tokenSymbol: string,
  prevContrRewards: number,
  signer: Signer
}

export const useCreateCgProject = () => {
  const [status, setStatus] = useState<{
    transactionHash: string,
    error: string,
    tokenAddress: string
  }>({transactionHash: "", error: "", tokenAddress: ""});
  const dispatch = useAppDispatch();

  // const contract = useContract({
  //     address: CONTRACTS_DETAILS[280].CG_FACTORY,
  //     abi: CONTRACTS_DETAILS[280].CG_FACTORY_ABI
  //   });

  let contract = new Contract(
    CONTRACTS_DETAILS[280].CG_FACTORY,
    CONTRACTS_DETAILS[280].CG_FACTORY_ABI
  );

  const checkNow = (params: CreateCgProjectInterface) => {
    setStatus({transactionHash: "", error: "", tokenAddress: ""});
    let signer = (new Web3Provider(window.ethereum)).getSigner();
      contract.connect(signer).generate(
        params.tokenName,
        params.tokenSymbol,
        params.prevContrRewards
      ).then(result => {
      return result.wait()
          .then(rc => {
            console.log('RC');
            console.log(rc);
            const event = rc?.events?.find(event => event.event === 'NewCgTokenCreated');
            console.log("event read", event);
            const [_addr, _name, _symbol, _percFundingDistribute] = event?.args;
            setStatus({transactionHash: "", error: "", tokenAddress: _addr});
          })
    });
  }
  return {
    ...status, checkNow
  }
}
