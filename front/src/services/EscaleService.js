import axiosInstance from "./AxiosConfig";

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
      console.log(
        "Sending escale object to server:",
        JSON.stringify(escale, null, 2)
      );
      // Prioritize getting matricule from the navire object as it's the source of truth
      const matricule =
        escale.navire?.matriculeNavire || escale.matriculeNavire;
      if (!matricule) {
        throw new Error("Matricule navire is required but was not provided");
      }
      const formattedEscale = {
        NOM_navire: escale.NOM_navire,
        DATE_accostage: escale.DATE_accostage,
        DATE_sortie: escale.DATE_sortie,
        matriculeNavire: matricule,
      };

      console.log(
        "Formatted escale data:",
        JSON.stringify(formattedEscale, null, 2)
      );

      // Enhanced debugging for request
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      };

      try {
        const response = await axiosInstance.post(
          ENDPOINT,
          formattedEscale,
          config
        );
        console.log("Success response:", response);
        return response;
      } catch (axiosError) {
        console.error("Error in createEscale:", axiosError);

        if (axiosError.response) {
          console.error("Error response data:", axiosError.response.data);
          console.error("Error status:", axiosError.response.status);
          console.error("Error headers:", axiosError.response.headers);
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
        } else {
          console.error("Error message:", axiosError.message);
        }

        throw axiosError;
      }
    } catch (error) {
      console.error("Unhandled error in createEscale:", error);
      throw error;
    }
  }

  async updateEscale(id, escale) {
    try {
      console.log("Updating escale object on server:", escale);
      // Prioritize getting matricule from the navire object as it's the source of truth
      const matricule =
        escale.navire?.matriculeNavire || escale.matriculeNavire;
      if (!matricule) {
        throw new Error("Matricule navire is required but was not provided");
      }
      // Format escale data consistently with createEscale
      const formattedEscale = {
        NOM_navire: escale.NOM_navire,
        DATE_accostage: escale.DATE_accostage,
        DATE_sortie: escale.DATE_sortie,
        matriculeNavire: matricule,
      };

      console.log(
        "Formatted update data:",
        JSON.stringify(formattedEscale, null, 2)
      );
      const response = await axiosInstance.put(
        `${ENDPOINT}/${id}`,
        formattedEscale
      );
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
  } // Alternative method using raw fetch API instead of Axios
  async createEscaleDirectFetch(escale) {
    try {
      console.log("Trying direct fetch API...");
      console.log("Original data:", JSON.stringify(escale));
      // Let's simplify the structure based on debug logs showing navire as a string
      const formattedEscale = {
        NOM_navire: escale.NOM_navire,
        DATE_accostage: escale.DATE_accostage,
        DATE_sortie: escale.DATE_sortie,
        // From the log, it seems Spring expects MATRICULE_navire as the FK reference
        matriculeNavire:
          escale.matriculeNavire || escale.navire?.matriculeNavire,
      };

      console.log(
        "Formatted data for backend:",
        JSON.stringify(formattedEscale, null, 2)
      ); // Add additional debugging output
      console.log("Server URL:", "http://localhost:8080/api/escales");
      console.log(
        "Authorization:",
        `Bearer ${
          localStorage.getItem("token")
            ? "***token-exists*** "
            : "***no-token***"
        }`
      );
      console.log("Sending JSON payload:", JSON.stringify(formattedEscale));

      const response = await fetch("http://localhost:8080/api/escales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(formattedEscale),
      });

      if (!response.ok) {
        console.error("Direct fetch error status:", response.status);
        let errorText = "";
        try {
          errorText = await response.text();
          console.error("Direct fetch error body:", errorText);

          // Try to pretty format the error message if it's JSON
          if (errorText && errorText.startsWith("{")) {
            const errorObj = JSON.parse(errorText);
            console.error("Parsed error:", errorObj);
          }
        } catch (e) {
          console.error("Failed to parse error response");
        }

        return {
          success: false,
          message: `Error ${response.status}: ${
            errorText || "No error details provided"
          }`,
          status: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Direct fetch error:", error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }
}

// Create an instance and export it (to avoid the import/no-anonymous-default-export warning)
const escaleServiceInstance = new EscaleService();
export default escaleServiceInstance;
