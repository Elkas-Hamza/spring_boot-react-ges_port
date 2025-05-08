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
            console.log("Calling getAllNavires API endpoint...");
            const response = await axiosInstance.get('/navires');
            
            // Fix for response returning as a string instead of parsed JSON
            if (typeof response.data === 'string') {
                try {
                    console.log("Response is a string, attempting to parse as JSON");
                    const parsedData = JSON.parse(response.data);
                    if (Array.isArray(parsedData)) {
                        console.log(`Successfully parsed string to array with ${parsedData.length} items`);
                        return {
                            success: true,
                            data: parsedData
                        };
                    }
                } catch (parseError) {
                    console.error("Failed to parse response string as JSON:", parseError);
                }
            }
            
            // If response.data is already an array, just return it
            if (Array.isArray(response.data)) {
                console.log(`Response is an array with ${response.data.length} items`);
                return {
                    success: true,
                    data: response.data
                };
            }
            
            // Handle different response scenarios
            if (!response || !response.data) {
                console.error("Empty response received");
                return {
                    success: false,
                    message: "Aucune donnée reçue du serveur",
                    data: []
                };
            }
            
            let naviresData = response.data;
            
            // Case 1: Response is already an array (ideal)
            if (Array.isArray(naviresData)) {
                console.log(`Response is an array with ${naviresData.length} items`);
                return {
                    success: true,
                    data: naviresData
                };
            }
            
            // Case 2: Response is a plain object but contains a data or content field that is an array
            if (naviresData.data && Array.isArray(naviresData.data)) {
                console.log(`Response has a nested data array with ${naviresData.data.length} items`);
                return {
                    success: true,
                    data: naviresData.data
                };
            }
            
            if (naviresData.content && Array.isArray(naviresData.content)) {
                console.log(`Response has a nested content array with ${naviresData.content.length} items`);
                return {
                    success: true,
                    data: naviresData.content
                };
            }
            
            // Case 3: Response is a single navire object (has idNavire property)
            if (naviresData.idNavire) {
                console.log("Response is a single navire object, converting to array");
                return {
                    success: true,
                    data: [naviresData]
                };
            }
            
            // Case 4: Response is a wrapper object with embedded _embedded.navireList
            if (naviresData._embedded && naviresData._embedded.navireList) {
                console.log(`Response has _embedded.navireList with ${naviresData._embedded.navireList.length} items`);
                return {
                    success: true,
                    data: naviresData._embedded.navireList
                };
            }
            
            // Case 5: Response is something else (strange object that we don't expect)
            console.warn("Unexpected response structure:", naviresData);
            
            // Try to extract any array we can find
            const anyArrayProperty = Object.values(naviresData).find(val => Array.isArray(val));
            if (anyArrayProperty) {
                console.log(`Found an array property in the response with ${anyArrayProperty.length} items`);
                return {
                    success: true,
                    data: anyArrayProperty
                };
            }
            
            // If it's an object but not recognized as a navire array
            if (typeof naviresData === 'object') {
                // Check if the object has numeric keys (common for JSON arrays converted to objects)
                const keys = Object.keys(naviresData);
                if (keys.every(key => !isNaN(Number(key)))) {
                    console.log("Response appears to be an array-like object with numeric keys, converting to array");
                    return {
                        success: true,
                        data: Object.values(naviresData)
                    };
                }
                
                // Last resort - check if this might be a navire object itself
                if (naviresData.nomNavire || naviresData.matriculeNavire) {
                    console.log("Response might be a single navire, converting to array");
                    return {
                        success: true,
                        data: [naviresData]
                    };
                }
            }
            
            // If nothing worked, return empty array
            console.error("Could not parse response as navires:", naviresData);
            return {
                success: false,
                message: "Format de réponse non reconnu",
                data: []
            };
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
    },

    getNavireDebugInfo: async () => {
        try {
            console.log("Calling debug endpoint for navires...");
            const response = await axiosInstance.get('/navires/debug');
            console.log("Debug response:", response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error("Error fetching debug info:", error);
            return handleError(error);
        }
    },

    getBasicNavireInfo: async () => {
        try {
            console.log("Fetching basic navire info...");
            const response = await axiosInstance.get('/navires/basic');
            console.log("Basic navire response:", response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return handleError(error);
        }
    },

    getNaviresWithAccurateCounts: async () => {
        try {
            console.log("Fetching navires with accurate container counts...");
            const response = await axiosInstance.get('/navires/withCounts');
            console.log("Navires with counts response:", response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error("Error fetching navires with counts:", error);
            return handleError(error);
        }
    },

    getNavireWithContainers: async (id) => {
        try {
            console.log(`Fetching navire ${id} with containers...`);
            
            // Try the detailed endpoint first
            try {
                const detailsResponse = await axiosInstance.get(`/navires/${id}/details`);
                console.log("Detailed navire response:", detailsResponse.data);
                
                if (detailsResponse.data) {
                    return {
                        success: true,
                        data: detailsResponse.data
                    };
                }
            } catch (detailsError) {
                console.error("Error fetching detailed navire data:", detailsError);
                // Continue with fallback approach
            }
            
            // Fallback: First try to get the ship details
            const shipResponse = await axiosInstance.get(`/navires/${id}`);
            if (!shipResponse.data) {
                throw new Error("No ship data received");
            }
            
            // Then get the containers for this ship
            const containersResponse = await axiosInstance.get(`/conteneurs/ship/${id}`);
            
            // Combine the data
            const shipWithContainers = {
                ...shipResponse.data,
                containers: containersResponse.data || []
            };
            
            console.log("Combined ship with containers:", shipWithContainers);
            
            return {
                success: true,
                data: shipWithContainers
            };
        } catch (error) {
            console.error(`Error fetching navire ${id} with containers:`, error);
            return handleError(error);
        }
    },

    getNavireContainers: async (id) => {
        try {
            console.log(`Fetching containers for navire ${id}...`);
            const response = await axiosInstance.get(`/navires/${id}/containers`);
            console.log(`Received ${response.data.length} containers for navire ${id}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error fetching containers for navire ${id}:`, error);
            return handleError(error);
        }
    }
}; 