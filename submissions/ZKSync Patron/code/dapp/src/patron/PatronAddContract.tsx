import Box from "@mui/material/Box";
import { Button, TextField } from "@mui/material";
import * as React from "react";
import { useState } from "react";

function PatronAddContract() {
  const [contractAddress, setContractAddress] = useState('');

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        id="outlined-basic"
        label="Smart contract address"
        variant="outlined"
        value={contractAddress}
        onChange={(newValue) => {
          setContractAddress(newValue.target.value);
        }}
        InputProps={{endAdornment:
            <Button variant="contained" onClick={() => {
              console.log(`added ${contractAddress}`); // TODO send the address to the api
              setContractAddress('');
            }}>Send
            </Button>}}
      />
    </Box>
  )
}

export default PatronAddContract
