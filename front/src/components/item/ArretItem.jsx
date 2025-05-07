import React, { useState, useEffect } from "react";
import { TableRow, TableCell, Button, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import ArretService from "../../services/ArretService";
import OperationService from "../../services/OperationService";

const ArretItem = ({ arret, onDelete }) => {
  const arretId =
    arret.id_arret || arret.ID_arret || arret.id || arret.num_escale;
  const [operation, setOperation] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);

  // Fetch operation details if there's an operation ID
  useEffect(() => {
    if (arret.id_operation || arret.ID_operation) {
      const operationId = arret.id_operation || arret.ID_operation;
      OperationService.getOperationById(operationId)
        .then(response => {
          setOperation(response.data);
          
          // Determine operation status based on dates
          const now = new Date();
          const startDate = new Date(response.data.date_debut);
          const endDate = new Date(response.data.date_fin);
          
          let status;
          if (startDate > now) {
            status = "Planifié";
          } else if (endDate < now) {
            status = "Terminé";
          } else {
            // Check for active arrêts to see if status is "En pause"
            ArretService.getActiveArretsForOperation(operationId)
              .then(arretsResponse => {
                if (arretsResponse && arretsResponse.length > 0) {
                  setOperationStatus("En pause");
                } else {
                  setOperationStatus(response.data.status || "En cours");
                }
              })
              .catch(error => {
                console.error("Error checking for active arrêts:", error);
                setOperationStatus(response.data.status || "En cours");
              });
            return; // Exit early as we'll set status in the promise
          }
          
          // Set the status if not checking for arrêts
          setOperationStatus(status);
        })
        .catch(error => {
          console.error("Error fetching operation:", error);
        });
    }
  }, [arret.id_operation, arret.ID_operation]);

  const handleDelete = async () => {
    try {
      await ArretService.deleteArret(arretId);
      onDelete(arretId);
    } catch (error) {
      console.error("Error deleting arret:", error);
    }
  };

  // Get color for operation status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planifié':
        return 'info';
      case 'En cours':
        return 'primary';
      case 'Terminé':
        return 'success';
      case 'En pause':
        return 'warning';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <TableRow>
      <TableCell>{arret.id_arret}</TableCell>
      <TableCell>{arret.num_escale}</TableCell>
      <TableCell>{new Date(arret.DATE_DEBUT_arret).toLocaleString()}</TableCell>
      <TableCell>{new Date(arret.DATE_FIN_arret).toLocaleString()}</TableCell>
      <TableCell>{arret.dure_arret}</TableCell>
      <TableCell>{arret.motif_arret}</TableCell>
      <TableCell>
        {operation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>{operation.nom_operation}</span>
            {operationStatus && (
              <Chip
                label={operationStatus}
                size="small"
                color={getStatusColor(operationStatus)}
              />
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <Button
          component={Link}
          to={`/arrets/edit/${arretId}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>
        <Button color="error" onClick={handleDelete}>
          Supprimer
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ArretItem;
