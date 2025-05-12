import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import OperationItem from "../item/OperationItem";
import OperationService from "../../services/OperationService";
import ErrorHandler from '../common/ErrorHandler';
import AuthService from '../../services/AuthService';

const OperationList = () => {
  const [operations, setOperations] = useState([]);
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOperations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = operations.filter((op) =>
        `${op.id_operation} ${op.nom_operation || ""} ${op.NUM_escale} ${op.id_shift} ${op.id_conteneure} ${op.id_engin} ${op.status || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredOperations(filtered);
    } else {
      setFilteredOperations(operations);
    }
  }, [searchQuery, operations]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const isValid = await AuthService.verifyToken();
      if (!isValid) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }
      
      const response = await OperationService.getAllOperationsWithDetails();
      setOperations(response.data);
      setFilteredOperations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching operations:", err);
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas l'autorisation d'accéder à ces données.");
      } else {
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (operation) => {
    setOperationToDelete(operation);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setOperationToDelete(null);
  };

  const handleDeleteOperation = async () => {
    try {
      await OperationService.deleteOperation(operationToDelete.id_operation);
      setOperations((prev) =>
        prev.filter((op) => op.id_operation !== operationToDelete.id_operation)
      );
      setFilteredOperations((prev) =>
        prev.filter((op) => op.id_operation !== operationToDelete.id_operation)
      );
      handleCloseDeleteDialog();
      setNotification({
        open: true,
        message: "Opération supprimée avec succès",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting operation:", err);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Gestion des Opérations
        </Typography>
        <Button
          component={Link}
          to="/operation/create"
          variant="contained"
          sx={{ mb: 3 }}
          startIcon={<AddIcon />}
        >
          Ajouter
        </Button>
      </Box>

      <TextField
        label="Rechercher par nom, escale, shift, conteneur ou engin"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <ErrorHandler 
          message={error} 
          onRetry={fetchOperations} 
        />
      )}

      {!loading && !error && filteredOperations.length === 0 && (


      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Escale</TableCell>
              <TableCell>Date/Heure Début</TableCell>
              <TableCell>Date/Heure Fin</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOperations.length > 0 ? (
              filteredOperations.map((operation) => (
                <OperationItem
                  key={operation.id_operation}
                  operation={operation}
                  onDelete={handleOpenDeleteDialog}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Aucune opération trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'opération{" "}
            {operationToDelete?.id_operation} ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button
            onClick={handleDeleteOperation}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OperationList;
