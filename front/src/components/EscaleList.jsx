import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import EscaleService from '../services/EscaleService';
import EscaleItem from './EscaleItem';

const EscaleList = () => {
    const [escales, setEscales] = useState([]);

    useEffect(() => {
        fetchEscales();
    }, []);

    const fetchEscales = async () => {
        try {
            const response = await EscaleService.getAllEscales();
            setEscales(response.data);
        } catch (error) {
            console.error('Error fetching escales:', error);
        }
    };

    const handleDeleteSuccess = (deletedId) => {
        setEscales(prevEscales => prevEscales.filter(escale => escale.NUM_escale !== deletedId));
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Management Des Escales
            </Typography>
            <Button
                component={Link}
                to="/escale/create"
                variant="contained"
                sx={{ mb: 3 }}
            >
                Créer une nouvelle escale
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Numéro d'escale</TableCell>
                            <TableCell>Nom du navire</TableCell>
                            <TableCell>Date d'accostage</TableCell>
                            <TableCell>Date de sortie</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {escales.map((escale) => (
                            <EscaleItem
                                key={escale.NUM_escale}
                                escale={escale}
                                onDelete={handleDeleteSuccess}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default EscaleList;