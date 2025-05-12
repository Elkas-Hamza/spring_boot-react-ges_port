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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { NavireService } from "../../services/NavireService";

const NavireForm = () => {
  const [navire, setNavire] = useState({
    nomNavire: "",
    matriculeNavire: "",
  });

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

        // Get the navire ID from the response or from the URL
        const navireId = id || response.data.idNavire;

        setNotification({
          open: true,
          message: `Navire ${id ? "modifié" : "créé"} avec succès.`,
          severity: "success",
        });

        // Redirect to navire details page instead of the list
        setDebugInfo(
          (prev) =>
            `${prev}\nRedirecting to navire details page: /navire/details/${navireId}`
        );
        setTimeout(() => {
          window.location.href = `/navire/details/${navireId}`;
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
