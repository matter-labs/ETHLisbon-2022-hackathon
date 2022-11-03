import React from 'react';
import CommonHeader from "../Common.Header/Common.Header";
import {Box} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<ICommonPageWrapper>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonPageWrapper: React.FC<ICommonPageWrapper> = (props) => {
  return (
    <Box width={"100vw"} minHeight={"100vh"}>
      <CommonHeader/>
      <Box display={"flex"} width="100%" alignItems={"center"} justifyContent={"center"} sx={{pt: 4}}>
        <Box width={props.customWidth ? props.customWidth : 800}>
          {props.children}
        </Box>
      </Box>
    </Box>
  );
};

export interface ICommonPageWrapper {
  children?: JSX.Element | JSX.Element[];
  customWidth?: string | number
}

export default CommonPageWrapper;
