import React from 'react';
import {Paper, Typography} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<IProjectSingleDetailCard>} props
 * @return {JSX.Element}
 * @constructor
 */
const ProjectSingleDetailCard: React.FC<IProjectSingleDetailCard> = (props) => {
  return (
    <Paper elevation={3} sx={{p: 3}}>
      <Typography fontSize={20} color={"textSecondary"}>{props.name}</Typography>
      <Typography fontSize={20} color={"primary"} fontWeight={500} sx={{mt: 0.5}}>{props.value}</Typography>
    </Paper>
  );
};

export interface IProjectSingleDetailCard {
  name: string,
  value: string
}

export default ProjectSingleDetailCard;
