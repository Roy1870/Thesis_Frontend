"use client";

import { useState, useEffect } from "react";
import {
  farmerAPI,
  livestockAPI,
  operatorAPI,
  prefetchRouteData,
} from "./services/api";
import { useRefreshStore } from "./shared-store";
import { RefreshCw } from "lucide-react";

// Import dashboard components
import DashboardHeader from "./dashboard/dashboard-header";
import DashboardStats from "./dashboard/dashboard-stats";
import TopPerformers from "./dashboard/top-performers";
import RecentHarvests from "./dashboard/recent-harvests";
import { processRawData } from "./utils/data-processor";
import CategoryBreakdown from "./dashboard/category-breakdown";
import CategoryDetails from "./dashboard/category-details";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const {
    isRefreshing,
    lastRefresh,
    setRefreshing,
    setLastRefresh,
    dataCache,
    updateDataCache,
  } = useRefreshStore();
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({
    farmers: [],
    livestock: [],
    operators: [],
    crops: [],
    rice: [],
    highValueCrops: [],
  });
  const [dashboardData, setDashboardData] = useState({
    totalProduction: 0,
    cropProduction: [],
    monthlyProduction: [],
    productionByBarangay: [],
    topPerformingItems: [],
    recentHarvests: [],
    productionTrend: 0,
    totalFarmers: 0,
    totalArea: 0,
    farmerTypeDistribution: [],
    categoryData: {
      livestock: { total: 0, items: [] },
      rice: { total: 0, items: [] },
      banana: { total: 0, items: [] },
      legumes: { total: 0, items: [] },
      spices: { total: 0, items: [] },
      fish: { total: 0, items: [] },
      highValueCrops: { total: 0, items: [] },
    },
  });

  // Fetch data on component mount
  useEffect(() => {
    // Check if we have data in the cache first
    if (Object.values(dataCache).some((arr) => arr.length > 0)) {
      setRawData(dataCache);
      setLoading(false);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    // Initial data fetch
    fetchAllData(signal, true);

    return () => {
      controller.abort();
    };
  }, []);

  // Process raw data when it changes
  useEffect(() => {
    if (Object.values(rawData).every((arr) => arr.length === 0)) return;
    const processedData = processRawData(rawData);
    setDashboardData(processedData);
  }, [rawData]);

  // Prefetch data for other routes
  useEffect(() => {
    prefetchRouteData("/inventory");

    const analyticsTimer = setTimeout(() => {
      prefetchRouteData("/analytics");
    }, 5000);

    return () => {
      clearTimeout(analyticsTimer);
    };
  }, []);

  // Set up polling for data updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!isRefreshing) {
        setRefreshing(true);

        const controller = new AbortController();
        const signal = controller.signal;

        fetchAllData(signal, true)
          .then(() => {
            setLastRefresh(new Date());
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Error during auto-refresh:", err);
            }
          })
          .finally(() => {
            setRefreshing(false);
          });
      }
    }, 60000); // Poll every 60 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [isRefreshing, setRefreshing, setLastRefresh]);

  // Fetch all data
  const fetchAllData = async (signal, forceRefresh = false) => {
    try {
      const isInitialLoad = Object.values(rawData).every(
        (arr) => arr.length === 0
      );

      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      // Fetch data in parallel
      const [farmersResponse, livestockResponse, operatorsResponse] =
        await Promise.all([
          farmerAPI.getAllFarmers(1, 1000, "", [], signal),
          livestockAPI.getAllLivestockRecords(1, 1000, "", signal),
          operatorAPI.getAllOperators(1, 1000, "", signal),
        ]);

      // Process farmers data
      const farmers = Array.isArray(farmersResponse)
        ? farmersResponse
        : farmersResponse.data || [];

      // Process livestock data
      const livestock = Array.isArray(livestockResponse)
        ? livestockResponse
        : livestockResponse.data || [];

      // Process operators data
      const operators = Array.isArray(operatorsResponse)
        ? operatorsResponse
        : operatorsResponse.data || [];

      // Create a map for faster farmer lookups
      const farmersMap = {};
      farmers.forEach((farmer) => {
        farmersMap[farmer.farmer_id] = farmer;
      });

      // Extract crops from farmers
      const crops = [];
      const rice = [];
      const highValueCrops = [];

      // Process each farmer to extract crops and rice data
      farmers.forEach((farmer) => {
        // Extract crops
        if (farmer.crops && Array.isArray(farmer.crops)) {
          // Filter regular crops and high value crops
          const regularCrops = farmer.crops.filter(
            (crop) => crop.crop_type !== "High Value Crops"
          );
          const hvCrops = farmer.crops.filter(
            (crop) => crop.crop_type === "High Value Crops"
          );

          // Add farmer info to each crop
          const farmerCrops = regularCrops.map((crop) => {
            // Parse production_data
            const productionData = parseProductionData(crop);

            return {
              ...crop,
              farmer_id: farmer.farmer_id,
              farmer_name:
                farmer.name ||
                `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() ||
                "Unknown",
              barangay: farmer.barangay,
              // Add parsed production data fields
              crop_value: productionData.crop || crop.crop_value || "",
              quantity: productionData.quantity || crop.quantity || "",
              harvest_date:
                crop.harvest_date ||
                crop.created_at ||
                new Date().toISOString(),
            };
          });
          crops.push(...farmerCrops);

          // Process high value crops
          const farmerHVCs = hvCrops.map((crop) => {
            // Parse production_data
            const productionData = parseProductionData(crop);

            return {
              ...crop,
              farmer_id: farmer.farmer_id,
              farmer_name:
                farmer.name ||
                `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() ||
                "Unknown",
              barangay: farmer.barangay,
              // Add parsed production data fields
              month: productionData.month || "",
              crop_value: productionData.crop || crop.crop_value || "",
              quantity: productionData.quantity || crop.quantity || "",
              harvest_date:
                crop.harvest_date ||
                crop.created_at ||
                new Date().toISOString(),
            };
          });
          highValueCrops.push(...farmerHVCs);
        }

        // Extract rice data
        if (farmer.rice && Array.isArray(farmer.rice)) {
          // Add farmer info to each rice entry
          const farmerRice = farmer.rice.map((riceItem) => ({
            ...riceItem,
            farmer_id: farmer.farmer_id,
            farmer_name:
              farmer.name ||
              `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() ||
              "Unknown",
            barangay: farmer.barangay,
            harvest_date:
              riceItem.harvest_date ||
              riceItem.created_at ||
              new Date().toISOString(),
          }));
          rice.push(...farmerRice);
        }
      });

      // Enrich livestock records with farmer information
      const enrichedLivestock = livestock.map((record) => {
        const farmer = farmersMap[record.farmer_id];
        return {
          ...record,
          farmer_name: farmer
            ? farmer.name ||
              `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim()
            : "Unknown",
          barangay: farmer ? farmer.barangay : "Unknown",
        };
      });

      // Enrich operators with farmer information
      const enrichedOperators = operators.map((record) => {
        const farmer = farmersMap[record.farmer_id];
        return {
          ...record,
          farmer_name: farmer
            ? farmer.name ||
              `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim()
            : "Unknown",
          barangay: farmer ? farmer.barangay : "Unknown",
        };
      });

      // Store all the fetched and processed data
      const newData = {
        farmers,
        livestock: enrichedLivestock,
        operators: enrichedOperators,
        crops,
        rice,
        highValueCrops,
      };

      setRawData(newData);
      updateDataCache(newData);

      // Turn off loading states
      setLoading(false);
      setRefreshing(false);

      // Update last refresh timestamp
      setLastRefresh(new Date());

      return newData;
    } catch (error) {
      // Only set error if not an abort error
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        setError(error.message);

        // Check if this is an initial load
        const isInitialLoad = Object.values(rawData).every(
          (arr) => arr.length === 0
        );

        // Reset the appropriate loading state
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
      throw error;
    }
  };

  // Helper function to parse production_data
  const parseProductionData = (crop) => {
    let productionData = {};
    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
      } catch (e) {
        // Silent error - continue with empty production data
      }
    } else if (
      crop.production_data &&
      typeof crop.production_data === "object"
    ) {
      productionData = crop.production_data;
    }
    return productionData;
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (!isRefreshing) {
      setRefreshing(true);

      const controller = new AbortController();
      const signal = controller.signal;

      fetchAllData(signal, true)
        .then(() => {
          setLastRefresh(new Date());
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Error during manual refresh:", err);
          }
        })
        .finally(() => {
          setRefreshing(false);
        });
    }
  };

  if (loading && Object.values(rawData).every((arr) => arr.length === 0)) {
    return (
      <div className="p-5 bg-[#F5F7F9] min-h-screen overflow-y-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7F9]">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-medium text-red-700">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-[#F5F7F9] min-h-screen overflow-y-auto">
      <DashboardHeader
        formattedDate={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        isRefreshing={isRefreshing}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
      />

      <DashboardStats dashboardData={dashboardData} />
      <CategoryBreakdown categoryData={dashboardData.categoryData} />

      {/* Add a link to the analytics page */}
      <div className="p-6 mb-8 text-center bg-white border border-gray-100 shadow-sm rounded-xl">
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          Charts & Analytics
        </h3>
        <p className="mb-4 text-gray-600">
          All charts have been moved to the Analytics page for a more
          comprehensive view of your agricultural data.
        </p>
        <a
          href="/analytics"
          className="inline-flex items-center px-4 py-2 text-white transition-colors bg-[#6A9C89] rounded-md hover:bg-[#5A8C79]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          View Analytics
        </a>
      </div>

      {/* Add the CategoryDetails component */}
      <CategoryDetails categoryData={dashboardData.categoryData} />

      <TopPerformers topPerformingItems={dashboardData.topPerformingItems} />

      <RecentHarvests recentHarvests={dashboardData.recentHarvests} />
    </div>
  );
}

// Helper function to format numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Dashboard skeleton component for loading state
function DashboardSkeleton() {
  return (
    <>
      {/* Dashboard Header Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="w-64 h-8 mb-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Production Trend Indicator Skeleton */}
        <div className="inline-flex items-center p-3 mt-4 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="w-5 h-5 mr-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-5 mr-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Top Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white shadow-md rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 p-2 mr-4 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="w-32 h-5 mb-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 bg-gray-200 rounded h-7 animate-pulse"></div>
              </div>
            </div>
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Category Breakdown Skeleton */}
      <div className="mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="p-6">
          <div className="w-48 h-6 mb-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 rounded-lg bg-gray-50"
              >
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 mr-3 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-20 mb-1 bg-gray-200 rounded h-7 animate-pulse"></div>
                <div className="w-32 h-4 mb-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j}>
                      <div className="flex justify-between mb-1">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Link Skeleton */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="w-40 h-6 mx-auto mb-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-3/4 h-4 mx-auto mb-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-10 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Category Details Skeleton */}
      <div className="mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="p-6">
          <div className="w-48 h-6 mb-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 rounded-lg bg-gray-50"
              >
                <div className="w-32 h-5 mb-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Items Skeleton */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-100 rounded-lg bg-gray-50"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 mr-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="mt-2">
                <div className="w-16 h-6 mb-1 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-2 mt-3 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Harvests Skeleton */}
      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="px-6 py-3 bg-gray-50">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
