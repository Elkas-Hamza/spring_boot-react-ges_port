import axiosInstance from './AxiosConfig';

// Helper functions since they don't exist in ApiHelper
const handleResponse = (response) => {
  return {
    success: true,
    data: response.data
  };
};

const handleError = (error) => {
  console.error("API Error:", error.response || error);
  
  return {
    success: false,
    message: error.response?.data?.message || error.message || "Une erreur est survenue",
    status: error.response?.status || 500
  };
};

export const NavireService = {
    getAllNavires: async () => {
        try {
            const response = await axiosInstance.get('/navires');
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    getNavireById: async (id) => {
        try {
            const response = await axiosInstance.get(`/navires/${id}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    getNavireByMatricule: async (matricule) => {
        try {
            const response = await axiosInstance.get(`/navires/matricule/${matricule}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    getNavireByNom: async (nom) => {
        try {
            const response = await axiosInstance.get(`/navires/nom/${nom}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    createNavire: async (navireData) => {
        try {
            console.log("Creating navire with data:", navireData);
            const response = await axiosInstance.post('/navires', navireData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    updateNavire: async (id, navireData) => {
        try {
            console.log("Updating navire with ID:", id, "and data:", navireData);
            const response = await axiosInstance.put(`/navires/${id}`, navireData);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    deleteNavire: async (id) => {
        try {
            const response = await axiosInstance.delete(`/navires/${id}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }
}; 