import axiosInstance from './AxiosConfig';

const ENDPOINT = "/equipes";

class EquipeService {
  getAllEquipes() {
    return axiosInstance.get(ENDPOINT);
  }

  getEquipeById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  searchEquipes(name) {
    return axiosInstance.get(`${ENDPOINT}/search?name=${name}`);
  }

  getEquipesByPersonnel(personnelId) {
    return axiosInstance.get(`${ENDPOINT}/personnel/${personnelId}`);
  }

  getEquipesBySoustraiteur(soustraiteurId) {
    return axiosInstance.get(`${ENDPOINT}/soustraiteur/${soustraiteurId}`);
  }

  createEquipe(equipe) {
    return axiosInstance.post(ENDPOINT, equipe);
  }

  updateEquipe(id, equipe) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, equipe);
  }

  deleteEquipe(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }

  addPersonnelToEquipe(equipeId, personnelId) {
    console.log(`Adding personnel ${personnelId} to equipe ${equipeId}`);
    return axiosInstance.post(`${ENDPOINT}/${equipeId}/personnel`, {
      personnelId: personnelId
    });
  }

  removePersonnelFromEquipe(equipeId, personnelId) {
    return axiosInstance.delete(`${ENDPOINT}/${equipeId}/personnel/${personnelId}`);
  }

  addSoustraiteurToEquipe(equipeId, soustraiteurId) {
    console.log(`Adding sous-traiteur ${soustraiteurId} to equipe ${equipeId}`);
    return axiosInstance.post(`${ENDPOINT}/${equipeId}/soustraiteur`, {
      soustraiteurId: soustraiteurId
    });
  }

  removeSoustraiteurFromEquipe(equipeId, soustraiteurId) {
    return axiosInstance.delete(`${ENDPOINT}/${equipeId}/soustraiteur/${soustraiteurId}`);
  }
}

export default new EquipeService();
