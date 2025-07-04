import React, { useState, useEffect } from "react";
import {
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
  TextField,
  Chip,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Landscape, Anchor } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";
import ErrorHandler from "../common/ErrorHandler";

const ConteneureList = () => {
  const [conteneurs, setConteneurs] = useState([]);
  const [filteredConteneurs, setFilteredConteneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [conteneurToDelete, setConteneurToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const fetchConteneurs = async () => {
    try {
      setLoading(true);
      const response = await ConteneureService.getAllConteneures();

      if (response.data && Array.isArray(response.data)) {
        setConteneurs(response.data);
        setFilteredConteneurs(response.data);
        setError(null);
      }
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

  useEffect(() => {
    if (searchQuery) {
      const filtered = conteneurs.filter((c) =>
        `${c.id_conteneure} ${c.nom_conteneure} ${c.type_conteneure || ""} ${
          c.id_type?.nomType || ""
        } ${c.navire?.nomNavire || "Port"}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredConteneurs(filtered);
    } else {
      setFilteredConteneurs(conteneurs);
    }
  }, [searchQuery, conteneurs]);

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
      await ConteneureService.deleteConteneure(conteneurToDelete.id_conteneure);
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

  const getLocationChip = (conteneur) => {
    // Debug the container object
    console.log("Container in getLocationChip:", conteneur);

    // Check if the container has id_type property with correct structure
    // Different endpoints might return either id_type.id or id_type.idType
    const typeId = conteneur.id_type || conteneur.id_type;
    console.log("Determined typeId:", typeId);

    // Check if this container is on a ship - two conditions:
    // 1. Type ID is 2 OR
    // 2. Container has a navire property
    const isOnShip = typeId === 2 || conteneur.navire != null;
    console.log("Container is on ship:", isOnShip);

    if (isOnShip) {
      return (
        <Tooltip
          title={
            conteneur.navire ? `Navire: ${conteneur.idNavire}` : "Type: NAVIRE"
          }
        >
          <Chip
            icon={<Anchor />}
            label={conteneur.idNavire}
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Situé au port">
          <Chip
            icon={<Landscape />}
            label="Port"
            color="success"
            size="small"
            sx={{ mr: 1 }}
          />
        </Tooltip>
      );
    }
  };
  // Provide type definition in JSX directly without unused columns variable
  const renderEmplacementChip = (typeId) => {
    const value = typeId === 2 ? "NAVIRE" : "INPORT";
    return (
      <Chip
        label={value}
        color={typeId === 2 ? "primary" : "default"}
        variant={typeId === 2 ? "contained" : "outlined"}
      />
    );
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
          Gestion des Conteneurs
        </Typography>
        <Box>
          <Button
            component={Link}
            to="/conteneures/create"
            variant="contained"
            sx={{ mb: 3 }}
            startIcon={<AddIcon />}
          >
            Ajouter
          </Button>
        </Box>
      </Box>

      <TextField
        label="Rechercher par ID, nom, type ou emplacement"
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

      {error && <ErrorHandler message={error} onRetry={fetchConteneurs} />}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom du Conteneur</TableCell>
              <TableCell>Type Physique</TableCell>
              <TableCell>Emplacement</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && !error && filteredConteneurs.length > 0 ? (
              filteredConteneurs.map((conteneur) => (
                <TableRow hover key={conteneur.id_conteneure}>
                  <TableCell>{conteneur.id_conteneure}</TableCell>
                  <TableCell>{conteneur.nom_conteneure}</TableCell>
                  <TableCell>{conteneur.type_conteneure}</TableCell>
                  <TableCell>{getLocationChip(conteneur)}</TableCell>
                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/conteneures/edit/${conteneur.id_conteneure}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(conteneur)}
                      color="error"
                      size="small"
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : !loading && !error && filteredConteneurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    Aucun conteneur trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

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
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
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

export default ConteneureList;
