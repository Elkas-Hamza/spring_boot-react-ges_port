import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import SoustraiteureService from "../../services/SoustraiteureService";

const SoustraiteureForm = () => {
  const [soustraiteure, setSoustraiteure] = useState({
    nom_soustraiteure: "",
    prenom_soustraiteure: "",
    fonction_soustraiteure: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      SoustraiteureService.getSoustraiteureById(id)
        .then((response) => {
          const soustraiteureData = response.data;
          console.log("Fetched soustraiteure data:", soustraiteureData);

          setSoustraiteure({
            nom_soustraiteure: soustraiteureData.nom_soustraiteure || "",
            prenom_soustraiteure: soustraiteureData.prenom_soustraiteure || "",
            fonction_soustraiteure: soustraiteureData.fonction_soustraiteure || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching soustraiteure:", error);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSoustraiteure((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !soustraiteure.nom_soustraiteure ||
      !soustraiteure.prenom_soustraiteure ||
      !soustraiteure.fonction_soustraiteure
    ) {
      console.error("All fields are required");
      return;
    }

    const formattedData = {
      nom_soustraiteure: soustraiteure.nom_soustraiteure,
      prenom_soustraiteure: soustraiteure.prenom_soustraiteure,
      fonction_soustraiteure: soustraiteure.fonction_soustraiteure,
    };
    console.log("Formatted data:", formattedData);

    try {
      if (id) {
        await SoustraiteureService.updateSoustraiteure(id, formattedData);
      } else {
        await SoustraiteureService.createSoustraiteure(formattedData);
      }
      navigate("/soustraiteure");
    } catch (error) {
      console.error("Error saving soustraiteure:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Soustraiteure" : "Créer Soustraiteure"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom"
          name="nom_soustraiteure"
          value={soustraiteure.nom_soustraiteure}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Prénom"
          name="prenom_soustraiteure"
          value={soustraiteure.prenom_soustraiteure}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Fonction"
          name="fonction_soustraiteure"
          value={soustraiteure.fonction_soustraiteure}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Sauvegarder
        </Button>
        <Button component={Link} to="/soustraiteure" sx={{ marginLeft: 2, mt: 2 }}>
          Annuler
        </Button>
      </form>
    </Container>
  );
};

export default SoustraiteureForm;