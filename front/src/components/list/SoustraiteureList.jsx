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
import SoustraiteureItem from "../item/SoustraiteureItem";
import SoustraiteureService from "../../services/SoustraiteureService";
import ErrorHandler from "../common/ErrorHandler";
import AuthService from "../../services/AuthService";

const SoustraiteureList = () => {
  const [soustraiteures, setSoustraiteures] = useState([]);
  const [filteredSoustraiteures, setFilteredSoustraiteures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [soustraiteureToDelete, setSoustraiteureToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSoustraiteures();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = soustraiteures.filter((s) =>
        `${s.matricule_soustraiteure} ${s.nom_soustraiteure} ${s.prenom_soustraiteure} ${s.fonction_soustraiteure} ${s.contact_soustraiteure || ''} ${s.entreprise_soustraiteure || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredSoustraiteures(filtered);
    } else {
      setFilteredSoustraiteures(soustraiteures);
    }
  }, [searchQuery, soustraiteures]);

  const fetchSoustraiteures = async () => {
    setLoading(true);
    try {
      // Verify token validity before making request
      const isValid = await AuthService.verifyToken();
      if (!isValid) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }
      
      const response = await SoustraiteureService.getAllSoustraiteure();
      setSoustraiteures(response.data);
      setFilteredSoustraiteures(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching soustraiteures:", err);
      
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas l'autorisation d'accéder à ces données.");
      } else if (err.response && err.response.status === 404) {
        setError("Aucun soustraiteure trouvé.");
      } else if (err.response && err.response.status === 500) {
        setError("Erreur serveur. Veuillez contacter l'administrateur.");
      } else if (err.request) {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (soustraiteure) => {
    setSoustraiteureToDelete(soustraiteure);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setSoustraiteureToDelete(null);
  };

  const handleDeleteSoustraiteure = async () => {
    try {
      if (!soustraiteureToDelete) return;

      await SoustraiteureService.deleteSoustraiteure(
        soustraiteureToDelete.matricule_soustraiteure
      );
      setSoustraiteures((prev) =>
        prev.filter(
          (s) =>
            s.matricule_soustraiteure !==
            soustraiteureToDelete.matricule_soustraiteure
        )
      );
      setFilteredSoustraiteures((prev) =>
        prev.filter(
          (s) =>
            s.matricule_soustraiteure !==
            soustraiteureToDelete.matricule_soustraiteure
        )
      );
      handleCloseDeleteDialog();
      setNotification({
        open: true,
        message: "Soustraiteure supprimé avec succès",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting soustraiteure:", err);
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

  const handleEditSoustraiteure = (soustraiteure) => {
    // Implement your edit logic here
    console.log("Editing soustraiteure:", soustraiteure);
    // You can navigate to an edit page or open a modal
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
          Gestion des Soustraiteures
        </Typography>
        <Button
          component={Link}
          to="/soustraiteure/create"
          variant="contained"
          sx={{ mb: 3 }}
          startIcon={<AddIcon />}
        >
          Ajouter
        </Button>
      </Box>

      <TextField
        label="Rechercher par matricule, nom, prénom, fonction, contact ou entreprise"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <ErrorHandler 
          message={error} 
          onRetry={fetchSoustraiteures} 
        />
      )}

      {!loading && !error && filteredSoustraiteures.length === 0 && (
        <Typography sx={{ textAlign: "center", my: 4 }} color="text.secondary">
          Aucun soustraiteure trouvé
        </Typography>
      )}

      {!loading && !error && filteredSoustraiteures.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Entreprise</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSoustraiteures.map((soustraiteure) => (
                <SoustraiteureItem
                  key={soustraiteure.matricule_soustraiteure}
                  soustraiteure={soustraiteure}
                  onDelete={handleOpenDeleteDialog}
                  onEdit={handleEditSoustraiteure}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer{" "}
            {soustraiteureToDelete?.nom_soustraiteure}{" "}
            {soustraiteureToDelete?.prenom_soustraiteure} ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button
            onClick={handleDeleteSoustraiteure}
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

export default SoustraiteureList;
