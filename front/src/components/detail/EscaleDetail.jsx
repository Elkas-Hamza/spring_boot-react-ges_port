import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import EscaleService from '../../services/EscaleService';
import ArretService from '../../services/ArretService';

const EscaleDetail = () => {
    const { id } = useParams();
    const [escale, setEscale] = useState(null);
    const [arrets, setArrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const escaleResponse = await EscaleService.getEscaleById(id);
                setEscale(escaleResponse.data);

                const arretsResponse = await ArretService.getArretsByEscaleId(id);
                setArrets(arretsResponse.data);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <Container>Loading...</Container>;
    if (error) return <Container>{error}</Container>;

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Escale Details
            </Typography>

            {escale && (
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6">Escale Information</Typography>
                    <Typography>Numéro d'escale: {escale.num_escale || escale.NUM_escale}</Typography>
                    <Typography>Nom du navire: {escale.nom_navire || escale.NOM_navire}</Typography>
                    <Typography>
                        Date d'accostage: {new Date(escale.date_accostage || escale.DATE_accostage).toLocaleString()}
                    </Typography>
                    <Typography>
                        Date de sortie: {new Date(escale.date_sortie || escale.DATE_sortie).toLocaleString()}
                    </Typography>
                </Paper>
            )}

            <Typography variant="h5" gutterBottom>
                Arrets
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Durée</TableCell>
                            <TableCell>Date Début</TableCell>
                            <TableCell>Date Fin</TableCell>
                            <TableCell>Motif</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {arrets.map((arret) => (
                            <TableRow key={arret.id_arret}>
                                <TableCell>{arret.dure_arret} jours</TableCell>
                                <TableCell>{new Date(arret.date_DEBUT_arret).toLocaleString()}</TableCell>
                                <TableCell>{new Date(arret.date_FIN_arret).toLocaleString()}</TableCell>
                                <TableCell>{arret.motif_arret}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                component="a"
                href={`/arret/create/${id}`}
            >
                Ajouter un Arrêt
            </Button>
        </Container>
    );
};

export default EscaleDetail;