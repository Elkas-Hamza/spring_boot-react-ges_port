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
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Add as AddIcon } from "@mui/icons-material";
import EnginService from "../../services/EnginService";
import ErrorHandler from "../common/ErrorHandler";

const EnginList = () => {
  const [engins, setEngins] = useState([]);
  const [filteredEngins, setFilteredEngins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEngins();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = engins.filter((engin) =>
        `${engin.id_engin || ''} ${engin.nom_engin || ''} ${engin.type_engin || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredEngins(filtered);
    } else {
      setFilteredEngins(engins);
    }
  }, [searchQuery, engins]);

  const fetchEngins = async () => {
    try {
      setLoading(true);
      const response = await EnginService.getAllEngins();
      setEngins(response.data);
      setFilteredEngins(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching engins:", error);
      setError("Erreur lors du chargement des équipements. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      try {
        await EnginService.deleteEngin(id);
        setEngins((prev) => prev.filter((engin) => engin.id_engin !== id));
        setFilteredEngins((prev) => prev.filter((engin) => engin.id_engin !== id));
      } catch (error) {
        console.error("Error deleting engin:", error);
        alert("Erreur lors de la suppression de l'équipement. Veuillez réessayer.");
      }
    }
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
          Gestion des Équipements
        </Typography>
        <Button
          component={Link}
          to="/engins/create"
          variant="contained"
          sx={{ mb: 3 }}
          startIcon={<AddIcon />}
        >
          Ajouter
        </Button>
      </Box>

      <TextField
        label="Rechercher par ID, nom ou type d'équipement"
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
          onRetry={fetchEngins} 
        />
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && !error && filteredEngins.length > 0 ? (
              filteredEngins.map((engin) => (
                <TableRow key={engin.id_engin}>
                  <TableCell>{engin.id_engin}</TableCell>
                  <TableCell>{engin.nom_engin}</TableCell>
                  <TableCell>{engin.type_engin || "Non spécifié"}</TableCell>
                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/engins/edit/${engin.id_engin}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(engin.id_engin)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : !loading && !error && filteredEngins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">
                    Aucun équipement trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EnginList;
