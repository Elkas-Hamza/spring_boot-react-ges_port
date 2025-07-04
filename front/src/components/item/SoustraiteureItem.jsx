import React from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import { Link } from "react-router-dom";

const SoustraiteureItem = ({ soustraiteure, onDelete }) => {
  return (
    <TableRow>
      <TableCell>{soustraiteure.matricule_soustraiteure}</TableCell>
      <TableCell>{soustraiteure.nom_soustraiteure}</TableCell>
      <TableCell>{soustraiteure.prenom_soustraiteure}</TableCell>
      <TableCell>{soustraiteure.fonction_soustraiteure}</TableCell>
      <TableCell>{soustraiteure.contact_soustraiteure || "-"}</TableCell>
      <TableCell>{soustraiteure.entreprise_soustraiteure || "-"}</TableCell>
      <TableCell align="right">
        <Button
          component={Link}
          to={`/soustraiteure/edit/${soustraiteure.matricule_soustraiteure}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>
        <Button color="error" onClick={() => onDelete(soustraiteure)}>
          Supprimer
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default SoustraiteureItem;
