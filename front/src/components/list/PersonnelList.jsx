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
        `${p.matricule_personnel} ${p.nom_personnel} ${p.prenom_personnel} ${p.fonction_personnel}`
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
      const response = await PersonnelService.getAllPersonnel();
      setPersonnel(response.data);
      setFilteredPersonnel(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching personnel:", err);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
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
      console.error("Error deleting personnel:", err);
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPersonnel.length > 0 ? (
                filteredPersonnel.map((person) => (
                  <PersonnelItem
                    key={person.matricule_personnel}
                    personnel={person}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucun personnel trouvé
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
