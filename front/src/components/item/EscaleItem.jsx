import React from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import { Link } from "react-router-dom";

const EscaleItem = ({ escale, onDelete }) => {
  const escaleId = escale.NUM_escale || escale.num_escale;
  const nomNavire = escale.NOM_navire || escale.nom_navire;

  return (
    <TableRow>
      <TableCell>{escaleId}</TableCell>
      <TableCell>{nomNavire}</TableCell>
      <TableCell>
        {escale.DATE_accostage || escale.date_accostage
          ? new Date(
              escale.DATE_accostage || escale.date_accostage
            ).toLocaleString()
          : "N/A"}
      </TableCell>
      <TableCell>
        {escale.DATE_sortie || escale.date_sortie
          ? new Date(escale.DATE_sortie || escale.date_sortie).toLocaleString()
          : "N/A"}
      </TableCell>
      <TableCell>
        <Button
          component={Link}
          to={`/escale/edit/${escale.num_escale}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>

        <Button color="error" onClick={() => onDelete(escale)}>
          Supprimer
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default EscaleItem;
