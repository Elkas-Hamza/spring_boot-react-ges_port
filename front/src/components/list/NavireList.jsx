import React, { useState, useEffect } from 'react';
import {
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
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NavireService } from '../../services/NavireService';
import ErrorHandler from "../common/ErrorHandler";
import axiosInstance from '../../services/AxiosConfig';

const NavireList = () => {
    const [navires, setNavires] = useState([]);
    const [filteredNavires, setFilteredNavires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [navireToDelete, setNavireToDelete] = useState(null);
    const [notification, setNotification] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    useEffect(() => {
        // First try to get debug info to understand what's available
        const checkDebugInfo = async () => {
            try {
                const debugResponse = await NavireService.getNavireDebugInfo();
                console.log("Debug info received:", debugResponse.data);
                if (debugResponse.success && debugResponse.data.navires) {
                    console.log(`Debug info shows ${debugResponse.data.count} navires available in the database`);
                }
            } catch (err) {
                console.error("Failed to get debug info:", err);
            }
            
            // First try to get accurate container counts
            try {
                console.log("Trying to get accurate container counts...");
                const accurateResponse = await NavireService.getNaviresWithAccurateCounts();
                if (accurateResponse.success && Array.isArray(accurateResponse.data)) {
                    console.log(`Got ${accurateResponse.data.length} ships with accurate container counts`);
                    setNavires(accurateResponse.data);
                    setFilteredNavires(accurateResponse.data);
                    setError(null);
                    setLoading(false);
                    return; // Exit early if we got accurate data
                }
            } catch (err) {
                console.error("Failed to get accurate container counts:", err);
            }
            
            // Then fetch the actual ships as fallback
        fetchNavires();
        };
        
        checkDebugInfo();
    }, []);

    useEffect(() => {
        if (!Array.isArray(navires)) {
            // If navires is not an array, set filteredNavires to empty array
            setFilteredNavires([]);
            return;
        }
        
        if (searchQuery) {
            const filtered = navires.filter((navire) =>
                `${navire.idNavire || ''} ${navire.nomNavire || ''} ${navire.matriculeNavire || ''}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredNavires(filtered);
        } else {
            setFilteredNavires(navires);
        }
    }, [searchQuery, navires]);

    const fetchNavires = async () => {
        try {
            setLoading(true);
            console.log("Fetching navires...");
            const response = await NavireService.getAllNavires();
            console.log("Navires API response:", response);
            
            if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                console.log(`Loaded ${response.data.length} navires successfully`);
                
                // Debug the container data
                response.data.forEach(navire => {
                    console.log(`Ship ${navire.idNavire} (${navire.nomNavire}):`, {
                        containersArray: navire.conteneurs,
                        isContainersArray: Array.isArray(navire.conteneurs),
                        containerCount: navire.conteneurs ? navire.conteneurs.length : 0,
                        containerCountField: navire.containerCount
                    });
                });
                
                setNavires(response.data);
                setFilteredNavires(response.data);
                setError(null);
            } else if (response.success && response.data && typeof response.data === 'object') {
                // Handle potential single object response instead of array
                console.error("Response is not an array, attempting to convert:", response.data);
                const dataArray = [response.data];
                setNavires(dataArray);
                setFilteredNavires(dataArray);
                setError(null);
            } else if (response.success) {
                // Handle if data is returned but not as an array
                console.error("Unexpected response format:", response.data);
                // Try the basic endpoint as fallback
                console.log("Trying basic navire endpoint as fallback...");
                const basicResponse = await NavireService.getBasicNavireInfo();
                
                if (basicResponse.success && Array.isArray(basicResponse.data)) {
                    console.log(`Loaded ${basicResponse.data.length} navires from basic endpoint`);
                    setNavires(basicResponse.data);
                    setFilteredNavires(basicResponse.data);
                    setError(null);
                } else {
                    setNavires([]);
                    setFilteredNavires([]);
                    setError("Format de réponse inattendu");
                }
            } else {
                console.error("API returned error:", response.message);
                // Try the basic endpoint as fallback
                console.log("Trying basic navire endpoint as fallback...");
                const basicResponse = await NavireService.getBasicNavireInfo();
                
                if (basicResponse.success && Array.isArray(basicResponse.data)) {
                    console.log(`Loaded ${basicResponse.data.length} navires from basic endpoint`);
                    setNavires(basicResponse.data);
                    setFilteredNavires(basicResponse.data);
                    setError(null);
                } else {
                    setNavires([]);
                    setFilteredNavires([]);
                    setError(response.message || "Erreur lors du chargement des navires");
                }
            }
        } catch (error) {
            console.error("Error fetching navires:", error);
            // Try the basic endpoint as a last resort
            try {
                console.log("Trying basic navire endpoint as last resort...");
                const basicResponse = await NavireService.getBasicNavireInfo();
                
                if (basicResponse.success && Array.isArray(basicResponse.data)) {
                    console.log(`Loaded ${basicResponse.data.length} navires from basic endpoint`);
                    setNavires(basicResponse.data);
                    setFilteredNavires(basicResponse.data);
                    setError(null);
                } else {
                    setNavires([]);
                    setFilteredNavires([]);
                    setError("Erreur lors du chargement des navires");
                }
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
                setNavires([]);
                setFilteredNavires([]);
                setError("Erreur lors du chargement des navires");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchNaviresDirect = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Directly fetching navires from API...");
            
            // Make direct API call without going through the service layer
            const response = await axiosInstance.get('/navires');
            console.log("Direct API response:", response);
            
            if (response.status === 200) {
                const data = response.data;
                if (Array.isArray(data)) {
                    console.log(`Direct API returned ${data.length} ships as array`);
                    setNavires(data);
                    setFilteredNavires(data);
                } else if (data && typeof data === 'object') {
                    console.log("Direct API returned an object, converting to array");
                    const shipArray = [data];
                    setNavires(shipArray);
                    setFilteredNavires(shipArray);
                } else {
                    console.error("Direct API returned unexpected data format:", data);
                    setError("Format de données non reconnu");
                    setNavires([]);
                    setFilteredNavires([]);
                }
            } else {
                console.error("Direct API call failed with status:", response.status);
                setError(`Erreur API: ${response.status}`);
                setNavires([]);
                setFilteredNavires([]);
            }
        } catch (error) {
            console.error("Error in direct API call:", error);
            setError("Erreur lors de l'appel direct à l'API");
            setNavires([]);
            setFilteredNavires([]);
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

    // Ensure filteredNavires is always an array before rendering
    const naviresList = Array.isArray(filteredNavires) ? filteredNavires : [];

    // Add a button to trigger the direct API call
    const handleTryDirectApi = () => {
        fetchNaviresDirect();
    };

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
                    Gestion des Navires
                </Typography>
                <Box>
                    <Tooltip title="Rafraîchir la liste">
                        <IconButton 
                            color="primary" 
                            onClick={fetchNavires}
                            sx={{ mr: 2 }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    {error && (
                        <Tooltip title="Essayer l'API directe">
                            <Button 
                                variant="outlined" 
                                color="warning" 
                                size="small"
                                onClick={handleTryDirectApi}
                                sx={{ mr: 2 }}
                            >
                                API Directe
                            </Button>
                        </Tooltip>
                    )}
                <Button
                    variant="contained"
                    sx={{ mb: 3 }}
                    startIcon={<AddIcon />}
                    onClick={() => {
                        console.log("Navigating to create navire - direct navigation");
                        localStorage.setItem('redirecting_to_create_navire', 'true');
                        window.location.href = "/navires/create";
                    }}
                >
                    Ajouter
                </Button>
                </Box>
            </Box>

            <TextField
                label="Rechercher par nom ou immatriculation"
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
                    onRetry={fetchNavires} 
                />
            )}

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nom du Navire</TableCell>
                            <TableCell>Immatriculation</TableCell>
                            <TableCell>Conteneurs</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!loading && !error && naviresList.length > 0 ? (
                            naviresList.map((navire) => (
                                <TableRow hover key={navire.idNavire}>
                                    <TableCell>{navire.idNavire}</TableCell>
                                    <TableCell>{navire.nomNavire}</TableCell>
                                    <TableCell>{navire.matriculeNavire}</TableCell>
                                    <TableCell>
                                        {navire.conteneurs && Array.isArray(navire.conteneurs) && navire.conteneurs.length > 0
                                            ? `${navire.conteneurs.length} conteneur(s)` 
                                            : navire.containerCount !== undefined && navire.containerCount > 0
                                                ? `${navire.containerCount} conteneur(s)`
                                                : navire.conteneurs 
                                                    ? "1 conteneur" 
                                            : "Aucun"}
                                    </TableCell>
                                    <TableCell align="center">
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
                                            component={Link}
                                            to={`/navires/edit/${navire.idNavire}`}
                                            sx={{ mr: 1 }}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteClick(navire)}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : !loading && !error && naviresList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary">
                                        Aucun navire trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </TableContainer>

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
                    <Button onClick={handleCloseDeleteDialog}>
                        Annuler
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
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
        </Box>
    );
};

export default NavireList; 