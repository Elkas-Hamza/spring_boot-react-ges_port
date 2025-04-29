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
  InputAdornment,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShiftService from "../../services/ShiftService";

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await ShiftService.getAllShifts();
      setShifts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError("Failed to load shifts. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await ShiftService.deleteShift(id);
        setShifts(shifts.filter(shift => shift.id_shift !== id));
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

  const filteredShifts = shifts.filter(shift =>
    shift.id_shift.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Typography align="center">Loading...</Typography>;
  if (error) return <Typography color="error" align="center">{error}</Typography>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Shift Management
      </Typography>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          component={Link}
          to="/shifts/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Shift
        </Button>
        
        <TextField
          variant="outlined"
          placeholder="Search shift by ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No shifts found
                </TableCell>
              </TableRow>
            ) : (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id_shift}>
                  <TableCell>{shift.id_shift}</TableCell>
                  <TableCell>{formatTime(shift.heure_debut)}</TableCell>
                  <TableCell>{formatTime(shift.heure_fin)}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/shifts/edit/${shift.id_shift}`}
                      color="primary"
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(shift.id_shift)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ShiftList; 