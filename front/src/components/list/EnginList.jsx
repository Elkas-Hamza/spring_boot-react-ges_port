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
import EnginService from "../../services/EnginService";

const EnginList = () => {
  const [engins, setEngins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEngins();
  }, []);

  const fetchEngins = async () => {
    try {
      setLoading(true);
      const response = await EnginService.getAllEngins();
      setEngins(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching engins:", error);
      setError("Failed to load equipment. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await EnginService.deleteEngin(id);
        setEngins(engins.filter((engin) => engin.id_engin !== id));
      } catch (error) {
        console.error("Error deleting engin:", error);
        alert("Error deleting equipment. Please try again.");
      }
    }
  };

  const filteredEngins = engins.filter((engin) =>
    engin.nom_engin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (engin.type_engin && engin.type_engin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <Typography align="center">Loading...</Typography>;
  if (error)
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Equipment Management
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          component={Link}
          to="/engins/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Equipment
        </Button>

        <TextField
          variant="outlined"
          placeholder="Search equipment..."
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
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEngins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEngins.map((engin) => (
                <TableRow key={engin.id_engin}>
                  <TableCell>{engin.id_engin}</TableCell>
                  <TableCell>{engin.nom_engin}</TableCell>
                  <TableCell>{engin.type_engin || "Non spécifié"}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/engins/edit/${engin.id_engin}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(engin.id_engin)}
                    >
                      supprimer
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

export default EnginList;
