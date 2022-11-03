import React from 'react';
import {Box} from "@mui/material";
import RewardLine from "./RewardLine";
import {ProjectUserContributionInterface} from "../../../hooks/useLoadProjectUserContributions";

/**
 *
 * @param {React.PropsWithChildren<IProjectUserRewardsList>} props
 * @return {JSX.Element}
 * @constructor
 */
const ProjectUserRewardsList: React.FC<IProjectUserRewardsList> = (props) => {
  return (
    <Box display={"flex"}
         flexDirection={"column"}
         sx={{
           backgroundColor: "#f6f6f6",
           px: 3,
           py: 2,
           borderRadius: 4,
           borderColor: "#d2d2d2",
           borderWidth: 1,
           borderStyle: "solid"
         }}
    >
      {
        props.contributionList.length === 0 ?
          "You don't have any paid contribution yet in this project"
          :
          props.contributionList.map((contribution) =>
            <RewardLine key={contribution.paymentId} contribution={contribution}/>
          )
      }
    </Box>
  );
};

export interface IProjectUserRewardsList {
  contributionList: ProjectUserContributionInterface[]

}

export default ProjectUserRewardsList;
