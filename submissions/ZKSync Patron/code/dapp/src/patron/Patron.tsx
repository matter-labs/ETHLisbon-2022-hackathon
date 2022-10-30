import * as React from 'react';
import { Typography } from '@mui/material'
import Box from '@mui/material/Box';
import PatronBalanceTopUp from "./PatronBalanceTopUp";
import PatronContractList from "./PatronContractList";
import PatronAddContract from './PatronAddContract';


function Patron(){
  return (
    <Box sx={{ width: '100%' }}>
      <Typography>Patron</Typography>
      <PatronBalanceTopUp/>
      <PatronContractList/>
      <PatronAddContract/>
    </Box>
  )
}

export default Patron
