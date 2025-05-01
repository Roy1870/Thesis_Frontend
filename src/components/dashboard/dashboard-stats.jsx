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
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to format percentage
  const formatPercentage = (num) => {
    return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  };

  // State for the active tab
  const [activeTab, setActiveTab] = useState("overview");

  // Define the tabs
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "crops", label: "Crops" },
    { id: "livestock", label: "Livestock & Fish" },
  ];

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

  // Dummy rawData for fallback
  const rawData = {
    farmers: [],
  };

  return (
    <div className="mb-10">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Production Statistics
        </h3>
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
                <div className="p-2 mr-3 text-white bg-green-600 rounded-lg">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Top Categories
                </h4>
              </div>

              <div className="space-y-4">
                {/* Rice */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-1.5 mr-2 text-yellow-600 bg-yellow-100 rounded-md">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Rice
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatNumber(
                      dashboardData.categoryData.rice.total.toFixed(2)
                    )}{" "}
                    tons
                  </span>
                </div>

                {/* Banana */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-1.5 mr-2 text-orange-600 bg-orange-100 rounded-md">
                      <Banana className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Banana
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatNumber(
                      dashboardData.categoryData.banana.total.toFixed(2)
                    )}{" "}
                    tons
                  </span>
                </div>

                {/* Livestock */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-1.5 mr-2 text-green-600 bg-green-100 rounded-md">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Livestock
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatNumber(dashboardData.categoryData.livestock.total)}{" "}
                    heads
                  </span>
                </div>

                {/* Fish */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-1.5 mr-2 text-blue-600 bg-blue-100 rounded-md">
                      <Fish className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Fish
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatNumber(
                      dashboardData.categoryData.fish.total.toFixed(2)
                    )}{" "}
                    tons
                  </span>
                </div>
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

      {/* Crops Tab */}
      {activeTab === "crops" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Rice Production */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-yellow-600 rounded-lg">
                  <Wheat className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Rice Production
                </h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(dashboardData.categoryData.rice.total.toFixed(2))}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.rice.items.length} varieties tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.rice.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.rice.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Banana Production */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-orange-600 rounded-lg">
                  <Banana className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Banana Production
                </h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(
                  dashboardData.categoryData.banana.total.toFixed(2)
                )}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.banana.items.length} varieties
                tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.banana.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.banana.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Vegetables Production */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-green-600 rounded-lg">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Vegetables
                </h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(
                  dashboardData.categoryData.vegetables.total.toFixed(2)
                )}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.vegetables.items.length} varieties
                tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.vegetables.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.vegetables.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Legumes Production */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white rounded-lg bg-amber-600">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">Legumes</h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(
                  dashboardData.categoryData.legumes.total.toFixed(2)
                )}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.legumes.items.length} varieties
                tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.legumes.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.legumes.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Spices Production */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-red-600 rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">Spices</h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(
                  dashboardData.categoryData.spices.total.toFixed(2)
                )}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.spices.items.length} varieties
                tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.spices.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.spices.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* High Value Crops */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-purple-600 rounded-lg">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  High Value Crops
                </h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(
                  dashboardData.categoryData.highValueCrops.total.toFixed(2)
                )}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.highValueCrops.items.length}{" "}
                varieties tracked
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Top variety:
                </span>
                {dashboardData.categoryData.highValueCrops.items.length > 0 ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {dashboardData.categoryData.highValueCrops.items[0].name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No data</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Livestock & Fish Tab */}
      {activeTab === "livestock" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Livestock */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-green-600 rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">Livestock</h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(dashboardData.categoryData.livestock.total)}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  heads
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.livestock.items.length} types
                tracked
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <h5 className="mb-3 text-sm font-medium text-gray-700">
                Top Livestock Types
              </h5>
              <div className="space-y-3">
                {dashboardData.categoryData.livestock.items
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatNumber(item.value)} heads
                      </span>
                    </div>
                  ))}
                {dashboardData.categoryData.livestock.items.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No livestock data available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fish */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 mr-3 text-white bg-blue-600 rounded-lg">
                  <Fish className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-medium text-gray-800">
                  Fish Production
                </h4>
              </div>
              <p className="mb-1 text-3xl font-bold text-gray-800">
                {formatNumber(dashboardData.categoryData.fish.total.toFixed(2))}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  tons
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {dashboardData.categoryData.fish.items.length} species tracked
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <h5 className="mb-3 text-sm font-medium text-gray-700">
                Top Fish Species
              </h5>
              <div className="space-y-3">
                {dashboardData.categoryData.fish.items
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatNumber(item.value.toFixed(2))} tons
                      </span>
                    </div>
                  ))}
                {dashboardData.categoryData.fish.items.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No fish data available
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
