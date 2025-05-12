import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { NavireService } from "../../services/NavireService";
import ConteneureService from "../../services/ConteneureService";
import { Delete } from "@mui/icons-material";

const NavireForm = () => {
  const [navire, setNavire] = useState({
    nomNavire: "",
    matriculeNavire: "",
  });

  // Container management state
  const [containerIds, setContainerIds] = useState([]);
  const [allContainers, setAllContainers] = useState([]);
  const [containerInput, setContainerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("No actions taken yet");
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add logging on component mount
  useEffect(() => {
    console.log("NavireForm mounted with params:", { id });
    console.log("Current auth:", {
      token: localStorage.getItem("token") ? "Present" : "Missing",
      role: localStorage.getItem("userRole"),
    });

    // Check and clear the redirect flag
    const isRedirectingFromList =
      localStorage.getItem("redirecting_to_create_navire") === "true";
    if (isRedirectingFromList) {
      console.log("Detected redirect from list - clearing flag");
      localStorage.removeItem("redirecting_to_create_navire");
      setDebugInfo(
        `Form loaded via direct navigation. Mode: ${id ? "Edit" : "Create"}`
      );
    } else {
      setDebugInfo(`Form loaded. Mode: ${id ? "Edit" : "Create"}`);
    }

    if (id) {
      const fetchNavire = async () => {
        try {
          setLoading(true);
          const response = await NavireService.getNavireById(id);

          if (response.success) {
            const navireData = response.data;
            setNavire({
              nomNavire: navireData.nomNavire || "",
              matriculeNavire: navireData.matriculeNavire || "",
            });

            // Fetch containers for this ship
            try {
              const containersResponse =
                await ConteneureService.getShipContainers(id);
              if (containersResponse.data) {
                setContainerIds(
                  containersResponse.data.map((c) => c.id_conteneure)
                );
              }
            } catch (error) {
              console.error("Error fetching ship containers:", error);
            }
          } else {
            setNotification({
              open: true,
              message: "Échec du chargement des données du navire",
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching navire:", error);
          setNotification({
            open: true,
            message: "Échec du chargement des données du navire",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchNavire();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNavire((prev) => ({ ...prev, [name]: value }));
  };

  // Container management handlers
  const handleContainerInputChange = (e) => {
    setContainerInput(e.target.value);
  };

  const handleAddContainer = () => {
    if (!containerInput.trim()) return;

    // Create a container ID-like format for manually entered containers
    const containerId = `CONT-${Date.now().toString().slice(-6)}`;

    setContainerIds((prev) => [...prev, containerId]);

    // Also add to allContainers so we can display the name
    setAllContainers((prev) => [
      ...prev,
      {
        id_conteneure: containerId,
        nom_conteneure: containerInput.trim(),
      },
    ]);

    setContainerInput("");
  };

  const handleRemoveContainer = (containerId) => {
    setContainerIds((prev) => prev.filter((id) => id !== containerId));
    setAllContainers((prev) =>
      prev.filter((container) => container.id_conteneure !== containerId)
    );
  };

  const handleContainerInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddContainer();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit initiated - payload:", navire);
    setDebugInfo(
      (prev) => `${prev}\nSubmit initiated - payload: ${JSON.stringify(navire)}`
    );

    // Validation
    if (!navire.nomNavire || !navire.matriculeNavire) {
      setNotification({
        open: true,
        message:
          "Le nom du navire et le numéro d'immatriculation sont obligatoires",
        severity: "error",
      });
      setDebugInfo(
        (prev) => `${prev}\nValidation error: Missing required fields`
      );
      return;
    }

    try {
      setLoading(true);
      setDebugInfo((prev) => `${prev}\nSending request to server...`);
      let response;

      if (id) {
        // Update existing navire
        setDebugInfo((prev) => `${prev}\nAttempting to update navire ${id}`);
        response = await NavireService.updateNavire(id, navire);
      } else {
        // Create new navire with just the required fields
        const navireData = {
          nomNavire: navire.nomNavire,
          matriculeNavire: navire.matriculeNavire,
        };

        setDebugInfo((prev) => `${prev}\nAttempting to create new navire`);
        response = await NavireService.createNavire(navireData);
      }

      if (response.success) {
        setDebugInfo((prev) => `${prev}\nServer response: Success`);

        // Get the ship ID from the response or from the URL
        const shipId = id || response.data.idNavire;
        console.log("Ship ID for container assignment:", shipId);

        // Process all containers that need to be created
        const containersToProcess = [...allContainers];

        // Track successful container creations
        let successCount = 0;
        let errorCount = 0;

        for (const container of containersToProcess) {
          try {
            setDebugInfo(
              (prev) =>
                `${prev}\nProcessing container: ${container.nom_conteneure}`
            );

            // 1. Create the container with direct navire reference and NAVIRE type
            const containerData = {
              nom_conteneure: container.nom_conteneure,
              type_conteneure: "NAVIRE", // Explicitly set as NAVIRE type
              navire: {
                idNavire: shipId, // Direct reference to the ship
              },
            };

            console.log("Creating container with data:", containerData);

            // 2. Create the container in the database
            const creationResponse = await ConteneureService.createConteneure(
              containerData
            );
            console.log("Container creation response:", creationResponse);

            // If the above approach fails, try the two-step approach as fallback
            if (!creationResponse || !creationResponse.data) {
              // Alternative approach: First create container then assign to ship
              const basicContainerData = {
                nom_conteneure: container.nom_conteneure,
              };

              const containerResponse =
                await ConteneureService.createConteneure(basicContainerData);
              console.log(
                "Created container with basic data:",
                containerResponse.data
              );

              // Now assign it to the ship
              await ConteneureService.assignContainerToShip(
                containerResponse.data.id_conteneure,
                shipId
              );
              console.log(
                `Assigned container ${containerResponse.data.id_conteneure} to ship ${shipId}`
              );
            }

            successCount++;
          } catch (error) {
            console.error(
              `Error processing container ${container.nom_conteneure}:`,
              error
            );
            errorCount++;
          }
        }

        // Set notification with results
        setNotification({
          open: true,
          message: `Navire ${
            id ? "modifié" : "créé"
          } avec succès. ${successCount} conteneurs ajoutés.${
            errorCount > 0 ? ` ${errorCount} échecs.` : ""
          }`,
          severity: "success",
        });

        // Redirect using direct navigation instead of React Router
        setDebugInfo(
          (prev) =>
            `${prev}\nRedirecting to navires list using direct navigation`
        );
        setTimeout(() => {
          window.location.href = "/navires";
        }, 1500);
      } else {
        setDebugInfo(
          (prev) =>
            `${prev}\nServer response: Error - ${
              response.message || "Unknown error"
            }`
        );
        setNotification({
          open: true,
          message:
            response.message ||
            `Échec de ${id ? "la modification" : "la création"} du navire`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving navire:", error);
      setDebugInfo(
        (prev) =>
          `${prev}\nException caught: ${error.message || "Unknown error"}`
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Échec de ${id ? "la modification" : "la création"} du navire`;

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (loading && id) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Navire" : "Créer Navire"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom du navire"
          name="nomNavire"
          value={navire.nomNavire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Numéro d'immatriculation"
          name="matriculeNavire"
          value={navire.matriculeNavire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        {/* Container Management Section */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ajouter des conteneurs
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                label="Nom du conteneur"
                value={containerInput}
                onChange={handleContainerInputChange}
                onKeyDown={handleContainerInputKeyDown}
                fullWidth
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddContainer}
                disabled={!containerInput.trim()}
              >
                Ajouter
              </Button>
            </Box>
          </Box>

          {/* Containers list */}
          {containerIds.length > 0 ? (
            <Paper variant="outlined" sx={{ mt: 2, mb: 2 }}>
              <List>
                {containerIds.map((containerId) => {
                  const container = allContainers.find(
                    (c) => c.id_conteneure === containerId
                  );
                  return (
                    <ListItem
                      key={containerId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveContainer(containerId)}
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          container ? container.nom_conteneure : containerId
                        }
                        secondary={containerId}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2, mb: 2 }}>
              Aucun conteneur sélectionné
            </Typography>
          )}

          {/* Chip display of container count */}
          {containerIds.length > 0 && (
            <Chip
              label={`${containerIds.length} conteneur${
                containerIds.length > 1 ? "s" : ""
              }`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sauvegarder"}
        </Button>

        <Button
          onClick={() => (window.location.href = "/navires")}
          sx={{ ml: 2, mt: 2 }}
        >
          Annuler
        </Button>
      </form>

      {/* Notification Snackbar */}
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

      {/* Debug info section (hidden in production) */}
      {process.env.NODE_ENV !== "production" && (
        <Paper
          elevation={1}
          sx={{ mt: 4, p: 2, maxHeight: "200px", overflow: "auto" }}
        >
          <Typography
            variant="caption"
            component="pre"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {debugInfo}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default NavireForm;
