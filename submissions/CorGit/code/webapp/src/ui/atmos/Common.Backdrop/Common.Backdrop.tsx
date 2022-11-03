import React from 'react';
import {Backdrop, CircularProgress} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<ICommonBackdrop>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonBackdrop: React.FC<ICommonBackdrop> = (props) => {
  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={props.show}
        onClick={() => props.toggleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export interface ICommonBackdrop {
  show: boolean,
  toggleClose: () => void
}

export default CommonBackdrop;
