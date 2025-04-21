// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Process all data for dashboard
export const processData = (rawData) => {
  try {
    // Process data for each category
    const categoryData = {
      livestock: processLivestockData(rawData.livestock),
      rice: processRiceData(rawData.rice),
      banana: processBananaData(rawData.crops),
      legumes: processLegumesData(rawData.crops),
      spices: processSpicesData(rawData.crops),
      fish: processFishData(rawData.crops, rawData.operators),
      highValueCrops: processHighValueCropsData(rawData.highValueCrops),
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

    // Process all data sources for barangay production
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToBarangayMap(rice, production);
    });

    rawData.crops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangayMap(crop, production);
    });

    rawData.highValueCrops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangayMap(crop, production);
    });

    rawData.livestock.forEach((livestock) => {
      const quantity = Number.parseInt(livestock.quantity || 0);
      addToBarangayMap(livestock, quantity);
    });

    rawData.operators.forEach((operator) => {
      const production = Number.parseFloat(operator.production_kg || 0);
      addToBarangayMap(operator, production);
    });

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
      const area = Number.parseFloat(operator.productive_area_sqm || 0) / 10000; // Convert sqm to hectares
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

    // Process all data sources for yearly production
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToYearlyProduction(rice.harvest_date || rice.created_at, production);
    });

    rawData.crops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToYearlyProduction(crop.harvest_date || crop.created_at, production);
    });

    rawData.highValueCrops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToYearlyProduction(crop.harvest_date || crop.created_at, production);
    });

    rawData.operators.forEach((operator) => {
      const production = Number.parseFloat(operator.production_kg || 0);
      addToYearlyProduction(
        operator.date_of_harvest || operator.created_at,
        production
      );
    });

    // Calculate production trend percentage
    const productionTrend =
      lastYearProduction > 0
        ? ((currentYearProduction - lastYearProduction) / lastYearProduction) *
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

    return {
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
        fish: { total: 0, items: [] },
        highValueCrops: { total: 0, items: [] },
      },
    };
  }
};

// Helper functions for data processing
function processLivestockData(livestock) {
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

  return { total, items };
}

function processRiceData(riceData) {
  const varietyMap = {};

  riceData.forEach((rice) => {
    const variety = rice.variety || rice.seed_type || "Unknown Rice";
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

  return { total, items };
}

function processBananaData(crops) {
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
    let variety = crop.crop_value || crop.variety_clone || "Unknown Banana";
    let productionData = {};

    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
        if (productionData.crop) {
          variety = productionData.crop;
        }
      } catch (e) {
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

    let production = 0;
    if (
      productionData.quantity &&
      !isNaN(Number.parseFloat(productionData.quantity))
    ) {
      production = Number.parseFloat(productionData.quantity);
    } else if (crop.quantity && !isNaN(Number.parseFloat(crop.quantity))) {
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

  return { total, items };
}

// Helper functions for other crop types
function processLegumesData(crops) {
  // Similar implementation as processBananaData but for legumes
  const legumesTypeMap = {};

  // Filter legume crops
  const legumeCrops = crops.filter(
    (crop) =>
      (crop.crop_type && isLegume(crop.crop_type.toLowerCase())) ||
      (crop.crop_value && isLegume(crop.crop_value.toLowerCase()))
  );

  // Process legume crops
  // ... (similar to banana processing)

  const items = Object.entries(legumesTypeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((sum, item) => sum + item.value, 0);

  return { total, items };
}

function processSpicesData(crops) {
  // Similar implementation for spices
  return { total: 0, items: [] };
}

function processFishData(crops, operators) {
  // Similar implementation for fish data
  return { total: 0, items: [] };
}

function processHighValueCropsData(highValueCrops) {
  // Similar implementation for high value crops
  return { total: 0, items: [] };
}

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
  return fishTypes.some((fish) => cropType.includes(fish));
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
