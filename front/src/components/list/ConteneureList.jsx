import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";

const ConteneureList = () => {
  const [conteneures, setConteneures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [conteneureToDelete, setConteneureToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const fetchConteneures = async () => {
    try {
      setLoading(true);
      const response = await ConteneureService.getAllConteneures();
      setConteneures(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching conteneures:", error);
      setError("Erreur lors du chargement des conteneures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteneures();
  }, []);

  const handleDeleteClick = (conteneure) => {
    setConteneureToDelete(conteneure);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setConteneureToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!conteneureToDelete) return;
    
    try {
      await ConteneureService.deleteConteneure(conteneureToDelete.id_conteneure);
      setNotification({
        open: true,
        message: "Conteneure supprimé avec succès",
        severity: "success"
      });
      fetchConteneures();
    } catch (error) {
      console.error("Error deleting conteneure:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression du conteneure",
        severity: "error"
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1">
            Liste des Conteneures
          </Typography>
          <Button
            component={Link}
            to="/conteneures/add"
            variant="contained"
            color="primary"
            startIcon={<Add />}
          >
            Ajouter
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Nom du Conteneure</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conteneures.length > 0 ? (
                    conteneures.map((conteneure) => (
                      <TableRow hover key={conteneure.id_conteneure}>
                        <TableCell>{conteneure.id_conteneure}</TableCell>
                        <TableCell>{conteneure.nom_conteneure}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            component={Link}
                            to={`/conteneures/edit/${conteneure.id_conteneure}`}
                            color="primary"
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick(conteneure)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Aucun conteneure trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le conteneure "{conteneureToDelete?.nom_conteneure}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConteneureList; 