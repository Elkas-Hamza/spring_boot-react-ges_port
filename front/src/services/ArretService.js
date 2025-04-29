import axios from "axios";

// Create an axios instance with CORS credentials support
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/arrets",
  withCredentials: true,
});

// Add request/response interceptors for debugging
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
    return Promise.reject(error);
  }
);

class ArretService {
  getAllArrets() {
    return axiosInstance.get("");
  }

  getArretById(id) {
    return axiosInstance.get(`/${id}`);
  }

  createArret(arret) {
    return axiosInstance.post("", arret);
  }

  updateArret(id, arret) {
    return axiosInstance.put(`/${id}`, arret);
  }

  deleteArret(id) {
    return axiosInstance.delete(`/${id}`);
  }
}

export default new ArretService();
