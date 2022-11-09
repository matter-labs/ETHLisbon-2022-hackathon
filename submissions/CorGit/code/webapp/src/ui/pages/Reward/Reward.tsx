import React, {useEffect, useState} from 'react';
import CommonPageWrapper from "../../organisms/Common.PageWrapper/Common.PageWrapper";
import {Box, CircularProgress, TextField, Typography} from "@mui/material";
import {useGetPullRequestDetails} from "../../../hooks/useGetPullRequestDetails";
import {useDebounce} from "use-debounce";
import {useAppSelector} from "../../../hooks/reduxHooks";
import {PullRequest} from "../../../utils/ProjectTypes/Project.types";
import RewardPullRequestViewer from "../../organisms/Reward.PullRequestViewer/Reward.PullRequestViewer";

/**
 *
 * @param {React.PropsWithChildren<IReward>} props
 * @return {JSX.Element}
 * @constructor
 */
const Reward: React.FC<IReward> = (props) => {

  const [urlSearchValue, setUrlSearchValue] = useState<string>("");
  const tokenName = useAppSelector(state => state.cgProject?.tokenName);
  const [searchCgProjectValue] = useDebounce(urlSearchValue, 500);
  const {loading, error, pullRequestUrl, checkNow} = useGetPullRequestDetails();

  const pullRequest: PullRequest = useAppSelector(state => state.github.pullRequest);

  useEffect(() => {
    if (searchCgProjectValue)
      checkNow(searchCgProjectValue);
  }, [searchCgProjectValue]);

  return (
    <CommonPageWrapper>
      <Box display="flex" flexDirection={"column"} alignItems={"center"}>
        <Typography variant={"h1"}>{tokenName}</Typography>
        <Typography variant={"h3"}>- Reward Page -</Typography>

        <Box width={500} sx={{mt: 4}}>
          <TextField fullWidth
                     size={"small"}
                     value={urlSearchValue}
                     onChange={(e) =>{setUrlSearchValue(e.target.value)}}
                     InputProps={{
                       ...( loading ? {endAdornment: <CircularProgress size={16}/>}: {} )
                     }}
                     placeholder={"Enter the Github Pull Request URL"} />
        </Box>

        {
          pullRequest ?
            <Box mt={6} width={"100%"}>
              <RewardPullRequestViewer pullRequest={pullRequest}/>
            </Box>
            :
            ""
        }

      </Box>
    </CommonPageWrapper>
  );
};

export interface IReward {

}

export default Reward;
