import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";
import { useState } from "react";


// TODO remove later, only for testing purposes
const dummyRows = [
  { id: 0, contractAddresses: '0x4e7C85666666666baF72eF69c633FefD1bF2bdE9'},
  { id: 1, contractAddresses: '0x55555555555555555552eF69c633FefD1bF2bdE9'},
];


function PatronContractList() {
  const columns: GridColDef[] = [
    {
      field: 'contractAddresses',
      headerName: 'Contracts',
      width: 450,
      editable: false,
    },
    {
      field: 'remove',
      headerName: 'Remove',
      sortable: false,
      editable: false,
      width: 110,
      renderCell: (params) => { // TODO add deleting functionality to the button
        return <Button  onClick={() => {
          console.log(`Deleted row ${params.id}`)
            // 1. api call delete contract XYZ
            // 2. fetch contract and setContracts setContracts(...);
        }}>X</Button>;
      }
    },
  ];

  const [contracts, setContracts] = useState(dummyRows);
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={contracts}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}

export default PatronContractList