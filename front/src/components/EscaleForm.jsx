import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import EscaleService from '../services/EscaleService';

const EscaleForm = () => {
    const [escale, setEscale] = useState({
        NUM_escale: '',
        NOM_navire: '',
        DATE_accostage: '',
        DATE_sortie: ''
    });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            EscaleService.getEscaleById(id)
                .then(response => {
                    const escaleData = response.data;
                    console.log('Fetched escale data:', escaleData); 
                    
                    const formattedData = {
                        NUM_escale: escaleData.NUM_escale || escaleData.num_escale || '',
                        NOM_navire: escaleData.NOM_navire || escaleData.nom_navire || '',
                        DATE_accostage: formatDateForInput(escaleData.DATE_accostage || escaleData.date_accostage),
                        DATE_sortie: formatDateForInput(escaleData.DATE_sortie || escaleData.date_sortie)
                    };
                    
                    setEscale(formattedData);
                })
                .catch(error => {
                    console.error('Error fetching escale:', error);
                });
        }
    }, [id]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEscale(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!escale.NUM_escale || !escale.NOM_navire || !escale.DATE_accostage || !escale.DATE_sortie) {
            console.error('All fields are required');
            return;
        }

        const dateAccostage = new Date(escale.DATE_accostage);
        const dateSortie = new Date(escale.DATE_sortie);

        const formattedData = {
            num_escale: parseInt(escale.NUM_escale),
            DATE_accostage: dateAccostage.toISOString().replace('T', ' ').slice(0, 19),
            DATE_sortie: dateSortie.toISOString().replace('T', ' ').slice(0, 19),
            nom_navire: escale.NOM_navire,
            date_sortie: dateSortie.toISOString().slice(0, 19),
            date_accostage: dateAccostage.toISOString().slice(0, 19)
        };

        try {
            if (id) {
                await EscaleService.updateEscale(id, formattedData);
            } else {
                await EscaleService.createEscale(formattedData);
            }
            navigate('/escales');
        } catch (error) {
            console.error('Error saving escale:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                {id ? 'Modifier Escale' : 'Créer Escale'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Numéro d'escale"
                    name="NUM_escale"
                    type="number"
                    value={escale.NUM_escale}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{
                        readOnly: !!id, 
                    }}
                />
                <TextField
                    label="Nom du navire"
                    name="NOM_navire"
                    value={escale.NOM_navire}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Date d'accostage"
                    name="DATE_accostage"
                    type="datetime-local"
                    value={escale.DATE_accostage}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField
                    label="Date de sortie"
                    name="DATE_sortie"
                    type="datetime-local"
                    value={escale.DATE_sortie}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Sauvegarder
                </Button>
                <Button 
                    component={Link} 
                    to="/escales" 
                    sx={{ marginLeft: 2, mt: 2 }}
                >
                    Annuler
                </Button>
            </form>
        </Container>
    );
};

export default EscaleForm;