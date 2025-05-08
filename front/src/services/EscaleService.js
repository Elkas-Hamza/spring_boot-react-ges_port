import axiosInstance from './AxiosConfig';

const ENDPOINT = "/escales";

class EscaleService {
  getAllEscales() {
    return axiosInstance.get(ENDPOINT);
  }

  getEscaleById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  async createEscale(escale) {
    try {
      console.log("Sending escale object to server:", JSON.stringify(escale, null, 2));
      
      // Ensure we're sending application/json content type
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axiosInstance.post(ENDPOINT, escale, config);
      return response;
    } catch (error) {
      console.error("Error in createEscale:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.statusText);
      
      // If we have validation errors in the response, log them
      if (error.response?.data) {
        try {
          const responseData = error.response.data;
          console.error("Response data details:", responseData);
          
          if (typeof responseData === 'string' && responseData.includes('Validation failed')) {
            console.error("Validation errors detected in response");
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
      }
      
      throw error;
    }
  }

  async updateEscale(id, escale) {
    try {
      console.log("Updating escale object on server:", escale);
      const response = await axiosInstance.put(`${ENDPOINT}/${id}`, escale);
      return response;
    } catch (error) {
      console.error("Error in updateEscale:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  }

  deleteEscale(id) {
    console.log(`Attempting to delete escale with ID: ${id}`);
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }

  // Alternative method using raw fetch API instead of Axios
  async createEscaleDirectFetch(escale) {
    try {
      console.log("Trying direct fetch API...");
      console.log("Sending data:", JSON.stringify(escale));
      
      const response = await fetch('http://localhost:8080/api/escales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(escale)
      });
      
      if (!response.ok) {
        console.error("Direct fetch error status:", response.status);
        const text = await response.text();
        console.error("Direct fetch error body:", text);
        return { success: false, message: `Error ${response.status}: ${text}` };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Direct fetch error:", error);
      return { success: false, message: error.message };
    }
  }
}

export default new EscaleService();
