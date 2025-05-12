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
  Autocomplete,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import EscaleService from "../../services/EscaleService";
import { NavireService } from "../../services/NavireService";

const EscaleForm = () => {
  const [escale, setEscale] = useState({
    NOM_navire: "",
    navire: null,
    DATE_accostage: "",
    DATE_sortie: "",
  });

  const [navires, setNavires] = useState([]);
  const [selectedNavire, setSelectedNavire] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchNavires = async () => {
      try {
        setLoading(true);
        const response = await NavireService.getAllNavires();
        if (response.success) {
          setNavires(response.data);
        } else {
          console.error("Failed to fetch navires:", response.message);
          setNotification({
            open: true,
            message: "Impossible de charger la liste des navires",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching navires:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des navires",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNavires();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchEscale = async () => {
        try {
          setLoading(true);
          const response = await EscaleService.getEscaleById(id);
          const escaleData = response.data;

          const escaleNavireId = escaleData.navire?.idNavire || "";

          // Find the full navire object for the autocomplete field
          const matchingNavire = escaleNavireId
            ? navires.find((nav) => nav.idNavire === escaleNavireId) || null
            : null;

          setSelectedNavire(matchingNavire);
          setEscale({
            NOM_navire: escaleData.NOM_navire,
            navire: escaleNavireId,
            DATE_accostage: formatDateForInput(escaleData.DATE_accostage),
            DATE_sortie: formatDateForInput(escaleData.DATE_sortie),
          });
        } catch (error) {
          console.error("Error fetching escale:", error);
          setNotification({
            open: true,
            message: "Failed to load escale data",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchEscale();
    }
  }, [id, navires]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEscale((prev) => ({ ...prev, [name]: value })); // If selecting a navire from dropdown, update the NOM_navire field too
    if (name === "navire" && value) {
      const selectedNavire = navires.find((nav) => nav.idNavire === value);
      if (selectedNavire) {
        setEscale((prev) => ({
          ...prev,
          NOM_navire: selectedNavire.nomNavire,
        }));
      }
    }
  };

  const handleNavireChange = (event, newValue) => {
    if (newValue) {
      setSelectedNavire(newValue);
      setEscale((prev) => ({
        ...prev,
        navire: newValue.idNavire,
        NOM_navire: newValue.nomNavire,
      }));
    } else {
      setSelectedNavire(null);
      setEscale((prev) => ({
        ...prev,
        navire: "",
        NOM_navire: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !escale.NOM_navire ||
      !escale.navire ||
      !escale.DATE_accostage ||
      !escale.DATE_sortie
    ) {
      setNotification({
        open: true,
        message: "Tous les champs sont obligatoires",
        severity: "error",
      });
      return;
    }

    try {
      // Find the selected navire object
      const navireObj = navires.find((nav) => nav.idNavire === escale.navire);

      if (!navireObj) {
        setNotification({
          open: true,
          message:
            "Navire introuvable. Veuillez sélectionner un navire valide.",
          severity: "error",
        });
        return;
      }

      // Verify that the navire has a matriculeNavire property which is required
      if (!navireObj.matriculeNavire) {
        setNotification({
          open: true,
          message:
            "Le matricule du navire est obligatoire. Veuillez vérifier les données du navire.",
          severity: "error",
        });
        return;
      }

      // Use our shared date formatting function
      const isoDate1 = formatDateForAPI(escale.DATE_accostage);
      const isoDate2 = formatDateForAPI(escale.DATE_sortie);

      // Based on debug logs, we need to use the correct JPA column name
      const escaleData = {
        // These fields match the Java Escale class property names exactly
        NOM_navire: navireObj.nomNavire,
        DATE_accostage: isoDate1,
        DATE_sortie: isoDate2, // Use matriculeNavire to match the @JsonProperty in the Escale entity
        matriculeNavire: navireObj.matriculeNavire,
      };
      // Debug information to help diagnose the issue
      console.log(
        "Sending escale data to server:",
        JSON.stringify(escaleData, null, 2)
      );

      try {
        if (id) {
          await EscaleService.updateEscale(id, escaleData);
          setNotification({
            open: true,
            message: "Escale mise à jour avec succès",
            severity: "success",
          });
        } else {
          try {
            // Try the regular Axios method first
            await EscaleService.createEscale(escaleData);
            setNotification({
              open: true,
              message: "Escale créée avec succès",
              severity: "success",
            });
          } catch (axiosError) {
            console.log(
              "Axios request failed, trying direct fetch API as fallback"
            );
            // If that fails, try the direct fetch method
            const result = await EscaleService.createEscaleDirectFetch(
              escaleData
            );

            if (result.success) {
              setNotification({
                open: true,
                message: "Escale créée avec succès (via fetch fallback)",
                severity: "success",
              });
            } else {
              throw new Error(result.message || "Failed to create escale");
            }
          }
        }

        // Redirect after a short delay to show notification
        setTimeout(() => navigate("/escales"), 1000);
      } catch (error) {
        console.error("Error saving escale:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la sauvegarde";
        setNotification({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving escale:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la sauvegarde";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };
  // Utility function to format dates for Spring Boot's LocalDateTime
  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr);
    // Format as yyyy-MM-ddTHH:mm:ss (Spring Boot LocalDateTime format)
    return date.toISOString().split(".")[0]; // Remove milliseconds part
  };

  // Function to help diagnose the issue by testing different payload formats
  // eslint-disable-next-line no-unused-vars
  const testDirectApi = async (format) => {
    try {
      // Find the selected navire object
      const navireObj = navires.find((nav) => nav.idNavire === escale.navire);

      if (!navireObj || !escale.DATE_accostage || !escale.DATE_sortie) {
        console.error("Missing required data for test");
        return;
      }

      const isoDate1 = formatDateForAPI(escale.DATE_accostage);
      const isoDate2 = formatDateForAPI(escale.DATE_sortie);

      // Create different payload formats for testing
      let testPayload;

      switch (format) {
        case "fk-only":
          testPayload = {
            NOM_navire: navireObj.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            MATRICULE_navire: navireObj.matriculeNavire,
          };
          break;

        case "nested":
          testPayload = {
            NOM_navire: navireObj.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            navire: {
              matriculeNavire: navireObj.matriculeNavire,
              idNavire: navireObj.idNavire,
              nomNavire: navireObj.nomNavire,
            },
          };
          break;

        case "hybrid":
          testPayload = {
            NOM_navire: navireObj.nomNavire,
            DATE_accostage: isoDate1,
            DATE_sortie: isoDate2,
            MATRICULE_navire: navireObj.matriculeNavire,
            navire: {
              matriculeNavire: navireObj.matriculeNavire,
            },
          };
          break;

        default:
          console.error("Unknown test format");
          return;
      }

      console.log(
        `Testing format "${format}":`,
        JSON.stringify(testPayload, null, 2)
      );

      // Send direct fetch request for testing
      const response = await fetch("http://localhost:8080/api/escales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(testPayload),
      });

      console.log(`Test result for format "${format}":`, response.status);
      const responseText = await response.text();
      console.log("Response data:", responseText);

      if (response.ok) {
        console.log(`SUCCESS with format "${format}"`);
      } else {
        console.error(`FAILED with format "${format}"`);
      }
    } catch (error) {
      console.error(`Error testing format "${format}":`, error);
    }
  };

  // Uncomment this line to test different formats if needed
  // React.useEffect(() => { if (navires.length > 0) { testDirectApi("fk-only"); } }, [navires.length]);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Escale" : "Créer Escale"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Autocomplete
          id="navire-autocomplete"
          options={navires}
          value={selectedNavire}
          onChange={handleNavireChange}
          getOptionLabel={(option) =>
            `${option.matriculeNavire} - ${option.nomNavire}`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sélectionner un navire par matricule"
              margin="normal"
              required
              fullWidth
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.idNavire === value.idNavire
          }
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {option.matriculeNavire}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.nomNavire}
                  </Typography>
                </Box>
              </li>
            );
          }}
        />{" "}
        <TextField
          label="Nom du navire"
          name="NOM_navire"
          value={escale.NOM_navire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={selectedNavire !== null} // Disable if navire is selected
        />{" "}
        <TextField
          label="Date d'accostage"
          name="DATE_accostage"
          type="datetime-local"
          value={escale.DATE_accostage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />{" "}
        <TextField
          label="Date de sortie"
          name="DATE_sortie"
          type="datetime-local"
          value={escale.DATE_sortie}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button type="submit" variant="contained" color="primary">
            Sauvegarder
          </Button>

          <Button component={Link} to="/escales" variant="outlined">
            Annuler
          </Button>
        </Box>
      </form>

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

export default EscaleForm;
