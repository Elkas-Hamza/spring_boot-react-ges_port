import React from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import { Link } from "react-router-dom";
const PersonnelItem = ({ personnel, onDelete }) => {
  return (
    <TableRow>
      <TableCell>{personnel.id_personnel}</TableCell>
      <TableCell>{personnel.matricule_personnel}</TableCell>
      <TableCell>{personnel.nom_personnel}</TableCell>
      <TableCell>{personnel.prenom_personnel}</TableCell>
      <TableCell>{personnel.fonction_personnel}</TableCell>
      <TableCell align="right">
        <Button
          component={Link}
          to={`/personnel/edit/${personnel.id_personnel}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>
        <Button color="error" onClick={() => onDelete(personnel)}>
          Supprimer
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PersonnelItem;
