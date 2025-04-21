"use client";
import axios from "axios";

// Base API URL
const API_BASE_URL = "https://thesis-backend-tau.vercel.app/api/api";

// Reduced cache TTL for faster updates
const CACHE_TTL = 300000; // 5 minutes in milliseconds
const CACHE_TTL_CRITICAL = 600000; // 10 minutes for critical data

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
    Connection: "keep-alive",
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
      const cacheKey = `${config.url}|${JSON.stringify(config.params || {})}`;
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

// Implement faster data fetching without timeouts
const fetchWithFastLoading = async (key, fetcher, options = {}) => {
  const { ttl = CACHE_TTL, revalidateOnMount = true } = options;

  // Check cache first
  const cachedData = cache.get(key);

  // Start fetching immediately
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
      // If we have cached data, return it on error
      if (cachedData) {
        return cachedData.data;
      }
      throw error;
    });

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
export const batchRequests = async (requests) => {
  try {
    // Process all requests in parallel
    const results = await Promise.all(
      requests.map((req) => {
        return apiClient(req)
          .then((res) => res.data)
          .catch((err) => {
            // Try to get from cache on error
            const cacheKey = `${req.url}|${JSON.stringify(req.params || {})}`;
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
              return cachedData.data;
            }
            throw err;
          });
      })
    );

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

// Update the prefetchCriticalData function to include prefetching for ViewFarmer and EditFarmer
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

        // Fourth priority: Prefetch first few farmers' details for ViewFarmer and EditFarmer
        async () => {
          try {
            // Get the first few farmers
            const farmersResponse = await farmerAPI.getAllFarmers(1, 5, "", [
              "farmer_id",
              "name",
              "barangay",
            ]);
            const farmers = Array.isArray(farmersResponse)
              ? farmersResponse
              : farmersResponse.data || [];

            // Prefetch details for each farmer (for ViewFarmer and EditFarmer)
            if (farmers.length > 0) {
              // Only prefetch the first 2 farmers to avoid too many requests
              const farmersToPreload = farmers.slice(0, 2);

              // Prefetch each farmer's details sequentially with small delays
              for (let i = 0; i < farmersToPreload.length; i++) {
                const farmer = farmersToPreload[i];
                // Wait a bit before each prefetch to avoid overwhelming the network
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Prefetch farmer details
                farmerAPI
                  .getFarmerById(farmer.farmer_id)
                  .catch((err) =>
                    console.error(
                      `Prefetch error for farmer ${farmer.farmer_id}:`,
                      err
                    )
                  );

                // Wait a bit before prefetching related data
                await new Promise((resolve) => setTimeout(resolve, 200));

                // Prefetch livestock records for this farmer
                livestockAPI
                  .getAllLivestockRecords()
                  .catch((err) =>
                    console.error("Prefetch livestock error:", err)
                  );

                // Wait a bit before next prefetch
                await new Promise((resolve) => setTimeout(resolve, 200));

                // Prefetch operator data for this farmer
                operatorAPI
                  .getAllOperators()
                  .catch((err) =>
                    console.error("Prefetch operators error:", err)
                  );
              }
            }
            return Promise.resolve();
          } catch (err) {
            console.error("Error prefetching farmer details:", err);
            return Promise.resolve(); // Continue with other prefetch operations
          }
        },

        // Fifth priority: More detailed farmer data for specific views
        () => {
          // Get the current path to determine what to prefetch
          const path = window.location.pathname;

          if (path.includes("inventory") || path.includes("analytics")) {
            // For inventory and analytics pages, prefetch more comprehensive data
            return Promise.all([
              farmerAPI.getAllFarmers(1, 20, "", [
                "farmer_id",
                "name",
                "barangay",
                "crops",
                "rice",
              ]),
              livestockAPI.getAllLivestockRecords(1, 20),
              operatorAPI.getAllOperators(1, 20),
            ]);
          }

          return Promise.resolve();
        },
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
              setTimeout(executeNext, 300);
            });
        }
      };

      executeNext();
    } catch (err) {
      console.error("Prefetch error:", err);
    }
  }, 100);
};

// Fix the prefetchFarmerDetails function to ensure it doesn't interfere with direct API calls

// Replace the existing prefetchFarmerDetails function with this corrected version
export const prefetchFarmerDetails = (farmerId) => {
  if (typeof window === "undefined" || !farmerId) return;

  // Don't block the UI
  setTimeout(async () => {
    try {
      // Use a flag in the cache to indicate this is a prefetch request
      const cacheKey = `farmer|${farmerId}|prefetch`;

      // Check if we've already prefetched this farmer
      if (cache.has(cacheKey)) {
        console.log(`Farmer ${farmerId} already prefetched, skipping`);
        return;
      }

      // Mark this farmer as being prefetched to prevent duplicate requests
      cache.set(cacheKey, { prefetching: true }, 60000); // 1 minute TTL for the prefetch flag

      // Prefetch farmer details
      const farmerResponse = await farmerAPI.getFarmerById(farmerId);

      // If we successfully got the farmer data, update the cache
      if (farmerResponse) {
        // Mark this farmer as prefetched
        cache.set(
          cacheKey,
          { prefetched: true, timestamp: Date.now() },
          CACHE_TTL
        );
        console.log(`Successfully prefetched farmer ${farmerId}`);

        // Start prefetching related data in parallel with small delays
        setTimeout(() => {
          // Filter livestock records for this farmer
          livestockAPI
            .getAllLivestockRecords()
            .then((response) => {
              console.log(`Prefetched livestock data for farmer ${farmerId}`);
            })
            .catch((err) => console.error("Prefetch livestock error:", err));
        }, 100);

        setTimeout(() => {
          // Filter operators for this farmer
          operatorAPI
            .getAllOperators()
            .then((response) => {
              console.log(`Prefetched operator data for farmer ${farmerId}`);
            })
            .catch((err) => console.error("Prefetch operators error:", err));
        }, 200);
      }
    } catch (err) {
      console.error(`Prefetch error for farmer ${farmerId}:`, err);
    }
  }, 50); // Start very quickly after the request
};

// Add a function to prefetch data based on the current route
export const prefetchRouteData = (route) => {
  if (typeof window === "undefined") return;

  setTimeout(() => {
    try {
      switch (route) {
        case "/dashboard":
          // Prefetch data needed for dashboard
          farmerAPI.getAllFarmers(1, 20, "", [
            "farmer_id",
            "name",
            "barangay",
            "crops",
            "rice",
          ]);
          livestockAPI.getAllLivestockRecords(1, 20);
          operatorAPI.getAllOperators(1, 20);
          break;

        case "/analytics":
          // Prefetch data needed for analytics
          farmerAPI.getAllFarmers(1, 50, "", [
            "farmer_id",
            "name",
            "barangay",
            "crops",
            "rice",
          ]);
          livestockAPI.getAllLivestockRecords(1, 50);
          operatorAPI.getAllOperators(1, 50);
          break;

        case "/inventory":
          // Prefetch data needed for inventory
          farmerAPI.getAllFarmers(1, 30, "", ["farmer_id", "name", "barangay"]);
          break;

        default:
          // Default prefetch for any other route
          prefetchCriticalData();
          break;
      }
    } catch (err) {
      console.error("Route-based prefetch error:", err);
    }
  }, 200);
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

// User Management API endpoints
export const userAPI = {
  // Get all users with pagination and search
  getAllUsers: async () => {
    const cacheKey = `users`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/usermanagement/data`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch users: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
    );
  },

  // Get current user info
  getCurrentUser: async () => {
    const cacheKey = `current-user`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/user`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch current user: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
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
  getAllFarmers: async (page = 1, perPage = 10, search = "", fields = []) => {
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
          const response = await apiClient.get(`/farmers?${params.toString()}`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch farmers: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
    );
  },

  // Get a single farmer by ID with optimized fallback
  getFarmerById: async (farmerId) => {
    const cacheKey = `farmer|${farmerId}`;

    return fetchWithFastLoading(
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
      { ttl: CACHE_TTL_CRITICAL }
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
            `/livestock-records?${params.toString()}`
          );
          return response.data;
        } catch (error) {
          throw new Error(
            `Failed to fetch livestock records: ${error.message}`
          );
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
    );
  },

  // Get a single livestock record by ID
  getLivestockRecordById: async (recordId) => {
    const cacheKey = `livestock-record|${recordId}`;

    return fetchWithFastLoading(
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
      { ttl: CACHE_TTL_CRITICAL }
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
            `/operators?${params.toString()}`
          );
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operators: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
    );
  },

  // Get a single operator by ID
  getOperatorById: async (operatorId) => {
    const cacheKey = `operator|${operatorId}`;

    return fetchWithFastLoading(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get(`/operators/${operatorId}`);
          return response.data;
        } catch (error) {
          throw new Error(`Failed to fetch operator details: ${error.message}`);
        }
      },
      { ttl: CACHE_TTL_CRITICAL }
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
