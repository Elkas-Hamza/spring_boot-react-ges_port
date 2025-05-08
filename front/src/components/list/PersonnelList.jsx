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
import PersonnelItem from "../item/PersonnelItem";
import PersonnelService from "../../services/PersonnelService";
import ErrorHandler from "../common/ErrorHandler";
import AuthService from "../../services/AuthService";

const PersonnelList = () => {
  const [personnel, setPersonnel] = useState([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = personnel.filter((p) =>
        `${p.matricule_personnel} ${p.nom_personnel} ${p.prenom_personnel} ${p.fonction_personnel} ${p.contact_personnel || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredPersonnel(filtered);
    } else {
      setFilteredPersonnel(personnel);
    }
  }, [searchQuery, personnel]);

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      // Verify token validity before making request
      const isValid = await AuthService.verifyToken();
      if (!isValid) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }
      
      const response = await PersonnelService.getAllPersonnel();
      setPersonnel(response.data);
      setFilteredPersonnel(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching personnel:", err);
      if (err.response && err.response.status === 403) {
        setError("Vous n'avez pas l'autorisation d'accéder à ces données.");
      } else {
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (person) => {
    setPersonnelToDelete(person);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setPersonnelToDelete(null);
  };

  const handleDeletePersonnel = async () => {
    try {
      await PersonnelService.deletePersonnel(
        personnelToDelete.matricule_personnel
      );
      setPersonnel((prev) =>
        prev.filter(
          (p) => p.matricule_personnel !== personnelToDelete.matricule_personnel
        )
      );
      setFilteredPersonnel((prev) =>
        prev.filter(
          (p) => p.matricule_personnel !== personnelToDelete.matricule_personnel
        )
      );
      handleCloseDeleteDialog();
      setNotification({
        open: true,
        message: "Personnel supprimé avec succès",
        severity: "success",
      });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
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
          Gestion du Personnel
        </Typography>
        <Button
          component={Link}
          to="/personnel/create"
          variant="contained"
          sx={{ mb: 3 }}
          startIcon={<AddIcon />}
        >
          Ajouter
        </Button>
      </Box>

      <TextField
        label="Rechercher par matricule, nom, prénom ou fonction"
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
          onRetry={fetchPersonnel} 
        />
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Fonction</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && !error && filteredPersonnel.length > 0 ? (
              filteredPersonnel.map((person) => (
                <PersonnelItem
                  key={person.matricule_personnel}
                  personnel={person}
                  onDelete={handleOpenDeleteDialog}
                />
              ))
            ) : !loading && !error && filteredPersonnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    Aucun personnel trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer{" "}
            {personnelToDelete?.nom_personnel}{" "}
            {personnelToDelete?.prenom_personnel} ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button
            onClick={handleDeletePersonnel}
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

export default PersonnelList;
