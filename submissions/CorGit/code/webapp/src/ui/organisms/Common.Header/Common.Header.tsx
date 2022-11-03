import React from 'react';
import {Box, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {RouteKey} from "../../../App.Routes";

/**
 *
 * @param {React.PropsWithChildren<ICommonHeader>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonHeader: React.FC<ICommonHeader> = (props) => {
  const navigate = useNavigate();
  return (
    <Box width={"100vw"} height={80} display={"flex"} alignItems={"center"} sx={{px: 6}}>
      <Typography sx={{
                    fontWeight: 600,
                    fontSize: 30,
                    cursor: "pointer"
                  }}
                  onClick={() => {navigate(RouteKey.Home)}}
                  color="primary">
        CorGit
      </Typography>
    </Box>
  );
};

export interface ICommonHeader {

}

export default CommonHeader;
