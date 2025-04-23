import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import PersonnelService from "../../services/PersonnelService";

const PersonnelForm = () => {
  const [personnel, setPersonnel] = useState({
    nom_personnel: "",
    prenom_personnel: "",
    fonction_personnel: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      PersonnelService.getPersonnelById(id)
        .then((response) => {
          const personnelData = response.data;
          console.log("Fetched personnel data:", personnelData);

          setPersonnel({
            nom_personnel: personnelData.nom_personnel || "",
            prenom_personnel: personnelData.prenom_personnel || "",
            fonction_personnel: personnelData.fonction_personnel || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching personnel:", error);
        });
    }
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonnel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !personnel.nom_personnel ||
      !personnel.prenom_personnel ||
      !personnel.fonction_personnel
    ) {
      console.error("All fields are required");
      return;
    }

    const formattedData = {

      nom_personnel: personnel.nom_personnel,
      prenom_personnel: personnel.prenom_personnel,
      fonction_personnel: personnel.fonction_personnel,
    };
    console.log("Formatted data:", formattedData);

    try {
      if (id) {
        await PersonnelService.updatePersonnel(id, formattedData);
      } else {
        await PersonnelService.createPersonnel(formattedData);
      }
      navigate("/personnel");
    } catch (error) {
      console.error("Error saving personnel:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Personnel" : "Créer Personnel"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom"
          name="nom_personnel"
          value={personnel.nom_personnel}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Prénom"
          name="prenom_personnel"
          value={personnel.prenom_personnel}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Fonction"
          name="fonction_personnel"
          value={personnel.fonction_personnel}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Sauvegarder
        </Button>
        <Button component={Link} to="/personnel" sx={{ marginLeft: 2, mt: 2 }}>
          Annuler
        </Button>
      </form>
    </Container>
    
  );
  
};


export default PersonnelForm;
