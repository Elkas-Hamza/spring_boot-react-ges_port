import axios from 'axios';

const API_URL = 'http://localhost:8080/api/escale';

class EscaleService {
    getAllEscales() {
        return axios.get(API_URL);
    }

    getEscaleById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createEscale(escale) {
        return axios.post(API_URL, escale);
    }

    updateEscale(id, escale) {
        return axios.put(`${API_URL}/${id}`, escale);
    }

    deleteEscale(id) {
        console.log(`Attempting to delete escale with ID: ${id}`);
        return axios.delete(`${API_URL}/${id}`)
            .catch(error => {
                console.error('Delete escale error details:', error.response?.data);
                throw error;
            });
    }
}

const escaleServiceInstance = new EscaleService();

export default escaleServiceInstance;