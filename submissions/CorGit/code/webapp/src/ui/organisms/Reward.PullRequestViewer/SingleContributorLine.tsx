import React from 'react';
import {Avatar, Box, TextField, Typography} from "@mui/material";
import {PullRequestContributor} from "../../../utils/ProjectTypes/Project.types";
import {useAppSelector} from "../../../hooks/reduxHooks";

/**
 *
 * @param {React.PropsWithChildren<ISingleContributorLine>} props
 * @return {JSX.Element}
 * @constructor
 */
const SingleContributorLine: React.FC<ISingleContributorLine> = (props) => {

  const tokenSymbol = useAppSelector(state => state.cgProject?.tokenSymbol);

  const handleChange = (e) => {
    props.editReward(e.target.value);
  }

  return (
    <Box display={"flex"} width="100%" sx={{py: 1, justifyContent: "space-between", alignItems: "center"}}>
      <Avatar src={props.contributor.avatarUrl}/>
      <Box sx={{flexGrow: 10, pl: 1}}>
        <Typography variant="h4">{props.contributor.username}</Typography>
        <Typography variant="body2">{props.contributor.commits.length} commit{props.contributor.commits.length > 1 ? "s" : ""}</Typography>
      </Box>
      <TextField variant="outlined"
                 type="number"
                 size={"small"}
                 sx={{width: 120}}
                 value={props.contributorReward}
                 onChange={handleChange}
      />
      <Typography variant="body2" sx={{pl: 1}}>${tokenSymbol}</Typography>
    </Box>
  );
};

export interface ISingleContributorLine {
  contributor: PullRequestContributor,
  contributorReward: string,
  editReward: (string) => void
}

export default SingleContributorLine;
