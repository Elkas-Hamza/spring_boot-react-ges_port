import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ShiftService from "../../services/ShiftService";

const ShiftForm = () => {
  const [shift, setShift] = useState({
    heure_debut: "",
    heure_fin: "",
    nom_shift: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      // Fetch shift data if editing
      setLoading(true);
      ShiftService.getShiftById(id)
        .then((response) => {
          // Format times for input fields
          const formattedShift = {
            ...response.data,
            heure_debut: response.data.heure_debut
              ? response.data.heure_debut.substring(0, 5)
              : "",
            heure_fin: response.data.heure_fin
              ? response.data.heure_fin.substring(0, 5)
              : "",
          };
          setShift(formattedShift);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching shift:", error);
          setNotification({
            open: true,
            message: "Erreur lors du chargement des données",
            severity: "error",
          });
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShift((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!shift.heure_debut || !shift.heure_fin || !shift.nom_shift) {
      setNotification({
        open: true,
        message: "Le nom du shift, les heures de début et de fin sont requis",
        severity: "error",
      });
      return;
    }

    // Validate times
    // if (shift.heure_debut >= shift.heure_fin) {
    //   setNotification({
    //     open: true,
    //     message: "L'heure de fin doit être après l'heure de début",
    //     severity: "error",
    //   });
    //   return;
    // }

    try {
      setLoading(true);
      if (id) {
        await ShiftService.updateShift(id, shift);
        setNotification({
          open: true,
          message: "Shift modifié avec succès",
          severity: "success",
        });
      } else {
        await ShiftService.createShift(shift);
        setNotification({
          open: true,
          message: "Shift ajouté avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/shifts"), 1500);
    } catch (error) {
      console.error("Error saving shift:", error);
      setNotification({
        open: true,
        message: "Erreur lors de l'enregistrement",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? "Modifier le Shift" : "Ajouter un Shift"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {id && (
            <TextField
              label="ID Shift"
              value={id}
              fullWidth
              margin="normal"
              disabled
            />
          )}

          <TextField
            label="Nom du Shift"
            name="nom_shift"
            value={shift.nom_shift}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Heure de début"
            name="heure_debut"
            type="time"
            value={shift.heure_debut}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Heure de fin"
            name="heure_fin"
            type="time"
            value={shift.heure_fin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/shifts"
              variant="outlined"
              color="secondary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Box>
        </Box>
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

export default ShiftForm;
