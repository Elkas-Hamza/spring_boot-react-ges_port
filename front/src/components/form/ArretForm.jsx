import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArretService from "../../services/ArretService";
import EscaleService from "../../services/EscaleService";

const ArretForm = () => {
  const [arret, setArret] = useState({
    num_escale: "",
    dure_arret: "",
    DATE_DEBUT_arret: "",
    DATE_FIN_arret: "",
    motif_arret: "",
  });
  const [escales, setEscales] = useState([]);
  const [selectedEscaleDetails, setSelectedEscaleDetails] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all available escale numbers
    EscaleService.getAllEscales()
      .then((response) => {
        setEscales(response.data);
      })
      .catch((error) => {
        console.error("Error fetching escales:", error);
      });

    if (id) {
      // Fetch arret data if editing
      ArretService.getArretById(id)
        .then((response) => {
          setArret({
            num_escale: response.data.num_escale,
            dure_arret: response.data.dure_arret,
            DATE_DEBUT_arret: response.data.DATE_DEBUT_arret,
            DATE_FIN_arret: response.data.DATE_FIN_arret,
            motif_arret: response.data.motif_arret,
          });

          // Find and set the selected escale details
          if (response.data.num_escale) {
            const escaleDetail = escales.find(
              (e) => (e.num_escale || e.NUM_escale) === response.data.num_escale
            );
            setSelectedEscaleDetails(escaleDetail);
          }
        })
        .catch((error) => {
          console.error("Error fetching arret:", error);
        });
    }
  }, [id, escales]);

  useEffect(() => {
    if (arret.DATE_DEBUT_arret && arret.DATE_FIN_arret) {
      const startDate = new Date(arret.DATE_DEBUT_arret);
      const endDate = new Date(arret.DATE_FIN_arret);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setArret((prev) => ({ ...prev, dure_arret: diffDays }));
    }
  }, [arret.DATE_DEBUT_arret, arret.DATE_FIN_arret]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArret((prev) => ({ ...prev, [name]: value }));

    if (name === "num_escale") {
      const escaleDetail = escales.find(
        (e) => (e.num_escale || e.NUM_escale) === value
      );
      setSelectedEscaleDetails(escaleDetail);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !arret.num_escale ||
      !arret.DATE_DEBUT_arret ||
      !arret.DATE_FIN_arret ||
      !arret.motif_arret.trim()
    ) {
      alert("All fields are required");
      return;
    }

    const startDate = new Date(arret.DATE_DEBUT_arret);
    const endDate = new Date(arret.DATE_FIN_arret);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Invalid date format");
      return;
    }

    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }

    const formattedData = {
      DATE_DEBUT_arret: formatDateForBackend(arret.DATE_DEBUT_arret),
      DATE_FIN_arret: formatDateForBackend(arret.DATE_FIN_arret),
      motif_arret: arret.motif_arret.trim(),
      dure_arret: parseInt(arret.dure_arret, 10),
      num_escale: arret.num_escale.trim(),
    };

    console.log("Formatted data being sent to backend:", formattedData);

    try {
      if (id !== undefined) {
        const response = await ArretService.updateArret(id, formattedData);
        console.log("Update response:", response);
      } else {
        const response = await ArretService.createArret(formattedData);
        console.log("Create response:", response);
      }
      navigate("/arrets");
    } catch (error) {
      console.error("Error saving arret:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        alert(`Error: ${error.response.data.message || "Bad request"}`);
      }
    }
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace("T", " ").substring(0, 19); // Format as "yyyy-MM-dd HH:mm:ss"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Edit Arret" : "Create Arret"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="escale-select-label">Numéro d'escale</InputLabel>
          <Select
            labelId="escale-select-label"
            name="num_escale"
            value={arret.num_escale || ""}
            onChange={handleChange}
            label="Numéro d'escale"
          >
            {escales.map((escale) => (
              <MenuItem
                key={escale.num_escale || escale.NUM_escale}
                value={escale.num_escale || escale.NUM_escale}
              >
                {escale.num_escale || escale.NUM_escale}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedEscaleDetails && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Détails de l'escale sélectionnée:
            </Typography>
            <Typography variant="body2">
              Nom du navire:{" "}
              {selectedEscaleDetails.nom_navire ||
                selectedEscaleDetails.NOM_navire}
            </Typography>
            <Typography variant="body2">
              Date d'escortage:{" "}
              {formatDate(
                selectedEscaleDetails.date_accostage ||
                  selectedEscaleDetails.DATE_accostage
              )}
            </Typography>
            <Typography variant="body2">
              Date de sortie:{" "}
              {formatDate(
                selectedEscaleDetails.date_sortie ||
                  selectedEscaleDetails.DATE_sortie
              )}
            </Typography>
          </Box>
        )}

        <TextField
          label="Date Début"
          name="DATE_DEBUT_arret"
          type="datetime-local"
          value={arret.DATE_DEBUT_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Date Fin"
          name="DATE_FIN_arret"
          type="datetime-local"
          value={arret.DATE_FIN_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Durée (jours)"
          name="dure_arret"
          type="number"
          value={arret.dure_arret}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Motif d'arrêt"
          name="motif_arret"
          value={arret.motif_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Sauvegarder
        </Button>
        <Button component={Link} to="/arrets" sx={{ marginLeft: 2 }}>
          Annuler
        </Button>
      </form>
    </Container>
  );
};

export default ArretForm;
