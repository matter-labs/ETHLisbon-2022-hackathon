import React from 'react';
import {Grid, TextField, Typography} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<ISingleCreateElement>} props
 * @return {JSX.Element}
 * @constructor
 */
const SingleCreateElement: React.FC<ISingleCreateElement> = (props) => {
  return (
    <Grid container sx={{my: 2}}>
      <Grid item xs={6}>
        <Typography variant="h4">{props.name}</Typography>
        <Typography variant="body2" color={"textSecondary"}>{props.description}</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField variant="standard"
                   fullWidth
                   value={props.value}
                   onChange={props.onChange}
                   type={props.isNumber ? "number" : "text"}
        />
      </Grid>
    </Grid>
  );
};

export interface ISingleCreateElement {
  name: string;
  description: string;
  value: string;
  onChange: (event) => void;
  isNumber?: boolean
}

export default SingleCreateElement;
