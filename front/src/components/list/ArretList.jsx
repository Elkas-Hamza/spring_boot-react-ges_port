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
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import ArretService from "../../services/ArretService";
import ArretItem from "../item/ArretItem";

const ArretList = () => {
  const [arrets, setArrets] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const location = useLocation();

  useEffect(() => {
    fetchArrets();

    // Check if we were redirected after creating/updating an arret
    if (location.state?.message) {
      setNotification({
        open: true,
        message: location.state.message,
        severity: location.state.severity || "success",
      });
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchArrets = async () => {
    try {
      const response = await ArretService.getAllArrets();
      setArrets(response.data);
    } catch (error) {
      console.error("Error fetching arrets:", error);
    }
  };
  const handleDeleteSuccess = (deletedId) => {
    setArrets((prevArrets) =>
      prevArrets.filter(
        (arret) => arret.id_arret !== deletedId && arret.ID_arret !== deletedId
      )
    );
    setNotification({
      open: true,
      message: "Arrêt supprimé avec succès",
      severity: "success",
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Management Des Arret
      </Typography>
      <Button
        component={Link}
        to="/arrets/create"
        variant="contained"
        sx={{ mb: 3 }}
      >
        Cree un nouveau arret
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Numéro d'escale</TableCell>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell>Durée (jour)</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Opération</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {arrets.map((arret) => (
              <ArretItem
                key={arret.ID_arret}
                arret={arret}
                onDelete={handleDeleteSuccess}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notification Snackbar */}
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
    </Box>
  );
};

export default ArretList;
