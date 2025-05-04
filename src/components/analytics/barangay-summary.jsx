"use client";

import { useState, useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BarangaySummary({ rawData, categories, loading }) {
  const [sortField, setSortField] = useState("totalProduction");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCategories, setVisibleCategories] = useState(
    categories ? categories.map((cat) => cat.id) : []
  );

  // Process data to get barangay summary
  const barangaySummaryData = useMemo(() => {
    if (!rawData || loading) return [];

    // Create a map to store data by barangay
    const barangayMap = new Map();

    // Helper function to add production to barangay data
    const addToBarangay = (barangay, category, value) => {
      if (!barangay || barangay === "Unknown" || isNaN(value) || value <= 0)
        return;

      if (!barangayMap.has(barangay)) {
        // Initialize barangay data with all categories set to 0
        const barangayData = {
          name: barangay,
          totalProduction: 0,
        };

        // Initialize all category values to 0
        categories.forEach((cat) => {
          barangayData[cat.id] = 0;
        });

        barangayMap.set(barangay, barangayData);
      }

      // Update the category value and total
      const barangayData = barangayMap.get(barangay);
      barangayData[category] = (barangayData[category] || 0) + value;
      barangayData.totalProduction += value;
    };

    // Process rice data
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToBarangay(rice.barangay, "rice", production);
    });

    // Process crops data
    rawData.crops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );

      // Determine category based on crop type
      const cropType = (crop.crop_type || "").toLowerCase();
      const cropValue = (crop.crop_value || "").toLowerCase();

      let category = "highValueCrops"; // Default category

      if (cropType.includes("banana") || cropValue.includes("banana")) {
        category = "banana";
      } else if (
        cropType.includes("vegetable") ||
        cropValue.includes("vegetable") ||
        cropType.includes("tomato") ||
        cropValue.includes("tomato") ||
        cropType.includes("eggplant") ||
        cropValue.includes("eggplant") ||
        cropType.includes("cabbage") ||
        cropValue.includes("cabbage")
      ) {
        category = "vegetables";
      } else if (
        cropType.includes("legume") ||
        cropValue.includes("legume") ||
        cropType.includes("bean") ||
        cropValue.includes("bean")
      ) {
        category = "legumes";
      } else if (cropType.includes("spice") || cropValue.includes("spice")) {
        category = "spices";
      }

      addToBarangay(crop.barangay, category, production);
    });

    // Process high value crops
    rawData.highValueCrops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangay(crop.barangay, "highValueCrops", production);
    });

    // Process livestock data
    rawData.livestock.forEach((item) => {
      const quantity = Number.parseFloat(item.quantity || 0);
      addToBarangay(item.barangay, "livestock", quantity);
    });

    // Process fish data from operators
    rawData.operators.forEach((operator) => {
      if (operator.cultured_species || operator.category === "Fish") {
        const production = Number.parseFloat(
          operator.production_kg || operator.production_volume || 0
        );
        addToBarangay(operator.barangay, "fish", production);
      }
    });

    // Convert map to array and return
    return Array.from(barangayMap.values());
  }, [rawData, categories, loading]);

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    if (!barangaySummaryData.length) return [];

    // Filter by search term
    let filteredData = barangaySummaryData;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = barangaySummaryData.filter((item) =>
        item.name.toLowerCase().includes(term)
      );
    }

    // Sort data
    return [...filteredData]
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortField] - b[sortField];
        } else {
          return b[sortField] - a[sortField];
        }
      })
      .slice(0, 15); // Limit to 15 barangays for better visualization
  }, [barangaySummaryData, sortField, sortDirection, searchTerm]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Toggle category visibility
  const toggleCategory = (categoryId) => {
    setVisibleCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Get chart colors for categories
  const getCategoryColor = (categoryId) => {
    const colors = {
      rice: "#4CAF50", // green
      livestock: "#9C27B0", // purple
      banana: "#FFC107", // yellow
      vegetables: "#FF9800", // orange
      legumes: "#26A69A", // teal
      spices: "#F44336", // red
      fish: "#2196F3", // blue
      highValueCrops: "#8BC34A", // light green
    };
    return colors[categoryId] || "#9E9E9E"; // default to grey
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-md shadow-md">
          <p className="font-semibold">{label}</p>
          <div className="mt-2">
            {payload.map((entry, index) => (
              <div key={`tooltip-${index}`} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm">
                  {entry.name}: {formatNumber(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full h-8 mb-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full bg-gray-100 rounded h-80 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Barangay Production Summary
        </h2>
        <p className="text-gray-600">
          Agricultural production by barangay across all categories
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row">
        {/* Search input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="totalProduction">Total Production</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              visibleCategories.includes(category.id)
                ? "bg-white text-gray-800 border border-gray-300 shadow-sm"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getCategoryColor(category.id) }}
            ></span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      {sortedAndFilteredData.length > 0 ? (
        <div className="mt-4" style={{ height: "500px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedAndFilteredData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) => (
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    <span>{value}</span>
                  </span>
                )}
              />
              {categories
                .filter((cat) => visibleCategories.includes(cat.id))
                .map((category) => (
                  <Bar
                    key={category.id}
                    dataKey={category.id}
                    name={category.name}
                    stackId="a"
                    fill={getCategoryColor(category.id)}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg h-80 bg-gray-50">
          <p className="text-gray-500">
            {searchTerm
              ? "No barangays match your search"
              : "No data available"}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {sortedAndFilteredData.length} of {barangaySummaryData.length}{" "}
        barangays
        {sortedAndFilteredData.length < barangaySummaryData.length &&
          " (limited to 15 for better visualization)"}
      </div>
    </div>
  );
}
