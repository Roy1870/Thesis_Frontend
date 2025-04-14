"use client";
import axios from "axios";

// Base API URL
const API_BASE_URL = "https://thesis-backend-tau.vercel.app/api/api";

// Add a simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute in milliseconds

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

// Add caching interceptor for GET requests
apiClient.interceptors.request.use(
  async (config) => {
    // Only cache GET requests
    if (config.method?.toLowerCase() !== "get") return config;

    const cacheKey = `${config.url}|${JSON.stringify(config.params)}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      const { data, timestamp } = cachedResponse;
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_TTL) {
        // Return cached data in a format axios expects
        return Promise.resolve({
          data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          cached: true,
        });
      } else {
        // Cache expired, remove it
        cache.delete(cacheKey);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Cache successful responses
apiClient.interceptors.response.use(
  (response) => {
    // Don't cache already cached responses
    if (response.cached) return response;

    // Only cache GET requests
    if (response.config.method?.toLowerCase() === "get") {
      const cacheKey = `${response.config.url}|${JSON.stringify(
        response.config.params
      )}`;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => Promise.reject(error)
);

// Implement SWR (Stale-While-Revalidate) pattern
const fetchWithSWR = async (key, fetcher) => {
  // Check cache first
  const cachedData = cache.get(key);

  // If we have cached data, return it immediately
  if (cachedData) {
    const { data, timestamp } = cachedData;

    // If cache is still fresh, just return it
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }

    // If cache is stale but exists, return it and revalidate in background
    setTimeout(async () => {
      try {
        const freshData = await fetcher();
        cache.set(key, {
          data: freshData,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Background revalidation failed:", error);
      }
    }, 0);

    return data;
  }

  // If no cache, fetch fresh data
  const freshData = await fetcher();
  cache.set(key, {
    data: freshData,
    timestamp: Date.now(),
  });

  return freshData;
};

// Batch requests helper
export const batchRequests = async (requests) => {
  try {
    const responses = await Promise.all(requests.map((req) => apiClient(req)));
    return responses.map((res) => res.data);
  } catch (error) {
    throw new Error(`Batch request failed: ${error.message}`);
  }
};

// Prefetch common data
export const prefetchCommonData = () => {
  // Prefetch data that's commonly needed
  farmerAPI.getAllFarmers(1, 10);
  livestockAPI.getAllLivestockRecords(1, 10);
  operatorAPI.getAllOperators(1, 10);
};

// Farmer API endpoints
export const farmerAPI = {
  // Get all farmers with pagination and search
  getAllFarmers: async (page = 1, perPage = 10, search = "", fields = []) => {
    const cacheKey = `farmers|${page}|${perPage}|${search}|${fields.join(",")}`;

    return fetchWithSWR(cacheKey, async () => {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
      });

      if (search) {
        params.append("search", search);
      }

      // Only request the fields you need
      if (fields.length > 0) {
        params.append("fields", fields.join(","));
      }

      try {
        const response = await apiClient.get(`/farmers?${params.toString()}`);
        return response.data;
      } catch (error) {
        throw new Error(`Failed to fetch farmers: ${error.message}`);
      }
    });
  },

  // Get a single farmer by ID
  getFarmerById: async (farmerId) => {
    const cacheKey = `farmer|${farmerId}`;

    return fetchWithSWR(cacheKey, async () => {
      try {
        // Try to directly get the farmer by ID first
        try {
          // This might not work if the endpoint doesn't exist
          const response = await apiClient.get(`/farmers/${farmerId}`);
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

          return farmer;
        }
      } catch (error) {
        throw new Error(`Failed to fetch farmer details: ${error.message}`);
      }
    });
  },

  // Create a new farmer
  createFarmer: async (farmerData) => {
    try {
      const response = await apiClient.post("/farmers", farmerData);
      // Invalidate farmers cache after creating
      Array.from(cache.keys())
        .filter((key) => key.startsWith("farmers|"))
        .forEach((key) => cache.delete(key));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create farmer: ${error.message}`);
    }
  },

  // Update a farmer
  updateFarmer: async (farmerId, farmerData) => {
    try {
      const response = await apiClient.put(`/farmers/${farmerId}`, farmerData);
      // Invalidate specific farmer and farmers list cache
      cache.delete(`farmer|${farmerId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("farmers|"))
        .forEach((key) => cache.delete(key));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update farmer: ${error.message}`);
    }
  },

  // Delete a farmer
  deleteFarmer: async (farmerId) => {
    try {
      const response = await apiClient.delete(`/farmers/${farmerId}`);
      // Invalidate specific farmer and farmers list cache
      cache.delete(`farmer|${farmerId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("farmers|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
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
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
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
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
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
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete rice data: ${error.message}`);
    }
  },

  updateCrop: async (farmerId, cropId, cropData) => {
    try {
      // cropData should already be in the correct format
      const response = await apiClient.put(
        `/farmers/${farmerId}/crops/${cropId}`,
        cropData
      );
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update crop: ${error.message}`);
    }
  },

  updateRice: async (farmerId, riceId, riceData) => {
    try {
      // riceData should already be in the correct format
      const response = await apiClient.put(
        `/farmers/${farmerId}/rice/${riceId}`,
        riceData
      );
      // Invalidate specific farmer cache
      cache.delete(`farmer|${farmerId}`);
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

    return fetchWithSWR(cacheKey, async () => {
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
        return response.data;
      } catch (error) {
        throw new Error(`Failed to fetch livestock records: ${error.message}`);
      }
    });
  },

  // Get a single livestock record by ID
  getLivestockRecordById: async (recordId) => {
    const cacheKey = `livestock-record|${recordId}`;

    return fetchWithSWR(cacheKey, async () => {
      try {
        const response = await apiClient.get(`/livestock-records/${recordId}`);
        return response.data;
      } catch (error) {
        throw new Error(
          `Failed to fetch livestock record details: ${error.message}`
        );
      }
    });
  },

  // Create livestock records
  createLivestockRecords: async (data) => {
    try {
      const response = await apiClient.post("/livestock-records", data);
      // Invalidate livestock records cache
      Array.from(cache.keys())
        .filter((key) => key.startsWith("livestock|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate farmer and livestock caches
      cache.delete(`farmer|${farmerId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("livestock|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate specific record and list cache
      cache.delete(`livestock-record|${recordId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("livestock|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate specific record and list cache
      cache.delete(`livestock-record|${recordId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("livestock|"))
        .forEach((key) => cache.delete(key));
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

    return fetchWithSWR(cacheKey, async () => {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
      });

      if (search) {
        params.append("search", search);
      }

      try {
        const response = await apiClient.get(`/operators?${params.toString()}`);
        return response.data;
      } catch (error) {
        throw new Error(`Failed to fetch operators: ${error.message}`);
      }
    });
  },

  // Get a single operator by ID
  getOperatorById: async (operatorId) => {
    const cacheKey = `operator|${operatorId}`;

    return fetchWithSWR(cacheKey, async () => {
      try {
        const response = await apiClient.get(`/operators/${operatorId}`);
        return response.data;
      } catch (error) {
        throw new Error(`Failed to fetch operator details: ${error.message}`);
      }
    });
  },

  // Add operator to a farmer
  addOperator: async (data) => {
    try {
      const response = await apiClient.post(`/operators`, data);
      // Invalidate operators cache
      Array.from(cache.keys())
        .filter((key) => key.startsWith("operators|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate specific operator and list cache
      cache.delete(`operator|${farmerId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("operators|"))
        .forEach((key) => cache.delete(key));
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
      // Invalidate specific operator and list cache
      cache.delete(`operator|${operatorId}`);
      Array.from(cache.keys())
        .filter((key) => key.startsWith("operators|"))
        .forEach((key) => cache.delete(key));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete operator: ${error.message}`);
    }
  },
};

// Export a default object with all APIs
export default {
  farmer: farmerAPI,
  livestock: livestockAPI,
  operator: operatorAPI,
};
