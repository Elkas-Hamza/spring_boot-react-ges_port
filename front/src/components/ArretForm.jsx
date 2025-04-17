import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ArretService from '../services/ArretService';
import EscaleService from '../services/EscaleService';

const ArretForm = () => {
    const [arret, setArret] = useState({
        num_escale: '',
        dure_arret: '',
        date_DEBUT_arret: '',
        date_FIN_arret: '',
        motif_arret: ''
    });
    const [escales, setEscales] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all available escale numbers
        EscaleService.getAllEscales()
            .then(response => {
                setEscales(response.data);
            })
            .catch(error => {
                console.error('Error fetching escales:', error);
            });

        if (id) {
            // Fetch arret data if editing
            ArretService.getArretById(id)
                .then(response => {
                    // Map backend fields to frontend state
                    setArret({
                        num_escale: response.data.num_escale,
                        dure_arret: response.data.dure_arret,
                        date_DEBUT_arret: response.data.date_DEBUT_arret,
                        date_FIN_arret: response.data.date_FIN_arret,
                        motif_arret: response.data.motif_arret
                    });
                })
                .catch(error => {
                    console.error('Error fetching arret:', error);
                });
        }
    }, [id]);

    // Calculate duration in days (as per your backend)
    useEffect(() => {
        if (arret.date_DEBUT_arret && arret.date_FIN_arret) {
            const startDate = new Date(arret.date_DEBUT_arret);
            const endDate = new Date(arret.date_FIN_arret);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setArret(prev => ({ ...prev, dure_arret: diffDays }));
        }
    }, [arret.date_DEBUT_arret, arret.date_FIN_arret]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setArret(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!arret.num_escale || !arret.date_DEBUT_arret || !arret.date_FIN_arret || !arret.motif_arret) {
            console.error('All fields are required');
            return;
        }

        const formattedData = {
            num_escale: parseInt(arret.num_escale),
            date_DEBUT_arret: arret.date_DEBUT_arret,
            date_FIN_arret: arret.date_FIN_arret,
            dure_arret: parseInt(arret.dure_arret),
            motif_arret: arret.motif_arret
        };

        if (formattedData.dure_arret <= 0) {
            formattedData.dure_arret = 1;
        }

        console.log('Original arret data:', arret);
        console.log('Formatted data being sent to backend:', formattedData);

        try {
            if (id !== undefined) {
                const response = await ArretService.updateArret(id, formattedData);
                console.log('Update response:', response);

            } else {
                const response = await ArretService.createArret(formattedData);
                console.log('Create response:', response);

            }
            navigate('/');
        } catch (error) {
            console.error('Error saving arret:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            return;
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Arret' : 'Create Arret'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="escale-select-label">Numéro d'escale</InputLabel>
                    <Select
                        labelId="escale-select-label"
                        name="num_escale"
                        value={arret.num_escale || ''}
                        onChange={handleChange}
                        label="Numéro d'escale"
                    >
                        {escales.map((escale) => (
                            <MenuItem key={escale.num_escale || escale.NUM_escale}
                                      value={escale.num_escale || escale.NUM_escale}>
                                {escale.num_escale || escale.NUM_escale}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Date Début"
                    name="date_DEBUT_arret"
                    type="datetime-local"
                    value={arret.date_DEBUT_arret}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField
                    label="Date Fin"
                    name="date_FIN_arret"
                    type="datetime-local"
                    value={arret.date_FIN_arret}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                <TextField
                    label="Durée (jours)"
                    name="dure_arret"
                    type="number"
                    value={arret.dure_arret}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                />
                <TextField
                    label="Motif d'arrêt"
                    name="motif_arret"
                    value={arret.motif_arret}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary">
                    sauvegarder
                </Button>
                <Button component={Link} to="/" sx={{ marginLeft: 2 }}>
                    annuler
                </Button>
            </form>
        </Container>
    );
};

export default ArretForm;