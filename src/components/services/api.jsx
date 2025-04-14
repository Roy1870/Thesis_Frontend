"use client";
import axios from "axios";

// Base API URL
const API_BASE_URL = "https://thesis-backend-tau.vercel.app/api/api";

// Simple lightweight cache implementation
const cache = {
  data: new Map(),
  get: (key) => {
    const item = cache.data.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cache.data.delete(key);
      return null;
    }
    return item.value;
  },
  set: (key, value, ttl = 60000) => {
    cache.data.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  },
  invalidate: (prefix) => {
    for (const key of cache.data.keys()) {
      if (key.startsWith(prefix)) {
        cache.data.delete(key);
      }
    }
  },
};

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authorization token not found");
    }
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Connection: "keep-alive", // Enable connection reuse
  },
  timeout: 10000, // Add timeout to prevent hanging requests
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
    const cacheKey = `farmers|${page}|${perPage}|${search}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    const params = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await apiClient.get(`/farmers?${params.toString()}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch farmers: ${error.message}`);
    }
  },

  // Get a single farmer by ID
  getFarmerById: async (farmerId) => {
    const cacheKey = `farmer|${farmerId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    try {
      // Try to directly get the farmer by ID first
      try {
        const response = await apiClient.get(`/farmers/${farmerId}`);
        cache.set(cacheKey, response.data);
        return response.data;
      } catch (directError) {
        // If direct access fails, try to get all farmers and filter
        console.log("Direct farmer fetch failed, trying alternative method");

        // Get all farmers without pagination
        const response = await apiClient.get(`/farmers`);

        // Check if response.data is an array
        let farmers = response.data;
        if (!Array.isArray(farmers)) {
          // If it's not an array, it might be paginated data
          if (response.data.data && Array.isArray(response.data.data)) {
            farmers = response.data.data;
          } else {
            throw new Error("Unexpected API response format");
          }
        }

        // Find the specific farmer by ID
        const farmer = farmers.find((f) => f.farmer_id === farmerId);

        if (!farmer) {
          throw new Error(`Farmer with ID ${farmerId} not found`);
        }

        cache.set(cacheKey, farmer);
        return farmer;
      }
    } catch (error) {
      throw new Error(`Failed to fetch farmer details: ${error.message}`);
    }
  },

  // Create a new farmer
  createFarmer: async (farmerData) => {
    try {
      const response = await apiClient.post("/farmers", farmerData);
      cache.invalidate("farmers|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create farmer: ${error.message}`);
    }
  },

  // Update a farmer
  updateFarmer: async (farmerId, farmerData) => {
    try {
      const response = await apiClient.put(`/farmers/${farmerId}`, farmerData);
      cache.invalidate(`farmer|${farmerId}`);
      cache.invalidate("farmers|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update farmer: ${error.message}`);
    }
  },

  // Delete a farmer
  deleteFarmer: async (farmerId) => {
    try {
      const response = await apiClient.delete(`/farmers/${farmerId}`);
      cache.invalidate(`farmer|${farmerId}`);
      cache.invalidate("farmers|");
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
      cache.invalidate(`farmer|${farmerId}`);
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
      cache.invalidate(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add rice data: ${error.message}`);
    }
  },

  // Delete a crop
  deleteCrop: async (farmerId, cropId) => {
    try {
      const response = await apiClient.delete(
        `/farmers/${farmerId}/crops/${cropId}`
      );
      cache.invalidate(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete crop: ${error.message}`);
    }
  },

  // Delete rice data
  deleteRice: async (farmerId, riceId) => {
    try {
      const response = await apiClient.delete(
        `/farmers/${farmerId}/rice/${riceId}`
      );
      cache.invalidate(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete rice data: ${error.message}`);
    }
  },

  updateCrop: async (farmerId, cropId, cropData) => {
    try {
      const response = await apiClient.put(
        `/farmers/${farmerId}/crops/${cropId}`,
        cropData
      );
      cache.invalidate(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update crop: ${error.message}`);
    }
  },

  updateRice: async (farmerId, riceId, riceData) => {
    try {
      const response = await apiClient.put(
        `/farmers/${farmerId}/rice/${riceId}`,
        riceData
      );
      cache.invalidate(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update rice data: ${error.message}`);
    }
  },
};

// Livestock API endpoints
export const livestockAPI = {
  // Get all livestock records with pagination and search
  getAllLivestockRecords: async (page = 1, perPage = 10, search = "") => {
    const cacheKey = `livestock|${page}|${perPage}|${search}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    const params = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await apiClient.get(
        `/livestock-records?${params.toString()}`
      );
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch livestock records: ${error.message}`);
    }
  },

  // Get a single livestock record by ID
  getLivestockRecordById: async (recordId) => {
    const cacheKey = `livestock-record|${recordId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    try {
      const response = await apiClient.get(`/livestock-records/${recordId}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch livestock record details: ${error.message}`
      );
    }
  },

  // Create livestock records
  createLivestockRecords: async (data) => {
    try {
      const response = await apiClient.post("/livestock-records", data);
      cache.invalidate("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create livestock records: ${error.message}`);
    }
  },

  // Add livestock records to a farmer
  addLivestockRecords: async (farmerId, livestockData) => {
    try {
      const response = await apiClient.post(
        `/farmers/${farmerId}/livestock-records`,
        livestockData
      );
      cache.invalidate(`farmer|${farmerId}`);
      cache.invalidate("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add livestock records: ${error.message}`);
    }
  },

  // Update a livestock record
  updateLivestockRecord: async (recordId, livestockData) => {
    try {
      const response = await apiClient.put(
        `/livestock-records/${recordId}`,
        livestockData
      );
      cache.invalidate(`livestock-record|${recordId}`);
      cache.invalidate("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update livestock record: ${error.message}`);
    }
  },

  // Delete a livestock record
  deleteLivestockRecord: async (recordId) => {
    try {
      console.log("API Service - Deleting livestock record with ID:", recordId);
      if (!recordId) {
        throw new Error("Record ID is required for deletion");
      }

      const response = await apiClient.delete(`/livestock-records/${recordId}`);
      cache.invalidate(`livestock-record|${recordId}`);
      cache.invalidate("livestock|");
      return response.data;
    } catch (error) {
      console.error("API Service - Error deleting livestock record:", error);
      throw new Error(`Failed to delete livestock record: ${error.message}`);
    }
  },
};

// Operator API endpoints
export const operatorAPI = {
  // Get all operators with pagination and search
  getAllOperators: async (page = 1, perPage = 10, search = "") => {
    const cacheKey = `operators|${page}|${perPage}|${search}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    const params = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (search) {
      params.append("search", search);
    }

    try {
      const response = await apiClient.get(`/operators?${params.toString()}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch operators: ${error.message}`);
    }
  },

  // Get a single operator by ID
  getOperatorById: async (operatorId) => {
    const cacheKey = `operator|${operatorId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) return cachedData;

    try {
      const response = await apiClient.get(`/operators/${operatorId}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch operator details: ${error.message}`);
    }
  },

  // Add operator to a farmer
  addOperator: async (data) => {
    try {
      const response = await apiClient.post(`/operators`, data);
      cache.invalidate("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add operator: ${error.message}`);
    }
  },

  // Update an operator
  updateOperator: async (farmerId, operatorData) => {
    try {
      const response = await apiClient.put(
        `/operators/${farmerId}`,
        operatorData
      );
      cache.invalidate(`operator|${farmerId}`);
      cache.invalidate("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update operator: ${error.message}`);
    }
  },

  // Delete an operator
  deleteOperator: async (operatorId) => {
    try {
      if (!operatorId) {
        throw new Error("Operator ID is required for deletion");
      }
      const response = await apiClient.delete(`/operators/${operatorId}`);
      cache.invalidate(`operator|${operatorId}`);
      cache.invalidate("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete operator: ${error.message}`);
    }
  },
};

// Prefetch common data function
export const prefetchCommonData = () => {
  // Prefetch data that's commonly needed
  farmerAPI.getAllFarmers(1, 10);
  livestockAPI.getAllLivestockRecords(1, 10);
  operatorAPI.getAllOperators(1, 10);
};

// Export a default object with all APIs
export default {
  farmer: farmerAPI,
  livestock: livestockAPI,
  operator: operatorAPI,
};
