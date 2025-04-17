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
import ArretService from '../services/ArretService';
import ArretItem from './ArretItem';

const ArretList = () => {
    const [arrets, setArrets] = useState([]);

    useEffect(() => {
        fetchArrets();
    }, []);

    const fetchArrets = async () => {
        try {
            const response = await ArretService.getAllArrets();
            setArrets(response.data);
        } catch (error) {
            console.error('Error fetching arrets:', error);
        }
    };

    const handleDeleteSuccess = (deletedId) => {
        setArrets(prevArrets => prevArrets.filter(arret => arret.id_arret !== deletedId && arret.ID_arret !== deletedId));
    };

    return (
        <>
            <Typography variant="h4" gutterBottom>
            Management Des Arret
            </Typography>
            <Button
                component={Link}
                to="/create"
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
                            <TableCell>Durée</TableCell>
                            <TableCell>Motif</TableCell>
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
            </>
    );
};

export default ArretList;