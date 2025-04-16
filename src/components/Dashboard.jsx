"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  Sprout,
  Loader2,
  Calendar,
  Award,
  ArrowUp,
  ArrowDown,
  Activity,
  Fish,
  MilkIcon as Cow,
} from "lucide-react";

import {
  farmerAPI,
  livestockAPI,
  operatorAPI,
  prefetchRouteData,
} from "./services/api";

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
      livestock: {
        total: 0,
        items: [],
      },
      rice: {
        total: 0,
        items: [],
      },
      banana: {
        total: 0,
        items: [],
      },
      legumes: {
        total: 0,
        items: [],
      },
      spices: {
        total: 0,
        items: [],
      },
      fish: {
        total: 0,
        items: [],
      },
      highValueCrops: {
        total: 0,
        items: [],
      },
    },
  });

  // Theme colors - memoized to prevent recreating on each render
  const colors = useMemo(
    () => ({
      primary: "#6A9C89",
      primaryLight: "#8DB5A5",
      primaryDark: "#4A7C69",
      secondary: "#E6F5E4",
      accent: "#4F6F7D",
      accentLight: "#6F8F9D",
      error: "#D32F2F",
      warning: "#FFA000",
      success: "#388E3C",
      info: "#0288D1",
      textDark: "#333333",
      textLight: "#666666",
      border: "#E0E0E0",
      background: "#F5F7F9",
      cardBg: "#FFFFFF",
      raiser: "#8884d8",
      operator: "#82ca9d",
      grower: "#ffc658",
    }),
    []
  );

  // Colors for pie chart - memoized
  const COLORS = useMemo(
    () => [
      colors.primary,
      colors.accent,
      colors.success,
      colors.warning,
      colors.info,
      "#8884d8",
      colors.primaryLight,
      colors.accentLight,
    ],
    [colors]
  );

  // Get current date with month name and year - memoized
  const formattedDate = useMemo(() => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  }, []);

  // Format number with commas - memoized
  const formatNumber = useCallback((num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    processData();
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

  // Process all data for dashboard - memoized to prevent unnecessary recalculations
  const processData = useCallback(() => {
    try {
      // Process data for each category
      const categoryData = {
        livestock: processLivestockData(),
        rice: processRiceData(),
        banana: processBananaData(),
        legumes: processLegumesData(),
        spices: processSpicesData(),
        fish: processFishData(),
        highValueCrops: processHighValueCropsData(),
      };

      // Calculate total production across all categories
      const totalProduction = Object.values(categoryData).reduce(
        (sum, category) => sum + category.total,
        0
      );

      // Process data for crop production pie chart
      const cropProduction = [];
      Object.entries(categoryData).forEach(([category, data]) => {
        if (data.total > 0) {
          cropProduction.push({
            name: getCategoryName(category),
            value: data.total,
          });
        }
      });

      // Process data for monthly production
      const monthlyProductionMap = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      };

      // Add rice production to monthly data
      rawData.rice.forEach((rice) => {
        if (rice.harvest_date) {
          const harvestDate = new Date(rice.harvest_date);
          const month = harvestDate.toLocaleString("en-US", { month: "short" });
          const production = Number.parseFloat(
            rice.production || rice.yield_amount || 0
          );
          if (!isNaN(production) && production > 0) {
            monthlyProductionMap[month] =
              (monthlyProductionMap[month] || 0) + production;
          }
        }
      });

      // Add crop production to monthly data
      rawData.crops.forEach((crop) => {
        if (crop.harvest_date) {
          const harvestDate = new Date(crop.harvest_date);
          const month = harvestDate.toLocaleString("en-US", { month: "short" });
          const production = Number.parseFloat(
            crop.yield_amount || crop.production || crop.quantity || 0
          );
          if (!isNaN(production) && production > 0) {
            monthlyProductionMap[month] =
              (monthlyProductionMap[month] || 0) + production;
          }
        }
      });

      // Add high value crops to monthly data
      rawData.highValueCrops.forEach((crop) => {
        if (crop.harvest_date) {
          const harvestDate = new Date(crop.harvest_date);
          const month = harvestDate.toLocaleString("en-US", { month: "short" });
          const production = Number.parseFloat(
            crop.yield_amount || crop.production || crop.quantity || 0
          );
          if (!isNaN(production) && production > 0) {
            monthlyProductionMap[month] =
              (monthlyProductionMap[month] || 0) + production;
          }
        }
      });

      // Add fish production to monthly data
      rawData.operators.forEach((operator) => {
        if (operator.date_of_harvest) {
          const harvestDate = new Date(operator.date_of_harvest);
          const month = harvestDate.toLocaleString("en-US", { month: "short" });
          const production = Number.parseFloat(operator.production_kg || 0);
          if (!isNaN(production) && production > 0) {
            monthlyProductionMap[month] =
              (monthlyProductionMap[month] || 0) + production;
          }
        }
      });

      // Convert monthly production to array for chart
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyProduction = monthOrder.map((month) => ({
        name: month,
        production: monthlyProductionMap[month] || 0,
      }));

      // Process data for production by barangay
      const barangayProductionMap = {};

      // Add all sources of production to barangay map
      const addToBarangayMap = (item, production) => {
        if (isNaN(production) || production <= 0) return;

        const barangay = item.barangay || "Unknown";
        barangayProductionMap[barangay] =
          (barangayProductionMap[barangay] || 0) + production;
      };

      // Process all data sources in parallel using batch processing
      // Rice production
      for (let i = 0; i < rawData.rice.length; i++) {
        const rice = rawData.rice[i];
        const production = Number.parseFloat(
          rice.production || rice.yield_amount || 0
        );
        addToBarangayMap(rice, production);
      }

      // Crop production
      for (let i = 0; i < rawData.crops.length; i++) {
        const crop = rawData.crops[i];
        const production = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        addToBarangayMap(crop, production);
      }

      // High value crop production
      for (let i = 0; i < rawData.highValueCrops.length; i++) {
        const crop = rawData.highValueCrops[i];
        const production = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        addToBarangayMap(crop, production);
      }

      // Livestock production
      for (let i = 0; i < rawData.livestock.length; i++) {
        const livestock = rawData.livestock[i];
        const quantity = Number.parseInt(livestock.quantity || 0);
        addToBarangayMap(livestock, quantity);
      }

      // Operator production
      for (let i = 0; i < rawData.operators.length; i++) {
        const operator = rawData.operators[i];
        const production = Number.parseFloat(operator.production_kg || 0);
        addToBarangayMap(operator, production);
      }

      // Convert barangay production to array for chart
      const productionByBarangay = Object.entries(barangayProductionMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 barangays

      // Get top performing crops
      const allItems = [];

      // Combine all items from all categories
      Object.entries(categoryData).forEach(([category, data]) => {
        data.items.forEach((item) => {
          // Add category information to each item
          allItems.push({
            ...item,
            category: category, // Add category field to track the source
          });
        });
      });

      // Sort by value and take top 5
      const topPerformingItems = allItems
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Calculate total area
      let totalArea = 0;

      // Add rice area
      rawData.rice.forEach((rice) => {
        const area = Number.parseFloat(rice.area_harvested || rice.area || 0);
        if (!isNaN(area) && area > 0) {
          totalArea += area;
        }
      });

      // Add crop area
      rawData.crops.forEach((crop) => {
        const area = Number.parseFloat(crop.area_hectare || crop.area || 0);
        if (!isNaN(area) && area > 0) {
          totalArea += area;
        }
      });

      // Add high value crop area
      rawData.highValueCrops.forEach((crop) => {
        const area = Number.parseFloat(crop.area_hectare || crop.area || 0);
        if (!isNaN(area) && area > 0) {
          totalArea += area;
        }
      });

      // Add operator area
      rawData.operators.forEach((operator) => {
        const area =
          Number.parseFloat(operator.productive_area_sqm || 0) / 10000; // Convert sqm to hectares
        if (!isNaN(area) && area > 0) {
          totalArea += area;
        }
      });

      // Calculate production trend (year over year)
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      let currentYearProduction = 0;
      let lastYearProduction = 0;

      // Function to add to yearly production
      const addToYearlyProduction = (date, production) => {
        if (!date || isNaN(production) || production <= 0) return;

        const year = new Date(date).getFullYear();
        if (year === currentYear) {
          currentYearProduction += production;
        } else if (year === lastYear) {
          lastYearProduction += production;
        }
      };

      // Process all data sources in parallel for yearly production
      // Rice production
      for (let i = 0; i < rawData.rice.length; i++) {
        const rice = rawData.rice[i];
        const production = Number.parseFloat(
          rice.production || rice.yield_amount || 0
        );
        addToYearlyProduction(rice.harvest_date || rice.created_at, production);
      }

      // Crop production
      for (let i = 0; i < rawData.crops.length; i++) {
        const crop = rawData.crops[i];
        const production = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        addToYearlyProduction(crop.harvest_date || crop.created_at, production);
      }

      // High value crop production
      for (let i = 0; i < rawData.highValueCrops.length; i++) {
        const crop = rawData.highValueCrops[i];
        const production = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        addToYearlyProduction(crop.harvest_date || crop.created_at, production);
      }

      // Operator production
      for (let i = 0; i < rawData.operators.length; i++) {
        const operator = rawData.operators[i];
        const production = Number.parseFloat(operator.production_kg || 0);
        addToYearlyProduction(
          operator.date_of_harvest || operator.created_at,
          production
        );
      }

      // Calculate production trend percentage
      const productionTrend =
        lastYearProduction > 0
          ? ((currentYearProduction - lastYearProduction) /
              lastYearProduction) *
            100
          : 0;

      // Prepare recent harvests data
      const allHarvests = [];

      // Add rice harvests
      rawData.rice.forEach((rice) => {
        const production = Number.parseFloat(
          rice.production || rice.yield_amount || 0
        );
        if (production > 0) {
          allHarvests.push({
            id: rice.id || Math.random().toString(),
            farmer_id: rice.farmer_id,
            farmer_name: rice.farmer_name,
            type: "Grower",
            crop_type: rice.variety || rice.seed_type || "Rice",
            yield_amount: production,
            area: Number.parseFloat(rice.area_harvested || rice.area || 0),
            yield_per_hectare:
              rice.area_harvested > 0
                ? (
                    production / Number.parseFloat(rice.area_harvested || 1)
                  ).toFixed(2)
                : "N/A",
            harvest_date: new Date(
              rice.harvest_date || rice.created_at || new Date()
            ),
            barangay: rice.barangay,
          });
        }
      });

      // Add crop harvests
      rawData.crops.forEach((crop) => {
        const yield_amount = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        if (yield_amount > 0) {
          allHarvests.push({
            id: crop.id || Math.random().toString(),
            farmer_id: crop.farmer_id,
            farmer_name: crop.farmer_name,
            type: "Grower",
            crop_type: crop.crop_type || crop.crop_value || "Crop",
            yield_amount: yield_amount,
            area: Number.parseFloat(crop.area_hectare || crop.area || 0),
            yield_per_hectare:
              crop.area_hectare > 0
                ? (
                    yield_amount / Number.parseFloat(crop.area_hectare || 1)
                  ).toFixed(2)
                : "N/A",
            harvest_date: new Date(
              crop.harvest_date || crop.created_at || new Date()
            ),
            barangay: crop.barangay,
          });
        }
      });

      // Add high value crop harvests
      rawData.highValueCrops.forEach((crop) => {
        const yield_amount = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        if (yield_amount > 0) {
          allHarvests.push({
            id: crop.id || Math.random().toString(),
            farmer_id: crop.farmer_id,
            farmer_name: crop.farmer_name,
            type: "Grower",
            crop_type: crop.crop_value || "High Value Crop",
            yield_amount: yield_amount,
            area: Number.parseFloat(crop.area_hectare || crop.area || 0),
            yield_per_hectare:
              crop.area_hectare > 0
                ? (
                    yield_amount / Number.parseFloat(crop.area_hectare || 1)
                  ).toFixed(2)
                : "N/A",
            harvest_date: new Date(
              crop.harvest_date || crop.created_at || new Date()
            ),
            barangay: crop.barangay,
          });
        }
      });

      // Add operator harvests
      rawData.operators.forEach((operator) => {
        const production = Number.parseFloat(operator.production_kg || 0);
        if (production > 0) {
          allHarvests.push({
            id: operator.id || Math.random().toString(),
            farmer_id: operator.farmer_id,
            farmer_name: operator.farmer_name,
            type: "Operator",
            crop_type: operator.cultured_species || "Fish",
            yield_amount: production,
            area: Number.parseFloat(operator.productive_area_sqm || 0) / 10000, // Convert sqm to hectares
            yield_per_hectare:
              operator.productive_area_sqm > 0
                ? (
                    (production * 10000) /
                    Number.parseFloat(operator.productive_area_sqm || 1)
                  ).toFixed(2)
                : "N/A",
            harvest_date: new Date(
              operator.date_of_harvest || operator.created_at || new Date()
            ),
            barangay: operator.barangay,
          });
        }
      });

      // Sort harvests by date (most recent first) and take top 5
      const recentHarvests = allHarvests
        .sort((a, b) => b.harvest_date - a.harvest_date)
        .slice(0, 5);

      // Process farmer type distribution
      const farmerTypeCount = {
        Raiser: 0,
        Operator: 0,
        Grower: 0,
      };

      // Create lookup sets for faster checking
      const livestockFarmerIds = new Set(
        rawData.livestock.map((record) => record.farmer_id)
      );

      const operatorFarmerIds = new Set(
        rawData.operators.map((record) => record.farmer_id)
      );

      const cropFarmerIds = new Set([
        ...rawData.crops.map((record) => record.farmer_id),
        ...rawData.rice.map((record) => record.farmer_id),
        ...rawData.highValueCrops.map((record) => record.farmer_id),
      ]);

      // Count farmers by type using the lookup sets
      rawData.farmers.forEach((farmer) => {
        if (livestockFarmerIds.has(farmer.farmer_id)) farmerTypeCount.Raiser++;
        if (operatorFarmerIds.has(farmer.farmer_id)) farmerTypeCount.Operator++;
        if (cropFarmerIds.has(farmer.farmer_id)) farmerTypeCount.Grower++;
      });

      // Convert to array for chart
      const farmerTypeDistribution = Object.entries(farmerTypeCount)
        .map(([name, value]) => ({ name, value }))
        .filter((item) => item.value > 0);

      // Update dashboard data
      setDashboardData({
        totalProduction,
        cropProduction,
        monthlyProduction,
        productionByBarangay,
        topPerformingItems,
        recentHarvests,
        productionTrend,
        totalFarmers: rawData.farmers.length,
        totalArea,
        farmerTypeDistribution,
        categoryData,
      });
    } catch (error) {
      console.error("Error processing data:", error);
      setError("Error processing data: " + error.message);
    }
  }, [rawData]);

  // Process livestock data - memoized
  const processLivestockData = useCallback(() => {
    const livestock = rawData.livestock || [];
    const animalTypeMap = {};

    livestock.forEach((record) => {
      const animalType = record.animal_type || "Unknown";
      const quantity = Number.parseInt(record.quantity) || 0;

      animalTypeMap[animalType] = (animalTypeMap[animalType] || 0) + quantity;
    });

    const items = Object.entries(animalTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.livestock]);

  // Process rice data - memoized
  const processRiceData = useCallback(() => {
    const riceData = rawData.rice || [];
    const varietyMap = {};

    riceData.forEach((rice) => {
      // Use variety if available, otherwise use seed_type
      const variety = rice.variety || rice.seed_type || "Unknown Rice";

      // Try to get production from different possible fields
      let production = 0;
      if (rice.production && !isNaN(Number.parseFloat(rice.production))) {
        production = Number.parseFloat(rice.production);
      } else if (
        rice.yield_amount &&
        !isNaN(Number.parseFloat(rice.yield_amount))
      ) {
        production = Number.parseFloat(rice.yield_amount);
      } else if (rice.yield && !isNaN(Number.parseFloat(rice.yield))) {
        production = Number.parseFloat(rice.yield);
      }

      varietyMap[variety] = (varietyMap[variety] || 0) + production;
    });

    const items = Object.entries(varietyMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.rice]);

  // Process banana data - memoized
  const processBananaData = useCallback(() => {
    const crops = rawData.crops || [];
    const bananaVarietyMap = {};

    // Filter banana crops
    const bananaCrops = crops.filter(
      (crop) =>
        (crop.crop_type && crop.crop_type.toLowerCase().includes("banana")) ||
        (crop.crop_value && crop.crop_value.toLowerCase().includes("banana")) ||
        isBananaVariety(crop.crop_type) ||
        isBananaVariety(crop.crop_value)
    );

    bananaCrops.forEach((crop) => {
      // Get variety from crop_value, variety_clone, or from parsed production_data
      let variety = crop.crop_value || crop.variety_clone || "Unknown Banana";

      // Try to parse production_data if it's a string
      let productionData = {};
      if (crop.production_data && typeof crop.production_data === "string") {
        try {
          productionData = JSON.parse(crop.production_data);
          // If crop value is in production_data, use it
          if (productionData.crop) {
            variety = productionData.crop;
          }
        } catch (e) {
          // Silent error - continue with empty production data
          productionData = {};
        }
      } else if (
        crop.production_data &&
        typeof crop.production_data === "object"
      ) {
        productionData = crop.production_data;
        if (productionData.crop) {
          variety = productionData.crop;
        }
      }

      // Try to get quantity from different possible fields
      let production = 0;

      // First check if quantity is in production_data
      if (
        productionData.quantity &&
        !isNaN(Number.parseFloat(productionData.quantity))
      ) {
        production = Number.parseFloat(productionData.quantity);
      }
      // Then check other possible fields
      else if (crop.quantity && !isNaN(Number.parseFloat(crop.quantity))) {
        production = Number.parseFloat(crop.quantity);
      } else if (
        crop.yield_amount &&
        !isNaN(Number.parseFloat(crop.yield_amount))
      ) {
        production = Number.parseFloat(crop.yield_amount);
      } else if (
        crop.production &&
        !isNaN(Number.parseFloat(crop.production))
      ) {
        production = Number.parseFloat(crop.production);
      }

      if (variety && production > 0) {
        bananaVarietyMap[variety] =
          (bananaVarietyMap[variety] || 0) + production;
      }
    });

    const items = Object.entries(bananaVarietyMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.crops]);

  // Process legumes data - memoized
  const processLegumesData = useCallback(() => {
    const crops = rawData.crops || [];
    const legumesTypeMap = {};

    // Filter legume crops
    const legumeCrops = crops.filter(
      (crop) =>
        (crop.crop_type && isLegume(crop.crop_type.toLowerCase())) ||
        (crop.crop_value && isLegume(crop.crop_value.toLowerCase()))
    );

    legumeCrops.forEach((crop) => {
      // Get crop type from crop_value, crop_type, or from parsed production_data
      let type = crop.crop_value || crop.crop_type || "Unknown Legume";

      // Try to parse production_data if it's a string
      let productionData = {};
      if (crop.production_data && typeof crop.production_data === "string") {
        try {
          productionData = JSON.parse(crop.production_data);
          // If crop value is in production_data, use it
          if (productionData.crop) {
            type = productionData.crop;
          }
        } catch (e) {
          // Silent error - continue with empty production data
          productionData = {};
        }
      } else if (
        crop.production_data &&
        typeof crop.production_data === "object"
      ) {
        productionData = crop.production_data;
        if (productionData.crop) {
          type = productionData.crop;
        }
      }

      // Try to get quantity from different possible fields
      let production = 0;

      // First check if quantity is in production_data
      if (
        productionData.quantity &&
        !isNaN(Number.parseFloat(productionData.quantity))
      ) {
        production = Number.parseFloat(productionData.quantity);
      }
      // Then check other possible fields
      else if (crop.quantity && !isNaN(Number.parseFloat(crop.quantity))) {
        production = Number.parseFloat(crop.quantity);
      } else if (
        crop.yield_amount &&
        !isNaN(Number.parseFloat(crop.yield_amount))
      ) {
        production = Number.parseFloat(crop.yield_amount);
      } else if (
        crop.production &&
        !isNaN(Number.parseFloat(crop.production))
      ) {
        production = Number.parseFloat(crop.production);
      }

      if (type && production > 0) {
        legumesTypeMap[type] = (legumesTypeMap[type] || 0) + production;
      }
    });

    const items = Object.entries(legumesTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.crops]);

  // Process spices data - memoized
  const processSpicesData = useCallback(() => {
    const crops = rawData.crops || [];
    const spicesTypeMap = {};

    // Filter spice crops
    const spiceCrops = crops.filter(
      (crop) =>
        (crop.crop_type && isSpice(crop.crop_type.toLowerCase())) ||
        (crop.crop_value && isSpice(crop.crop_value.toLowerCase()))
    );

    spiceCrops.forEach((crop) => {
      // Get crop type from crop_value, crop_type, or from parsed production_data
      let type = crop.crop_value || crop.crop_type || "Unknown Spice";

      // Try to parse production_data if it's a string
      let productionData = {};
      if (crop.production_data && typeof crop.production_data === "string") {
        try {
          productionData = JSON.parse(crop.production_data);
          // If crop value is in production_data, use it
          if (productionData.crop) {
            type = productionData.crop;
          }
        } catch (e) {
          // Silent error - continue with empty production data
          productionData = {};
        }
      } else if (
        crop.production_data &&
        typeof crop.production_data === "object"
      ) {
        productionData = crop.production_data;
        if (productionData.crop) {
          type = productionData.crop;
        }
      }

      // Try to get quantity from different possible fields
      let production = 0;

      // First check if quantity is in production_data
      if (
        productionData.quantity &&
        !isNaN(Number.parseFloat(productionData.quantity))
      ) {
        production = Number.parseFloat(productionData.quantity);
      }
      // Then check other possible fields
      else if (crop.quantity && !isNaN(Number.parseFloat(crop.quantity))) {
        production = Number.parseFloat(crop.quantity);
      } else if (
        crop.yield_amount &&
        !isNaN(Number.parseFloat(crop.yield_amount))
      ) {
        production = Number.parseFloat(crop.yield_amount);
      } else if (
        crop.production &&
        !isNaN(Number.parseFloat(crop.production))
      ) {
        production = Number.parseFloat(crop.production);
      }

      if (type && production > 0) {
        spicesTypeMap[type] = (spicesTypeMap[type] || 0) + production;
      }
    });

    const items = Object.entries(spicesTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.crops]);

  // Process fish data - memoized
  const processFishData = useCallback(() => {
    // Combine data from crops and operators (for fish)
    const crops = rawData.crops || [];
    const operators = rawData.operators || [];
    const fishTypeMap = {};

    // Filter fish crops
    const fishCrops = crops.filter(
      (crop) =>
        (crop.crop_type && isFish(crop.crop_type.toLowerCase())) ||
        (crop.crop_value && isFish(crop.crop_value.toLowerCase()))
    );

    fishCrops.forEach((crop) => {
      const type = crop.crop_value || crop.crop_type || "Unknown Fish";
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );

      fishTypeMap[type] = (fishTypeMap[type] || 0) + production;
    });

    // Add fish data from operators
    operators.forEach((operator) => {
      if (operator.cultured_species) {
        const species = operator.cultured_species;
        const production = Number.parseFloat(operator.production_kg || 0);

        fishTypeMap[species] = (fishTypeMap[species] || 0) + production;
      }
    });

    const items = Object.entries(fishTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.crops, rawData.operators]);

  // Process high value crops data - memoized
  const processHighValueCropsData = useCallback(() => {
    const highValueCrops = rawData.highValueCrops || [];
    const cropTypeMap = {};

    highValueCrops.forEach((crop) => {
      // Get crop type from crop_value or from parsed production_data
      let cropType = crop.crop_value || "Unknown HVC";

      // Try to parse production_data if it's a string
      let productionData = {};
      if (crop.production_data && typeof crop.production_data === "string") {
        try {
          productionData = JSON.parse(crop.production_data);
          // If crop value is in production_data, use it
          if (productionData.crop) {
            cropType = productionData.crop;
          }
        } catch (e) {
          // Silent error - continue with empty production data
          productionData = {};
        }
      } else if (
        crop.production_data &&
        typeof crop.production_data === "object"
      ) {
        productionData = crop.production_data;
        if (productionData.crop) {
          cropType = productionData.crop;
        }
      }

      // Try to get quantity from different possible fields
      let quantity = 0;

      // First check if quantity is in production_data
      if (
        productionData.quantity &&
        !isNaN(Number.parseFloat(productionData.quantity))
      ) {
        quantity = Number.parseFloat(productionData.quantity);
      }
      // Then check other possible fields
      else if (crop.quantity && !isNaN(Number.parseFloat(crop.quantity))) {
        quantity = Number.parseFloat(crop.quantity);
      } else if (
        crop.yield_amount &&
        !isNaN(Number.parseFloat(crop.yield_amount))
      ) {
        quantity = Number.parseFloat(crop.yield_amount);
      } else if (
        crop.production &&
        !isNaN(Number.parseFloat(crop.production))
      ) {
        quantity = Number.parseFloat(crop.production);
      }

      if (cropType && quantity > 0) {
        cropTypeMap[cropType] = (cropTypeMap[cropType] || 0) + quantity;
      }
    });

    const items = Object.entries(cropTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.highValueCrops]);

  // Helper functions to categorize crops - memoized
  const isBananaVariety = useCallback((cropType) => {
    if (!cropType) return false;
    const bananaVarieties = [
      "lakatan",
      "latundan",
      "saba",
      "cavendish",
      "señorita",
    ];
    return bananaVarieties.some((variety) =>
      cropType.toLowerCase().includes(variety)
    );
  }, []);

  const isLegume = useCallback((cropType) => {
    if (!cropType) return false;
    const legumes = [
      "mung bean",
      "peanut",
      "soybean",
      "cowpea",
      "pigeon pea",
      "beans",
      "legume",
      "legumes",
    ];
    return (
      cropType.toLowerCase() === "legumes" ||
      legumes.some((legume) => cropType.toLowerCase().includes(legume))
    );
  }, []);

  const isSpice = useCallback((cropType) => {
    if (!cropType) return false;
    const spices = [
      "ginger",
      "turmeric",
      "pepper",
      "chili",
      "lemongrass",
      "spice",
      "spices",
    ];
    return (
      cropType.toLowerCase() === "spices" ||
      spices.some((spice) => cropType.toLowerCase().includes(spice))
    );
  }, []);

  const isFish = useCallback((cropType) => {
    if (!cropType) return false;
    const fishTypes = [
      "tilapia",
      "milkfish",
      "catfish",
      "carp",
      "shrimp",
      "fish",
    ];
    return fishTypes.some((fish) => cropType.includes(fish));
  }, []);

  // Get category name for display - memoized
  const getCategoryName = useCallback((category) => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 mr-2 text-green-500 animate-spin" />
        <span className="ml-2">Loading production data...</span>
      </div>
    );
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
              Overview of all farmer types and production as of {formattedDate}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-[#6A9C89]" />
              <span className="text-sm font-medium">{formattedDate}</span>
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
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-[#6A9C89] to-[#4A7C69] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center mb-4">
            <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white opacity-80">
                Total Production
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(dashboardData.totalProduction.toFixed(2))}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white opacity-80">
            Metric tons of produce across all categories
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#4F6F7D] to-[#3A5A68] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center mb-4">
            <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white opacity-80">
                Average Yield
              </p>
              <p className="text-2xl font-bold">
                {dashboardData.recentHarvests.length > 0
                  ? (
                      dashboardData.recentHarvests.reduce(
                        (sum, harvest) =>
                          sum +
                          (harvest.yield_per_hectare !== "N/A"
                            ? Number.parseFloat(harvest.yield_per_hectare)
                            : 0),
                        0
                      ) /
                      dashboardData.recentHarvests.filter(
                        (h) => h.yield_per_hectare !== "N/A"
                      ).length
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white opacity-80">
            Tons per hectare across all farms
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center mb-4">
            <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white opacity-80">
                Total Area
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(dashboardData.totalArea.toFixed(2))}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white opacity-80">
            Hectares of cultivated land and water
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0288D1] to-[#0277BD] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center mb-4">
            <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              {dashboardData.topPerformingItems &&
              dashboardData.topPerformingItems.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-white opacity-80">
                    Top{" "}
                    {getCategoryName(
                      dashboardData.topPerformingItems[0].category
                    ).replace(" & Poultry", "")}
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.topPerformingItems[0].name}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-white opacity-80">
                    Top Producer
                  </p>
                  <p className="text-2xl font-bold">None</p>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-white opacity-80">
            {dashboardData.topPerformingItems &&
            dashboardData.topPerformingItems.length > 0
              ? `${formatNumber(
                  dashboardData.topPerformingItems[0].value.toFixed(2)
                )} ${
                  dashboardData.topPerformingItems[0].category === "livestock"
                    ? "heads"
                    : "tons"
                }`
              : "No production data available"}
          </p>
        </div>
      </div>

      {/* Farmer Type Distribution */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">
          Farmer Type Distribution
        </h4>
        {dashboardData.farmerTypeDistribution &&
        dashboardData.farmerTypeDistribution.length > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.farmerTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.farmerTypeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Raiser"
                          ? colors.raiser
                          : entry.name === "Operator"
                          ? colors.operator
                          : colors.grower
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${formatNumber(value)} farmers`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-gray-400">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-lg font-medium">No farmer type data available</p>
            <p className="mt-2 text-sm text-gray-400">
              Add farmer data to see distribution
            </p>
          </div>
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Registered Farmers
            </h3>
            <div className="p-2 rounded-lg bg-blue-50">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(dashboardData.totalFarmers)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Active agricultural producers
          </p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Livestock Count
            </h3>
            <div className="p-2 rounded-lg bg-purple-50">
              <Cow className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(dashboardData.categoryData.livestock.total)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Total heads of livestock and poultry
          </p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Aquaculture Production
            </h3>
            <div className="p-2 rounded-lg bg-cyan-50">
              <Fish className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(dashboardData.categoryData.fish.total.toFixed(2))}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Metric tons of fish and seafood
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <h4 className="mb-6 text-lg font-semibold text-gray-800">
            Production Distribution
          </h4>
          {dashboardData.cropProduction.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.cropProduction}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.cropProduction.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      name === "Livestock & Poultry"
                        ? `${formatNumber(value)} heads`
                        : `${formatNumber(value.toFixed(2))} tons`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "8px",
                      border: "1px solid #E0E0E0",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[320px] text-gray-400">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-lg font-medium">
                No production data available
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Add production data to see distribution
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <h4 className="mb-6 text-lg font-semibold text-gray-800">
            Monthly Production Trend
          </h4>
          {dashboardData.monthlyProduction.some(
            (item) => item.production > 0
          ) ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.monthlyProduction}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorProduction"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors.primary}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors.primary}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: colors.textLight }}
                    axisLine={{ stroke: colors.border }}
                  />
                  <YAxis
                    tick={{ fill: colors.textLight }}
                    axisLine={{ stroke: colors.border }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(value.toFixed(2))} tons`,
                      "Production",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "8px",
                      border: "1px solid #E0E0E0",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="production"
                    name="Production (tons)"
                    stroke={colors.primary}
                    fillOpacity={1}
                    fill="url(#colorProduction)"
                    activeDot={{
                      r: 8,
                      stroke: colors.primary,
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[320px] text-gray-400">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-lg font-medium">No monthly data available</p>
              <p className="mt-2 text-sm text-gray-400">
                Add harvest dates to see trends
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Barangay Production Distribution */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">
          Production by Barangay
        </h4>
        {dashboardData.productionByBarangay.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.productionByBarangay}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barSize={40}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E0E0E0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.textLight }}
                  axisLine={{ stroke: colors.border }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: colors.textLight }}
                  axisLine={{ stroke: colors.border }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(value.toFixed(2))} units`,
                    "Production",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Production (units)"
                  fill={colors.primary}
                  radius={[4, 4, 0, 0]}
                >
                  {dashboardData.productionByBarangay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index % 2 === 0 ? colors.primary : colors.primaryLight
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-lg font-medium">
              No barangay production data available
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Add barangay information to see distribution
            </p>
          </div>
        )}
      </div>

      {/* Top Performing Items */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Top Performing Items
          </h4>
          <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            By Production Volume
          </span>
        </div>

        {dashboardData.topPerformingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {dashboardData.topPerformingItems.map((item, index) => (
              <div
                key={index}
                className="p-4 transition-all border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md"
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-200 text-gray-700"
                        : index === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h5
                    className="font-medium text-gray-800 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h5>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(item.value.toFixed(2))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.category === "livestock" ? "heads" : "metric tons"}
                  </div>
                </div>
                <div className="w-full h-2 mt-3 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{
                      width: `${
                        (item.value /
                          dashboardData.topPerformingItems[0].value) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p>No production data available</p>
          </div>
        )}
      </div>

      {/* Recent Harvests */}
      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Recent Harvests
          </h4>
          <a
            href="/inventory"
            className="text-sm font-medium text-[#6A9C89] hover:underline"
          >
            View All Records →
          </a>
        </div>

        {dashboardData.recentHarvests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase rounded-tl-lg bg-gray-50"
                  >
                    Farmer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Yield
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Area (ha)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Yield/ha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase rounded-tr-lg bg-gray-50"
                  >
                    Harvest Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentHarvests.map((harvest, index) => (
                  <tr
                    key={harvest.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-[#E6F5E4] text-[#6A9C89] rounded-full flex items-center justify-center">
                          {harvest.farmer_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {harvest.farmer_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {harvest.barangay}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          harvest.type === "Raiser"
                            ? "bg-purple-100 text-purple-700"
                            : harvest.type === "Operator"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-[#E6F5E4] text-[#6A9C89]"
                        } font-medium`}
                      >
                        {harvest.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-[#E6F5E4] text-[#6A9C89] font-medium">
                        {harvest.crop_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {harvest.yield_amount.toFixed(2)}
                      {harvest.type === "Raiser" ? " heads" : " tons"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {harvest.area.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          harvest.yield_per_hectare !== "N/A" &&
                          Number(harvest.yield_per_hectare) > 5
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {harvest.yield_per_hectare}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {harvest.harvest_date.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-lg font-medium">No recent harvests</p>
            <p className="mt-2 text-sm text-gray-400">
              Add harvest data to see recent activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// UserIcon component for the dashboard
function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
