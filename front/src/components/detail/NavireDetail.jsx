import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { NavireService } from "../../services/NavireService";
import ConteneureService from "../../services/ConteneureService";
import {
  ArrowBack,
  Edit,
  Refresh,
  Add,
  Delete,
  Info,
  Link as LinkIcon,
} from "@mui/icons-material";

const NavireDetail = () => {
  const { id } = useParams();
  const [navire, setNavire] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Utility function to map typeId to readable container type
  const getContainerTypeName = (typeId) => {
    if (typeId === undefined || typeId === null) return "Non spécifié";

    const typeMap = {
      1: "PORT",
      2: "NAVIRE",
      3: "ENTREPÔT",
      4: "EN TRANSIT",
    };

    return typeMap[typeId] || `Type ${typeId}`;
  };

  // Predefined container types - same as in ConteneureForm.jsx
  const conteneureTypes = [
    "20 pieds standard",
    "40 pieds standard",
    "40 pieds high cube",
    "Réfrigéré",
    "Open top",
    "Flat rack",
    "Tank",
    "Citerne",
    "Flexitank",
    "Autre",
  ];

  // Add container dialog state
  const [containerDialogOpen, setContainerDialogOpen] = useState(false);
  const [newContainer, setNewContainer] = useState({
    nom_conteneure: "",
    type_conteneure: "", // Changed to type_conteneure to match backend model
    id_type: 2, // Always 2 for NAVIRE containers
  });
  const [containerDialogLoading, setContainerDialogLoading] = useState(false);

  // Add container deletion state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    container: null,
    loading: false,
  });

  // Add container details dialog state
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    container: null,
  });

  // Fetch data on component mount
  const fetchNavireData = useCallback(async () => {
    if (!id) {
      setError("ID de navire non valide");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching navire details for ID:", id);

      // Try to fetch from the enhanced endpoint first
      try {
        console.log("Trying to get navire with accurate container info...");
        const detailResponse = await NavireService.getNavireWithContainers(id);
        if (detailResponse.success && detailResponse.data) {
          console.log(
            "Successfully fetched navire with containers:",
            detailResponse.data
          );
          setNavire(detailResponse.data);

          // Make sure we're getting the latest container data with proper type_conteneure values
          if (
            detailResponse.data.containers &&
            Array.isArray(detailResponse.data.containers)
          ) {
            // Log the container data to help debug
            console.log(
              "Container data received:",
              detailResponse.data.containers
            );

            // Process the containers to ensure consistent field naming
            const processedContainers = detailResponse.data.containers.map(
              (container) => {
                // Get the type_conteneure field (database column)
                let typeValue = container.type_conteneure;

                // If type_conteneure is missing, set a default value
                if (!typeValue && container.id_conteneure) {
                  typeValue = "Standard"; // Default string value from database
                  console.warn(
                    `Container ${container.id_conteneure} has no type_conteneure information, using default`
                  );
                }
                const dateValue = container.D;

                // Log the date field to help debug
                if (!dateValue) {
                  console.warn(
                    `Container ${container.id_conteneure} missing date field. Available fields:`,
                    Object.keys(container)
                  );
                }
                // Normalize field names to match what the UI expects
                return {
                  id_conteneure: container.id_conteneure,
                  nom_conteneure: container.nom_conteneure,
                  type_conteneure: typeValue, // String value from database column
                  id_type: container.typeId || 2, // Default to 2 for NAVIRE containers
                  idNavire: container.idNavire || detailResponse.data.idNavire,
                  dateAjout: container.dateAjout,
                };
              }
            );

            setContainers(processedContainers);
          }
          setLoading(false);
          return;
        }
      } catch (enhancedError) {
        console.error("Enhanced navire fetch failed:", enhancedError);
      }

      // Try direct container endpoint
      try {
        console.log("Trying direct container endpoint...");
        const navireResponse = await NavireService.getNavireById(id);
        if (navireResponse.success && navireResponse.data) {
          setNavire(navireResponse.data);

          // Get containers using the direct endpoint
          const containersResponse = await NavireService.getNavireContainers(
            id
          );
          if (
            containersResponse.success &&
            Array.isArray(containersResponse.data)
          ) {
            console.log(
              `Loaded ${containersResponse.data.length} containers from direct endpoint`
            );

            // Process containers to ensure type_conteneure is present
            const processedDirectContainers = containersResponse.data.map(
              (container) => {
                // Get the type_conteneure field (database column)
                let typeValue = container.type_conteneure;

                // If type_conteneure is missing, set a default value
                if (!typeValue && container.id_conteneure) {
                  typeValue = "Standard"; // Default string value from database
                  console.warn(
                    `Container ${container.id_conteneure} has no type_conteneure information, using default`
                  );
                }

                return {
                  ...container,
                  type_conteneure: typeValue,
                  id_type: container.typeId || 2,
                };
              }
            );

            setContainers(processedDirectContainers);
            setLoading(false);
            return;
          }
        }
      } catch (directEndpointError) {
        console.error("Direct container endpoint failed:", directEndpointError);
      }

      // Standard fetch as fallback
      const response = await NavireService.getNavireById(id);
      console.log("Standard navire fetch response:", response);

      if (response.success) {
        setNavire(response.data);

        // Get containers for this ship
        try {
          console.log("Fetching containers for ship:", id);
          const containersResponse = await ConteneureService.getShipContainers(
            id
          );
          console.log("Ship containers response:", containersResponse);

          if (
            containersResponse.data &&
            Array.isArray(containersResponse.data)
          ) {
            // Process containers to ensure type_conteneure is present for fallback method
            const processedFallbackContainers = containersResponse.data.map(
              (container) => {
                // First, check for the actual physical type of the container (predefined container type)
                let physicalType = container.type_conteneure;

                // We need to display one of the predefined container physical types (20 pieds standard, 40 pieds high cube, etc.)
                if (!physicalType) {
                  // Default to a value for newly created containers with no type specified
                  physicalType = container.id_conteneure
                    ? conteneureTypes[1]
                    : "Non spécifié"; // Default to "40 pieds standard"
                  console.warn(
                    `Container ${container.id_conteneure} has no type_conteneure information, using default "40 pieds standard"`
                  );
                }

                // Determine container location type from typeId
                let locationType = "Inconnu";
                if (container.typeId) {
                  const typeMap = {
                    1: "PORT",
                    2: "NAVIRE",
                    3: "ENTREPÔT",
                    4: "EN TRANSIT",
                  };
                  locationType =
                    typeMap[container.typeId] || `Type ${container.typeId}`;
                  console.log(
                    `Mapped typeId ${container.typeId} to location type: ${locationType}`
                  );
                } else {
                  // Default to NAVIRE type for containers in this view
                  console.log("No typeId found, defaulting to NAVIRE (2)");
                  container.typeId = 2;
                  locationType = "NAVIRE";
                }

                return {
                  ...container,
                  type_conteneure: physicalType, // Physical container type (40 pieds standard, etc.)
                  location_type: locationType, // Location category (NAVIRE, PORT, etc.)
                  id_type: container.typeId || 2, // Location type ID
                  idNavire: container.idNavire || id, // Ensure navire ID is set
                };
              }
            );

            setContainers(processedFallbackContainers);
          } else {
            console.warn("No containers found or invalid container data");
            setContainers([]);
          }
        } catch (containerError) {
          console.error("Error fetching containers:", containerError);
          setContainers([]);
        }
      } else {
        setError("Erreur lors du chargement des données du navire");
      }
    } catch (err) {
      console.error("Error fetching navire:", err);
      setError(
        "Erreur lors du chargement des données du navire. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNavireData();
  }, [id, fetchNavireData]);

  // Handle container dialog open
  const handleOpenContainerDialog = () => {
    setNewContainer({
      nom_conteneure: "",
      type_conteneure: "", // Fixed to use consistent field name
      id_type: 2, // Always 2 for NAVIRE containers
    });
    setContainerDialogOpen(true);
  };

  // Handle container dialog close
  const handleCloseContainerDialog = () => {
    setContainerDialogOpen(false);
  };

  // Handle container input change
  const handleContainerInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for type_conteneure dropdown
    if (name === "type_conteneure") {
      // For index-based selection
      const selectedType = conteneureTypes[value - 1] || value;

      setNewContainer((prev) => ({
        ...prev,
        type_conteneure: selectedType,
        id_type: 2, // Always set to 2 for NAVIRE
      }));
    } else {
      setNewContainer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Create container function with retry mechanism
  const handleCreateContainer = async (retryCount = 0) => {
    if (!newContainer.nom_conteneure) {
      setNotification({
        open: true,
        message: "Le nom du conteneur est requis",
        severity: "error",
      });
      return;
    }

    if (!newContainer.type_conteneure) {
      setNotification({
        open: true,
        message: "Le type de conteneur est requis",
        severity: "error",
      });
      return;
    }

    const maxRetries = 3;

    try {
      if (retryCount === 0) {
        setContainerDialogLoading(true);
      }

      // Create container data with the correct structure matching database schema
      const containerData = {
        nom_conteneure: newContainer.nom_conteneure,
        type_conteneure: newContainer.type_conteneure, // Physical container type (e.g., "40 pieds high cube")
        id_type: 2, // Always set to 2 for NAVIRE type (location type)
        idNavire: navire.idNavire.toString(), // Ensure idNavire is a string
        // Removed typeId as it's not used in the backend and might cause confusion
      };

      console.log(
        `Creating container with data (attempt ${retryCount + 1}/${
          maxRetries + 1
        }):`,
        containerData
      );

      const result = await ConteneureService.createConteneure(containerData);

      if (result) {
        console.log("Container created successfully:", result);
        // Removed unused variable 'containerId'
        // Refresh data
        setNotification({
          open: true,
          message: "Conteneur ajouté avec succès au navire",
          severity: "success",
        });

        // Close dialog and refresh data
        handleCloseContainerDialog();
        fetchNavireData();
      } else {
        setNotification({
          open: true,
          message: "Erreur lors de la création du conteneur",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating container:", error);

      // Check if this is a duplicate key error that we can retry
      const isDuplicateKeyError =
        (error.response &&
          error.response.data &&
          error.response.status === 409) ||
        (error.message && error.message.includes("Duplicate entry"));

      if (isDuplicateKeyError && retryCount < maxRetries) {
        console.log(
          `Container ID conflict, retrying (attempt ${
            retryCount + 1
          } of ${maxRetries})`
        );

        // Wait a short delay before retrying
        setTimeout(() => {
          handleCreateContainer(retryCount + 1);
        }, 500);
        return;
      }

      // If we can't retry or have exhausted retries, show error to user
      // Extract more detailed error message if available
      let errorMessage = "Erreur lors de la création du conteneur";

      if (error.response && error.response.data) {
        // For axios errors or fetch errors with response data
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.action) {
          errorMessage = error.response.data.action;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
        console.log("Server error details:", error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      // If this was the last retry, show a more detailed message
      if (isDuplicateKeyError && retryCount >= maxRetries) {
        errorMessage = `Erreur persistante de conflit d'ID. Veuillez réessayer plus tard.`;
      }

      setNotification({
        open: true,
        message: `Erreur: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      // Only reset loading state if we're not retrying
      if (retryCount >= maxRetries) {
        setContainerDialogLoading(false);
      }
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleRefresh = () => {
    fetchNavireData();
    setNotification({
      open: true,
      message: "Données rafraîchies",
      severity: "info",
    });
  };

  // Handle delete dialog open
  const handleOpenDeleteDialog = (container) => {
    setDeleteDialog({
      open: true,
      container,
      loading: false,
    });
  };

  // Handle delete dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      ...deleteDialog,
      open: false,
    });
  };

  // Handle container deletion
  const handleDeleteContainer = async () => {
    if (!deleteDialog.container) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));

      const containerId = deleteDialog.container.id_conteneure;
      console.log("Deleting container:", containerId);

      const response = await ConteneureService.deleteConteneure(containerId);

      if (response && response.status === 204) {
        console.log("Container deleted successfully");

        // Remove the container from the list
        setContainers((prev) =>
          prev.filter((c) => c.id_conteneure !== containerId)
        );

        // Show success notification
        setNotification({
          open: true,
          message: "Conteneur supprimé avec succès",
          severity: "success",
        });

        // Close the dialog
        handleCloseDeleteDialog();

        // Refresh the data to ensure everything is up to date
        fetchNavireData();
      } else {
        setNotification({
          open: true,
          message: "Erreur lors de la suppression du conteneur",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting container:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression du conteneur",
        severity: "error",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle details dialog open
  const handleOpenDetailsDialog = (container) => {
    // Create a copy of the container with proper fields
    const containerWithDetails = {
      ...container,
      // Make sure we have the correct fields for display
      id_conteneure: container.id_conteneure,
      nom_conteneure: container.nom_conteneure,
      type_conteneure: container.type_conteneure,
      id_type: container.id_type || 2, // Default to 2 for NAVIRE containers
      dateAjout: container.dateAjout,
      idNavire: container.idNavire || navire?.idNavire,
    };

    console.log("Opening details dialog with container:", containerWithDetails);

    setDetailsDialog({
      open: true,
      container: containerWithDetails,
    });
  };

  // Handle details dialog close
  const handleCloseDetailsDialog = () => {
    setDetailsDialog({
      ...detailsDialog,
      open: false,
    });
  };

  // Add function to reassociate a container with this ship
  const handleReassociateContainer = async (containerId) => {
    if (!containerId || !navire) return;

    try {
      setNotification({
        open: true,
        message: "Réassociation en cours...",
        severity: "info",
      });

      console.log(
        `Attempting to reassociate container ${containerId} with ship ${navire.idNavire}`
      );
      const response = await ConteneureService.assignContainerToShip(
        containerId,
        navire.idNavire
      );

      if (response && response.data) {
        console.log("Container successfully reassociated:", response.data);

        setNotification({
          open: true,
          message: "Conteneur réassocié avec succès",
          severity: "success",
        });

        // Refresh the data
        fetchNavireData();
      } else {
        setNotification({
          open: true,
          message: "Erreur lors de la réassociation",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error reassociating container:", error);
      setNotification({
        open: true,
        message: "Erreur lors de la réassociation",
        severity: "error",
      });
    }
  };

  // Handle debug and attempt to fix container type display
  const handleDebugAndFixContainer = (container) => {
    console.log("Debug container:", container);

    // Log all properties for debugging
    console.log("Container properties:", Object.keys(container));
    console.log(
      `Container type_conteneure value: "${container.type_conteneure}"`
    );
    console.log(`Container typeId value: "${container.typeId}"`);
    console.log(`Container id_type value: "${container.id_type}"`);

    // Create a corrected container with type field if missing
    const correctedContainer = { ...container };
    let wasUpdated = false;
    let updateMessage = [];

    // If type_conteneure is missing, set a physical container type
    if (!correctedContainer.type_conteneure) {
      console.log(
        "Missing physical type_conteneure, assigning default type..."
      );

      // Set a default container physical type (40 pieds standard)
      const defaultType = conteneureTypes[1]; // "40 pieds standard"
      console.log(`Assigning default physical type: ${defaultType}`);

      correctedContainer.type_conteneure = defaultType;
      wasUpdated = true;
      updateMessage.push(`Type physique: ${defaultType}`);
    }

    // Check for missing typeId (location type)
    if (correctedContainer.typeId === undefined) {
      console.log("Missing typeId, setting default NAVIRE (2)");
      correctedContainer.typeId = 2;
      correctedContainer.id_type = 2;
      wasUpdated = true;
      updateMessage.push("Type de localisation: NAVIRE");
    }

    // Check for missing id_type (should match typeId)
    if (correctedContainer.id_type === undefined) {
      console.log("Missing id_type, setting from typeId or default");
      correctedContainer.id_type = correctedContainer.typeId || 2;
      wasUpdated = true;
      updateMessage.push("ID Type corrigé");
    }

    // If any updates were made, update the container in the array
    if (wasUpdated) {
      // Update the container in the containers array
      const updatedContainers = containers.map((c) => {
        if (c.id_conteneure === container.id_conteneure) {
          return correctedContainer;
        }
        return c;
      });

      setContainers(updatedContainers);

      setNotification({
        open: true,
        message: "Corrections appliquées: " + updateMessage.join(", "),
        severity: "success",
      });
      return;
    }

    // Container already has all required fields, allow manual type change
    console.log(
      "Container physical type is already present:",
      container.type_conteneure
    );

    // Ask user if they want to change the physical type
    const newPhysicalType = prompt(
      "Choisissez un nouveau type physique de conteneur:\n" +
        conteneureTypes.map((type, i) => `${i + 1}. ${type}`).join("\n"),
      container.type_conteneure
    );

    if (newPhysicalType && newPhysicalType !== container.type_conteneure) {
      // Update the container with the new physical type
      const updatedContainers = containers.map((c) => {
        if (c.id_conteneure === container.id_conteneure) {
          return {
            ...c,
            type_conteneure: newPhysicalType,
          };
        }
        return c;
      });

      setContainers(updatedContainers);

      setNotification({
        open: true,
        message: `Type physique de conteneur modifié: ${newPhysicalType}`,
        severity: "success",
      });
    }
  };

  // Handle debug - logs container data to console
  const handleDebugContainerData = (container) => {
    console.log("Container data structure:", {
      ...container,
      hasIdNavire: !!container.idNavire,
      hasTypeConteneur: !!container.typeConteneur,
      hasType_conteneure: !!container.type_conteneure,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erreur
          </Typography>
          <Typography>{error}</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              onClick={handleRefresh}
              startIcon={<Refresh />}
              variant="contained"
              color="primary"
            >
              Réessayer
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!navire) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography>Navire non trouvé</Typography>
          <Button component={Link} to="/navires" startIcon={<ArrowBack />}>
            Retour à la liste
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Détails du Navire
      </Typography>

      {/* Navire Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations du Navire
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>ID:</strong> {navire.idNavire}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Nom du navire:</strong> {navire.nomNavire}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            <strong>Numéro d'immatriculation:</strong> {navire.matriculeNavire}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            component={Link}
            to={`/navires/edit/${navire.idNavire}`}
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            component={Link}
            to="/navires"
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Retour à la liste
          </Button>
        </Box>
      </Paper>

      {/* Containers Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">
            Conteneurs
            <Chip
              label={containers.length}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenContainerDialog}
          >
            Ajouter un conteneur
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Type de conteneur</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {containers.length > 0 ? (
                containers.map((container) => (
                  <TableRow key={container.id_conteneure}>
                    <TableCell>{container.id_conteneure}</TableCell>
                    <TableCell>
                      {container.nom_conteneure || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={container.type_conteneure || "Non spécifié"}
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      {container.idNavire ? (
                        <Chip
                          size="small"
                          label={`Associé au navire`}
                          color="success"
                        />
                      ) : (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            size="small"
                            label="Non associé"
                            color="error"
                          />
                          <Tooltip title="Réassocier au navire">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleReassociateContainer(
                                  container.id_conteneure
                                )
                              }
                            >
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Tooltip title="Voir détails">
                        <IconButton
                          onClick={() => handleOpenDetailsDialog(container)}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(container)}
                          color="error"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Corriger ou modifier le type de conteneur">
                        <IconButton
                          onClick={() => handleDebugAndFixContainer(container)}
                          color="default"
                          size="small"
                        >
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun conteneur associé à ce navire
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Container Dialog */}
      <Dialog
        open={containerDialogOpen}
        onClose={handleCloseContainerDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter un conteneur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nom_conteneure"
            label="Nom du conteneur"
            type="text"
            fullWidth
            variant="outlined"
            value={newContainer.nom_conteneure}
            onChange={handleContainerInputChange}
            sx={{ mb: 2, mt: 1 }}
            required
          />

          {/* Container type selection - same as in ConteneureForm.jsx */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="type-conteneure-label">
              Type de Conteneur
            </InputLabel>
            <Select
              labelId="type-conteneure-label"
              id="type_conteneure"
              name="type_conteneure"
              value={
                newContainer.type_conteneure
                  ? conteneureTypes.indexOf(newContainer.type_conteneure) + 1 ||
                    ""
                  : ""
              }
              onChange={handleContainerInputChange}
              label="Type de Conteneur"
            >
              <MenuItem value="">
                <em>Sélectionnez un type</em>
              </MenuItem>
              {conteneureTypes.map((type, index) => (
                <MenuItem key={index} value={index + 1}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Sélectionnez le type physique du conteneur
            </FormHelperText>
          </FormControl>

         
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseContainerDialog}
            disabled={containerDialogLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateContainer}
            variant="contained"
            color="primary"
            disabled={
              containerDialogLoading ||
              !newContainer.nom_conteneure ||
              !newContainer.type_conteneure
            }
          >
            {containerDialogLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Ajouter"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Container Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le conteneur{" "}
            <strong>
              {deleteDialog.container?.nom_conteneure ||
                deleteDialog.container?.id_conteneure}
            </strong>
            ?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteDialog.loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteContainer}
            variant="contained"
            color="error"
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? (
              <CircularProgress size={24} />
            ) : (
              "Supprimer"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Container Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Détails du conteneur</DialogTitle>
        <DialogContent>
          {detailsDialog.container && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6">Informations générales</Typography>
              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography>
                    {detailsDialog.container.id_conteneure}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nom
                  </Typography>
                  <Typography>
                    {detailsDialog.container.nom_conteneure || "Non spécifié"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type de conteneur
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      detailsDialog.container.type_conteneure || "Standard"
                    }
                    color="primary"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date d'ajout
                  </Typography>
                  <Typography>
                    {detailsDialog.container.dateAjout
                      ? new Date(
                          detailsDialog.container.dateAjout
                        ).toLocaleString()
                      : "Non spécifiée"}
                  </Typography>
                </Box>
              </Box>

              {detailsDialog.container.id_type !== undefined && (
                <>
                  <Typography variant="h6" sx={{ mt: 3 }}>
                    Type de conteneur
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        ID Type
                      </Typography>
                      <Typography>
                        {detailsDialog.container.id_type || "Non spécifié"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type physique du conteneur
                      </Typography>
                      <Typography>
                        {detailsDialog.container.type_conteneure ||
                          "Non spécifié"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography>
                        {detailsDialog.container.description || "Non spécifiée"}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              <Typography variant="h6" sx={{ mt: 3 }}>
                Navire associé
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 2 }}>
                {detailsDialog.container.idNavire || navire ? (
                  <Typography>
                    {navire?.nomNavire || "Navire actuel"}
                    {navire?.matriculeNavire && ` (${navire.matriculeNavire})`}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      ID: {detailsDialog.container.idNavire || navire?.idNavire}
                    </Typography>
                  </Typography>
                ) : (
                  <Typography color="error">
                    Non associé à un navire! Le conteneur est orphelin.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NavireDetail;
