"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  farmerAPI,
  livestockAPI,
  operatorAPI,
  prefetchRouteData,
} from "./services/api";
import {
  ChevronDown,
  RefreshCw,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRefreshStore } from "./shared-store";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
function Analytics() {
  const [loading, setLoading] = useState(false);
  const {
    isRefreshing,
    lastRefresh,
    setRefreshing,
    setLastRefresh,
    dataCache,
    updateDataCache,
  } = useRefreshStore();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [rawData, setRawData] = useState({
    farmers: [],
    livestock: [],
    operators: [],
    crops: [],
    rice: [],
    highValueCrops: [],
  });
  const [analyticsData, setAnalyticsData] = useState({
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
  });

  const [selectedDataType, setSelectedDataType] = useState("Total");
  const [selectedMonthlyDataType, setSelectedMonthlyDataType] =
    useState("Total");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBarangayMonth, setSelectedBarangayMonth] = useState("All");
  const [selectedBarangayYear, setSelectedBarangayYear] = useState(
    new Date().getFullYear()
  );

  // Add this after the existing state declarations
  const [dataError, setDataError] = useState(false);

  // Ref for cleanup
  const abortControllerRef = useRef(null);

  // Helper functions to categorize crops - memoized with useCallback
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
      "bangus",
      "milkfish",
      "catfish",
      "hito",
      "carp",
      "shrimp",
      "hipon",
      "fish",
      "isda",
      "aquaculture",
      "seafood",
    ];
    return fishTypes.some((fish) => cropType.toLowerCase().includes(fish));
  }, []);

  // Helper function to get color for index - memoized with useMemo
  const getColorForIndex = useMemo(() => {
    const colors = [
      "#4CAF50", // Green (primary accent)
      "#2196F3", // Blue
      "#FFC107", // Amber
      "#FF5722", // Deep Orange
      "#9C27B0", // Purple
      "#3F51B5", // Indigo
      "#00BCD4", // Cyan
      "#795548", // Brown
    ];
    return (index) => colors[index % colors.length];
  }, []);

  // Define categories - memoized to prevent recreating on each render
  const categories = useMemo(
    () => [
      {
        id: "livestock",
        name: "Livestock & Poultry",
        icon: "🐄",
        unit: "heads",
      },
      { id: "rice", name: "Rice", icon: "🌾", unit: "tons" },
      { id: "banana", name: "Banana", icon: "🍌", unit: "tons" },
      { id: "legumes", name: "Legumes", icon: "🌱", unit: "tons" },
      { id: "spices", name: "Spices", icon: "🌶️", unit: "tons" },
      { id: "fish", name: "Fish", icon: "🐟", unit: "tons" },
      {
        id: "highValueCrops",
        name: "High Value Crops",
        icon: "🌿",
        unit: "tons",
      },
    ],
    []
  );

  // Function to format a date to readable string
  const formatRefreshTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Add formatNumber utility function after the formatRefreshTime function
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Fetch data with AbortController for cleanup
  useEffect(() => {
    // Check if we have data in the cache first
    if (Object.values(dataCache).some((arr) => arr.length > 0)) {
      console.log("Analytics: Using cached data from store");
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

  // Set up polling to refresh data periodically
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Don't start polling until initial load is complete
    if (loading) return;

    const pollingInterval = setInterval(() => {
      fetchAllData(signal, true); // true means background refresh
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(pollingInterval);
      controller.abort();
    };
  }, [loading, setRefreshing, setLastRefresh]);

  // Function to handle data change notifications from other components
  const handleDataChange = useCallback(() => {
    const controller = new AbortController();
    fetchAllData(controller.signal, true);

    return () => {
      controller.abort();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownOpen
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Prefetch data for other routes when analytics is loaded
  useEffect(() => {
    // Prefetch inventory data when analytics is loaded
    prefetchRouteData("/inventory");

    // No need to prefetch dashboard data as it's lighter and will load quickly
  }, []);

  // Process raw data into analytics data - optimized with useCallback
  useEffect(() => {
    if (Object.values(rawData).every((arr) => arr.length === 0)) return;

    // Process the data for each category
    const processedData = {
      livestock: processLivestockData(),
      rice: processRiceData(),
      banana: processBananaData(),
      legumes: processLegumesData(),
      spices: processSpicesData(),
      fish: processFishData(),
      highValueCrops: processHighValueCropsData(),
    };

    // Process data for crop production pie chart
    const cropProduction = [];
    Object.entries(processedData).forEach(([category, data]) => {
      if (data.total > 0) {
        cropProduction.push({
          name: getCategoryName(category),
          value: data.total,
        });
      }
    });

    // Calculate total production across all categories
    const totalProduction = Object.values(processedData).reduce(
      (sum, category) => sum + category.total,
      0
    );

    setAnalyticsData({
      ...processedData,
      cropProduction,
      totalProduction,
    });
  }, [rawData]);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    const controller = new AbortController();
    fetchAllData(controller.signal, true);

    return () => {
      controller.abort();
    };
  }, [setRefreshing, setLastRefresh]);

  // Find the fetchAllData function and replace it with this version that always uses background refreshing
  // Around line 330, replace the entire fetchAllData function with:

  // Fetch all data using optimized approach with signal for cancellation
  const fetchAllData = async (signal, forceRefresh = false) => {
    try {
      // Check if this is an initial load (no data yet)
      const isInitialLoad = Object.values(rawData).every(
        (arr) => arr.length === 0
      );

      // For initial load with no data, show full loading state
      if (
        isInitialLoad &&
        !Object.values(dataCache).some((arr) => arr.length > 0)
      ) {
        setLoading(true);
      } else {
        // For subsequent loads or if we have cached data, use background refreshing
        setRefreshing(true);
      }

      setDataError(false);

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

      // Create a map for faster farmer lookups
      const farmersMap = {};
      farmers.forEach((farmer) => {
        farmersMap[farmer.farmer_id] = farmer;
      });

      // Extract crops from farmers - process in batches for better performance
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

      // Add this line to update the shared store
      updateDataCache({
        farmers,
        livestock: enrichedLivestock,
        operators: enrichedOperators,
        crops,
        rice,
        highValueCrops,
      });

      // Always turn off loading states when done
      setLoading(false);
      setRefreshing(false);

      // Update last refresh timestamp
      setLastRefresh(new Date());
    } catch (error) {
      // Only set error if not an abort error (which happens during cleanup)
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        setDataError(true);

        // Check if this is an initial load (no data yet)
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
    }
  };

  // Updated processLivestockData function to use the subcategory field directly from the data
  const processLivestockData = useCallback(() => {
    const livestock = rawData.livestock || [];

    // Initialize the data structure
    const animalTypeMap = {};

    // Process each livestock record
    livestock.forEach((record) => {
      // Get the animal type, subcategory, and quantity
      const animalType = record.animal_type || "Unknown";
      const subcategory = record.subcategory || "Unknown"; // Use the subcategory directly from the data
      const quantity = Number.parseInt(record.quantity) || 0;

      // Skip if quantity is zero
      if (quantity <= 0) return;

      // Initialize category if it doesn't exist
      if (!animalTypeMap[animalType]) {
        animalTypeMap[animalType] = {
          total: 0,
          subtypes: {},
        };
      }

      // Add to category total
      animalTypeMap[animalType].total += quantity;

      // Initialize subtype if it doesn't exist
      if (!animalTypeMap[animalType].subtypes[subcategory]) {
        animalTypeMap[animalType].subtypes[subcategory] = 0;
      }

      // Add to subtype
      animalTypeMap[animalType].subtypes[subcategory] += quantity;

      // Also store the original record for reference (useful for debugging)
      if (!animalTypeMap[animalType].records) {
        animalTypeMap[animalType].records = [];
      }
      animalTypeMap[animalType].records.push(record);
    });

    // Convert the nested structure to the format expected by the UI
    const items = Object.entries(animalTypeMap)
      .filter(([_, data]) => data.total > 0) // Only include categories with data
      .map(([category, data]) => {
        // Convert subtypes to array format
        const subtypeItems = Object.entries(data.subtypes)
          .filter(([_, value]) => value > 0) // Only include subcategories with data
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        return {
          name: category,
          value: data.total,
          subtypes: subtypeItems,
          // Include original records for debugging if needed
          records: data.records,
        };
      });

    // Sort categories by total value
    items.sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    // Log the processed data for debugging
    console.log("Processed livestock data:", { total, items });

    return {
      total,
      items,
    };
  }, [rawData.livestock]);

  // Process rice data - memoized with useCallback
  const processRiceData = useCallback(() => {
    const riceData = rawData.rice || [];

    // Create separate maps for irrigated and rainfed rice
    const irrigatedMap = {};
    const rainfedMap = {};

    riceData.forEach((rice) => {
      // Normalize variety names to prevent duplicates with slight differences
      let variety = (
        rice.variety ||
        rice.seed_type ||
        rice.name ||
        "Unknown Rice"
      ).trim();

      // Convert to lowercase for better matching
      const varietyLower = variety.toLowerCase();

      // Standardize common rice variety names
      if (varietyLower.includes("dinorado")) variety = "Dinorado";
      else if (varietyLower.includes("jasmine")) variety = "Jasmine Rice";
      else if (varietyLower.includes("sinandomeng")) variety = "Sinandomeng";
      else if (varietyLower.includes("rc")) variety = variety.toUpperCase(); // RC varieties should be uppercase

      // Try to get production from different possible fields with better validation
      let production = 0;

      // Check all possible field names for production data
      const productionFields = [
        "production",
        "yield_amount",
        "yield",
        "quantity",
        "harvest_amount",
        "total_production",
      ];

      for (const field of productionFields) {
        if (rice[field] && !isNaN(Number.parseFloat(rice[field]))) {
          production = Number.parseFloat(rice[field]);
          break;
        }
      }

      // Determine if rice is irrigated or rainfed
      const isIrrigated =
        (rice.area_type &&
          rice.area_type.toLowerCase().includes("irrigated")) ||
        (rice.ecosystem &&
          rice.ecosystem.toLowerCase().includes("irrigated")) ||
        (rice.irrigation_type &&
          rice.irrigation_type.toLowerCase() !== "rainfed");

      // If we have a valid variety and production value, add it to the appropriate map
      if (variety && production > 0) {
        if (isIrrigated) {
          irrigatedMap[variety] = (irrigatedMap[variety] || 0) + production;
        } else {
          rainfedMap[variety] = (rainfedMap[variety] || 0) + production;
        }
      }
    });

    // Convert maps to arrays of items
    const irrigatedItems = Object.entries(irrigatedMap)
      .map(([name, value]) => ({
        name: `${name} (Irrigated)`,
        value,
        type: "irrigated",
      }))
      .sort((a, b) => b.value - a.value);

    const rainfedItems = Object.entries(rainfedMap)
      .map(([name, value]) => ({
        name: `${name} (Rainfed)`,
        value,
        type: "rainfed",
      }))
      .sort((a, b) => b.value - a.value);

    // Combine both arrays
    const items = [...irrigatedItems, ...rainfedItems];

    // Calculate total production
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const irrigatedTotal = irrigatedItems.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const rainfedTotal = rainfedItems.reduce(
      (sum, item) => sum + item.value,
      0
    );

    return {
      total,
      items,
      irrigatedTotal,
      rainfedTotal,
    };
  }, [rawData.rice]);

  // Helper function to parse production_data - memoized with useCallback
  const parseProductionData = useCallback((crop) => {
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
  }, []);

  // Process banana data - memoized with useCallback
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

      // Try to get production from different possible fields
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
  }, [rawData.crops, isBananaVariety]);

  // Process legumes data - memoized with useCallback
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
  }, [rawData.crops, isLegume]);

  // Process spices data - memoized with useCallback
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
  }, [rawData.crops, isSpice]);

  // Process fish data - memoized with useCallback
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

    // Process fish crops
    fishCrops.forEach((crop) => {
      // Normalize fish type names
      let type = (crop.crop_value || crop.crop_type || "Unknown Fish").trim();

      // Convert to lowercase for better matching
      const typeLower = type.toLowerCase();

      // Standardize common fish type names
      if (typeLower.includes("tilapia")) type = "Tilapia";
      else if (typeLower.includes("milkfish") || typeLower.includes("bangus"))
        type = "Milkfish/Bangus";
      else if (typeLower.includes("catfish") || typeLower.includes("hito"))
        type = "Catfish/Hito";

      // Get production value from any available field
      let production = 0;
      const productionFields = [
        "yield_amount",
        "production",
        "quantity",
        "harvest_amount",
        "total_production",
      ];

      for (const field of productionFields) {
        if (crop[field] && !isNaN(Number.parseFloat(crop[field]))) {
          production = Number.parseFloat(crop[field]);
          break;
        }
      }

      // The variable 'ype' was used instead of 'type'
      const typeValid = type;
      if (typeValid && production > 0) {
        fishTypeMap[typeValid] = (fishTypeMap[typeValid] || 0) + production;
      }
    });

    // Add fish data from operators
    operators.forEach((operator) => {
      if (operator.cultured_species) {
        // Normalize species name
        let species = operator.cultured_species.trim();

        // Standardize common fish names
        const speciesLower = species.toLowerCase();
        if (speciesLower.includes("tilapia")) species = "Tilapia";
        else if (
          speciesLower.includes("milkfish") ||
          speciesLower.includes("bangus")
        )
          species = "Milkfish/Bangus";
        else if (
          speciesLower.includes("catfish") ||
          speciesLower.includes("hito")
        )
          species = "Catfish/Hito";

        // Get production value
        let production = 0;
        if (
          operator.production_kg &&
          !isNaN(Number.parseFloat(operator.production_kg))
        ) {
          production = Number.parseFloat(operator.production_kg);
        } else if (
          operator.production &&
          !isNaN(Number.parseFloat(operator.production))
        ) {
          production = Number.parseFloat(operator.production);
        }

        if (species && production > 0) {
          fishTypeMap[species] = (fishTypeMap[species] || 0) + production;
        }
      }
    });

    const items = Object.entries(fishTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Calculate the total correctly to ensure accurate percentages
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  }, [rawData.crops, rawData.operators, isFish]);

  // Process high value crops data - memoized with useCallback
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

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen]);

  // Handle category selection
  const handleCategorySelect = useCallback((index) => {
    setCurrentCategory(index);
    setDropdownOpen(false);
  }, []);

  // Add getCategoryName function after the getColorForIndex function
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

  // Add getBarangayDataByType function after the processHighValueCropsData function
  const getBarangayDataByType = useCallback(
    (dataType, month = selectedBarangayMonth, year = selectedBarangayYear) => {
      // If no data is available, return empty array
      if (!rawData || Object.values(rawData).every((arr) => arr.length === 0)) {
        return [];
      }

      const barangayMap = {};

      // Helper function to add data to the barangay map
      const addToBarangayMap = (item, value, barangay, date) => {
        if (isNaN(value) || value <= 0) return;

        // Skip if date is not provided
        if (!date) return;

        // Filter by month and year
        const itemDate = new Date(date);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.toLocaleString("en-US", { month: "short" });

        // Skip if year doesn't match
        if (year !== itemYear) return;

        // Skip if month doesn't match (unless "All" is selected)
        if (month !== "All" && month !== itemMonth) return;

        barangay = barangay || item.barangay || "Unknown";

        if (!barangayMap[barangay]) {
          barangayMap[barangay] = 0;
        }

        barangayMap[barangay] += value;
      };

      // Process data based on selected type
      if (dataType === "Total" || dataType === "Livestock") {
        // Add livestock data
        rawData.livestock.forEach((livestock) => {
          const quantity = Number.parseInt(livestock.quantity || 0);
          if (dataType === "Total" || dataType === "Livestock") {
            addToBarangayMap(
              livestock,
              quantity,
              livestock.barangay,
              livestock.created_at
            );
          }
        });
      }

      if (dataType === "Total" || dataType === "Rice") {
        // Add rice data
        rawData.rice.forEach((rice) => {
          const production = Number.parseFloat(
            rice.production || rice.yield_amount || 0
          );
          if (dataType === "Total" || dataType === "Rice") {
            addToBarangayMap(
              rice,
              production,
              rice.barangay,
              rice.harvest_date
            );
          }
        });
      }

      if (dataType === "Total" || dataType === "Crops") {
        // Add crops data (including high value crops)
        rawData.crops.forEach((crop) => {
          const production = Number.parseFloat(
            crop.yield_amount || crop.production || crop.quantity || 0
          );
          if (dataType === "Total" || dataType === "Crops") {
            addToBarangayMap(
              crop,
              production,
              crop.barangay,
              crop.harvest_date
            );
          }
        });

        // Add high value crops
        rawData.highValueCrops.forEach((crop) => {
          const production = Number.parseFloat(
            crop.yield_amount || crop.production || crop.quantity || 0
          );
          if (dataType === "Total" || dataType === "Crops") {
            addToBarangayMap(
              crop,
              production,
              crop.barangay,
              crop.harvest_date
            );
          }
        });
      }

      if (dataType === "Total" || dataType === "Fish") {
        // Add fish data from operators
        rawData.operators.forEach((operator) => {
          const production = Number.parseFloat(operator.production_kg || 0);
          if (dataType === "Total" || dataType === "Fish") {
            addToBarangayMap(
              operator,
              production,
              operator.barangay,
              operator.date_of_harvest
            );
          }
        });
      }

      // Convert to array format for chart
      return Object.entries(barangayMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 barangays
    },
    [rawData, selectedBarangayMonth, selectedBarangayYear]
  );

  // Add getMonthlyDataByType function after the getBarangayDataByType function
  const getMonthlyDataByType = useCallback(
    (dataType, year = selectedYear) => {
      // If no data is available, return empty array
      if (!rawData || Object.values(rawData).every((arr) => arr.length === 0)) {
        return [];
      }

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

      // Process data based on selected type
      if (dataType === "Total" || dataType === "Rice") {
        // Add rice production to monthly data
        rawData.rice.forEach((rice) => {
          if (rice.harvest_date) {
            const harvestDate = new Date(rice.harvest_date);
            // Filter by year
            if (harvestDate.getFullYear() === year) {
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              const production = Number.parseFloat(
                rice.production || rice.yield_amount || 0
              );
              if (!isNaN(production) && production > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + production;
              }
            }
          }
        });
      }

      if (dataType === "Total" || dataType === "Crops") {
        // Add crop production to monthly data
        rawData.crops.forEach((crop) => {
          if (crop.harvest_date) {
            const harvestDate = new Date(crop.harvest_date);
            // Filter by year
            if (harvestDate.getFullYear() === year) {
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              const production = Number.parseFloat(
                crop.yield_amount || crop.production || crop.quantity || 0
              );
              if (!isNaN(production) && production > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + production;
              }
            }
          }
        });

        // Add high value crops to monthly data
        rawData.highValueCrops.forEach((crop) => {
          if (crop.harvest_date) {
            const harvestDate = new Date(crop.harvest_date);
            // Filter by year
            if (harvestDate.getFullYear() === year) {
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              const production = Number.parseFloat(
                crop.yield_amount || crop.production || crop.quantity || 0
              );
              if (!isNaN(production) && production > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + production;
              }
            }
          }
        });
      }

      if (dataType === "Total" || dataType === "Fish") {
        // Add fish production to monthly data
        rawData.operators.forEach((operator) => {
          if (operator.date_of_harvest) {
            const harvestDate = new Date(operator.date_of_harvest);
            // Filter by year
            if (harvestDate.getFullYear() === year) {
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              const production = Number.parseFloat(operator.production_kg || 0);
              if (!isNaN(production) && production > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + production;
              }
            }
          }
        });
      }

      if (dataType === "Total" || dataType === "Livestock") {
        // Add livestock data to monthly data
        rawData.livestock.forEach((livestock) => {
          if (livestock.created_at) {
            const addedDate = new Date(livestock.created_at);
            // Filter by year
            if (addedDate.getFullYear() === year) {
              const month = addedDate.toLocaleString("en-US", {
                month: "short",
              });
              const quantity = Number.parseInt(livestock.quantity || 0);
              if (!isNaN(quantity) && quantity > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + quantity;
              }
            }
          }
        });
      }

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
      return monthOrder.map((month) => ({
        name: month,
        production: monthlyProductionMap[month] || 0,
      }));
    },
    [rawData, selectedYear]
  );

  // Add getAvailableYears function after the getMonthlyDataByType function
  const getAvailableYears = useCallback(() => {
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
  }, [rawData]);

  // Add a new state for production trend after the other state declarations (around line 50):
  const [productionTrend, setProductionTrend] = useState(0);

  // Calculate production trend compared to previous year
  const calculateProductionTrend = useCallback(() => {
    const currentYear = selectedYear;
    const previousYear = currentYear - 1;

    // Get total production for current year
    const currentYearData = getMonthlyDataByType("Total", currentYear);
    const currentYearTotal = currentYearData.reduce(
      (sum, item) => sum + item.production,
      0
    );

    // Get total production for previous year
    const previousYearData = getMonthlyDataByType("Total", previousYear);
    const previousYearTotal = previousYearData.reduce(
      (sum, item) => sum + item.production,
      0
    );

    // Calculate percentage change
    if (previousYearTotal > 0) {
      const trend =
        ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
      return trend;
    }

    return 0; // Default to 0 if no previous year data
  }, [selectedYear, getMonthlyDataByType]);

  // Update production trend when data changes
  useEffect(() => {
    const trend = calculateProductionTrend();
    setProductionTrend(trend);
  }, [rawData, selectedYear, calculateProductionTrend]);

  // Toggle dropdown
  const toggleDropdownHandler = useCallback(() => {
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen]);

  // Handle category selection
  const handleCategorySelectHandler = useCallback((index) => {
    setCurrentCategory(index);
    setDropdownOpen(false);
  }, []);

  // Find the renderCategoryContent function and update it to include a fixed height and scrolling
  const renderCategoryContent = () => {
    const category = categories[currentCategory];
    const data = analyticsData[category.id];

    if (!data) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-sm h-[400px] overflow-y-auto">
          <div className="w-1/3 h-6 mb-4 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-4 mb-6 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm h-[400px] overflow-y-auto">
        <h2 className="flex items-center mb-2 text-xl font-bold text-gray-800">
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </h2>
        <p className="mb-4 text-lg font-semibold text-green-700">
          Total: {formatNumber(data.total)} {category.unit}
        </p>
        {data.items && data.items.length > 0 ? (
          <div className="mt-4 space-y-3">
            {data.items.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-2 h-full min-h-[24px] rounded-l-md"
                  style={{ backgroundColor: getColorForIndex(index) }}
                ></div>
                <div className="flex-1 py-2 pl-3 bg-gray-50 rounded-r-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-700">
                      {formatNumber(item.value)} {category.unit}
                      <span className="ml-1 text-xs text-gray-500">
                        ({((item.value / data.total) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 rounded-md bg-gray-50">
            No data available for {category.name}.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50">
      <div className="px-4 py-8 pb-16 mx-auto overflow-x-hidden max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              Agricultural Production Analytics
            </h1>
          </div>
          <p className="mt-2 ml-4 text-gray-600">
            Comprehensive overview of agricultural production data and trends
          </p>

          {/* Status indicator and refresh button */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
            {isRefreshing ? (
              <div className="flex items-center px-3 py-1 rounded-full text-amber-600 bg-amber-50">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span>Updating data...</span>
              </div>
            ) : dataError ? (
              <div className="flex items-center px-3 py-1 text-red-600 rounded-full bg-red-50">
                <span>Error loading data. </span>
                <button
                  onClick={handleManualRefresh}
                  className="ml-2 underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              lastRefresh && (
                <div className="flex flex-wrap items-center justify-between w-full gap-2">
                  <div className="px-3 py-1 text-gray-500 bg-white rounded-full shadow-sm">
                    <span>Last updated: {formatRefreshTime(lastRefresh)}</span>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    className="flex items-center px-3 py-1 text-green-600 transition-all bg-white rounded-full shadow-sm hover:text-green-800 hover:shadow"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    <span>Refresh Data</span>
                  </button>
                </div>
              )
            )}
          </div>
          {/* Production Trend Indicator */}
          <div className="inline-flex flex-wrap items-center p-3 mt-4 transition-all duration-200 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
            <Activity className="w-5 h-5 mr-2 text-[#6A9C89]" />
            <span className="mr-2 text-sm font-medium">Production Trend:</span>
            <div
              className={`flex items-center ${
                productionTrend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {productionTrend >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              <span className="font-semibold">
                {Math.abs(productionTrend).toFixed(1)}%
              </span>
              <span className="ml-1 text-sm text-gray-600">
                from previous year
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Production Distribution Section */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Production Distribution
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                  <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
                  <p className="text-lg font-medium">Loading data...</p>
                </div>
              ) : analyticsData.cropProduction &&
                analyticsData.cropProduction.length > 0 ? (
                <div className="flex flex-col items-center md:flex-row">
                  <div className="w-full md:w-3/5 h-[280px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.cropProduction}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={false}
                        >
                          {analyticsData.cropProduction.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getColorForIndex(index)}
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
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "8px",
                            border: "1px solid #E0E0E0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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

                  {/* Legend/stats section */}
                  <div className="w-full pl-0 mt-4 md:w-2/5 md:mt-0 md:pl-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h3 className="mb-3 text-sm font-medium text-gray-500">
                        Production Breakdown
                      </h3>
                      <div className="space-y-3">
                        {analyticsData.cropProduction.map((entry, index) => (
                          <div key={index} className="flex items-center">
                            <div
                              className="w-3 h-3 mr-2 rounded-sm"
                              style={{
                                backgroundColor: getColorForIndex(index),
                              }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span
                                  className="text-sm font-medium truncate max-w-[120px]"
                                  title={entry.name}
                                >
                                  {entry.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {(
                                    (entry.value /
                                      analyticsData.totalProduction) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: `${
                                      (entry.value /
                                        analyticsData.totalProduction) *
                                      100
                                    }%`,
                                    backgroundColor: getColorForIndex(index),
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
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
          </div>
          {/* Monthly Production Trend Section */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Monthly Production Trend
              </h2>
              <div className="flex items-center mt-2 space-x-2 sm:mt-0">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {getAvailableYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="flex items-center bg-white border border-gray-200 rounded-md">
                  <button
                    onClick={() => {
                      const dataTypes = [
                        "Total",
                        "Livestock",
                        "Rice",
                        "Crops",
                        "Fish",
                      ];
                      const currentIndex = dataTypes.indexOf(
                        selectedMonthlyDataType
                      );
                      const prevIndex =
                        (currentIndex - 1 + dataTypes.length) %
                        dataTypes.length;
                      setSelectedMonthlyDataType(dataTypes[prevIndex]);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <span className="px-2 py-1 text-sm font-medium text-gray-800 border-l border-r border-gray-200">
                    {selectedMonthlyDataType}
                  </span>
                  <button
                    onClick={() => {
                      const dataTypes = [
                        "Total",
                        "Livestock",
                        "Rice",
                        "Crops",
                        "Fish",
                      ];
                      const currentIndex = dataTypes.indexOf(
                        selectedMonthlyDataType
                      );
                      const nextIndex = (currentIndex + 1) % dataTypes.length;
                      setSelectedMonthlyDataType(dataTypes[nextIndex]);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[280px] md:h-[320px] text-gray-400">
                  <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
                  <p className="text-lg font-medium">Loading data...</p>
                </div>
              ) : getMonthlyDataByType(
                  selectedMonthlyDataType,
                  selectedYear
                ).some((item) => item.production > 0) ? (
                <div className="h-[280px] md:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getMonthlyDataByType(
                        selectedMonthlyDataType,
                        selectedYear
                      )}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                            stopColor="#4CAF50"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4CAF50"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E0E0E0"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#666666" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <YAxis
                        tick={{ fill: "#666666" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${formatNumber(value.toFixed(2))} ${
                            selectedMonthlyDataType === "Livestock"
                              ? "heads"
                              : "tons"
                          }`,
                          "Production",
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "8px",
                          border: "1px solid #E0E0E0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="production"
                        name={`${selectedMonthlyDataType} Production ${
                          selectedMonthlyDataType === "Livestock"
                            ? "(heads)"
                            : "(tons)"
                        }`}
                        stroke="#2E7D32"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProduction)"
                        activeDot={{
                          r: 6,
                          stroke: "#2E7D32",
                          strokeWidth: 2,
                          fill: "white",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px] md:h-[320px] text-gray-400">
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
                    No monthly data available
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Add harvest dates to see trends
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Production by Barangay Section */}
          <div className="overflow-hidden bg-white shadow-sm rounded-xl lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Production by Barangay
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <select
                  value={selectedBarangayMonth}
                  onChange={(e) => setSelectedBarangayMonth(e.target.value)}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Months</option>
                  {[
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
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedBarangayYear}
                  onChange={(e) =>
                    setSelectedBarangayYear(Number(e.target.value))
                  }
                  className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {getAvailableYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="flex items-center bg-white border border-gray-200 rounded-md">
                  <button
                    onClick={() => {
                      const dataTypes = [
                        "Total",
                        "Livestock",
                        "Rice",
                        "Crops",
                        "Fish",
                      ];
                      const currentIndex = dataTypes.indexOf(selectedDataType);
                      const prevIndex =
                        (currentIndex - 1 + dataTypes.length) %
                        dataTypes.length;
                      setSelectedDataType(dataTypes[prevIndex]);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <span className="px-2 py-1 text-sm font-medium text-gray-800 border-l border-r border-gray-200">
                    {selectedDataType}
                  </span>
                  <button
                    onClick={() => {
                      const dataTypes = [
                        "Total",
                        "Livestock",
                        "Rice",
                        "Crops",
                        "Fish",
                      ];
                      const currentIndex = dataTypes.indexOf(selectedDataType);
                      const nextIndex = (currentIndex + 1) % dataTypes.length;
                      setSelectedDataType(dataTypes[nextIndex]);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-gray-400">
                  <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
                  <p className="text-lg font-medium">Loading data...</p>
                </div>
              ) : getBarangayDataByType(
                  selectedDataType,
                  selectedBarangayMonth,
                  selectedBarangayYear
                ).length > 0 ? (
                <div className="h-[300px] md:h-[400px] overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getBarangayDataByType(
                        selectedDataType,
                        selectedBarangayMonth,
                        selectedBarangayYear
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      barSize={30}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E0E0E0"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#666666" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fill: "#666666" }}
                        axisLine={{ stroke: "#E0E0E0" }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${formatNumber(value.toFixed(2))} ${
                            selectedDataType === "Livestock" ? "heads" : "tons"
                          }`,
                          `${selectedDataType} Production`,
                        ]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "8px",
                          border: "1px solid #E0E0E0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name={`${selectedDataType} Production ${
                          selectedDataType === "Livestock"
                            ? "(heads)"
                            : "(tons)"
                        }`}
                        radius={[4, 4, 0, 0]}
                      >
                        {getBarangayDataByType(
                          selectedDataType,
                          selectedBarangayMonth,
                          selectedBarangayYear
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getColorForIndex(index)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-gray-400">
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
          </div>
          {/* Category Details Section */}
          <div className="mb-8 lg:col-span-2">
            <div className="relative mb-4">
              <button
                ref={buttonRef}
                onClick={toggleDropdownHandler}
                className="flex items-center justify-between w-full px-5 py-4 text-left transition-all bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-10 h-10 mr-3 text-xl text-green-600 rounded-full bg-green-50">
                    {categories[currentCategory].icon}
                  </span>
                  <span className="font-medium text-gray-800">
                    {categories[currentCategory].name}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown that stays within the document flow */}
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg"
                >
                  <ul className="py-1">
                    {categories.map((category, index) => (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() => handleCategorySelectHandler(index)}
                          className={`flex items-center w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors ${
                            currentCategory === index
                              ? "bg-green-50/50 text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="flex items-center justify-center w-8 h-8 mr-3 text-lg text-green-600 rounded-full bg-green-50">
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Also update the loading state for the category content to have the same fixed height */}
            {loading ? (
              <div className="p-6 bg-white rounded-lg shadow-sm h-[400px] overflow-y-auto">
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
                  <p className="text-lg font-medium">
                    Loading category data...
                  </p>
                </div>
              </div>
            ) : (
              renderCategoryContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
