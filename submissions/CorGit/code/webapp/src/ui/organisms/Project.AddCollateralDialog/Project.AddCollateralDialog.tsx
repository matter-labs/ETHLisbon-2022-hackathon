import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Slide,
  TextField,
  Typography
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {TransitionProps} from "@mui/material/transitions";
import {useAddCollateral} from "../../../hooks/useAddCollateral";
import {useAccount, useSigner} from "wagmi";
import {useParams} from "react-router";
import {useLoadProjectUserContributions} from "../../../hooks/useLoadProjectUserContributions";
import {useAppSelector} from "../../../hooks/reduxHooks";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 *
 * @param {React.PropsWithChildren<IProjectAddCollateralDialog>} props
 * @return {JSX.Element}
 * @constructor
 */
const ProjectAddCollateralDialog: React.FC<IProjectAddCollateralDialog> = (props) => {

  const [valueEth, setValueEth] = useState<string>("0");
  const tokenSymbol = useAppSelector(state => state.cgProject?.tokenSymbol);

  const { address, isConnected } = useAccount();
  let { tokenAddress } = useParams();
  const {data: signer} = useSigner({chainId: 5});
  const {completed, transactionHash, error, checkNow} = useAddCollateral({cgTokenAddress: tokenAddress});
  let { loading: loadingCgProjectContributions,
    error: errorLoadCjProjectContributions,
    projectUserContributions, checkNow: checkProjectContributions } = useLoadProjectUserContributions(tokenAddress);

  useEffect(() => {
    if (completed) {
      checkProjectContributions({
        signer: signer,
        address: address
      });
      props.close();
    }
  }, [completed]);

  return (
    <Dialog
      open={props.show}
      TransitionComponent={Transition}
      onClose={props.close}
    >
      <DialogTitle>
        <Typography variant={"h2"}>Add Collateral</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Fund your projects by adding collateral. Rewards will be used to reward previous contributors,
          and to mint new tokens, according to your distribution reward value
        </DialogContentText>

        {/* Enter the amount */}
        <Grid container sx={{mt: 3}}>
          <Grid item flexGrow={10}>
            <TextField fullWidth
                       size={"small"}
                       value={valueEth}
                       onChange={(e) => {setValueEth(e.target.value)}}
                       InputProps={{
                         sx: {
                           textAlign: "right"
                         }
                       }}
            />
          </Grid>
          <Grid item sx={{pl: 1, mt: 1}}>
            ETH
          </Grid>
          <Grid item xs={12} sx={{textAlign: "right", mt: 0.3, pr: 6}}>
            <Typography variant={"body2"}><strong>Max </strong>15,345</Typography>
          </Grid>
        </Grid>

        <Grid container mt={2}>
          <Grid item xs={12} sx={{mb: 0.5}}>
            <Typography variant={"body1"}>
              <strong>After the operation completes</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}><Typography variant={"body1"}>${tokenSymbol} value</Typography></Grid>
          <Grid item xs={6} sx={{textAlign: "right"}}>0,00000 ETH</Grid>
          <Grid item xs={6}>Amount Token minted</Grid>
          <Grid item xs={6} sx={{textAlign: "right"}}>12,456</Grid>
          <Grid item xs={6}>Increase token value</Grid>
          <Grid item xs={6} sx={{textAlign: "right"}}>+120 %</Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{pr: 3, pb: 3}}>
        {
          transactionHash ?
            <CircularProgress size={24}/>
            :
            <Box>
              <Button onClick={props.close}
                      color="secondary"
                      sx={{textTransform: "none"}}
                      variant={"outlined"}
              >Cancel</Button>
              <Button onClick={() => {checkNow({
                        amountETH: parseFloat(valueEth),
                        signer
                      })}}
                      color="secondary"
                      sx={{color: "white", textTransform: "none", ml: 2}}
                      variant={"contained"}>Confirm</Button>
            </Box>
        }

      </DialogActions>
    </Dialog>
  );
};

export interface IProjectAddCollateralDialog {
  show: boolean,
  close: () => void
}

export default ProjectAddCollateralDialog;
