import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowBack, Delete, Add } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import EquipeService from "../../services/EquipeService";
import OperationService from "../../services/OperationService";
import PersonnelService from "../../services/PersonnelService";
import SoustraiteureService from "../../services/SoustraiteureService";

const EquipeDetails = () => {
  const [equipe, setEquipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState([]);
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [availableSoustraiteurs, setAvailableSoustraiteurs] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [selectedSoustraiteur, setSelectedSoustraiteur] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const fetchEquipe = useCallback(async () => {
    try {
      console.log("Fetching equipe with ID:", id);
      const response = await EquipeService.getEquipeById(id);
      console.log("Fetched equipe:", response.data);
      setEquipe(response.data);
    } catch (error) {
      console.error("Error fetching equipe:", error);
      // Implement a retry mechanism
      console.log("Retrying equipe fetch in 1 second...");
      setTimeout(async () => {
        try {
          console.log("Retrying fetch for equipe ID:", id);
          const retryResponse = await EquipeService.getEquipeById(id);
          console.log("Retry fetch response:", retryResponse.data);
          setEquipe(retryResponse.data);
        } catch (retryError) {
          console.error("Error in retry fetch:", retryError);
          setNotification({
            open: true,
            message:
              "Erreur lors du chargement de l'équipe après plusieurs tentatives",
            severity: "error",
          });
        }
      }, 1000);
    }
  }, [id]);

  const fetchOperations = useCallback(async () => {
    try {
      const response = await OperationService.getOperationsByEquipeId(id);
      setOperations(response.data || []);
    } catch (error) {
      console.error("Error fetching operations:", error);
      setNotification({
        open: true,
        message: "Erreur lors du chargement des opérations",
        severity: "error",
      });
    }
  }, [id]);

  const fetchPersonnel = useCallback(async () => {
    try {
      const response = await PersonnelService.getAllPersonnel();
      setAvailablePersonnel(response.data || []);
    } catch (error) {
      console.error("Error fetching personnel:", error);
    }
  }, []);

  const fetchSoustraiteurs = useCallback(async () => {
    try {
      const response = await SoustraiteureService.getAllSoustraiteure();
      setAvailableSoustraiteurs(response.data || []);
    } catch (error) {
      console.error("Error fetching soustraiteurs:", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchEquipe(),
      fetchOperations(),
      fetchPersonnel(),
      fetchSoustraiteurs(),
    ])
      .catch((error) => {
        console.error("Error loading details:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des données",
          severity: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchEquipe, fetchOperations, fetchPersonnel, fetchSoustraiteurs]);

  const handleSelectPersonnel = (e) => {
    setSelectedPersonnel(e.target.value || "");
  };

  const handleSelectSoustraiteur = (e) => {
    setSelectedSoustraiteur(e.target.value || "");
  };

  const isPersonnelAlreadySelected = (personnelId) => {
    return (
      equipe?.personnel &&
      equipe.personnel.some((p) => p.matricule_personnel === personnelId)
    );
  };

  const isSoustraiteurAlreadySelected = (soustraiteurId) => {
    return (
      equipe?.soustraiteurs &&
      equipe.soustraiteurs.some(
        (s) => s.matricule_soustraiteure === soustraiteurId
      )
    );
  };

  const addPersonnel = async () => {
    if (!selectedPersonnel) return;

    try {
      const selectedPersonnelData = availablePersonnel.find(
        (p) => p.matricule_personnel === selectedPersonnel
      );
      if (!selectedPersonnelData) {
        throw new Error("Personnel not found in the available list");
      }

      console.log(
        `Attempting to add personnel with ID: ${selectedPersonnel} to equipe: ${id}`
      );

      const response = await EquipeService.addPersonnelToEquipe(
        id,
        selectedPersonnel
      );
      console.log("Successfully added personnel", response.data);

      await fetchEquipe();
      setSelectedPersonnel("");

      setNotification({
        open: true,
        message: "Personnel ajouté avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding personnel:", error);
      let errorMessage = "Erreur lors de l'ajout du personnel";
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        errorMessage += ` (${error.response.status})`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const removePersonnel = async (personnelId) => {
    try {
      await EquipeService.removePersonnelFromEquipe(id, personnelId);
      await fetchEquipe();

      setNotification({
        open: true,
        message: "Personnel retiré avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing personnel:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression du personnel",
        severity: "error",
      });
    }
  };

  const addSoustraiteur = async () => {
    if (!selectedSoustraiteur) return;

    try {
      const selectedSoustraiteurData = availableSoustraiteurs.find(
        (s) => s.matricule_soustraiteure === selectedSoustraiteur
      );
      if (!selectedSoustraiteurData) {
        throw new Error("Soustraiteur not found in the available list");
      }

      console.log(
        `Attempting to add soustraiteur with ID: ${selectedSoustraiteur} to equipe: ${id}`
      );

      const response = await EquipeService.addSoustraiteurToEquipe(
        id,
        selectedSoustraiteur
      );
      console.log("Successfully added soustraiteur", response.data);

      await fetchEquipe();
      setSelectedSoustraiteur("");

      setNotification({
        open: true,
        message: "Sous-traiteur ajouté avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding soustraiteur:", error);
      let errorMessage = "Erreur lors de l'ajout du sous-traiteur";
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        errorMessage += ` (${error.response.status})`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const removeSoustraiteur = async (soustraiteurId) => {
    try {
      await EquipeService.removeSoustraiteurFromEquipe(id, soustraiteurId);
      await fetchEquipe();

      setNotification({
        open: true,
        message: "Sous-traiteur retiré avec succès",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing soustraiteur:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression du sous-traiteur",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  const handleDeleteOperation = async (operationId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette opération?")) {
      try {
        await OperationService.deleteOperation(operationId);
        fetchOperations();
        setNotification({
          open: true,
          message: "Opération supprimée avec succès",
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting operation:", error);
        setNotification({
          open: true,
          message: "Erreur lors de la suppression de l'opération",
          severity: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!equipe) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography>Équipe non trouvée</Typography>
          <Button component={Link} to="/equipes" startIcon={<ArrowBack />}>
            Retour à la liste
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Détails de l'Équipe
      </Typography>

      {/* Equipe Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations de l'Équipe
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>ID:</strong> {equipe.id_equipe}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>nom:</strong> {equipe.nom_equipe}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>nombre de membres:</strong>{" "}
            {(equipe.personnel ? equipe.personnel.length : 0) +
              (equipe.soustraiteurs ? equipe.soustraiteurs.length : 0)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={() => (window.location.href = `/equipes/edit/${id}`)}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            onClick={() => (window.location.href = "/equipes")}
            variant="outlined"
          >
            Retour à la liste
          </Button>
        </Box>
      </Paper>

      {/* Operations Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Opérations</Typography>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Escale</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Conteneur</TableCell>
              <TableCell>Engin</TableCell>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operations.length > 0 ? (
              operations.map((operation) => (
                <TableRow key={operation.id_operation}>
                  <TableCell>{operation.id_operation}</TableCell>
                  <TableCell>{operation.id_escale}</TableCell>
                  <TableCell>{operation.id_shift}</TableCell>
                  <TableCell>{operation.id_conteneure}</TableCell>
                  <TableCell>{operation.id_engin}</TableCell>
                  <TableCell>{formatDate(operation.date_debut)}</TableCell>
                  <TableCell>{formatDate(operation.date_fin)}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/operations/edit/${operation.id_operation}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      color="error"
                      onClick={() =>
                        handleDeleteOperation(operation.id_operation)
                      }
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucune opération trouvée pour cette équipe
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Membres Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        ></Box>
        <Typography variant="h5" gutterBottom>
          Personnel
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ flexGrow: 1 }}>
            <InputLabel id="personnel-select-label">Personnel</InputLabel>
            <Select
              labelId="personnel-select-label"
              value={selectedPersonnel}
              label="Personnel"
              onChange={handleSelectPersonnel}
              sx={{ "& .MuiMenuItem-root": { py: 1.5 } }}
            >
              <MenuItem value="">
                <em>Sélectionner un membre du personnel</em>
              </MenuItem>
              {availablePersonnel.map((person) => (
                <MenuItem
                  key={person.matricule_personnel}
                  value={person.matricule_personnel}
                  disabled={isPersonnelAlreadySelected(
                    person.matricule_personnel
                  )}
                  sx={{ py: 1.5 }}
                >
                  {person.prenom_personnel} {person.nom_personnel} (
                  {person.matricule_personnel})
                  {isPersonnelAlreadySelected(person.matricule_personnel) &&
                    " - Déjà ajouté"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={addPersonnel}
            sx={{ height: "56px", minWidth: "150px" }}
            disabled={!selectedPersonnel}
          >
            Ajouter
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>matricule</TableCell>
                <TableCell>nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {" "}
              {(equipe.personnel || []).length > 0 ? (
                equipe.personnel.map((person) => (
                  <TableRow key={person.matricule_personnel}>
                    <TableCell>{person.matricule_personnel}</TableCell>
                    <TableCell>{person.nom_personnel}</TableCell>
                    <TableCell>{person.prenom_personnel}</TableCell>
                    <TableCell>{person.fonction_personnel}</TableCell>
                    <TableCell>
                      {person.contact_personnel || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Button
                        edge="end"
                        color="error"
                        onClick={() =>
                          removePersonnel(person.matricule_personnel)
                        }
                      >
                        supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun membre du personnel ajouté
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Sous-traiteurs
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ flexGrow: 1 }}>
            <InputLabel id="soustraiteur-select-label">
              Sous-traiteur
            </InputLabel>
            <Select
              labelId="soustraiteur-select-label"
              value={selectedSoustraiteur}
              label="Sous-traiteur"
              onChange={handleSelectSoustraiteur}
              sx={{ "& .MuiMenuItem-root": { py: 1.5 } }}
            >
              <MenuItem value="">
                <em>Sélectionner un sous-traiteur</em>
              </MenuItem>
              {availableSoustraiteurs.map((soustraiteur) => (
                <MenuItem
                  key={soustraiteur.matricule_soustraiteure}
                  value={soustraiteur.matricule_soustraiteure}
                  disabled={isSoustraiteurAlreadySelected(
                    soustraiteur.matricule_soustraiteure
                  )}
                  sx={{ py: 1.5 }}
                >
                  {soustraiteur.prenom_soustraiteure}{" "}
                  {soustraiteur.nom_soustraiteure} (
                  {soustraiteur.matricule_soustraiteure})
                  {isSoustraiteurAlreadySelected(
                    soustraiteur.matricule_soustraiteure
                  ) && " - Déjà ajouté"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={addSoustraiteur}
            sx={{ height: "56px", minWidth: "150px" }}
            disabled={!selectedSoustraiteur}
          >
            Ajouter
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>matricule</TableCell>
                <TableCell>nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Entreprise</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(equipe.soustraiteurs || []).length > 0 ? (
                equipe.soustraiteurs.map((soustraiteur) => (
                  <TableRow key={soustraiteur.matricule_soustraiteure}>
                    <TableCell>
                      {soustraiteur.matricule_soustraiteure}
                    </TableCell>
                    <TableCell>{soustraiteur.nom_soustraiteure}</TableCell>
                    <TableCell>{soustraiteur.prenom_soustraiteure}</TableCell>
                    <TableCell>{soustraiteur.fonction_soustraiteure}</TableCell>
                    <TableCell>
                      {soustraiteur.entreprise_soustraiteure || "Non spécifiée"}
                    </TableCell>
                    <TableCell>
                      {soustraiteur.contact_soustraiteure || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Button
                        edge="end"
                        color="error"
                        onClick={() =>
                          removeSoustraiteur(
                            soustraiteur.matricule_soustraiteure
                          )
                        }
                      >
                        supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun sous-traiteur ajouté
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default EquipeDetails;
