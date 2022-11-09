import {useState} from "react";
import {useAppDispatch} from "./reduxHooks";
import isGithubUrl from "is-github-url";
import parseGithubUrl from "parse-github-url";
import axios, {AxiosResponse} from "axios";
import {cgProjectReducerActions} from "../store/reducers/cgProject";
import {ethers} from "ethers";

const getContractAddressFromGithubRepo = async (repoOwner: string, repoName: string): Promise<string | undefined> => {
  const githubRawResponse: AxiosResponse = await axios.get(
      `https://raw.githubusercontent.com/${repoOwner}/${repoName}/master/.corgit.config`);
  if (githubRawResponse.status === 200) {
    const corgitConfig: {cgTokenAddress: string} = githubRawResponse.data;
    return corgitConfig.cgTokenAddress;
  } else return undefined;
}

export const useSearchCgProject = () => {
  const [status, setStatus] = useState<{
    loading: boolean,
    error: string,
    address: string,
  }>({loading: false, error: "", address: ""});
  const dispatch = useAppDispatch();

  const checkNow = (address: string) => {
    setStatus({loading: true, error: "", address: ""});
    // understand if the address parameter is an ETH contract address or a GitHub repository
    if (isGithubUrl(address, {repository: true, strict: false})) {
      console.log(`Valid GitHub url -> ` + address);
      const githubRepoInfo = parseGithubUrl(address);
      // get token address from the master branch
      getContractAddressFromGithubRepo(githubRepoInfo.owner, githubRepoInfo.name)
          .then(tokenAddress => {
            if (tokenAddress === undefined) {
              setStatus({loading: false, error: ".corgit.config not found", address: ""});
            } else {
              dispatch(cgProjectReducerActions.setTokenAddress(tokenAddress));
              setStatus({loading: false, error: "", address: tokenAddress});
            }
          });
    } else {
      if (!ethers.utils.isAddress(address)) {
        setStatus({loading: false, error: "Invalid Ethereum address", address: ""});
      } else {
        dispatch(cgProjectReducerActions.setTokenAddress(address));
        setStatus({loading: false, error: "", address: address});
      }
    }
  }
  return {
    ...status, checkNow
  }
}
