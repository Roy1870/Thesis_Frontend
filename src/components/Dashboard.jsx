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
import { processRawData } from "./utils/data-processor";
import CategoryBreakdown from "./dashboard/category-breakdown";
import CategoryDetails from "./dashboard/category-details";
import GlobalFilter from "./dashboard/global-filter";

// Import the filter utilities
import { filterArrayByDate } from "./utils/filter-utils";

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

  // Global filter state
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [availableYears, setAvailableYears] = useState([]);

  // State to hold filtered data
  const [filteredData, setFilteredData] = useState({
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

  const [isFiltering, setIsFiltering] = useState(false);

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

    // Extract available years from the data
    const years = extractAvailableYears(rawData);
    setAvailableYears(years);
  }, [rawData]);

  // Initialize filtered data when dashboard data changes
  useEffect(() => {
    if (Object.keys(dashboardData).length === 0) return;

    // Initial filtering based on current filter settings
    updateFilteredData();
  }, [dashboardData]);

  // Add useEffect to immediately update filtered data when filters change
  useEffect(() => {
    console.log("Filters changed, updating filtered data...");
    updateFilteredData();
  }, [selectedYear, selectedMonth, rawData, dashboardData]);

  // Function to update filtered data
  const updateFilteredData = () => {
    setIsFiltering(true);

    // Small timeout to allow UI to update with loading state if needed
    setTimeout(() => {
      try {
        // If both filters are set to "All", use the original data
        if (selectedYear === "All" && selectedMonth === "All") {
          setFilteredData(dashboardData);
          setIsFiltering(false);
          return;
        }

        // Apply filters to raw data first
        const filteredRawData = {
          ...rawData,
          farmers: rawData.farmers, // Keep all farmers regardless of filter
          rice: filterArrayByDate(
            rawData.rice,
            selectedYear,
            selectedMonth,
            "harvest_date"
          ),
          crops: filterArrayByDate(
            rawData.crops,
            selectedYear,
            selectedMonth,
            "harvest_date"
          ),
          highValueCrops: filterArrayByDate(
            rawData.highValueCrops,
            selectedYear,
            selectedMonth,
            "harvest_date"
          ),
          livestock: filterArrayByDate(
            rawData.livestock,
            selectedYear,
            selectedMonth,
            "created_at"
          ),
          operators: filterArrayByDate(
            rawData.operators,
            selectedYear,
            selectedMonth,
            "date_of_harvest"
          ),
        };

        // Process the filtered raw data
        const filteredProcessedData = processRawData(filteredRawData, {
          year: selectedYear,
          month: selectedMonth,
        });

        // Update filtered data state with all dashboard data
        setFilteredData(filteredProcessedData);
      } catch (err) {
        console.error("Error during filtering:", err);
        // If filtering fails, use unfiltered data
        setFilteredData(dashboardData);
      } finally {
        setIsFiltering(false);
      }
    }, 10); // Very small timeout just to let the UI thread breathe
  };

  // Extract available years from raw data
  const extractAvailableYears = (data) => {
    const years = new Set();
    const currentYear = new Date().getFullYear();

    // Add current and previous year as defaults
    years.add(currentYear);
    years.add(currentYear - 1);

    // Extract years from various data sources
    const extractYearFromDate = (dateString) => {
      if (!dateString) return;
      try {
        const year = new Date(dateString).getFullYear();
        if (!isNaN(year)) years.add(year);
      } catch (e) {
        // Ignore invalid dates
      }
    };

    // Process farmers data
    data.farmers.forEach((farmer) => {
      extractYearFromDate(farmer.created_at);
    });

    // Process crops data
    data.crops.forEach((crop) => {
      extractYearFromDate(crop.harvest_date || crop.created_at);
    });

    // Process rice data
    data.rice.forEach((rice) => {
      extractYearFromDate(rice.harvest_date || rice.created_at);
    });

    // Process livestock data
    data.livestock.forEach((livestock) => {
      extractYearFromDate(livestock.created_at);
    });

    // Process high value crops data
    data.highValueCrops.forEach((crop) => {
      extractYearFromDate(crop.harvest_date || crop.created_at);
    });

    // Convert Set to sorted array (descending)
    return Array.from(years).sort((a, b) => b - a);
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    // This is a placeholder - in a real app you'd return actual icons
    // Return a placeholder based on category
    return category;
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      livestock: "#4CAF50",
      rice: "#FFC107",
      banana: "#FF9800",
      legumes: "#8BC34A",
      spices: "#FF5722",
      fish: "#2196F3",
      highValueCrops: "#9C27B0",
    };

    return colors[category] || "#6A9C89"; // Default color
  };

  // Prefetch data for other routes
  useEffect(() => {
    try {
      prefetchRouteData("/inventory").catch((err) => {
        console.warn("Failed to prefetch inventory data:", err);
      });

      const analyticsTimer = setTimeout(() => {
        prefetchRouteData("/analytics").catch((err) => {
          console.warn("Failed to prefetch analytics data:", err);
        });
      }, 5000);

      return () => {
        clearTimeout(analyticsTimer);
      };
    } catch (err) {
      console.warn("Error in prefetch setup:", err);
    }
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

      // Fetch data in parallel with error handling for each request
      const results = await Promise.allSettled([
        farmerAPI.getAllFarmers(1, 1000, "", [], signal),
        livestockAPI.getAllLivestockRecords(1, 1000, "", signal),
        operatorAPI.getAllOperators(1, 1000, "", signal),
      ]);

      // Process results with fallbacks for failed requests
      const farmers =
        results[0].status === "fulfilled"
          ? Array.isArray(results[0].value)
            ? results[0].value
            : results[0].value?.data || []
          : rawData.farmers.length > 0
          ? rawData.farmers
          : [];

      const livestock =
        results[1].status === "fulfilled"
          ? Array.isArray(results[1].value)
            ? results[1].value
            : results[1].value?.data || []
          : rawData.livestock.length > 0
          ? rawData.livestock
          : [];

      const operators =
        results[2].status === "fulfilled"
          ? Array.isArray(results[2].value)
            ? results[2].value
            : results[2].value?.data || []
          : rawData.operators.length > 0
          ? rawData.operators
          : [];

      // Log any failed requests
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const endpoints = ["farmers", "livestock", "operators"];
          console.warn(
            `Failed to fetch ${endpoints[index]} data:`,
            result.reason
          );
        }
      });

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

  // Handle global filter change
  const handleGlobalFilterChange = ({ year, month }) => {
    console.log(`Global filter changed: Year=${year}, Month=${month}`);
    // The state is already updated by the child component
    // The useEffect above will handle the filtering
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

      {/* Global Filter */}
      <GlobalFilter
        availableYears={availableYears}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onFilterChange={handleGlobalFilterChange}
      />

      {/* Filter Status Indicator */}
      {(selectedYear !== "All" || selectedMonth !== "All") && (
        <div
          className={`p-4 mb-6 ${
            isFiltering
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          } border rounded-lg transition-colors duration-300`}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 mr-2 ${
                isFiltering ? "text-green-600" : "text-yellow-600"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p
              className={`text-sm ${
                isFiltering ? "text-green-700" : "text-yellow-700"
              }`}
            >
              <span className="font-medium">
                {isFiltering ? "Updating..." : "Filter Active:"}
              </span>{" "}
              {!isFiltering && (
                <>
                  Currently showing data for{" "}
                  {selectedYear === "All"
                    ? "all years"
                    : `year ${selectedYear}`}
                  {selectedMonth === "All" ? "" : `, month ${selectedMonth}`}.
                  All dashboard sections are filtered.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Pass the filtered data to DashboardStats */}
      <DashboardStats dashboardData={filteredData} />
      <CategoryBreakdown categoryData={filteredData.categoryData} />

      {/* Add the CategoryDetails component */}
      <CategoryDetails categoryData={filteredData.categoryData} />

      <TopPerformers topPerformingItems={filteredData.topPerformingItems} />
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

      {/* Global Filter Skeleton */}
      <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
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
    </>
  );
}
