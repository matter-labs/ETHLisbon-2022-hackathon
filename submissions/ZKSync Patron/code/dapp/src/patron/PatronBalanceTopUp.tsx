import * as React from "react";
import Box from "@mui/material/Box";
import { Button, TextField } from "@mui/material";
import { useState } from 'react';


function PatronBalanceTopUp(){
  const [topUp, setTopUp] = useState('');

  return (
    <Box sx={{ width: '100%' }}>
      0.1 ETH {/*TODO replace with the actual balance*/}
      <TextField
        id="outlined-basic"
        label="Top up amount"
        variant="outlined"
        type='number'
        value={topUp}
        onChange={(newValue) => {
          setTopUp(newValue.target.value);
        }}
        InputProps={{endAdornment:
            <Button variant="contained" onClick={() => {
              console.log(`Topped up ${topUp}`); // TODO send the top up amount to the api
              setTopUp('');
              }}>Send
            </Button>}}
      />
    </Box>
  )
}

export default PatronBalanceTopUp;
