import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Add, Search, Edit, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NavireService } from '../../services/NavireService';

const NavireList = () => {
    const [navires, setNavires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [navireToDelete, setNavireToDelete] = useState(null);
    const [notification, setNotification] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    useEffect(() => {
        fetchNavires();
    }, []);

    const fetchNavires = async () => {
        try {
            setLoading(true);
            const response = await NavireService.getAllNavires();
            if (response.success) {
                setNavires(response.data);
                setError(null);
            } else {
                setError(response.message || "Erreur lors du chargement des navires");
            }
        } catch (error) {
            console.error("Error fetching navires:", error);
            setError("Erreur lors du chargement des navires");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (navire) => {
        setNavireToDelete(navire);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setNavireToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!navireToDelete) return;

        setLoading(true);
        try {
            const response = await NavireService.deleteNavire(navireToDelete.idNavire);
            
            if (response.success) {
                setNotification({
                    open: true,
                    message: "Navire supprimé avec succès",
                    severity: "success",
                });
                fetchNavires();
            } else {
                setNotification({
                    open: true,
                    message: response.message || "Erreur lors de la suppression du navire",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Error deleting navire:", error);
            setNotification({
                open: true,
                message: "Erreur lors de la suppression du navire",
                severity: "error",
            });
        } finally {
            setLoading(false);
            handleCloseDeleteDialog();
        }
    };

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const filteredNavires = navires.filter(
        (navire) =>
            navire.nomNavire.toLowerCase().includes(searchText.toLowerCase()) ||
            navire.matriculeNavire.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h1">
                        Liste des Navires
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        component={Link}
                        to="/navires/create"
                    >
                        Ajouter
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Rechercher par nom ou immatriculation"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <Paper sx={{ width: "100%", overflow: "hidden" }}>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Nom du Navire</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Immatriculation</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Conteneurs</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNavires.length > 0 ? (
                                        filteredNavires.map((navire) => (
                                            <TableRow hover key={navire.idNavire}>
                                                <TableCell>{navire.idNavire}</TableCell>
                                                <TableCell>{navire.nomNavire}</TableCell>
                                                <TableCell>{navire.matriculeNavire}</TableCell>
                                                <TableCell>
                                                    {navire.idConteneure 
                                                        ? `${navire.idConteneure.split(',').filter(c => c.trim()).length} conteneur(s)` 
                                                        : "Aucun"}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        color="info"
                                                        size="small"
                                                        component={Link}
                                                        to={`/navires/details/${navire.idNavire}`}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Détails
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<Edit />}
                                                        component={Link}
                                                        to={`/navires/edit/${navire.idNavire}`}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Modifier
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        size="small"
                                                        startIcon={<Delete />}
                                                        onClick={() => handleDeleteClick(navire)}
                                                    >
                                                        Supprimer
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Aucun navire trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer le navire "
                        {navireToDelete?.nomNavire}" ? Cette action est
                        irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default NavireList; 