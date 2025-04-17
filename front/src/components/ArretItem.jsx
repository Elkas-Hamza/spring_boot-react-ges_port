import React from 'react';
import { TableRow, TableCell, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArretService from '../services/ArretService';

const ArretItem = ({ arret, onDelete }) => {
    const arretId = arret.id_arret || arret.ID_arret || arret.id || arret.num_escale;

    const handleDelete = async () => {
        try {
            await ArretService.deleteArret(arretId);
            onDelete(arretId); 
        } catch (error) {
            console.error('Error deleting arret:', error);
        }
    };

    return (
        <TableRow>
            <TableCell>{arret.id_arret}</TableCell>
            <TableCell>{arret.num_escale}</TableCell>
            <TableCell>{new Date(arret.DATE_DEBUT_arret).toLocaleString()}</TableCell>
            <TableCell>{new Date(arret.DATE_FIN_arret).toLocaleString()}</TableCell>
            <TableCell>{arret.dure_arret}</TableCell>
            <TableCell>{arret.motif_arret}</TableCell>
            <TableCell>
                <Button
                    component={Link}
                    to={`/edit/${arretId}`}
                    color="primary"
                    sx={{ mr: 1 }}
                >
                    Modifier
                </Button>
                <Button 
                    color="error" 
                    onClick={handleDelete}
                >
                    Supprimer
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default ArretItem;