import React, {useEffect, useMemo, useState} from 'react';
import {Box, Button, CircularProgress, Typography} from "@mui/material";
import {PullRequest, PullRequestContributor} from "../../../utils/ProjectTypes/Project.types";
import SingleContributorLine from "./SingleContributorLine";
import {theme} from "../../../GlobalStyles";
import {useParams} from "react-router";
import {useCreateRewardContributions} from "../../../hooks/useCreateRewardContributions";
import {useNavigate} from "react-router-dom";
import {useSigner} from "wagmi";
import {BigNumber} from "@ethersproject/bignumber";
import {format} from "date-fns";
import {useAppSelector} from "../../../hooks/reduxHooks";

/**
 *
 * @param {React.PropsWithChildren<IRewardPullRequestViewer>} props
 * @return {JSX.Element}
 * @constructor
 */
const RewardPullRequestViewer: React.FC<IRewardPullRequestViewer> = (props) => {

  const [contributorRewards, setContributorRewards] = useState<{ c: PullRequestContributor, amount: string }[]>([]);
  let { tokenAddress } = useParams();
  const navigate = useNavigate();
  const { data: signer, isError, isLoading } = useSigner();
  const tokenSymbol = useAppSelector(state => state.cgProject?.tokenSymbol);

  const {completed, transactionHash, error: createContributionError, checkNow: createContribution}
    = useCreateRewardContributions({cgTokenAddress: tokenAddress});

  useEffect(() => {
    if (completed)
      navigate(`/project/${tokenAddress}`);
  }, [completed]);

  useEffect(() => {
    let newContributorsRewards = props.pullRequest.contributors.map((c) => ({
      c, amount: "0"
    }));
    setContributorRewards(newContributorsRewards);
  }, [props.pullRequest]);

  const editContributorReward = (pos: number, amount: string) => {
    let cr = contributorRewards;
    cr[pos].amount = amount;
    setContributorRewards(JSON.parse(JSON.stringify(cr)));
  }

  const totalAmount = useMemo(() => {
    return contributorRewards.reduce((a,b) => a+parseInt(b.amount ? b.amount : "0"), 0);
  }, [contributorRewards]);

  return (
    <Box display={"flex"} flexDirection={"column"} sx={{width: "100%"}}>
      <Typography variant="h3">{props.pullRequest.title}</Typography>
      <Typography variant="body1">Closed {
          format(new Date(props.pullRequest.closedAt * 1000), "d LLL yyyy @ h:mm aaa")
        }</Typography>
      <Typography variant="body2" sx={{mt: 2, mb: 4}}>
        Total of <strong>{props.pullRequest.contributors.length} contributors</strong>
      </Typography>
      {
        contributorRewards.map((c, i) =>
          <SingleContributorLine key={i}
                                 contributor={c.c}
                                 contributorReward={c.amount}
                                 editReward={(newAmount: string) => {editContributorReward(i, newAmount)}}/>
        )
      }

      {/* TOTAL */}
      {
        props.pullRequest.contributors.length > 0 ?
          <Box display={"flex"} width="100%"
               sx={{
                 borderTop: `1px solid ${theme.palette.text.secondary}`,
                 justifyContent: "space-between",
                 alignItems: "center",
                 mt: 2, pt: 2
          }}>
            <Box sx={{flexGrow: 10, pl: 1}}>
              <Typography variant="h4">TOTAL</Typography>
            </Box>
            <Typography variant="h4">{totalAmount}</Typography>
            <Typography variant="body2" sx={{pl: 1}}>${tokenSymbol}</Typography>
          </Box>
          :
          ""
      }

      {/* REWARD BUTTON */}
      {
        props.pullRequest.contributors.length > 0 ?
            transactionHash ?
              <Box sx={{width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", pt: 4}}>
                <CircularProgress size={28}/>
              </Box>
              :
              <Box sx={{width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", pt: 4}}>
                <Button variant={"outlined"}
                        color="secondary"
                        onClick={() => {navigate(`/project/${tokenAddress}`)}}
                        sx={{textTransform: "none", width: 100}}>
                  Cancel
                </Button>
                <Button variant={"contained"}
                        color="secondary"
                        onClick={() => {createContribution({
                          githubIds: contributorRewards.map( c => c.c.id),
                          amountList: contributorRewards.map( c => BigNumber.from(parseInt(c.amount)).mul(BigNumber.from(10).pow(18))),
                          name: props.pullRequest.title,
                          signer: signer
                        })}}
                        sx={{color: "white", textTransform: "none", ml: 2, width: 100}}>
                  Reward
                </Button>
              </Box>
          :
          ""
      }
    </Box>
  );
};

export interface IRewardPullRequestViewer {
  pullRequest: PullRequest
}

export default RewardPullRequestViewer;
