import axios from 'axios';

const API_URL = 'http://localhost:8080/api/arret';

class ArretService {
    getAllArrets() {
        return axios.get(API_URL);
    }

    getArretById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createArret(arret) {
        return axios.post(API_URL, arret);
    }

    updateArret(id, arret) {
        return axios.put(`${API_URL}/${id}`, arret);
    }

    deleteArret(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

const arretServiceInstance = new ArretService();

export default arretServiceInstance;