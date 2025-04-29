"use client";

import { useState, useEffect } from "react";
import {
  farmerAPI,
  livestockAPI,
  operatorAPI,
  prefetchRouteData,
} from "./services/api";
import { RefreshCw } from "lucide-react";
import { useRefreshStore } from "./shared-store";

// Import analytics components
import AnalyticsHeader from "./analytics/analytics-header";
import CategoryAnalytics from "./analytics/category-analytics";
import { processRawData } from "./utils/data-processor";

function Analytics() {
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

  const [analyticsData, setAnalyticsData] = useState({
    totalProduction: 0,
    cropProduction: [],
    monthlyProduction: [],
    productionByBarangay: [],
    productionTrend: 0,
    totalFarmers: 0,
    totalArea: 0,
    categoryData: {
      livestock: { total: 0, items: [] },
      rice: { total: 0, items: [] },
      banana: { total: 0, items: [] },
      legumes: { total: 0, items: [] },
      spices: { total: 0, items: [] },
      fish: { total: 0, items: [] },
      vegetables: { total: 0, items: [] },
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
    setAnalyticsData(processedData);
  }, [rawData]);

  // Prefetch data for other routes
  useEffect(() => {
    prefetchRouteData("/inventory");
    prefetchRouteData("/dashboard");
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

  // Helper function to get available years from data
  const getAvailableYears = () => {
    const years = new Set();
    const currentYear = new Date().getFullYear();

    // Add current and previous year as defaults
    years.add(currentYear);
    years.add(currentYear - 1);

    // Extract years from rice data
    rawData.rice.forEach((rice) => {
      if (rice.harvest_date) {
        const year = new Date(rice.harvest_date).getFullYear();
        years.add(year);
      }
    });

    // Extract years from crops data
    rawData.crops.forEach((crop) => {
      if (crop.harvest_date) {
        const year = new Date(crop.harvest_date).getFullYear();
        years.add(year);
      }
    });

    // Extract years from high value crops data
    rawData.highValueCrops.forEach((crop) => {
      if (crop.harvest_date) {
        const year = new Date(crop.harvest_date).getFullYear();
        years.add(year);
      }
    });

    // Extract years from operators data
    rawData.operators.forEach((operator) => {
      if (operator.date_of_harvest) {
        const year = new Date(operator.date_of_harvest).getFullYear();
        years.add(year);
      }
    });

    // Extract years from livestock data
    rawData.livestock.forEach((livestock) => {
      if (livestock.created_at) {
        const year = new Date(livestock.created_at).getFullYear();
        years.add(year);
      }
    });

    // Convert Set to sorted array
    return Array.from(years).sort((a, b) => b - a);
  };

  if (loading && Object.values(rawData).every((arr) => arr.length === 0)) {
    return (
      <div className="min-h-screen p-5 bg-[#F5F7F9] overflow-y-auto">
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7F9]">
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

  // Define categories for analytics
  const categories = [
    { id: "rice", name: "Rice", icon: "🌾", unit: "tons" },
    { id: "livestock", name: "Livestock & Poultry", icon: "🐄", unit: "heads" },
    { id: "banana", name: "Banana", icon: "🍌", unit: "tons" },
    { id: "vegetables", name: "Vegetables", icon: "🥕", unit: "tons" },
    { id: "legumes", name: "Legumes", icon: "🌱", unit: "tons" },
    { id: "spices", name: "Spices", icon: "🌶️", unit: "tons" },
    { id: "fish", name: "Fish", icon: "🐟", unit: "tons" },
    {
      id: "highValueCrops",
      name: "High Value Crops",
      icon: "🌿",
      unit: "tons",
    },
  ];

  return (
    <div className="min-h-screen p-5 bg-[#F5F7F9] overflow-y-auto">
      <AnalyticsHeader
        lastRefresh={lastRefresh}
        productionTrend={analyticsData.productionTrend}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Category-specific analytics */}
      {categories.map((category) => (
        <CategoryAnalytics
          key={category.id}
          category={category}
          categoryData={analyticsData.categoryData[category.id]}
          rawData={rawData}
          availableYears={getAvailableYears()}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Analytics skeleton component for loading state
function AnalyticsSkeleton() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-5 mt-2 ml-4 bg-gray-200 rounded w-80 animate-pulse"></div>

        <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
          <div className="w-40 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        <div className="inline-flex items-center p-3 mt-4 bg-white border border-gray-100 rounded-lg">
          <div className="w-5 h-5 mr-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-5 mr-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center">
            <div className="w-5 h-5 mr-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Category Analytics Skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 mr-3 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="h-[280px] bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="h-[280px] bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default Analytics;
