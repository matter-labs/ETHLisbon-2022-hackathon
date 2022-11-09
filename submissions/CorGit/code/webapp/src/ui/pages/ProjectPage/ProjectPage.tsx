import React, {useEffect, useState} from 'react';
import CommonPageWrapper from "../../organisms/Common.PageWrapper/Common.PageWrapper";
import {Box, Button, Grid, Typography} from "@mui/material";
import ProjectSingleDetailCard from "../../atmos/Project.SingleDetailCard/Project.SingleDetailCard";
import ProjectUserRewardsList from "../../organisms/Project.UserRewardsList/Project.UserRewardsList";
import {useNavigate} from "react-router-dom";
import {useParams} from "react-router";
import ProjectAddCollateralDialog from "../../organisms/Project.AddCollateralDialog/Project.AddCollateralDialog";
import CommonBackdrop from "../../atmos/Common.Backdrop/Common.Backdrop";
import {useLoadCgProject} from "../../../hooks/useLoadCgProject";
import {useLoadProjectUserContributions} from "../../../hooks/useLoadProjectUserContributions";
import {useAppSelector} from "../../../hooks/reduxHooks";
import {useAccount, useProvider, useSigner} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<IProjectPage>} props
 * @return {JSX.Element}
 * @constructor
 */
const ProjectPage: React.FC<IProjectPage> = (props) => {

  const [showAddCollateral, setShowAddCollateral] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const navigate = useNavigate();
  let { tokenAddress } = useParams();
  const tokenSymbol = useAppSelector(state => state.cgProject?.tokenSymbol);
  let { loading: loadingCgProject,
    error: errorLoadCjProject,
    checkNow: loadProjectData } = useLoadCgProject(tokenAddress);
  let { loading: loadingCgProjectContributions,
    error: errorLoadCjProjectContributions,
    projectUserContributions, checkNow:   checkProjectContributions } = useLoadProjectUserContributions(tokenAddress);
  const { data: signer, error: errorSigner, isLoading: isLoadingSigner } = useSigner();

  const provider = useProvider();
  const { address, isConnected } = useAccount();

  const project = useAppSelector(state => state.cgProject);
  const contributions = useAppSelector(state => state.contributions.userContributions);

  useEffect(() => {
    // if (tokenAddress && isConnected && !isLoadingSigner && signer
    //        && provider.network.chainId === 280) {
    if (tokenAddress && isConnected && !isLoadingSigner) {
      loadProjectData(signer, provider, address);
      checkProjectContributions({
        signer: signer,
        address: address
      });
    }
  }, [tokenAddress, isConnected, isLoadingSigner, signer, provider]);

  useEffect(() => {
    setShowLoader(loadingCgProject || loadingCgProjectContributions);
  }, [loadingCgProject, loadingCgProjectContributions]);

  return (
    <CommonPageWrapper>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="h1">{project.tokenName}</Typography>
          <Typography variant="h2" sx={{mt: 1}}>${project.tokenSymbol}</Typography>
          <Typography variant="body1" color="textSecondary">{
            tokenAddress.substring(0,6) + "..." + tokenAddress.substring(38)
          }</Typography>
        </Grid>
        <Grid item xs={6} textAlign={"right"}>
          <Button variant={"outlined"}
                  color="secondary"
                  sx={{textTransform: "none"}}
                  onClick={() => setShowAddCollateral(true)}
          >
            Add Collateral
          </Button>
          {
            project.isPayer ?
              <Button variant={"contained"}
                      color="secondary"
                      sx={{color: "white", textTransform: "none", ml: 2}}
                      onClick={() => {navigate(`/project/${tokenAddress}/reward`)}}
              >
                Reward
              </Button>
              :
              ""
          }
        </Grid>
      </Grid>

      {/* Section of details */}
      <Grid container sx={{mt: 4}} spacing={2}>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={"Total Tokens"} value={project.tokenTotalSupply.toString()}/>
        </Grid>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={"Treasury balance"} value={project.treasuryBalance.toString()}/>
        </Grid>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={"Unclaimed rewards"} value={project.unclaimedRewards.toString()}/>
        </Grid>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={"Collected rewards"} value={project.collectedRewards.toString()}/>
        </Grid>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={"Distribution reward"} value={project.distributionReward.toString() + "%"}/>
        </Grid>
        <Grid item xs={4}>
          <ProjectSingleDetailCard name={`$${tokenSymbol} value`} value={(project.tokenValue < 0.0001 ? "<0.000" : project.tokenValue) + " ETH"}/>
        </Grid>
      </Grid>

      {/*  Section of unclaimed rewards*/}
      <Box mt={6}>
        <Typography variant={"h2"}>Your unclaimed rewards</Typography>
        <Box mt={2}>
          <ProjectUserRewardsList contributionList={contributions}/>
        </Box>
      </Box>

      {/* Dialog to add collateral */}
      <ProjectAddCollateralDialog show={showAddCollateral} close={() => {setShowAddCollateral(false)}}/>

      {/* Show a Backdrop loader */}
      <CommonBackdrop show={showLoader} toggleClose={() => setShowLoader(false)}/>

    </CommonPageWrapper>
  );
};

export interface IProjectPage {

}

export default ProjectPage;
