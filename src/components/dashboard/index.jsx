"use client";

import { useState, useEffect, useCallback } from "react";
import {
  farmerAPI,
  livestockAPI,
  operatorAPI,
  prefetchRouteData,
} from "../services/api";
import { Activity, ArrowUp, ArrowDown, Calendar } from "lucide-react";

// Import dashboard components
import StatCards from "./components/StatCards";
import ChartSection from "./components/ChartSection";
import TopPerformingItems from "./components/TopPerformingItems";
import RecentHarvests from "./components/RecentHarvests";
import FarmerTypeDistribution from "./components/FarmerTypeDistribution";
import ProductionByBarangay from "./components/ProductionByBarangay";
import SecondaryStats from "./components/SecondaryStats";

// Import utility functions
import { processData, formatNumber } from "./utils/dataProcessing";
import { useThemeColors } from "./utils/themeColors";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
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

  // Get theme colors
  const colors = useThemeColors();

  // Get current date with month name and year - memoized
  const formattedDate = useCallback(() => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  }, []);

  // Fetch all data with AbortController for cleanup
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetchAllData(signal);

    return () => {
      controller.abort();
    };
  }, []);

  // Process raw data when it changes
  useEffect(() => {
    if (Object.values(rawData).every((arr) => arr.length === 0)) return;
    const processedData = processData(rawData);
    setDashboardData(processedData);
  }, [rawData]);

  // Prefetch data for other routes when dashboard is loaded
  useEffect(() => {
    // Prefetch inventory data when dashboard is loaded
    prefetchRouteData("/inventory");

    // Prefetch analytics data with a delay to avoid overwhelming the network
    const analyticsTimer = setTimeout(() => {
      prefetchRouteData("/analytics");
    }, 5000); // 5 second delay

    return () => {
      clearTimeout(analyticsTimer);
    };
  }, []);

  // Fetch all data using optimized approach with signal for cancellation
  const fetchAllData = async (signal) => {
    try {
      setLoading(true);

      // Use Promise.all to fetch data in parallel
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

      // Extract crops from farmers - process in batches for better performance
      const crops = [];
      const rice = [];
      const highValueCrops = [];

      // Create a map for faster farmer lookups
      const farmersMap = {};
      farmers.forEach((farmer) => {
        farmersMap[farmer.farmer_id] = farmer;
      });

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
            // Parse production_data if it exists and is a string
            let productionData = {};
            if (
              crop.production_data &&
              typeof crop.production_data === "string"
            ) {
              try {
                productionData = JSON.parse(crop.production_data);
              } catch (e) {
                // Silent error - continue with empty production data
                productionData = {};
              }
            } else if (
              crop.production_data &&
              typeof crop.production_data === "object"
            ) {
              productionData = crop.production_data;
            }

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
            // Parse production_data if it exists and is a string
            let productionData = {};
            if (
              crop.production_data &&
              typeof crop.production_data === "string"
            ) {
              try {
                productionData = JSON.parse(crop.production_data);
              } catch (e) {
                // Silent error - continue with empty production data
                productionData = {};
              }
            } else if (
              crop.production_data &&
              typeof crop.production_data === "object"
            ) {
              productionData = crop.production_data;
            }

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

      // Enrich livestock records with farmer information using the map for faster lookup
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

      // Enrich operators with farmer information using the map for faster lookup
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
      setRawData({
        farmers,
        livestock: enrichedLivestock,
        operators: enrichedOperators,
        crops,
        rice,
        highValueCrops,
      });

      setLoading(false);
    } catch (error) {
      // Only set error if not an abort error (which happens during cleanup)
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7F9]">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-medium text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-[#F5F7F9] min-h-screen overflow-y-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#333333]">
              Agricultural Production Dashboard
            </h2>
            <p className="text-[#666666] mt-1">
              Overview of all farmer types and production as of{" "}
              {formattedDate()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-[#6A9C89]" />
              <span className="text-sm font-medium">{formattedDate()}</span>
            </div>
          </div>
        </div>

        {/* Production Trend Indicator */}
        <div className="inline-flex items-center p-3 mt-4 bg-white border border-gray-100 rounded-lg shadow-sm">
          <Activity className="w-5 h-5 mr-2 text-[#6A9C89]" />
          <span className="mr-2 text-sm font-medium">Production Trend:</span>
          <div
            className={`flex items-center ${
              dashboardData.productionTrend >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {dashboardData.productionTrend >= 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            <span className="font-semibold">
              {Math.abs(dashboardData.productionTrend).toFixed(1)}%
            </span>
            <span className="ml-1 text-sm text-gray-600">
              from previous year
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <StatCards
        dashboardData={dashboardData}
        colors={colors}
        formatNumber={formatNumber}
      />

      {/* Farmer Type Distribution */}
      <FarmerTypeDistribution
        data={dashboardData.farmerTypeDistribution}
        colors={colors}
        formatNumber={formatNumber}
      />

      {/* Secondary Stats Row */}
      <SecondaryStats
        dashboardData={dashboardData}
        formatNumber={formatNumber}
      />

      {/* Charts Row */}
      <ChartSection
        dashboardData={dashboardData}
        colors={colors}
        formatNumber={formatNumber}
      />

      {/* Barangay Production Distribution */}
      <ProductionByBarangay
        data={dashboardData.productionByBarangay}
        colors={colors}
        formatNumber={formatNumber}
      />

      {/* Top Performing Items */}
      <TopPerformingItems
        items={dashboardData.topPerformingItems}
        formatNumber={formatNumber}
        getCategoryName={getCategoryName}
      />

      {/* Recent Harvests */}
      <RecentHarvests
        harvests={dashboardData.recentHarvests}
        formatNumber={formatNumber}
      />
    </div>
  );
}

// Helper function to get category name for display
function getCategoryName(category) {
  const categoryNames = {
    livestock: "Livestock & Poultry",
    rice: "Rice",
    banana: "Banana",
    legumes: "Legumes",
    spices: "Spices",
    fish: "Fish",
    highValueCrops: "High Value Crops",
  };

  return categoryNames[category] || category;
}

// Dashboard loading skeleton
function DashboardSkeleton() {
  return (
    <div className="p-5 bg-[#F5F7F9] min-h-screen overflow-y-auto">
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
              <div className="w-10 h-10 p-2 mr-4 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="w-32 h-5 mb-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 bg-gray-200 rounded h-7 animate-pulse"></div>
              </div>
            </div>
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Additional skeleton sections */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="w-48 h-6 mb-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-[320px] bg-gray-100 rounded animate-pulse"></div>
      </div>

      {/* Secondary Stats Row Skeleton */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-white border border-gray-100 shadow-md rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 p-2 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-32 h-8 mb-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
