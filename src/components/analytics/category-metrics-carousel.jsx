"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function CategoryMetricsCarousel({
  categories,
  rawData,
  loading,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Date range filter states
  const [useRangeFilter, setUseRangeFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Extract available years from data
  useEffect(() => {
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
    setAvailableYears(Array.from(years).sort((a, b) => b - a));

    // Set default date range
    if (!startDate) {
      const defaultStartDate = new Date(currentYear, 0, 1);
      setStartDate(defaultStartDate.toISOString().split("T")[0]);
    }

    if (!endDate) {
      const defaultEndDate = new Date();
      setEndDate(defaultEndDate.toISOString().split("T")[0]);
    }
  }, [rawData]);

  // Update metrics when active index or selected year changes
  useEffect(() => {
    if (categories.length === 0) return;

    const activeCategory = categories[activeIndex];
    const newMetrics = prepareCategoryMetrics(activeCategory);
    setMetrics(newMetrics);
  }, [
    activeIndex,
    selectedYear,
    startDate,
    endDate,
    useRangeFilter,
    rawData,
    categories,
  ]);

  // Prepare category-specific metrics
  const prepareCategoryMetrics = (category) => {
    switch (category.id) {
      case "rice":
        return prepareRiceMetrics();
      case "livestock":
        return prepareLivestockMetrics();
      case "banana":
        return prepareBananaMetrics();
      case "vegetables":
        return prepareVegetablesMetrics();
      case "legumes":
        return prepareLegumesMetrics();
      case "spices":
        return prepareSpicesMetrics();
      case "fish":
        return prepareFishMetrics();
      case "highValueCrops":
        return prepareHighValueCropsMetrics();
      default:
        return [];
    }
  };

  // Helper function to check if a date is within the selected range
  const isDateInRange = (dateString) => {
    if (!dateString) return false;

    if (useRangeFilter && startDate && endDate) {
      const date = new Date(dateString);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set time to midnight for accurate date comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return date >= start && date <= end;
    } else {
      // If not using range filter, use the year filter
      const date = new Date(dateString);
      return date.getFullYear() === selectedYear;
    }
  };

  // Helper functions to prepare metrics for each category
  const prepareRiceMetrics = () => {
    // Filter rice data based on selected filter type
    const filteredData = rawData.rice.filter((item) => {
      if (!item.harvest_date) return false;
      return isDateInRange(item.harvest_date);
    });

    // Calculate average yield per hectare
    let totalYield = 0;
    let totalArea = 0;
    const varietiesMap = {};
    const barangayMap = {};

    filteredData.forEach((item) => {
      const yield_amount = Number.parseFloat(
        item.production || item.yield_amount || 0
      );
      const area = Number.parseFloat(item.area_harvested || item.area || 0);

      totalYield += yield_amount;
      totalArea += area;

      // Count varieties
      const variety = item.variety || item.seed_type || "Unknown";
      varietiesMap[variety] = (varietiesMap[variety] || 0) + 1;

      // Count by barangay
      if (item.barangay) {
        barangayMap[item.barangay] =
          (barangayMap[item.barangay] || 0) + yield_amount;
      }
    });

    const avgYield = totalArea > 0 ? totalYield / totalArea : 0;

    // Get top varieties
    const varieties = Object.entries(varietiesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Get top barangays
    const topBarangays = Object.entries(barangayMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-green-600" />,
        color: "bg-green-50 border-green-100",
        textColor: "text-green-700",
      },
      {
        name: "Total Production",
        value: totalYield.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-green-600" />,
        color: "bg-green-50 border-green-100",
        textColor: "text-green-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-green-600" />,
        color: "bg-green-50 border-green-100",
        textColor: "text-green-700",
      },
      {
        name: "Farmers",
        value: new Set(filteredData.map((item) => item.farmer_id)).size,
        unit: "count",
        icon: <Users className="w-6 h-6 text-green-600" />,
        color: "bg-green-50 border-green-100",
        textColor: "text-green-700",
      },
      {
        name: "Varieties",
        value: Object.keys(varietiesMap).length,
        unit: "types",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-green-600">
            🌾
          </div>
        ),
        color: "bg-green-50 border-green-100",
        textColor: "text-green-700",
      },
    ];
  };

  const prepareLivestockMetrics = () => {
    // Filter livestock data based on selected filter type
    const filteredData = rawData.livestock.filter((item) => {
      if (!item.created_at) return false;
      return isDateInRange(item.created_at);
    });

    // Calculate metrics
    let totalHeads = 0;
    const animalTypesMap = {};
    const farmersMap = {};
    const barangayMap = {};

    filteredData.forEach((item) => {
      const quantity = Number.parseInt(item.quantity || 0);
      totalHeads += quantity;

      // Count animal types
      const animalType = item.animal_type || "Unknown";
      animalTypesMap[animalType] = (animalTypesMap[animalType] || 0) + quantity;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }

      // Count by barangay
      if (item.barangay) {
        barangayMap[item.barangay] =
          (barangayMap[item.barangay] || 0) + quantity;
      }
    });

    // Get top animal types
    const animalTypes = Object.entries(animalTypesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return [
      {
        name: "Total Heads",
        value: totalHeads.toLocaleString(),
        unit: "animals",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-purple-600">
            🐄
          </div>
        ),
        color: "bg-purple-50 border-purple-100",
        textColor: "text-purple-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-purple-600" />,
        color: "bg-purple-50 border-purple-100",
        textColor: "text-purple-700",
      },
      {
        name: "Animal Types",
        value: Object.keys(animalTypesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-purple-600">
            🐖
          </div>
        ),
        color: "bg-purple-50 border-purple-100",
        textColor: "text-purple-700",
      },
      {
        name: "Average per Farmer",
        value:
          Object.keys(farmersMap).length > 0
            ? (totalHeads / Object.keys(farmersMap).length).toFixed(1)
            : "0",
        unit: "heads/farmer",
        icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
        color: "bg-purple-50 border-purple-100",
        textColor: "text-purple-700",
      },
      {
        name: "Top Animal",
        value: animalTypes.length > 0 ? animalTypes[0].name : "None",
        unit: "",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-purple-600">
            🏆
          </div>
        ),
        color: "bg-purple-50 border-purple-100",
        textColor: "text-purple-700",
      },
    ];
  };

  const prepareBananaMetrics = () => {
    // Filter banana data based on selected filter type
    const filteredData = rawData.crops.filter((item) => {
      if (!item.harvest_date) return false;
      return (
        isDateInRange(item.harvest_date) &&
        ((item.crop_type && item.crop_type.toLowerCase().includes("banana")) ||
          (item.crop_value && item.crop_value.toLowerCase().includes("banana")))
      );
    });

    // Calculate metrics
    let totalProduction = 0;
    let totalArea = 0;
    const varietiesMap = {};
    const farmersMap = {};
    const barangayMap = {};

    filteredData.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      // Count varieties
      const variety = item.crop_value || "Unknown";
      varietiesMap[variety] = (varietiesMap[variety] || 0) + 1;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }

      // Count by barangay
      if (item.barangay) {
        barangayMap[item.barangay] =
          (barangayMap[item.barangay] || 0) + production;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-yellow-600" />,
        color: "bg-yellow-50 border-yellow-100",
        textColor: "text-yellow-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-yellow-600" />,
        color: "bg-yellow-50 border-yellow-100",
        textColor: "text-yellow-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-yellow-600" />,
        color: "bg-yellow-50 border-yellow-100",
        textColor: "text-yellow-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-yellow-600" />,
        color: "bg-yellow-50 border-yellow-100",
        textColor: "text-yellow-700",
      },
      {
        name: "Varieties",
        value: Object.keys(varietiesMap).length,
        unit: "types",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-yellow-600">
            🍌
          </div>
        ),
        color: "bg-yellow-50 border-yellow-100",
        textColor: "text-yellow-700",
      },
    ];
  };

  const prepareVegetablesMetrics = () => {
    // Filter vegetables data based on selected filter type
    const filteredData = rawData.crops.filter((item) => {
      if (!item.harvest_date) return false;
      return (
        isDateInRange(item.harvest_date) &&
        ((item.crop_type &&
          item.crop_type.toLowerCase().includes("vegetable")) ||
          (item.crop_value &&
            item.crop_value.toLowerCase().includes("vegetable")))
      );
    });

    // Calculate metrics
    let totalProduction = 0;
    let totalArea = 0;
    const typesMap = {};
    const farmersMap = {};

    filteredData.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      // Count types
      const type = item.crop_value || "Unknown";
      typesMap[type] = (typesMap[type] || 0) + 1;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
        color: "bg-orange-50 border-orange-100",
        textColor: "text-orange-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
        color: "bg-orange-50 border-orange-100",
        textColor: "text-orange-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-orange-600" />,
        color: "bg-orange-50 border-orange-100",
        textColor: "text-orange-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-orange-600" />,
        color: "bg-orange-50 border-orange-100",
        textColor: "text-orange-700",
      },
      {
        name: "Vegetable Types",
        value: Object.keys(typesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-orange-600">
            🥕
          </div>
        ),
        color: "bg-orange-50 border-orange-100",
        textColor: "text-orange-700",
      },
    ];
  };

  const prepareLegumesMetrics = () => {
    // Filter legumes data based on selected filter type
    const filteredData = rawData.crops.filter((item) => {
      if (!item.harvest_date) return false;
      return (
        isDateInRange(item.harvest_date) &&
        ((item.crop_type && item.crop_type.toLowerCase().includes("legume")) ||
          (item.crop_value && item.crop_value.toLowerCase().includes("legume")))
      );
    });

    let totalProduction = 0;
    let totalArea = 0;
    const typesMap = {};
    const farmersMap = {};

    filteredData.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      const type = item.crop_value || "Unknown";
      typesMap[type] = (typesMap[type] || 0) + 1;

      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
        color: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
        color: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-emerald-600" />,
        color: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-emerald-600" />,
        color: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-700",
      },
      {
        name: "Legume Types",
        value: Object.keys(typesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-emerald-600">
            🌱
          </div>
        ),
        color: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-700",
      },
    ];
  };

  const prepareSpicesMetrics = () => {
    // Filter spices data based on selected filter type
    const filteredData = rawData.crops.filter((item) => {
      if (!item.harvest_date) return false;
      return (
        isDateInRange(item.harvest_date) &&
        ((item.crop_type && item.crop_type.toLowerCase().includes("spice")) ||
          (item.crop_value && item.crop_value.toLowerCase().includes("spice")))
      );
    });

    let totalProduction = 0;
    let totalArea = 0;
    const typesMap = {};
    const farmersMap = {};

    filteredData.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      const type = item.crop_value || "Unknown";
      typesMap[type] = (typesMap[type] || 0) + 1;

      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-red-600" />,
        color: "bg-red-50 border-red-100",
        textColor: "text-red-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-red-600" />,
        color: "bg-red-50 border-red-100",
        textColor: "text-red-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-red-600" />,
        color: "bg-red-50 border-red-100",
        textColor: "text-red-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-red-600" />,
        color: "bg-red-50 border-red-100",
        textColor: "text-red-700",
      },
      {
        name: "Spice Types",
        value: Object.keys(typesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-red-600">
            🌶️
          </div>
        ),
        color: "bg-red-50 border-red-100",
        textColor: "text-red-700",
      },
    ];
  };

  const prepareFishMetrics = () => {
    // Filter fish data based on selected filter type
    // First, check for fish in crops data
    const fishCrops = rawData.crops.filter((item) => {
      if (!item.harvest_date) return false;
      return (
        isDateInRange(item.harvest_date) &&
        ((item.crop_type && item.crop_type.toLowerCase().includes("fish")) ||
          (item.crop_value && item.crop_value.toLowerCase().includes("fish")))
      );
    });

    // Then, check for fish in operators data
    const fishOperators = rawData.operators.filter((item) => {
      if (!item.date_of_harvest) return false;
      return (
        isDateInRange(item.date_of_harvest) &&
        ((item.category && item.category.toLowerCase().includes("fish")) ||
          (item.cultured_species &&
            item.cultured_species.toLowerCase().includes("fish")) ||
          (item.machine_type &&
            item.machine_type.toLowerCase().includes("fish")))
      );
    });

    // Combine all fish data
    const filteredData = [...fishCrops, ...fishOperators];

    // Calculate metrics
    let totalProduction = 0;
    let totalArea = 0;
    const speciesMap = {};
    const farmersMap = {};

    // Process fish crops
    fishCrops.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      // Count species
      const species = item.crop_value || item.crop_type || "Unknown Fish";
      speciesMap[species] = (speciesMap[species] || 0) + 1;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    // Process fish operators
    fishOperators.forEach((item) => {
      const production = Number.parseFloat(item.production_kg || 0);
      const area = Number.parseFloat(item.productive_area_sqm || 0) / 10000; // Convert sqm to hectares

      totalProduction += production;
      totalArea += area;

      // Count species
      const species = item.cultured_species || "Unknown Fish";
      speciesMap[species] = (speciesMap[species] || 0) + 1;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "kg/ha",
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
        color: "bg-blue-50 border-blue-100",
        textColor: "text-blue-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
        color: "bg-blue-50 border-blue-100",
        textColor: "text-blue-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-blue-600" />,
        color: "bg-blue-50 border-blue-100",
        textColor: "text-blue-700",
      },
      {
        name: "Operators",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-blue-600" />,
        color: "bg-blue-50 border-blue-100",
        textColor: "text-blue-700",
      },
      {
        name: "Fish Species",
        value: Object.keys(speciesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-blue-600">
            🐟
          </div>
        ),
        color: "bg-blue-50 border-blue-100",
        textColor: "text-blue-700",
      },
    ];
  };

  const prepareHighValueCropsMetrics = () => {
    // Filter high value crops data based on selected filter type
    const filteredData = rawData.highValueCrops.filter((item) => {
      if (!item.harvest_date) return false;
      return isDateInRange(item.harvest_date);
    });

    // Calculate metrics
    let totalProduction = 0;
    let totalArea = 0;
    const typesMap = {};
    const farmersMap = {};

    filteredData.forEach((item) => {
      const production = Number.parseFloat(
        item.yield_amount || item.production || item.quantity || 0
      );
      const area = Number.parseFloat(item.area_hectare || item.area || 0);

      totalProduction += production;
      totalArea += area;

      // Count types
      const type = item.crop_value || "Unknown";
      typesMap[type] = (typesMap[type] || 0) + 1;

      // Count farmers
      if (item.farmer_id) {
        farmersMap[item.farmer_id] = true;
      }
    });

    const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;

    return [
      {
        name: "Average Yield",
        value: avgYield.toFixed(2),
        unit: "tons/ha",
        icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
        color: "bg-amber-50 border-amber-100",
        textColor: "text-amber-700",
      },
      {
        name: "Total Production",
        value: totalProduction.toFixed(2),
        unit: "kg",
        icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
        color: "bg-amber-50 border-amber-100",
        textColor: "text-amber-700",
      },
      {
        name: "Total Area",
        value: totalArea.toFixed(2),
        unit: "hectares",
        icon: <MapPin className="w-6 h-6 text-amber-600" />,
        color: "bg-amber-50 border-amber-100",
        textColor: "text-amber-700",
      },
      {
        name: "Farmers",
        value: Object.keys(farmersMap).length,
        unit: "count",
        icon: <Users className="w-6 h-6 text-amber-600" />,
        color: "bg-amber-50 border-amber-100",
        textColor: "text-amber-700",
      },
      {
        name: "Crop Types",
        value: Object.keys(typesMap).length,
        unit: "varieties",
        icon: (
          <div className="flex items-center justify-center w-6 h-6 text-lg text-amber-600">
            🌿
          </div>
        ),
        color: "bg-amber-50 border-amber-100",
        textColor: "text-amber-700",
      },
    ];
  };

  // Navigation handlers
  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === categories.length - 1 ? 0 : prev + 1));
  };

  // Get background gradient based on category
  const getCategoryGradient = () => {
    const gradients = {
      rice: "from-green-50 to-green-100",
      livestock: "from-purple-50 to-purple-100",
      banana: "from-yellow-50 to-yellow-100",
      vegetables: "from-orange-50 to-orange-100",
      legumes: "from-emerald-50 to-emerald-100",
      spices: "from-red-50 to-red-100",
      fish: "from-blue-50 to-blue-100",
      highValueCrops: "from-amber-50 to-amber-100",
    };

    return gradients[categories[activeIndex]?.id] || "from-gray-50 to-gray-100";
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Render trend icon based on trend direction
  const renderTrendIcon = (trend) => {
    if (trend === "up") {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === "down") {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
      {/* Header with filter */}
      <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="mb-2 text-xl font-semibold text-gray-800 sm:mb-0">
          Category Performance Metrics
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>

          {!useRangeFilter && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="py-2 pr-3 text-sm bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer pl-9 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Calendar className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="mb-6 overflow-hidden transition-all duration-300 ease-in-out">
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Filter Options
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="useRangeFilter"
                    checked={useRangeFilter}
                    onChange={() => setUseRangeFilter(!useRangeFilter)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="useRangeFilter"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Use Date Range Filter
                  </label>
                </div>

                {useRangeFilter ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-500">
                      Year
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableYears.slice(0, 5).map((year) => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            selectedYear === year
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveIndex(index)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center ${
                        activeIndex === index
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display selected date range */}
            {useRangeFilter && startDate && endDate && (
              <div className="p-2 mt-3 text-sm text-blue-700 rounded-md bg-blue-50">
                <span className="font-medium">Selected Range:</span>{" "}
                {formatDateForDisplay(startDate)} to{" "}
                {formatDateForDisplay(endDate)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category header with navigation */}
      <div
        className={`flex items-center justify-between p-4 mb-6 rounded-lg bg-gradient-to-r ${getCategoryGradient()}`}
      >
        <button
          onClick={goToPrevious}
          className="p-2 text-gray-600 transition-all bg-white rounded-full bg-opacity-70 hover:bg-opacity-100"
          aria-label="Previous category"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center mb-1">
            <span className="mr-2 text-2xl">
              {categories[activeIndex]?.icon}
            </span>
            <h3 className="text-xl font-bold text-gray-800">
              {categories[activeIndex]?.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {useRangeFilter
              ? `Performance metrics from ${formatDateForDisplay(
                  startDate
                )} to ${formatDateForDisplay(endDate)}`
              : `Performance metrics for ${selectedYear}`}
          </p>
        </div>

        <button
          onClick={goToNext}
          className="p-2 text-gray-600 transition-all bg-white rounded-full bg-opacity-70 hover:bg-opacity-100"
          aria-label="Next category"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Metrics display */}
      <div className="relative overflow-hidden">
        <div className="transition-opacity duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading metrics...</p>
            </div>
          ) : metrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 mb-4 bg-gray-100 rounded-full">
                <div className="text-4xl">{categories[activeIndex]?.icon}</div>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-700">
                No data available
              </h3>
              <p className="max-w-md text-gray-500">
                There is no data available for {categories[activeIndex]?.name}{" "}
                {useRangeFilter
                  ? `between ${formatDateForDisplay(
                      startDate
                    )} and ${formatDateForDisplay(endDate)}`
                  : `in ${selectedYear}`}
                . Try selecting a different time period or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-lg border ${metric.color} hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-500">
                      {metric.name}
                    </h4>
                    {metric.icon}
                  </div>
                  <div className={`text-2xl font-bold ${metric.textColor}`}>
                    {metric.value}
                  </div>
                  {metric.unit && (
                    <div className="mt-1 text-xs text-gray-500">
                      {metric.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex
                ? "bg-green-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
