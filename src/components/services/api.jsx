"use client";
import axios from "axios";

// Base API URL
const API_BASE_URL = "https://thesis-backend-tau.vercel.app/api/api";

// Reduced cache TTL for faster updates
const CACHE_TTL = 300000; // 5 minutes in milliseconds
const CACHE_TTL_CRITICAL = 600000; // 10 minutes for critical data

// Reduced timeout for faster error detection
const CONNECTION_TIMEOUT = 5000; // 5 seconds max for requests

// Persistent cache implementation with localStorage backup
class PersistentCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttls = new Map();
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const savedCache = localStorage.getItem("api_cache");
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        const now = Date.now();

        // Only load non-expired items
        Object.entries(parsed).forEach(([key, item]) => {
          if (item.expiry > now) {
            this.cache.set(key, item.data);
            this.ttls.set(key, item.expiry);
          }
        });

        console.log(`Loaded ${this.cache.size} items from persistent cache`);
      }
    } catch (e) {
      console.error("Failed to load cache from storage:", e);
    }
  }

  saveToStorage() {
    if (typeof window === "undefined") return;

    try {
      const cacheObj = {};
      const now = Date.now();

      // Only save non-expired items
      for (const [key, value] of this.cache.entries()) {
        const expiry = this.ttls.get(key);
        if (expiry && expiry > now) {
          cacheObj[key] = {
            data: value,
            expiry,
          };
        }
      }

      localStorage.setItem("api_cache", JSON.stringify(cacheObj));
    } catch (e) {
      console.error("Failed to save cache to storage:", e);
    }
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // Check if entry has expired
    const now = Date.now();
    if (this.ttls.has(key) && now > this.ttls.get(key)) {
      this.delete(key);
      return undefined;
    }

    // Get the value and refresh its position in the cache
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value, ttl = CACHE_TTL) {
    // If key exists, refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest item if cache is full
    else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.delete(oldestKey);
    }

    this.cache.set(key, value);

    // Set TTL
    if (ttl > 0) {
      this.ttls.set(key, Date.now() + ttl);
    }

    // Save to localStorage every 10 operations
    if (Math.random() < 0.1) {
      this.saveToStorage();
    }
  }

  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem("api_cache");
    }
  }

  has(key) {
    if (!this.cache.has(key)) return false;

    // Check if entry has expired
    const now = Date.now();
    if (this.ttls.has(key) && now > this.ttls.get(key)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  keys() {
    // Filter out expired keys
    const now = Date.now();
    const validKeys = [];

    for (const key of this.cache.keys()) {
      if (!this.ttls.has(key) || now <= this.ttls.get(key)) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  // Cleanup expired entries periodically
  startCleanupInterval(interval = 60000) {
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        let deleted = 0;
        for (const [key, expiry] of this.ttls.entries()) {
          if (now > expiry) {
            this.delete(key);
            deleted++;
          }
        }
        if (deleted > 0) {
          this.saveToStorage();
        }
      }, interval);
    }
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.saveToStorage();
    }
  }
}

// Create cache instance with larger size
const cache = new PersistentCache(500);
// Start cleanup interval
if (typeof window !== "undefined") {
  cache.startCleanupInterval();
}

// Helper to get auth token with memoization
let cachedToken = null;
let tokenTimestamp = 0;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  // Return cached token if it's less than 5 minutes old
  const now = Date.now();
  if (cachedToken && now - tokenTimestamp < 300000) {
    return cachedToken;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    // Update cached token
    cachedToken = token;
    tokenTimestamp = now;

    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Create axios instance with optimized config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Connection: "keep-alive",
  },
  timeout: CONNECTION_TIMEOUT, // Reduced timeout for faster error detection
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add compression support
    config.headers["Accept-Encoding"] = "gzip, deflate, br";

    // Add request ID for tracing
    config.headers["X-Request-ID"] = `req-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add caching interceptor for GET requests with optimized implementation
apiClient.interceptors.request.use(
  async (config) => {
    // Only cache GET requests
    if (config.method?.toLowerCase() !== "get") return config;

    // Don't cache if specifically requested
    if (config.headers?.["Cache-Control"] === "no-cache") return config;

    const cacheKey = `${config.url}|${JSON.stringify(config.params)}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      // Return cached data in a format axios expects
      return Promise.resolve({
        data: cachedResponse.data,
        status: 200,
        statusText: "OK",
        headers: cachedResponse.headers || {},
        config,
        cached: true,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Cache successful responses with optimized implementation
apiClient.interceptors.response.use(
  (response) => {
    // Don't cache already cached responses
    if (response.cached) return response;

    // Only cache GET requests
    if (response.config.method?.toLowerCase() === "get") {
      const cacheKey = `${response.config.url}|${JSON.stringify(
        response.config.params
      )}`;

      // Store in cache with headers for ETag support
      cache.set(cacheKey, {
        data: response.data,
        headers: {
          etag: response.headers?.etag,
          "last-modified": response.headers?.["last-modified"],
        },
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    // Implement faster retry logic for network errors
    const config = error.config;

    // Only retry certain requests and limit retries
    if (
      config &&
      !config._retryCount &&
      // Retry on network errors
      (error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        // Retry on 5xx errors (server errors)
        (error.response && error.response.status >= 500) ||
        // Retry on 429 (rate limit)
        (error.response && error.response.status === 429))
    ) {
      // Use faster retry with minimal delay
      const retryCount = config._retryCount || 0;
      config._retryCount = retryCount + 1;

      if (config._retryCount <= 2) {
        // Maximum 2 retries for faster response
        // Calculate delay with minimal backoff
        const delay = Math.min(
          200 * (retryCount + 1), // Start with 200ms, then 400ms
          1000 // Max 1 second
        );

        console.log(
          `Retrying request (${config._retryCount}/2) after ${delay}ms`
        );

        return new Promise((resolve) => {
          setTimeout(() => resolve(apiClient(config)), delay);
        });
      }
    }

    // For failed requests, try to return stale cache data if available
    if (config && config.method?.toLowerCase() === "get") {
      const cacheKey = `${config.url}|${JSON.stringify(config.params)}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        console.log("Returning stale cache data after request failure");
        return Promise.resolve({
          data: cachedData.data,
          status: 200,
          statusText: "OK (from stale cache)",
          headers: cachedData.headers || {},
          config,
          cached: true,
          stale: true,
        });
      }
    }

    return Promise.reject(error);
  }
);

// Implement faster SWR pattern with timeout
const fetchWithSWR = async (key, fetcher, options = {}) => {
  const { ttl = CACHE_TTL, revalidateOnMount = true, timeout = 5000 } = options;

  // Check cache first
  const cachedData = cache.get(key);

  // If we have cached data, return it immediately
  if (cachedData) {
    // If revalidateOnMount is true, revalidate in background with timeout
    if (revalidateOnMount) {
      const revalidationPromise = new Promise(async (resolve) => {
        try {
          const freshData = await fetcher();
          cache.set(
            key,
            {
              data: freshData,
              timestamp: Date.now(),
            },
            ttl
          );
          resolve();
        } catch (error) {
          console.error("Background revalidation failed:", error);
          resolve();
        }
      });

      // Set timeout for background revalidation
      setTimeout(() => {
        // This will just abandon the revalidation if it takes too long
      }, timeout);
    }

    return cachedData.data;
  }

  // If no cache, fetch fresh data with timeout
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeout);
    });

    // Race between the actual fetch and the timeout
    const freshData = await Promise.race([fetcher(), timeoutPromise]);

    cache.set(
      key,
      {
        data: freshData,
        timestamp: Date.now(),
      },
      ttl
    );

    return freshData;
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);

    // If we timeout or have an error, check if we have any cached data at all
    // even if it's expired
    if (typeof window !== "undefined") {
      try {
        const savedCache = localStorage.getItem("api_cache");
        if (savedCache) {
          const parsed = JSON.parse(savedCache);
          if (parsed[key] && parsed[key].data) {
            console.log("Returning expired data after fetch failure");
            return parsed[key].data;
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    throw error;
  }
};

// Optimized batch requests helper with faster parallel execution
export const batchRequests = async (requests) => {
  try {
    // Process all requests in parallel with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Batch requests timeout")), 5000);
    });

    const results = await Promise.race([
      Promise.all(
        requests.map((req) => {
          // Add a short timeout to each individual request
          req.timeout = 4000; // 4 seconds per request
          return apiClient(req).then((res) => res.data);
        })
      ),
      timeoutPromise,
    ]);

    return results;
  } catch (error) {
    console.error(`Batch request failed: ${error.message}`);

    // Return partial results if available
    const partialResults = [];
    for (const req of requests) {
      try {
        const cacheKey = `${req.url}|${JSON.stringify(req.params || {})}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          partialResults.push(cachedData.data);
        }
      } catch (e) {
        // Skip this item if there's an error
      }
    }

    if (partialResults.length > 0) {
      console.log(
        `Returning ${partialResults.length} cached results after batch failure`
      );
      return partialResults;
    }

    throw new Error(`Batch request failed: ${error.message}`);
  }
};

// Prefetch critical data immediately on load
export const prefetchCriticalData = () => {
  if (typeof window === "undefined") return;

  // Execute immediately without waiting
  setTimeout(() => {
    try {
      // Prefetch minimal data with small page sizes
      farmerAPI.getAllFarmers(1, 5, "", ["farmer_id", "name"]);
      livestockAPI.getAllLivestockRecords(1, 5);
      operatorAPI.getAllOperators(1, 5);
    } catch (err) {
      console.error("Prefetch error:", err);
    }
  }, 0);
};

// Call prefetch immediately
prefetchCriticalData();

// Optimized cache invalidation helper
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

// Farmer API endpoints
export const farmerAPI = {
  // Get all farmers with pagination and search
  getAllFarmers: async (page = 1, perPage = 10, search = "", fields = []) => {
    const cacheKey = `farmers|${page}|${perPage}|${search}|${fields.join(",")}`;

    return fetchWithSWR(
      cacheKey,
      async () => {
        const params = new URLSearchParams({
          page,
          per_page: perPage,
        });

        if (search) {
          params.append("search", search);
        }

        // Only request the fields you need (crucial for performance)
        if (fields.length > 0) {
          params.append("fields", fields.join(","));
        }

        try {
          const response = await apiClient.get(`/farmers?${params.toString()}`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch farmers: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Get a single farmer by ID with optimized fallback
  getFarmerById: async (farmerId) => {
    const cacheKey = `farmer|${farmerId}`;

    return fetchWithSWR(
      cacheKey,
      async () => {
        try {
          // Try to directly get the farmer by ID first
          try {
            const response = await apiClient.get(`/farmers/${farmerId}`);
            return response.data;
          } catch (directError) {
            // If direct access fails, try to get all farmers and filter
            console.log(
              "Direct farmer fetch failed, trying alternative method"
            );

            // Get all farmers without pagination but with minimal fields
            const response = await apiClient.get(`/farmers`, {
              params: {
                fields: "farmer_id,name,first_name,last_name,barangay",
                page: -1, // Signal to backend to return all records without pagination
              },
              timeout: 3000, // Shorter timeout for fallback
            });

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
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Create a new farmer with optimized cache invalidation
  createFarmer: async (farmerData) => {
    try {
      const response = await apiClient.post("/farmers", farmerData);
      // Invalidate farmers cache after creating
      invalidateCache("farmers|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create farmer: ${error.message}`);
    }
  },

  // Update a farmer with optimized cache invalidation
  updateFarmer: async (farmerId, farmerData) => {
    try {
      const response = await apiClient.put(`/farmers/${farmerId}`, farmerData);
      // Invalidate specific farmer and farmers list cache
      cache.delete(`farmer|${farmerId}`);
      invalidateCache("farmers|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update farmer: ${error.message}`);
    }
  },

  // Delete a farmer with optimized cache invalidation
  deleteFarmer: async (farmerId) => {
    try {
      const response = await apiClient.delete(`/farmers/${farmerId}`);
      // Invalidate specific farmer and farmers list cache
      cache.delete(`farmer|${farmerId}`);
      invalidateCache("farmers|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete farmer: ${error.message}`);
    }
  },

  // Add crops to a farmer with optimized cache invalidation
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

  // Add rice data to a farmer with optimized cache invalidation
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

  // Delete a crop with optimized cache invalidation
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

  // Delete rice data with optimized cache invalidation
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

    return fetchWithSWR(
      cacheKey,
      async () => {
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
          throw new Error(
            `Failed to fetch livestock records: ${error.message}`
          );
        }
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Get a single livestock record by ID
  getLivestockRecordById: async (recordId) => {
    const cacheKey = `livestock-record|${recordId}`;

    return fetchWithSWR(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(
            `/livestock-records/${recordId}`
          );
          return response.data;
        } catch (error) {
          throw new Error(
            `Failed to fetch livestock record details: ${error.message}`
          );
        }
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Create livestock records with optimized cache invalidation
  createLivestockRecords: async (data) => {
    try {
      const response = await apiClient.post("/livestock-records", data);
      // Invalidate livestock records cache
      invalidateCache("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create livestock records: ${error.message}`);
    }
  },

  // Add livestock records to a farmer with optimized cache invalidation
  addLivestockRecords: async (farmerId, livestockData) => {
    try {
      const response = await apiClient.post(
        `/farmers/${farmerId}/livestock-records`,
        livestockData
      );
      // Invalidate farmer and livestock caches
      cache.delete(`farmer|${farmerId}`);
      invalidateCache("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add livestock records: ${error.message}`);
    }
  },

  // Update a livestock record with optimized cache invalidation
  updateLivestockRecord: async (recordId, livestockData) => {
    try {
      const response = await apiClient.put(
        `/livestock-records/${recordId}`,
        livestockData
      );
      // Invalidate specific record and list cache
      cache.delete(`livestock-record|${recordId}`);
      invalidateCache("livestock|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update livestock record: ${error.message}`);
    }
  },

  // Delete a livestock record with optimized cache invalidation
  deleteLivestockRecord: async (recordId) => {
    try {
      console.log("API Service - Deleting livestock record with ID:", recordId);
      if (!recordId) {
        throw new Error("Record ID is required for deletion");
      }

      const response = await apiClient.delete(`/livestock-records/${recordId}`);
      // Invalidate specific record and list cache
      cache.delete(`livestock-record|${recordId}`);
      invalidateCache("livestock|");
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

    return fetchWithSWR(
      cacheKey,
      async () => {
        const params = new URLSearchParams({
          page,
          per_page: perPage,
        });

        if (search) {
          params.append("search", search);
        }

        try {
          const response = await apiClient.get(
            `/operators?${params.toString()}`
          );
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operators: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Get a single operator by ID
  getOperatorById: async (operatorId) => {
    const cacheKey = `operator|${operatorId}`;

    return fetchWithSWR(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/operators/${operatorId}`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operator details: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, timeout: 4000 }
    );
  },

  // Add operator to a farmer with optimized cache invalidation
  addOperator: async (data) => {
    try {
      const response = await apiClient.post(`/operators`, data);
      // Invalidate operators cache
      invalidateCache("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add operator: ${error.message}`);
    }
  },

  // Update an operator with optimized cache invalidation
  updateOperator: async (farmerId, operatorData) => {
    try {
      const response = await apiClient.put(
        `/operators/${farmerId}`,
        operatorData
      );
      // Invalidate specific operator and list cache
      cache.delete(`operator|${farmerId}`);
      invalidateCache("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update operator: ${error.message}`);
    }
  },

  // Delete an operator with optimized cache invalidation
  deleteOperator: async (operatorId) => {
    try {
      if (!operatorId) {
        throw new Error("Operator ID is required for deletion");
      }
      const response = await apiClient.delete(`/operators/${operatorId}`);
      // Invalidate specific operator and list cache
      cache.delete(`operator|${operatorId}`);
      invalidateCache("operators|");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete operator: ${error.message}`);
    }
  },
};

// Clean up resources when the app is unmounted
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    cache.stopCleanupInterval();
    cache.saveToStorage();
  });
}

// Export a default object with all APIs
export default {
  farmer: farmerAPI,
  livestock: livestockAPI,
  operator: operatorAPI,
};
