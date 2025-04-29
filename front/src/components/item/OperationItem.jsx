import React from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import { Link } from "react-router-dom";

const OperationItem = ({ operation, onDelete }) => {
  // Format date strings to readable format
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <TableRow>
      <TableCell>{operation.id_operation}</TableCell>
      <TableCell>{operation.id_shift}</TableCell>
      <TableCell>{operation.NUM_escale}</TableCell>
      <TableCell>{operation.id_conteneure}</TableCell>
      <TableCell>{operation.id_engin}</TableCell>
      <TableCell>{formatDateTime(operation.date_debut)}</TableCell>
      <TableCell>{formatDateTime(operation.date_fin)}</TableCell>
      <TableCell align="right">
        <Button
          component={Link}
          to={`/operations/edit/${operation.id_operation}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>
        <Button color="error" onClick={() => onDelete(operation)}>
          Supprimer
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default OperationItem; 