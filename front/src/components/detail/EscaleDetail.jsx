import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  TableContainer,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import EscaleService from "../../services/EscaleService";
import ArretService from "../../services/ArretService";
import { ArrowBack } from "@mui/icons-material";

const EscaleDetail = () => {
  const { id } = useParams();
  const [escale, setEscale] = useState(null);
  const [arrets, setArrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch escale details
        const escaleResponse = await EscaleService.getEscaleById(id);
        setEscale(escaleResponse.data);

        // Fetch all arrets and filter by escale ID
        const arretsResponse = await ArretService.getAllArrets();
        const filteredArrets = arretsResponse.data.filter(
          (arret) => arret.num_escale === id || arret.NUM_escale === id
        );
        setArrets(filteredArrets || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError("ID d'escale non valide");
      setLoading(false);
    }
  }, [id]);

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  // Handle delete operation
  const handleDelete = async (id_arret) => {
    try {
      await ArretService.deleteArret(id_arret);
      setArrets((prevArrets) => prevArrets.filter((arret) => arret.id_arret !== id_arret));
      setNotification({
        open: true,
        message: "Arrêt supprimé avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting arret:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression de l'arrêt",
        severity: "error",
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!escale) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Escale non trouvée
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Détails de l'Escale
      </Typography>

      {/* Escale Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations de l'Escale
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Numéro d'escale:</strong>{" "}
            {escale.num_escale || escale.NUM_escale || "Non spécifié"}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Nom du navire:</strong>{" "}
            {escale.nom_navire || escale.NOM_navire || "Non spécifié"}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Date d'accostage:</strong>{" "}
            {formatDate(escale.date_accostage || escale.DATE_accostage)}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Date de sortie:</strong>{" "}
            {formatDate(escale.date_sortie || escale.DATE_sortie)}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button component={Link} to="/escales" startIcon={<ArrowBack />}>
            Retour à la liste
          </Button>
        </Box>
      </Paper>

      {/* Arrets Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Arrêts</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/arret/create/${escale.num_escale || escale.NUM_escale}`}
        >
          Ajouter un Arrêt
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {arrets.length > 0 ? (
              arrets.map((arret) => (
                <TableRow key={arret.id_arret}>
                  <TableCell>{arret.id_arret}</TableCell>
                  <TableCell>{arret.dure_arret} jours</TableCell>
                  <TableCell>
                    {formatDate(arret.DATE_DEBUT_arret || arret.date_DEBUT_arret)}
                  </TableCell>
                  <TableCell>
                    {formatDate(arret.DATE_FIN_arret || arret.date_FIN_arret)}
                  </TableCell>
                  <TableCell>{arret.motif_arret}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/arrets/edit/${arret.id_arret}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(arret.id_arret)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun arrêt trouvé pour cette escale
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar Notification */}
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
    </Container>
  );
};

export default EscaleDetail;