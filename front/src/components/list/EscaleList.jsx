import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  TextField
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import EscaleService from "../../services/EscaleService";
import EscaleItem from "../item/EscaleItem";

const EscaleList = () => {
  const [escales, setEscales] = useState([]);
  const [filteredEscales, setFilteredEscales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [escaleToDelete, setEscaleToDelete] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEscales();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = escales.filter(e =>
        `${e.num_escale} ${e.nom_navire}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredEscales(filtered);
    } else {
      setFilteredEscales(escales);
    }
  }, [searchQuery, escales]);

  const fetchEscales = async () => {
    setLoading(true);
    try {
      const response = await EscaleService.getAllEscales();
      setEscales(response.data);
      setFilteredEscales(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching escales:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (escale) => {
    setEscaleToDelete(escale);
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setEscaleToDelete(null);
  };

  const handleDeleteEscale = async () => {
    try {
      await EscaleService.deleteEscale(escaleToDelete.num_escale);
      setEscales(prev => prev.filter(e => e.num_escale !== escaleToDelete.num_escale));
      setFilteredEscales(prev => prev.filter(e => e.num_escale !== escaleToDelete.num_escale));
      handleCloseDeleteDialog();
      setNotification({ 
        open: true, 
        message: 'Escale supprimée avec succès', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error deleting escale:', err);
      setNotification({ 
        open: true, 
        message: 'Erreur lors de la suppression il y a des arrets sous cet escale', 
        severity: 'error' 
      });
      handleCloseDeleteDialog();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" gutterBottom>
          Management Des Escales
        </Typography>
        <Button
          component={Link}
          to="/escale/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Créer une nouvelle escale
        </Button>
      </Box>

      <TextField
        label="Rechercher par numéro ou nom de navire"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro d'escale</TableCell>
                <TableCell>Nom du navire</TableCell>
                <TableCell>Date d'accostage</TableCell>
                <TableCell>Date de sortie</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEscales.length > 0 ? (
                filteredEscales.map((escale) => (
                  <EscaleItem
                    key={escale.num_escale}
                    escale={escale}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucune escale trouvée
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
            Êtes-vous sûr de vouloir supprimer l'escale {escaleToDelete?.num_escale} - {escaleToDelete?.nom_navire} ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteEscale} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EscaleList;