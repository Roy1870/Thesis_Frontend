"use client";

import { useState, useEffect, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import { Loader2, ChevronDown } from "lucide-react";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
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

  // Define categories
  const categories = [
    { id: "livestock", name: "Livestock & Poultry", icon: "🐄", unit: "heads" },
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
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update dropdown position when it opens
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [dropdownOpen]);

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

  // Process raw data into analytics data
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

    setAnalyticsData(processedData);
  }, [rawData]);

  // Fetch all data using the same approach as the inventory component
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all farmers
      const farmersResponse = await farmerAPI.getAllFarmers(1, 1000);
      const farmers = Array.isArray(farmersResponse)
        ? farmersResponse
        : farmersResponse.data || [];

      // Fetch all livestock records
      const livestockResponse = await livestockAPI.getAllLivestockRecords(
        1,
        1000
      );
      const livestock = Array.isArray(livestockResponse)
        ? livestockResponse
        : livestockResponse.data || [];

      // Fetch all operators
      const operatorsResponse = await operatorAPI.getAllOperators(1, 1000);
      const operators = Array.isArray(operatorsResponse)
        ? operatorsResponse
        : operatorsResponse.data || [];

      // Extract crops from farmers
      const crops = [];
      const rice = [];
      const highValueCrops = [];

      console.log("Farmers data:", farmers);

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
                console.error("Error parsing production data:", e);
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
              // Keep the original production_data for reference
              production_data: crop.production_data,
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
                console.error("Error parsing production data:", e);
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
              // Keep the original production_data for reference
              production_data: crop.production_data,
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
          }));
          rice.push(...farmerRice);
        }
      });

      console.log("Processed crops:", crops);
      console.log("Processed high value crops:", highValueCrops);

      // Enrich livestock records with farmer information
      const farmersMap = {};
      farmers.forEach((farmer) => {
        farmersMap[farmer.farmer_id] = farmer;
      });

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

      // Store all the fetched and processed data
      setRawData({
        farmers,
        livestock: enrichedLivestock,
        operators,
        crops,
        rice,
        highValueCrops,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Process livestock data
  const processLivestockData = () => {
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
  };

  // Replace the processRiceData function with this more comprehensive version
  const processRiceData = () => {
    const riceData = rawData.rice || [];
    const varietyMap = {};

    // Debug log to see what rice data we're working with
    console.log("Processing rice data:", riceData);

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

      // If we have a valid variety and production value, add it to the map
      if (variety && production > 0) {
        varietyMap[variety] = (varietyMap[variety] || 0) + production;
      }
    });

    // Log the processed variety map
    console.log("Rice variety map:", varietyMap);

    const items = Object.entries(varietyMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  };

  // Process banana data
  const processBananaData = () => {
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

    console.log("Banana crops:", bananaCrops);

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
          console.error("Error parsing production data:", e);
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
  };

  // Process legumes data
  const processLegumesData = () => {
    const crops = rawData.crops || [];
    const legumesTypeMap = {};

    // Filter legume crops
    const legumeCrops = crops.filter(
      (crop) =>
        (crop.crop_type && isLegume(crop.crop_type.toLowerCase())) ||
        (crop.crop_value && isLegume(crop.crop_value.toLowerCase()))
    );

    console.log("Legume crops:", legumeCrops);

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
          console.error("Error parsing production data:", e);
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
  };

  // Process spices data
  const processSpicesData = () => {
    const crops = rawData.crops || [];
    const spicesTypeMap = {};

    // Filter spice crops
    const spiceCrops = crops.filter(
      (crop) =>
        (crop.crop_type && isSpice(crop.crop_type.toLowerCase())) ||
        (crop.crop_value && isSpice(crop.crop_value.toLowerCase()))
    );

    console.log("Spice crops:", spiceCrops);

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
          console.error("Error parsing production data:", e);
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
  };

  // Replace the processFishData function with this more comprehensive version
  const processFishData = () => {
    // Combine data from crops and operators (for fish)
    const crops = rawData.crops || [];
    const operators = rawData.operators || [];
    const fishTypeMap = {};

    // Debug log
    console.log(
      "Processing fish data - crops:",
      crops.filter(
        (crop) =>
          (crop.crop_type && isFish(crop.crop_type.toLowerCase())) ||
          (crop.crop_value && isFish(crop.crop_value.toLowerCase()))
      )
    );
    console.log("Processing fish data - operators:", operators);

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

      if (type && production > 0) {
        fishTypeMap[type] = (fishTypeMap[type] || 0) + production;
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

    // Log the processed fish type map
    console.log("Fish type map:", fishTypeMap);

    const items = Object.entries(fishTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Calculate the total correctly to ensure accurate percentages
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      items,
    };
  };

  // Process high value crops data
  const processHighValueCropsData = () => {
    const highValueCrops = rawData.highValueCrops || [];
    const cropTypeMap = {};

    console.log("High Value Crops data:", highValueCrops);

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
          console.error("Error parsing production data:", e);
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
  };

  // Helper functions to categorize crops
  const isBananaVariety = (cropType) => {
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
  };

  const isLegume = (cropType) => {
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
  };

  const isSpice = (cropType) => {
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
  };

  // Update the isFish function to be more comprehensive
  const isFish = (cropType) => {
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
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle category selection
  const handleCategorySelect = (index) => {
    console.log("Category selected:", index);
    setCurrentCategory(index);
    setDropdownOpen(false);
  };

  // Update the renderCategoryContent function to fix percentage display
  const renderCategoryContent = () => {
    const category = categories[currentCategory];
    const data = analyticsData[category.id];

    if (!data || data.total === 0) {
      return (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No data available for {category.name}</p>
        </div>
      );
    }

    // Debug log to verify data
    console.log(`Rendering ${category.id} data:`, data);

    return (
      <div className="space-y-6">
        {/* Total Card */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="flex items-center text-2xl font-bold">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">Total production data</p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {data.total.toLocaleString()}{" "}
              <span className="text-base font-normal text-gray-500">
                {category.unit}
              </span>
            </div>
          </div>

          <div className="w-full h-2 mb-6 bg-gray-100 rounded-full">
            <div
              className="h-2 bg-green-600 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Type/Variety</span>
              <span>Amount ({category.unit})</span>
            </div>

            {data.items.length > 0 ? (
              data.items.map((item, index) => {
                // Calculate percentage with proper validation
                const percentage =
                  data.total > 0 ? (item.value / data.total) * 100 : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 mr-2 rounded-full"
                        style={{
                          backgroundColor: getColorForIndex(index),
                        }}
                      ></div>
                      <span className="font-medium capitalize">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold">
                        {item.value.toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">
                No breakdown data available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get color for index
  const getColorForIndex = (index) => {
    const colors = [
      "#6A9C89",
      "#4F6F7D",
      "#388E3C",
      "#FF8042",
      "#FFBB28",
      "#8884d8",
      "#82ca9d",
      "#ffc658",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 mr-2 text-green-500 animate-spin" />
        <span className="ml-2">Loading production data...</span>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto overflow-auto">
      <div className="flex flex-col mb-4 space-y-2">
        <h1 className="text-3xl font-bold">Agricultural Production Data</h1>
        <p className="text-gray-600">
          Total production and breakdown by category
        </p>
      </div>

      {/* Dropdown section with fixed position */}
      <div className="relative w-full">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <div className="flex items-center">
            <span className="mr-2">{categories[currentCategory].icon}</span>
            <span className="font-medium">
              {categories[currentCategory].name}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Fixed position dropdown that breaks out of any container constraints */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-300 rounded-md shadow-lg"
            style={{
              zIndex: 9999,
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <ul>
              {categories.map((category, index) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(index)}
                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${
                      currentCategory === index
                        ? "bg-green-50 text-green-700"
                        : ""
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Content section with scrollable overflow */}
      <div className="mt-4 overflow-auto">{renderCategoryContent()}</div>
    </div>
  );
}

export default Analytics;
