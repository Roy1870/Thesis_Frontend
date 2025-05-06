"use client";

import { useState } from "react";
import {
  Sprout,
  Fish,
  Wheat,
  Banana,
  Leaf,
  Users,
  PieChart,
} from "lucide-react";

export default function DashboardStats({ dashboardData }) {
  // Helper function to format numbers with commas and handle kg/tons conversion
  const formatNumber = (num, convertToTons = false) => {
    // Parse the number if it's a string
    const numValue = typeof num === "string" ? Number.parseFloat(num) : num;

    // If we need to convert to tons and the value is >= 1000kg
    if (convertToTons && numValue >= 1000) {
      return (numValue / 1000)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Otherwise format with appropriate decimal places
    return numValue
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to format percentage
  const formatPercentage = (num) => {
    return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  };

  // State for the active tab
  const [activeTab, setActiveTab] = useState("overview");

  // Define the tabs
  const tabs = [{ id: "overview", label: "Overview" }];

  // Colors for farmer type distribution
  const farmerTypeColors = {
    Grower: "#4CAF50",
    Raiser: "#8884d8",
    Operator: "#2196F3",
    "Grower & Raiser": "#9C27B0",
    "Grower & Operator": "#FF9800",
    "Raiser & Operator": "#E91E63",
    "Grower, Raiser & Operator": "#795548",
  };

  // Get top categories dynamically based on production values
  const getTopCategories = () => {
    const categories = Object.entries(dashboardData.categoryData)
      .map(([key, data]) => ({
        key,
        name: getCategoryName(key),
        total: data.total,
        unit: key === "livestock" ? "heads" : key === "rice" ? "kg" : "tons",
      }))
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4); // Get top 4 categories

    return categories;
  };

  // Helper function to get category name for display
  const getCategoryName = (category) => {
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
  };

  // Helper function to get category icon with correct color
  const getCategoryIcon = (category) => {
    switch (category) {
      case "rice":
        return (
          <div className="p-1.5 mr-2 text-green-600 bg-green-50 rounded-md">
            <Wheat className="w-4 h-4" />
          </div>
        );
      case "livestock":
        return (
          <div className="p-1.5 mr-2 text-purple-600 bg-purple-50 rounded-md">
            <Leaf className="w-4 h-4" />
          </div>
        );
      case "fish":
        return (
          <div className="p-1.5 mr-2 text-blue-600 bg-blue-50 rounded-md">
            <Fish className="w-4 h-4" />
          </div>
        );
      case "banana":
        return (
          <div className="p-1.5 mr-2 text-yellow-600 bg-yellow-50 rounded-md">
            <Banana className="w-4 h-4" />
          </div>
        );
      case "vegetables":
        return (
          <div className="p-1.5 mr-2 text-orange-600 bg-orange-50 rounded-md">
            <Sprout className="w-4 h-4" />
          </div>
        );
      case "legumes":
        return (
          <div className="p-1.5 mr-2 text-emerald-600 bg-emerald-50 rounded-md">
            <Leaf className="w-4 h-4" />
          </div>
        );
      case "spices":
        return (
          <div className="p-1.5 mr-2 text-red-600 bg-red-50 rounded-md">
            <Leaf className="w-4 h-4" />
          </div>
        );
      case "highValueCrops":
        return (
          <div className="p-1.5 mr-2 text-amber-600 bg-amber-50 rounded-md">
            <Sprout className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 mr-2 text-gray-600 bg-gray-50 rounded-md">
            <Leaf className="w-4 h-4" />
          </div>
        );
    }
  };

  // Dummy rawData for fallback
  const rawData = {
    farmers: [],
  };

  // Get top categories
  const topCategories = getTopCategories();

  // Get barangay data
  const barangayData = dashboardData.productionByBarangay || [];

  return (
    <div className="mb-10">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Top Categories */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white rounded-lg bg-emerald-600">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Top Categories
                </h4>
              </div>

              <div className="space-y-4">
                {/* Dynamically render top categories */}
                {topCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {getCategoryIcon(category.key)}
                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {category.key !== "livestock" && category.total < 1000
                        ? formatNumber(category.total.toFixed(2), false)
                        : formatNumber(
                            category.key === "livestock"
                              ? category.total
                              : category.total.toFixed(2),
                            category.key !== "livestock"
                          )}{" "}
                      {category.key === "livestock"
                        ? "heads"
                        : category.key !== "livestock" && category.total < 1000
                        ? "kg"
                        : "tons"}
                    </span>
                  </div>
                ))}

                {/* If we have fewer than 4 categories with data, fill with empty entries */}
                {topCategories.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No production data available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Farmer Statistics */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-purple-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Farmer Statistics
                </h4>
              </div>

              <div className="mb-4">
                <p className="mb-1 text-sm font-medium text-gray-500">
                  Total Registered Farmers
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatNumber(
                    dashboardData?.totalFarmers || rawData?.farmers?.length || 0
                  )}
                </p>
              </div>

              {/* Farmer Type Distribution */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center mb-3">
                  <PieChart className="w-4 h-4 mr-2 text-gray-600" />
                  <h5 className="text-sm font-medium text-gray-700">
                    Farmer Type Distribution
                  </h5>
                </div>

                {dashboardData?.farmerTypeDistribution &&
                dashboardData?.farmerTypeDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData?.farmerTypeDistribution.map(
                      (type, index) => {
                        // Calculate percentage
                        const totalFarmers =
                          dashboardData?.farmerTypeDistribution.reduce(
                            (sum, item) => sum + (item.value || 0),
                            0
                          );
                        const percentage =
                          totalFarmers > 0
                            ? ((type.value / totalFarmers) * 100).toFixed(1)
                            : 0;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 mr-2 rounded-sm"
                                style={{
                                  backgroundColor:
                                    farmerTypeColors[type.name] || "#6A9C89",
                                }}
                              ></div>
                              <span className="text-sm text-gray-600">
                                {type.name}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2 text-sm font-semibold text-gray-800">
                                {formatNumber(type.value || 0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No farmer type data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
