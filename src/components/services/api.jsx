"use client";
import axios from "axios";

// Base API URL
const API_BASE_URL = "http://localhost:8000/api/";

// Reduced cache TTL for faster updates
const CACHE_TTL = 60000; // 1 minute in milliseconds (reduced from 5 minutes)
const CACHE_TTL_CRITICAL = 120000; // 2 minutes for critical data (reduced from 10 minutes)

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
  },
  timeout: 15000, // Increased timeout for slower connections
});

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map();

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add compression support

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

    // Don't cache if forceRefresh is set
    if (config.forceRefresh === true) {
      delete config.forceRefresh; // Remove the custom property
      return config;
    }

    const cacheKey = `${config.url}|${JSON.stringify(config.params || {})}`;

    // Check if this exact request is already in flight
    if (pendingRequests.has(cacheKey)) {
      // Return the existing promise to avoid duplicate requests
      return pendingRequests.get(cacheKey);
    }

    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      // Return cached data in a format axios expects
      return {
        ...config,
        adapter: () => {
          return Promise.resolve({
            data: cachedResponse.data,
            status: 200,
            statusText: "OK",
            headers: cachedResponse.headers || {},
            config,
            cached: true,
          });
        },
      };
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
        response.config.params || {}
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

      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }

    return response;
  },
  (error) => {
    // Clean up pending requests on error
    if (error.config) {
      const cacheKey = `${error.config.url}|${JSON.stringify(
        error.config.params || {}
      )}`;
      pendingRequests.delete(cacheKey);
    }

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

        return new Promise((resolve) => {
          setTimeout(() => resolve(apiClient(config)), delay);
        });
      }
    }

    // For failed requests, try to return stale cache data if available
    if (config && config.method?.toLowerCase() === "get") {
      const cacheKey = `${config.url}|${JSON.stringify(config.params || {})}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
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

// Modified data fetching function with forceRefresh option
const fetchWithFastLoading = async (key, fetcher, options = {}) => {
  const {
    ttl = CACHE_TTL,
    revalidateOnMount = true,
    forceRefresh = false,
  } = options;

  // Check cache first (unless forceRefresh is true)
  const cachedData = forceRefresh ? null : cache.get(key);

  // Create a fetch promise that will update the cache
  const fetchPromise = fetcher()
    .then((freshData) => {
      // Update cache with fresh data
      cache.set(
        key,
        {
          data: freshData,
          timestamp: Date.now(),
        },
        ttl
      );
      return freshData;
    })
    .catch((error) => {
      console.error(`Error fetching data: ${error.message}`);
      // If we have cached data and not forcing refresh, return it on error
      if (cachedData && !forceRefresh) {
        return cachedData.data;
      }
      throw error;
    });

  // If forceRefresh is true, always wait for the fetch to complete
  if (forceRefresh) {
    return fetchPromise;
  }

  // If we have cached data, return it immediately while fetching in background
  if (cachedData) {
    if (revalidateOnMount) {
      // Let the fetch continue in background
      fetchPromise.catch((err) => {
        // Silently handle background fetch errors
        console.error("Background fetch error:", err);
      });
    }
    return cachedData.data;
  }

  // If no cache, wait for the fetch to complete
  return fetchPromise;
};

// Optimized batch requests helper with faster parallel execution
export const batchRequests = async (requests, forceRefresh = false) => {
  try {
    // Process all requests in parallel
    const results = await Promise.all(
      requests.map((req) => {
        // Add forceRefresh flag if specified
        if (forceRefresh) {
          req.forceRefresh = true;
        }

        return apiClient(req)
          .then((res) => res.data)
          .catch((err) => {
            // Try to get from cache on error (only if not forcing refresh)
            if (!forceRefresh) {
              const cacheKey = `${req.url}|${JSON.stringify(req.params || {})}`;
              const cachedData = cache.get(cacheKey);
              if (cachedData) {
                return cachedData.data;
              }
            }
            throw err;
          });
      })
    );

    return results;
  } catch (error) {
    console.error(`Batch request failed: ${error.message}`);

    // Return partial results if available and not forcing refresh
    if (!forceRefresh) {
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
        return partialResults;
      }
    }

    throw new Error(`Batch request failed: ${error.message}`);
  }
};

// Update the prefetchCriticalData function to be less aggressive
export const prefetchCriticalData = () => {
  if (typeof window === "undefined") return;

  // Execute with a small delay to not block initial render
  setTimeout(() => {
    try {
      // Create a queue of prefetch operations to run in sequence
      const prefetchQueue = [
        // First priority: Basic farmer data (most commonly needed)
        () =>
          farmerAPI.getAllFarmers(1, 10, "", ["farmer_id", "name", "barangay"]),

        // Second priority: Livestock data (smaller dataset)
        () => livestockAPI.getAllLivestockRecords(1, 10),

        // Third priority: Operator data (smaller dataset)
        () => operatorAPI.getAllOperators(1, 10),
      ];

      // Execute prefetch operations with a small delay between each
      let index = 0;
      const executeNext = () => {
        if (index < prefetchQueue.length) {
          prefetchQueue[index]()
            .catch((err) =>
              console.error(`Prefetch operation ${index} error:`, err)
            )
            .finally(() => {
              index++;
              // Add a small delay between operations to avoid overwhelming the browser
              setTimeout(executeNext, 500);
            });
        }
      };

      executeNext();
    } catch (err) {
      console.error("Prefetch error:", err);
    }
  }, 500); // Increased delay to prioritize main content
};

// Simplified prefetchFarmerDetails function
export const prefetchFarmerDetails = (farmerId) => {
  if (typeof window === "undefined" || !farmerId) return;

  // Don't block the UI
  setTimeout(async () => {
    try {
      // Use a flag in the cache to indicate this is a prefetch request
      const cacheKey = `farmer|${farmerId}|prefetch`;

      // Check if we've already prefetched this farmer
      if (cache.has(cacheKey)) {
        return;
      }

      // Mark this farmer as being prefetched to prevent duplicate requests
      cache.set(cacheKey, { prefetching: true }, 60000); // 1 minute TTL for the prefetch flag

      // Prefetch farmer details
      farmerAPI
        .getFarmerById(farmerId)
        .then(() => {
          // Mark this farmer as prefetched
          cache.set(
            cacheKey,
            { prefetched: true, timestamp: Date.now() },
            CACHE_TTL
          );
        })
        .catch((err) => {
          console.error(`Prefetch error for farmer ${farmerId}:`, err);
        });
    } catch (err) {
      console.error(`Prefetch error for farmer ${farmerId}:`, err);
    }
  }, 100);
};

// Simplified prefetchRouteData function
export const prefetchRouteData = (route) => {
  if (typeof window === "undefined") return;

  setTimeout(() => {
    try {
      switch (route) {
        case "/dashboard":
          // Prefetch data needed for dashboard
          farmerAPI.getAllFarmers(1, 10, "", ["farmer_id", "name", "barangay"]);
          break;

        case "/analytics":
          // Prefetch data needed for analytics
          farmerAPI.getAllFarmers(1, 10, "", ["farmer_id", "name", "barangay"]);
          break;

        default:
          // Default prefetch for any other route
          prefetchCriticalData();
          break;
      }
    } catch (err) {
      console.error("Route-based prefetch error:", err);
    }
  }, 500);
};

// Call prefetch immediately but with a delay
setTimeout(() => {
  prefetchCriticalData();
}, 1000);

// Optimized cache invalidation helper
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

// User Management API endpoints
export const userAPI = {
  // Get all users with pagination and search
  getAllUsers: async (forceRefresh = false) => {
    const cacheKey = `users`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/usermanagement/data`, {
            forceRefresh,
          });
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch users: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
    );
  },

  // Get current user info
  getCurrentUser: async (forceRefresh = false) => {
    const cacheKey = `current-user`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/user`, {
            forceRefresh,
          });
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch current user: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
    );
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post(`/register`, userData);
      // Invalidate users cache after creating
      invalidateCache("users");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.put(
        `/usermanagement/change-type/${userId}`,
        { role }
      );
      // Invalidate users cache
      invalidateCache("users");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(
        `/usermanagement/delete/${userId}`
      );
      // Invalidate users cache
      invalidateCache("users");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },
};

// Farmer API endpoints
export const farmerAPI = {
  // Get all farmers with pagination and search
  getAllFarmers: async (
    page = 1,
    perPage = 10,
    search = "",
    fields = [],
    forceRefresh = false
  ) => {
    const cacheKey = `farmers|${page}|${perPage}|${search}|${fields.join(",")}`;

    return fetchWithFastLoading(
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
          const response = await apiClient.get(
            `/farmers?${params.toString()}`,
            {
              forceRefresh,
            }
          );
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch farmers: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
    );
  },

  // Get a single farmer by ID with optimized fallback
  getFarmerById: async (farmerId, forceRefresh = false) => {
    const cacheKey = `farmer|${farmerId}`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          // Try to directly get the farmer by ID first
          try {
            const response = await apiClient.get(`/farmers/${farmerId}`, {
              forceRefresh,
            });
            return response.data;
          } catch (directError) {
            // If direct access fails, try to get all farmers and filter

            // Get all farmers without pagination but with minimal fields
            const response = await apiClient.get(`/farmers`, {
              params: {
                fields: "farmer_id,name,first_name,last_name,barangay",
                page: -1, // Signal to backend to return all records without pagination
              },
              forceRefresh,
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
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
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
  getAllLivestockRecords: async (
    page = 1,
    perPage = 10,
    search = "",
    forceRefresh = false
  ) => {
    const cacheKey = `livestock|${page}|${perPage}|${search}`;

    return fetchWithFastLoading(
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
            `/livestock-records?${params.toString()}`,
            { forceRefresh }
          );
          return response.data;
        } catch (error) {
          throw new Error(
            `Failed to fetch livestock records: ${error.message}`
          );
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
    );
  },

  // Get a single livestock record by ID
  getLivestockRecordById: async (recordId, forceRefresh = false) => {
    const cacheKey = `livestock-record|${recordId}`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(
            `/livestock-records/${recordId}`,
            { forceRefresh }
          );
          return response.data;
        } catch (error) {
          throw new Error(
            `Failed to fetch livestock record details: ${error.message}`
          );
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
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
  getAllOperators: async (
    page = 1,
    perPage = 10,
    search = "",
    forceRefresh = false
  ) => {
    const cacheKey = `operators|${page}|${perPage}|${search}`;

    return fetchWithFastLoading(
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
            `/operators?${params.toString()}`,
            { forceRefresh }
          );
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operators: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
    );
  },

  // Get a single operator by ID
  getOperatorById: async (operatorId, forceRefresh = false) => {
    const cacheKey = `operator|${operatorId}`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/operators/${operatorId}`, {
            forceRefresh,
          });
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operator details: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL, forceRefresh }
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
  user: userAPI,
};
