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
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Add as AddIcon } from "@mui/icons-material";
import ShiftService from "../../services/ShiftService";
import ErrorHandler from "../common/ErrorHandler";

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await ShiftService.getAllShifts();
      setShifts(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError("Failed to load shifts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await ShiftService.deleteShift(id);
        setShifts(shifts.filter((shift) => shift.id_shift !== id));
      } catch (error) {
        console.error("Error deleting shift:", error);
        alert("Error deleting shift. Please try again.");
      }
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5); // Format as HH:MM
  };

  const filteredShifts = shifts.filter((shift) =>
    (shift.id_shift?.toString().toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (shift.nom_shift?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Gestion des shifts
        </Typography>
        <Button
          component={Link}
          to="/shifts/create"
          variant="contained"
          sx={{ mb: 3 }}
          startIcon={<AddIcon />}
        >
          Ajouter
        </Button>
      </Box>

      <TextField
        label="Rechercher par ID ou nom du shift"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <ErrorHandler 
          message={error} 
          onRetry={fetchShifts} 
        />
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Date debut</TableCell>
              <TableCell>Date fin</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && !error && filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id_shift}>
                  <TableCell>{shift.id_shift}</TableCell>
                  <TableCell>{shift.nom_shift || "Non spécifié"}</TableCell>
                  <TableCell>{formatTime(shift.heure_debut)}</TableCell>
                  <TableCell>{formatTime(shift.heure_fin)}</TableCell>
                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/shifts/edit/${shift.id_shift}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      modifier
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(shift.id_shift)}
                    >
                      supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : !loading && !error && filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    Aucun shift trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ShiftList;
