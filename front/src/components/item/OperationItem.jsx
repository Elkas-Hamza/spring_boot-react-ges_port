import React, { useState, useEffect, useRef } from "react";
import { TableRow, TableCell, Button, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import ArretService from "../../services/ArretService";

const OperationItem = ({ operation, onDelete }) => {
  const [displayStatus, setDisplayStatus] = useState("");
  const hasCheckedArretsRef = useRef(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Determine initial status based on dates when component mounts
  useEffect(() => {
    // Reset check status when operation changes
    hasCheckedArretsRef.current = false;
    
    const determineStatus = () => {
      try {
        // Get current date
        const now = new Date();
        
        // Parse operation dates
        const startDate = operation.date_debut ? new Date(operation.date_debut) : null;
        const endDate = operation.date_fin ? new Date(operation.date_fin) : null;
        
        // If dates are not available, use the existing status
        if (!startDate || !endDate) {
          setDisplayStatus(operation.status || "En cours");
          hasCheckedArretsRef.current = true;
          return;
        }
        
        // Determine status based on dates
        if (startDate > now) {
          // Operation is in the future
          setDisplayStatus("Planifié");
          hasCheckedArretsRef.current = true;
        } else if (endDate < now) {
          // Operation is in the past
          setDisplayStatus("Terminé");
          hasCheckedArretsRef.current = true;
        } else {
          // Operation is current - check for arrêts
          checkForActiveArrets();
        }
      } catch (error) {
        console.error("Error determining status:", error);
        setDisplayStatus(operation.status || "En cours");
        hasCheckedArretsRef.current = true;
      }
    };
    
    // Call the function immediately if not already checked
    if (!hasCheckedArretsRef.current) {
      determineStatus();
    }
  }, [operation]);

  // Function to check for active arrêts
  const checkForActiveArrets = async () => {
    try {
      const activeArrets = await ArretService.getActiveArretsForOperation(operation.id_operation);
      
      // Only update state if component still mounted
      if (isMounted.current) {
        // If there are active arrêts, set status to "En pause"
        if (activeArrets && activeArrets.length > 0) {
          setDisplayStatus("En pause");
        } else {
          // Otherwise, use operation's status or default to "En cours"
          setDisplayStatus(operation.status || "En cours");
        }
        
        // Mark that we've checked
        hasCheckedArretsRef.current = true;
      }
    } catch (error) {
      // Only update state if component still mounted
      if (isMounted.current) {
        console.error("Error checking for active arrêts:", error);
        // Set default status and mark checked
        setDisplayStatus(operation.status || "En cours");
        hasCheckedArretsRef.current = true;
      }
    }
  };

  // Format date strings to readable format
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // Get status color based on status
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

  // Show a default status if displayStatus is empty
  const status = displayStatus || operation.status || "En cours";

  return (
    <TableRow>
      <TableCell>{operation.id_operation}</TableCell>
      <TableCell>{operation.nom_operation || "Non spécifié"}</TableCell>
      <TableCell>{operation.nom_shift || operation.id_shift}</TableCell>
      <TableCell>{operation.id_escale}</TableCell>
      <TableCell>{formatDateTime(operation.date_debut)}</TableCell>
      <TableCell>{formatDateTime(operation.date_fin)}</TableCell>
      <TableCell>
        <Chip 
          label={status} 
          size="small"
          color={getStatusColor(status)}
        />
      </TableCell>
      <TableCell align="right">
        <Button
          component={Link}
          to={`/operations/${operation.id_operation}`}
          color="primary"
          sx={{ mr: 1 }}
        >
          Détails
        </Button>
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
