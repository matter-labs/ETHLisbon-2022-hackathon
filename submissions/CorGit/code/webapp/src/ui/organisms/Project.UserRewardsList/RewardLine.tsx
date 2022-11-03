import React, {useEffect} from 'react';
import {Box, Button, CircularProgress, Grid, Typography} from "@mui/material";
import {Check} from "@mui/icons-material";
import {
  ProjectUserContributionInterface,
  useLoadProjectUserContributions
} from "../../../hooks/useLoadProjectUserContributions";
import {useClaimRewards} from "../../../hooks/useClaimRewards";
import {useAccount, useProvider, useSigner} from 'wagmi';
import {useParams} from "react-router";
import {format} from 'date-fns';
import {useAppSelector} from "../../../hooks/reduxHooks";
import {useLoadCgProject} from "../../../hooks/useLoadCgProject";

/**
 *
 * @param {React.PropsWithChildren<IRewardLine>} props
 * @return {JSX.Element}
 * @constructor
 */
const RewardLine: React.FC<IRewardLine> = (props) => {

  const { address, isConnected } = useAccount();
  let { tokenAddress } = useParams();
  const {data: signer} = useSigner({chainId: 5});
  const {completed, transactionHash, error, checkNow} = useClaimRewards({cgTokenAddress: tokenAddress});
  const provider = useProvider();
  let { loading: loadingCgProject,
    error: errorLoadCjProject,
    checkNow: loadProjectData } = useLoadCgProject(tokenAddress);
  let { loading: loadingCgProjectContributions,
    error: errorLoadCjProjectContributions,
    projectUserContributions, checkNow:   checkProjectContributions } = useLoadProjectUserContributions(tokenAddress);

  const tokenSymbol = useAppSelector(state => state.cgProject?.tokenSymbol);

  useEffect(() => {
    if (completed) {
      loadProjectData(signer, provider, address);
      checkProjectContributions({
        signer: signer,
        address: address
      });
    }
    
  }, [completed])

  return (
    <Grid container sx={{py: 0.5}} alignItems={"center"}>
      <Grid item xs={5}>
        <Typography variant="body1">{props.contribution.name}</Typography>
        <Typography fontSize={14} color="textSecondary">{
          format(new Date(props.contribution.creation * 1000), "d LLL yyyy @ h:mm aaa")
        }</Typography>
      </Grid>
      <Grid item xs={5} sx={{textAlign: "right"}}>
        <Typography variant="h4">{props.contribution.amount} ${tokenSymbol}</Typography>
      </Grid>
      <Grid item xs={2} sx={{textAlign: "right"}}>
        {
          props.contribution.paid ?
            <Box display={"flex"} justifyContent={"flex-end"}>
              <Typography sx={{fontSize: 16, mr: 0.5}}>Claimed</Typography>
              <Check color={"success"}/>
            </Box>
            :
            transactionHash ?
              <CircularProgress size={20}/>
              :
              <Button variant={"contained"}
                      color="secondary"
                      onClick={() => {checkNow({
                        toAddress:address,
                        paymentId: props.contribution.paymentId,
                        signer: signer
                      })}}
                      sx={{color: "white", textTransform: "none", ml: 2}}>
                Claim
              </Button>
        }
      </Grid>
    </Grid>
  );
};

export interface IRewardLine {
  contribution: ProjectUserContributionInterface
}

export default RewardLine;
