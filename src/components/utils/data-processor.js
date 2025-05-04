// Helper functions to categorize crops
function isBananaVariety(cropType) {
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
}

function isLegume(cropType) {
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
}

function isSpice(cropType) {
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
}

function isFish(cropType) {
  if (!cropType) return false;
  const fishTypes = [
    "tilapia",
    "milkfish",
    "catfish",
    "carp",
    "shrimp",
    "fish",
  ];
  return fishTypes.some((fish) => cropType.toLowerCase().includes(fish));
}

function isVegetable(cropType) {
  if (!cropType) return false;
  const vegetables = [
    "vegetable",
    "vegetables",
    "tomato",
    "eggplant",
    "cabbage",
    "lettuce",
    "carrot",
    "onion",
    "garlic",
    "potato",
    "squash",
    "cucumber",
    "okra",
    "broccoli",
    "cauliflower",
    "spinach",
    "kale",
    "pechay",
    "ampalaya",
    "sitaw",
    "kalabasa",
    "talong",
    "kamatis",
  ];
  return (
    cropType.toLowerCase() === "vegetables" ||
    vegetables.some((veg) => cropType.toLowerCase().includes(veg))
  );
}

// Helper function to parse production_data
function parseProductionData(crop) {
  let productionData = {};
  if (crop.production_data && typeof crop.production_data === "string") {
    try {
      productionData = JSON.parse(crop.production_data);
    } catch (e) {
      // Silent error - continue with empty production data
    }
  } else if (crop.production_data && typeof crop.production_data === "object") {
    productionData = crop.production_data;
  }
  return productionData;
}

// Get category name for display
function getCategoryName(category) {
  const categoryNames = {
    livestock: "Livestock & Poultry",
    rice: "Rice",
    banana: "Banana",
    legumes: "Legumes",
    spices: "Spices",
    fish: "Fish",
    vegetables: "Vegetables",
    highValueCrops: "High Value Crops",
  };

  return categoryNames[category] || category;
}

// Process livestock data
function processLivestockData(livestock = []) {
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
}

// Process rice data - keep values in kg instead of converting to tons
function processRiceData(riceData = []) {
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
}

// Process banana data
function processBananaData(crops = []) {
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
    const productionData = parseProductionData(crop);
    if (productionData.crop) {
      variety = productionData.crop;
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
    } else if (crop.production && !isNaN(Number.parseFloat(crop.production))) {
      production = Number.parseFloat(crop.production);
    }

    if (variety && production > 0) {
      bananaVarietyMap[variety] = (bananaVarietyMap[variety] || 0) + production;
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
}

// Process legumes data
function processLegumesData(crops = []) {
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

    // Try to parse production_data
    const productionData = parseProductionData(crop);
    if (productionData.crop) {
      type = productionData.crop;
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
    } else if (crop.production && !isNaN(Number.parseFloat(crop.production))) {
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
}

// Process spices data
function processSpicesData(crops = []) {
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

    // Try to parse production_data
    const productionData = parseProductionData(crop);
    if (productionData.crop) {
      type = productionData.crop;
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
    } else if (crop.production && !isNaN(Number.parseFloat(crop.production))) {
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
}

// Process vegetables data
function processVegetablesData(crops = []) {
  const vegetablesTypeMap = {};

  // Filter vegetable crops
  const vegetableCrops = crops.filter(
    (crop) =>
      (crop.crop_type && isVegetable(crop.crop_type.toLowerCase())) ||
      (crop.crop_value && isVegetable(crop.crop_value.toLowerCase()))
  );

  vegetableCrops.forEach((crop) => {
    // Get crop type from crop_value, crop_type, or from parsed production_data
    let type = crop.crop_value || crop.crop_type || "Unknown Vegetable";

    // Try to parse production_data
    const productionData = parseProductionData(crop);
    if (productionData.crop) {
      type = productionData.crop;
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
    } else if (crop.production && !isNaN(Number.parseFloat(crop.production))) {
      production = Number.parseFloat(crop.production);
    }

    if (type && production > 0) {
      vegetablesTypeMap[type] = (vegetablesTypeMap[type] || 0) + production;
    }
  });

  const items = Object.entries(vegetablesTypeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((sum, item) => sum + item.value, 0);

  return {
    total,
    items,
  };
}

// Process fish data
function processFishData(crops = [], operators = []) {
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
}

// Process high value crops data
function processHighValueCropsData(highValueCrops = []) {
  const cropTypeMap = {};

  highValueCrops.forEach((crop) => {
    // Get crop type from crop_value or from parsed production_data
    let cropType = crop.crop_value || "Unknown HVC";

    // Try to parse production_data
    const productionData = parseProductionData(crop);
    if (productionData.crop) {
      cropType = productionData.crop;
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
    } else if (crop.production && !isNaN(Number.parseFloat(crop.production))) {
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
}

// Add sorting functionality to the processed data
function sortProcessedData(data, sortField, sortOrder) {
  if (!sortField || !data || !Array.isArray(data)) return data;

  return [...data].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    // Handle nested properties using dot notation (e.g., "farmer.name")
    if (sortField.includes(".")) {
      const parts = sortField.split(".");
      valueA = parts.reduce(
        (obj, key) => (obj && obj[key] !== undefined ? obj[key] : null),
        a
      );
      valueB = parts.reduce(
        (obj, key) => (obj && obj[key] !== undefined ? obj[key] : null),
        b
      );
    }

    // Handle numeric values
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Handle dates
    if (valueA instanceof Date && valueB instanceof Date) {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Convert to string for default comparison
    const strA = String(valueA || "").toLowerCase();
    const strB = String(valueB || "").toLowerCase();

    return sortOrder === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
}

// Update the processRawData function to apply sorting to all relevant arrays
export function processRawData(rawData, filters = {}) {
  try {
    // Extract filter parameters
    const { year: selectedYear, month: selectedMonth } = filters;

    // Process data for each category
    const categoryData = {
      livestock: processLivestockData(rawData.livestock),
      rice: processRiceData(rawData.rice),
      banana: processBananaData(rawData.crops),
      legumes: processLegumesData(rawData.crops),
      spices: processSpicesData(rawData.crops),
      vegetables: processVegetablesData(rawData.crops),
      fish: processFishData(rawData.crops, rawData.operators),
      highValueCrops: processHighValueCropsData(rawData.highValueCrops),
    };

    // Add year and month data to items for filtering
    Object.keys(categoryData).forEach((category) => {
      if (categoryData[category] && categoryData[category].items) {
        categoryData[category].items = categoryData[category].items.map(
          (item) => {
            return {
              ...item,
              // Add a flag to indicate this item has been processed
              processed: true,
            };
          }
        );
      }
    });

    // Apply sorting to category items if specified in filters
    if (filters.sortField && filters.sortOrder) {
      Object.keys(categoryData).forEach((category) => {
        if (
          categoryData[category] &&
          Array.isArray(categoryData[category].items)
        ) {
          categoryData[category].items = sortProcessedData(
            categoryData[category].items,
            filters.sortField,
            filters.sortOrder
          );
        }
      });
    }

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
          category: category, // Add the category key for reference
        });
      }
    });

    // Sort crop production by value (descending)
    cropProduction.sort((a, b) => b.value - a.value);

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

    // Helper function to add production to monthly data with date filtering
    const addToMonthlyData = (item, production, dateField) => {
      if (!item[dateField] || isNaN(production) || production <= 0) return;

      const harvestDate = new Date(item[dateField]);
      if (isNaN(harvestDate.getTime())) return;

      // Apply year filter if specified
      if (selectedYear !== "All" && selectedYear !== undefined) {
        const itemYear = harvestDate.getFullYear();
        if (itemYear !== Number(selectedYear)) return;
      }

      const month = harvestDate.toLocaleString("en-US", { month: "short" });
      monthlyProductionMap[month] =
        (monthlyProductionMap[month] || 0) + production;
    };

    // Add rice production to monthly data - keep in kg
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToMonthlyData(rice, production, "harvest_date");
    });

    // Add crop production to monthly data
    rawData.crops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToMonthlyData(crop, production, "harvest_date");
    });

    // Add high value crops to monthly data
    rawData.highValueCrops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToMonthlyData(crop, production, "harvest_date");
    });

    // Add fish production to monthly data
    rawData.operators.forEach((operator) => {
      const production = Number.parseFloat(operator.production_kg || 0);
      addToMonthlyData(operator, production, "date_of_harvest");
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

    // Apply sorting to monthly production if needed
    if (filters.sortField === "month") {
      monthlyProduction.sort((a, b) => {
        const monthIndex = (month) => monthOrder.indexOf(month);
        return filters.sortOrder === "asc"
          ? monthIndex(a.name) - monthIndex(b.name)
          : monthIndex(b.name) - monthIndex(a.name);
      });
    } else if (filters.sortField === "production") {
      monthlyProduction.sort((a, b) => {
        return filters.sortOrder === "asc"
          ? a.production - b.production
          : b.production - a.production;
      });
    }

    // Process data for production by barangay
    const barangayProductionMap = {};

    // Add all sources of production to barangay map with date filtering
    const addToBarangayMap = (item, production, dateField) => {
      if (isNaN(production) || production <= 0) return;

      // Apply date filtering if specified
      if (dateField && (selectedYear !== "All" || selectedMonth !== "All")) {
        if (!item[dateField]) return;

        const itemDate = new Date(item[dateField]);
        if (isNaN(itemDate.getTime())) return;

        // Apply year filter
        if (selectedYear !== "All") {
          const itemYear = itemDate.getFullYear();
          if (itemYear !== Number(selectedYear)) return;
        }

        // Apply month filter
        if (selectedMonth !== "All") {
          const monthNames = [
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
          const itemMonth = monthNames[itemDate.getMonth()];
          if (itemMonth !== selectedMonth) return;
        }
      }

      const barangay = item.barangay || "Unknown";
      barangayProductionMap[barangay] =
        (barangayProductionMap[barangay] || 0) + production;
    };

    // Process all data sources in parallel using batch processing
    // Rice production - keep in kg
    for (let i = 0; i < rawData.rice.length; i++) {
      const rice = rawData.rice[i];
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToBarangayMap(rice, production, "harvest_date");
    }

    // Crop production
    for (let i = 0; i < rawData.crops.length; i++) {
      const crop = rawData.crops[i];
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangayMap(crop, production, "harvest_date");
    }

    // High value crop production
    for (let i = 0; i < rawData.highValueCrops.length; i++) {
      const crop = rawData.highValueCrops[i];
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangayMap(crop, production, "harvest_date");
    }

    // Livestock production
    for (let i = 0; i < rawData.livestock.length; i++) {
      const livestock = rawData.livestock[i];
      const quantity = Number.parseInt(livestock.quantity || 0);
      addToBarangayMap(livestock, quantity, "created_at");
    }

    // Operator production
    for (let i = 0; i < rawData.operators.length; i++) {
      const operator = rawData.operators[i];
      const production = Number.parseFloat(operator.production_kg || 0);
      addToBarangayMap(operator, production, "date_of_harvest");
    }

    // Convert barangay production to array for chart
    let productionByBarangay = Object.entries(barangayProductionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 barangays

    // Apply custom sorting to barangay data if needed
    if (filters.sortField === "barangay") {
      productionByBarangay = sortProcessedData(
        productionByBarangay,
        "name",
        filters.sortOrder
      );
    } else if (
      filters.sortField === "production" ||
      filters.sortField === "value"
    ) {
      productionByBarangay = sortProcessedData(
        productionByBarangay,
        "value",
        filters.sortOrder
      );
    }

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
    let topPerformingItems = allItems
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Apply custom sorting to top performers if needed
    if (filters.sortField && filters.sortOrder) {
      if (filters.sortField === "category") {
        topPerformingItems = sortProcessedData(
          topPerformingItems,
          "category",
          filters.sortOrder
        );
      } else {
        topPerformingItems = sortProcessedData(
          topPerformingItems,
          filters.sortField,
          filters.sortOrder
        );
      }
    }

    // Calculate total area with date filtering
    let totalArea = 0;

    // Helper function to add area with date filtering
    const addToTotalArea = (item, area, dateField) => {
      if (isNaN(area) || area <= 0) return;

      // Apply date filtering if specified
      if (dateField && (selectedYear !== "All" || selectedMonth !== "All")) {
        if (!item[dateField]) return;

        const itemDate = new Date(item[dateField]);
        if (isNaN(itemDate.getTime())) return;

        // Apply year filter
        if (selectedYear !== "All") {
          const itemYear = itemDate.getFullYear();
          if (itemYear !== Number(selectedYear)) return;
        }

        // Apply month filter
        if (selectedMonth !== "All") {
          const monthNames = [
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
          const itemMonth = monthNames[itemDate.getMonth()];
          if (itemMonth !== selectedMonth) return;
        }
      }

      totalArea += area;
    };

    // Add rice area
    rawData.rice.forEach((rice) => {
      const area = Number.parseFloat(rice.area_harvested || rice.area || 0);
      addToTotalArea(rice, area, "harvest_date");
    });

    // Add crop area
    rawData.crops.forEach((crop) => {
      const area = Number.parseFloat(crop.area_hectare || crop.area || 0);
      addToTotalArea(crop, area, "harvest_date");
    });

    // Add high value crop area
    rawData.highValueCrops.forEach((crop) => {
      const area = Number.parseFloat(crop.area_hectare || crop.area || 0);
      addToTotalArea(crop, area, "harvest_date");
    });

    // Add operator area
    rawData.operators.forEach((operator) => {
      const area = Number.parseFloat(operator.productive_area_sqm || 0) / 10000; // Convert sqm to hectares
      addToTotalArea(operator, area, "date_of_harvest");
    });

    // Calculate production trend (year over year) with proper filtering
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    let currentYearProduction = 0;
    let lastYearProduction = 0;

    // Function to add to yearly production with month filtering
    const addToYearlyProduction = (date, production) => {
      if (!date || isNaN(production) || production <= 0) return;

      const itemDate = new Date(date);
      if (isNaN(itemDate.getTime())) return;

      const year = itemDate.getFullYear();

      // Apply month filter if specified
      if (selectedMonth !== "All") {
        const monthNames = [
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
        const itemMonth = itemDate.getMonth();
        if (monthNames[itemMonth] !== selectedMonth) return;
      }

      if (year === currentYear) {
        currentYearProduction += production;
      } else if (year === lastYear) {
        lastYearProduction += production;
      }
    };

    // Process all data sources in parallel for yearly production
    // Rice production - keep in kg
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
        ? ((currentYearProduction - lastYearProduction) / lastYearProduction) *
          100
        : 0;

    // Prepare recent harvests data with proper filtering
    const allHarvests = [];

    // Helper function to add harvest with date filtering
    const addToHarvests = (item, harvestData, dateField) => {
      if (!item[dateField]) return;

      const harvestDate = new Date(item[dateField]);
      if (isNaN(harvestDate.getTime())) return;
      // Apply year filter
      if (selectedYear !== "All") {
        const itemYear = harvestDate.getFullYear();
        if (itemYear !== Number(selectedYear)) return;
      }

      // Apply month filter
      if (selectedMonth !== "All") {
        const monthNames = [
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
        const itemMonth = monthNames[harvestDate.getMonth()];
        if (itemMonth !== selectedMonth) return;
      }

      allHarvests.push(harvestData);
    };

    // Add rice harvests - keep in kg
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      if (production > 0) {
        const harvestData = {
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
        };
        addToHarvests(rice, harvestData, "harvest_date");
      }
    });

    // Add crop harvests
    rawData.crops.forEach((crop) => {
      const yield_amount = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      if (yield_amount > 0) {
        const harvestData = {
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
        };
        addToHarvests(crop, harvestData, "harvest_date");
      }
    });

    // Add high value crop harvests
    rawData.highValueCrops.forEach((crop) => {
      const yield_amount = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      if (yield_amount > 0) {
        const harvestData = {
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
        };
        addToHarvests(crop, harvestData, "harvest_date");
      }
    });

    // Add operator harvests
    rawData.operators.forEach((operator) => {
      const production = Number.parseFloat(operator.production_kg || 0);
      if (production > 0) {
        const harvestData = {
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
        };
        addToHarvests(operator, harvestData, "date_of_harvest");
      }
    });

    // Sort harvests by date (most recent first) and take top 5
    let recentHarvests = allHarvests
      .sort((a, b) => b.harvest_date - a.harvest_date)
      .slice(0, 5);

    // Apply custom sorting to recent harvests if needed
    if (filters.sortField && filters.sortOrder) {
      if (
        filters.sortField === "date" ||
        filters.sortField === "harvest_date"
      ) {
        recentHarvests = sortProcessedData(
          recentHarvests,
          "harvest_date",
          filters.sortOrder
        );
      } else if (filters.sortField === "farmer") {
        recentHarvests = sortProcessedData(
          recentHarvests,
          "farmer_name",
          filters.sortOrder
        );
      } else if (filters.sortField === "crop") {
        recentHarvests = sortProcessedData(
          recentHarvests,
          "crop_type",
          filters.sortOrder
        );
      } else {
        recentHarvests = sortProcessedData(
          recentHarvests,
          filters.sortField,
          filters.sortOrder
        );
      }
    }

    // Process farmer type distribution with proper filtering
    // Create sets for faster farmer ID lookups
    const allLivestockFarmerIds = new Set(
      rawData.livestock.map((record) => record.farmer_id).filter(Boolean)
    );
    const allOperatorFarmerIds = new Set(
      rawData.operators.map((record) => record.farmer_id).filter(Boolean)
    );
    const allCropFarmerIds = new Set(
      [
        ...rawData.crops.map((record) => record.farmer_id),
        ...rawData.rice.map((record) => record.farmer_id),
        ...rawData.highValueCrops.map((record) => record.farmer_id),
      ].filter(Boolean)
    );

    // Process farmer type distribution with specific mixed types
    const farmerTypeCount = {
      Grower: 0,
      Raiser: 0,
      Operator: 0,
      "Grower & Raiser": 0,
      "Grower & Operator": 0,
      "Raiser & Operator": 0,
      "All Types": 0,
    };

    // Count farmers by type, accounting for mixed types
    let totalFarmersCount = 0;

    // When using "All months" and "All years" filters, we should count all farmers
    // regardless of their activity dates
    rawData.farmers.forEach((farmer) => {
      if (!farmer.farmer_id) return;

      // Check which types this farmer belongs to
      const isGrowerType = allCropFarmerIds.has(farmer.farmer_id);
      const isRaiserType = allLivestockFarmerIds.has(farmer.farmer_id);
      const isOperatorType = allOperatorFarmerIds.has(farmer.farmer_id);

      // Skip farmers with no activity in any category
      if (!isGrowerType && !isRaiserType && !isOperatorType) {
        return;
      }

      totalFarmersCount++;

      // Determine the farmer's category based on their types
      if (isGrowerType && isRaiserType && isOperatorType) {
        farmerTypeCount["All Types"]++;
      } else if (isGrowerType && isRaiserType) {
        farmerTypeCount["Grower & Raiser"]++;
      } else if (isGrowerType && isOperatorType) {
        farmerTypeCount["Grower & Operator"]++;
      } else if (isRaiserType && isOperatorType) {
        farmerTypeCount["Raiser & Operator"]++;
      } else if (isGrowerType) {
        farmerTypeCount.Grower++;
      } else if (isRaiserType) {
        farmerTypeCount.Raiser++;
      } else if (isOperatorType) {
        farmerTypeCount.Operator++;
      }
    });

    // Convert to array for chart
    let farmerTypeDistribution = Object.entries(farmerTypeCount)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by value in descending order

    // Apply custom sorting to farmer type distribution if needed
    if (filters.sortField === "farmerType") {
      farmerTypeDistribution = sortProcessedData(
        farmerTypeDistribution,
        "name",
        filters.sortOrder
      );
    } else if (filters.sortField === "count" || filters.sortField === "value") {
      farmerTypeDistribution = sortProcessedData(
        farmerTypeDistribution,
        "value",
        filters.sortOrder
      );
    }

    // Return processed dashboard data
    return {
      totalProduction,
      cropProduction,
      monthlyProduction,
      productionByBarangay,
      topPerformingItems,
      recentHarvests,
      productionTrend,
      totalFarmers: totalFarmersCount,
      totalArea,
      farmerTypeDistribution,
      categoryData,
    };
  } catch (error) {
    console.error("Error processing data:", error);
    return {
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
        vegetables: { total: 0, items: [] },
        fish: { total: 0, items: [] },
        highValueCrops: { total: 0, items: [] },
      },
    };
  }
}
