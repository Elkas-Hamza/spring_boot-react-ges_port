import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/equipes",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((request) => {
  console.log("Starting Request", request);
  return request;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.log("Response Error:", error.response);
    if (error.response && error.response.status === 404) {
      console.log("404 Not Found Error - Request URL:", error.config.url);
      console.log("404 Not Found Error - Request Method:", error.config.method);
      console.log(
        "404 Not Found Error - Request Headers:",
        error.config.headers
      );
    }
    return Promise.reject(error);
  }
);

class EquipeService {
  getAllEquipes() {
    return axiosInstance.get("");
  }

  getEquipeById(id) {
    return axiosInstance.get(`/${id}`);
  }

  searchEquipes(name) {
    return axiosInstance.get(`/search?name=${name}`);
  }

  getEquipesByPersonnel(personnelId) {
    return axiosInstance.get(`/personnel/${personnelId}`);
  }

  getEquipesBySoustraiteur(soustraiteurId) {
    return axiosInstance.get(`/soustraiteur/${soustraiteurId}`);
  }

  createEquipe(equipe) {
    return axiosInstance.post("", equipe);
  }

  updateEquipe(id, equipe) {
    return axiosInstance.put(`/${id}`, equipe);
  }

  deleteEquipe(id) {
    return axiosInstance.delete(`/${id}`);
  }

  addPersonnelToEquipe(equipeId, personnelId) {
    console.log(`Adding personnel ${personnelId} to equipe ${equipeId}`);

    return axios.post(
      `http://localhost:8080/api/equipes/${equipeId}/personnel`,
      {
        personnelId: personnelId,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  removePersonnelFromEquipe(equipeId, personnelId) {
    return axiosInstance.delete(`/${equipeId}/personnel/${personnelId}`);
  }

  addSoustraiteurToEquipe(equipeId, soustraiteurId) {
    console.log(`Adding sous-traiteur ${soustraiteurId} to equipe ${equipeId}`);

    // Use the direct API URL to ensure the path is correct
    return axios.post(
      `http://localhost:8080/api/equipes/${equipeId}/soustraiteur`,
      {
        soustraiteurId: soustraiteurId,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  removeSoustraiteurFromEquipe(equipeId, soustraiteurId) {
    return axiosInstance.delete(`/${equipeId}/soustraiteur/${soustraiteurId}`);
  }
}

export default new EquipeService();
