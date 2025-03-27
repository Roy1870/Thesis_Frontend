import axios from "axios";

// Base API URL
const API_BASE_URL = "http://localhost:8000/api";

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authorization token not found");
  }
  return token;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Farmer API endpoints
export const farmerAPI = {
  // Get all farmers with pagination and search
  getAllFarmers: async (page = 1, perPage = 10, search = "") => {
    const params = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await apiClient.get(`/farmers?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch farmers: ${error.message}`);
    }
  },

  // Get a single farmer by ID
  getFarmerById: async (farmerId) => {
    try {
      const response = await apiClient.get(`/farmers/${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch farmer details: ${error.message}`);
    }
  },

  // Create a new farmer
  createFarmer: async (farmerData) => {
    try {
      const response = await apiClient.post("/farmers", farmerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create farmer: ${error.message}`);
    }
  },

  // Update a farmer
  updateFarmer: async (farmerId, farmerData) => {
    try {
      const response = await apiClient.put(`/farmers/${farmerId}`, farmerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update farmer: ${error.message}`);
    }
  },

  // Delete a farmer
  deleteFarmer: async (farmerId) => {
    try {
      const response = await apiClient.delete(`/farmers/${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete farmer: ${error.message}`);
    }
  },

  // Add crops to a farmer
  addCrops: async (farmerId, cropsData) => {
    try {
      const response = await apiClient.post(
        `/farmers/${farmerId}/crops`,
        cropsData
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add crops: ${error.message}`);
    }
  },

  // Add rice data to a farmer
  addRice: async (farmerId, riceData) => {
    try {
      const response = await apiClient.post(
        `/farmers/${farmerId}/rice`,
        riceData
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add rice data: ${error.message}`);
    }
  },

  // Delete a crop
  deleteCrop: async (cropId) => {
    try {
      const response = await apiClient.delete(`/crops/${cropId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete crop: ${error.message}`);
    }
  },

  // Delete rice data
  deleteRice: async (riceId) => {
    try {
      const response = await apiClient.delete(`/rice/${riceId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete rice data: ${error.message}`);
    }
  },
};

// Livestock API endpoints
export const livestockAPI = {
  // Create livestock records
  createLivestockRecords: async (data) => {
    try {
      const response = await apiClient.post("/livestock-records", data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create livestock records: ${error.message}`);
    }
  },

  // Update a livestock record
  updateLivestockRecord: async (recordId, data) => {
    try {
      const response = await apiClient.put(
        `/livestock-records/${recordId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update livestock record: ${error.message}`);
    }
  },

  // Delete a livestock record
  deleteLivestockRecord: async (recordId) => {
    try {
      const response = await apiClient.delete(`/livestock-records/${recordId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete livestock record: ${error.message}`);
    }
  },
};

// Export a default object with all APIs
export default {
  farmer: farmerAPI,
  livestock: livestockAPI,
};
