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
  Container,
  Box,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import EquipeService from "../../services/EquipeService";

const EquipeList = () => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = () => {
    setLoading(true);
    EquipeService.getAllEquipes()
      .then((response) => {
        setEquipes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching equipes:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des équipes",
          severity: "error",
        });
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchEquipes();
      return;
    }

    setLoading(true);
    EquipeService.searchEquipes(searchTerm)
      .then((response) => {
        setEquipes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error searching equipes:", error);
        setNotification({
          open: true,
          message: "Erreur lors de la recherche d'équipes",
          severity: "error",
        });
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette équipe?")) {
      EquipeService.deleteEquipe(id)
        .then(() => {
          setNotification({
            open: true,
            message: "Équipe supprimée avec succès",
            severity: "success",
          });
          fetchEquipes();
        })
        .catch((error) => {
          console.error("Error deleting equipe:", error);
          setNotification({
            open: true,
            message: "Erreur lors de la suppression de l'équipe",
            severity: "error",
          });
        });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" component="h2">
            Liste des Équipes
          </Typography>
          <Button
            onClick={() => {
              console.log("Creating new equipe - direct navigation");
              // Set a flag in localStorage to indicate we're navigating to create form
              localStorage.setItem("redirecting_to_create_equipe", "true");
              // Use a more direct approach to navigate to the form
              document.location.href = "/equipes/create";
            }}
            variant="contained"
            color="primary"
            startIcon={<Add />}
          >
            Nouvelle Équipe
          </Button>
        </Box>

        <Box sx={{ display: "flex", mb: 3 }}>
          <TextField
            label="Rechercher par nom"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Search />}
            onClick={handleSearch}
          >
            Rechercher
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Membres</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipes.length > 0 ? (
                equipes.map((equipe) => (
                  <TableRow key={equipe.id_equipe}>
                    <TableCell>{equipe.id_equipe}</TableCell>
                    <TableCell>{equipe.nom_equipe}</TableCell>
                    <TableCell>
                      {(equipe.personnel ? equipe.personnel.length : 0) +
                        (equipe.soustraiteurs
                          ? equipe.soustraiteurs.length
                          : 0)}{" "}
                      membres
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
                        <Tooltip title="Voir détails">
                          <Button
                            color="info"
                            onClick={() =>
                              navigate(`/equipe/${equipe.id_equipe}`)
                            }
                          >
                            detail
                          </Button>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <Button
                            color="primary"
                            onClick={() =>
                              navigate(`/equipe/edit/${equipe.id_equipe}`)
                            }
                          >
                            Modifier
                          </Button>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <Button
                            color="error"
                            onClick={() => handleDelete(equipe.id_equipe)}
                          >
                            supprimer
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucune équipe trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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

export default EquipeList;
