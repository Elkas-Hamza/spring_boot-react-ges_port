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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";

const ConteneureList = () => {
  const [conteneurs, setConteneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [conteneurToDelete, setConteneurToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchConteneurs = async () => {
    try {
      setLoading(true);
      const response = await ConteneureService.getAllConteneures();
      setConteneurs(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching conteneurs:", error);
      setError("Erreur lors du chargement des conteneurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteneurs();
  }, []);

  const handleDeleteClick = (conteneur) => {
    setConteneurToDelete(conteneur);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setConteneurToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!conteneurToDelete) return;

    try {
      await ConteneureService.deleteConteneure(
        conteneurToDelete.id_conteneure
      );
      setNotification({
        open: true,
        message: "Conteneur supprimé avec succès",
        severity: "success",
      });
      fetchConteneurs();
    } catch (error) {
      console.error("Error deleting conteneur:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression du conteneur",
        severity: "error",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Liste des Conteneurs
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
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Nom du Conteneur
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conteneurs.length > 0 ? (
                    conteneurs.map((conteneur) => (
                      <TableRow hover key={conteneur.id_conteneure}>
                        <TableCell>{conteneur.id_conteneure}</TableCell>
                        <TableCell>{conteneur.nom_conteneure}</TableCell>
                        <TableCell>{conteneur.type_conteneure || "Non spécifié"}</TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/conteneures/edit/${conteneur.id_conteneure}`}
                            color="primary"
                            size="small"
                          >
                            modifier
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(conteneur)}
                            color="error"
                            size="small"
                          >
                            supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucun conteneur trouvé
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le conteneur "
            {conteneurToDelete?.nom_conteneure}" ? Cette action est
            irréversible.
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
