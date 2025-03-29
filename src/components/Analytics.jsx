"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";

function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    farmers: [],
    livestock: [],
    operators: [],
    cropTypes: [],
    livestockTypes: [],
    riceVarieties: [],
    monthlyRegistrations: [],
    barangayDistribution: [],
  });

  // Colors for charts
  const COLORS = [
    "#6A9C89",
    "#4F6F7D",
    "#388E3C",
    "#FF8042",
    "#FFBB28",
    "#8884d8",
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch all data needed for analytics
        const [farmersResponse, livestockResponse, operatorsResponse] =
          await Promise.all([
            farmerAPI.getAllFarmers(1, 1000), // Get up to 1000 farmers for comprehensive analytics
            livestockAPI.getAllLivestockRecords(1, 1000),
            operatorAPI.getAllOperators(1, 1000),
          ]);

        // Process farmer data
        const farmers = Array.isArray(farmersResponse)
          ? farmersResponse
          : farmersResponse.data || [];

        // Process livestock data
        const livestock = Array.isArray(livestockResponse)
          ? livestockResponse
          : livestockResponse.data || [];

        // Process operator data
        const operators = Array.isArray(operatorsResponse)
          ? operatorsResponse
          : operatorsResponse.data || [];

        // Generate crop type distribution
        const cropTypesMap = {};
        farmers.forEach((farmer) => {
          if (farmer.crops && Array.isArray(farmer.crops)) {
            farmer.crops.forEach((crop) => {
              const cropType = crop.name || crop.crop_type || "Unknown";
              cropTypesMap[cropType] = (cropTypesMap[cropType] || 0) + 1;
            });
          }
        });

        const cropTypes = Object.entries(cropTypesMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Top 6 crop types

        // Generate rice variety distribution
        const riceVarietiesMap = {};
        farmers.forEach((farmer) => {
          if (farmer.rice && Array.isArray(farmer.rice)) {
            farmer.rice.forEach((rice) => {
              const variety = rice.variety || "Unknown";
              riceVarietiesMap[variety] = (riceVarietiesMap[variety] || 0) + 1;
            });
          }
        });

        const riceVarieties = Object.entries(riceVarietiesMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Top 6 rice varieties

        // Generate livestock type distribution
        const livestockTypesMap = {};
        livestock.forEach((record) => {
          const animalType = record.animal_type || "Unknown";
          const quantity = record.quantity || 1;
          livestockTypesMap[animalType] =
            (livestockTypesMap[animalType] || 0) + quantity;
        });

        const livestockTypes = Object.entries(livestockTypesMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Generate barangay distribution
        const barangayMap = {};
        farmers.forEach((farmer) => {
          const barangay = farmer.barangay || "Unknown";
          barangayMap[barangay] = (barangayMap[barangay] || 0) + 1;
        });

        const barangayDistribution = Object.entries(barangayMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Top 10 barangays

        // Generate monthly registration data (simulated based on available data)
        // In a real app, you'd use actual registration dates
        const monthlyRegistrations = generateMonthlyData(farmers);

        setAnalyticsData({
          farmers,
          livestock,
          operators,
          cropTypes,
          livestockTypes,
          riceVarieties,
          monthlyRegistrations,
          barangayDistribution,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Helper function to generate monthly data
  const generateMonthlyData = (farmers) => {
    const months = [
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
    const currentYear = new Date().getFullYear();

    // Create a map to count farmers by month
    const monthlyMap = {};

    // Initialize all months with zero
    months.forEach((month) => {
      monthlyMap[month] = 0;
    });

    // Count farmers by registration month
    farmers.forEach((farmer) => {
      // Try to get registration date from various possible fields
      const dateStr =
        farmer.created_at || farmer.registration_date || farmer.date_registered;

      if (dateStr) {
        const date = new Date(dateStr);
        // Only count registrations from current year
        if (date.getFullYear() === currentYear) {
          const month = months[date.getMonth()];
          monthlyMap[month] = (monthlyMap[month] || 0) + 1;
        }
      }
    });

    // Convert to array format for charts
    return months.map((month) => ({
      name: month,
      farmers: monthlyMap[month] || 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Agricultural Analytics</h1>
        <p className="text-gray-600">
          Comprehensive insights into farmers, crops, livestock, and operations
        </p>
      </div>

      {/* Custom Tabs with Tailwind */}
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "farmers"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("farmers")}
          >
            Farmers & Crops
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "livestock"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("livestock")}
          >
            Livestock
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "operators"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("operators")}
          >
            Operators
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stat Cards */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Total Farmers
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.farmers.length}
                  </div>
                  <p className="text-xs text-gray-500">Registered farmers</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Total Crops
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.farmers.reduce(
                      (total, farmer) => total + (farmer.crops?.length || 0),
                      0
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Registered crops</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Livestock Count
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.livestock.reduce(
                      (total, record) => total + (record.quantity || 1),
                      0
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Total animals</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Operators
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.operators.length}
                  </div>
                  <p className="text-xs text-gray-500">Farm operators</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Registrations Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Monthly Farmer Registrations
                    </h3>
                    <p className="text-sm text-gray-500">
                      New farmers registered by month
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.monthlyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="farmers"
                          stroke="#6A9C89"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Barangay Distribution Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Barangay Distribution
                    </h3>
                    <p className="text-sm text-gray-500">Farmers by location</p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.barangayDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Farmers" fill="#4F6F7D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Farmers & Crops Tab */}
          {activeTab === "farmers" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Crop Type Distribution Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Crop Type Distribution
                    </h3>
                    <p className="text-sm text-gray-500">
                      Most common crops grown
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.cropTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {analyticsData.cropTypes.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rice Variety Distribution Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Rice Variety Distribution
                    </h3>
                    <p className="text-sm text-gray-500">
                      Most common rice varieties
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.riceVarieties}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {analyticsData.riceVarieties.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Crop Area Analysis Chart */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Crop Area Analysis</h3>
                  <p className="text-sm text-gray-500">
                    Total area by crop type (in hectares)
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCropAreaData(analyticsData.farmers)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="area" name="Area (ha)" fill="#6A9C89" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Livestock Tab */}
          {activeTab === "livestock" && (
            <div className="space-y-4">
              {/* Livestock Distribution Chart */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Livestock Distribution
                  </h3>
                  <p className="text-sm text-gray-500">
                    Breakdown by animal type
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.livestockTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#4F6F7D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Include the existing LivestockInsights component */}
              <LivestockInsights />
            </div>
          )}

          {/* Operators Tab */}
          {activeTab === "operators" && (
            <div className="space-y-4">
              {/* Operator Role Distribution Chart */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Operator Role Distribution
                  </h3>
                  <p className="text-sm text-gray-500">
                    Breakdown by role type
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getOperatorRoleData(analyticsData.operators)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {getOperatorRoleData(analyticsData.operators).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Operators per Farmer Chart */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Operators per Farmer</h3>
                  <p className="text-sm text-gray-500">
                    Distribution of operators across farmers
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getOperatorsPerFarmerData(
                        analyticsData.operators,
                        analyticsData.farmers
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Farmers" fill="#388E3C" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get crop area data
function getCropAreaData(farmers) {
  const cropAreaMap = {};

  farmers.forEach((farmer) => {
    if (farmer.crops && Array.isArray(farmer.crops)) {
      farmer.crops.forEach((crop) => {
        const cropType = crop.name || crop.crop_type || "Unknown";
        const area = Number.parseFloat(crop.area) || 0;
        cropAreaMap[cropType] = (cropAreaMap[cropType] || 0) + area;
      });
    }
  });

  return Object.entries(cropAreaMap)
    .map(([name, area]) => ({ name, area }))
    .sort((a, b) => b.area - a.area)
    .slice(0, 8); // Top 8 crops by area
}

// Helper function to get operator role data
function getOperatorRoleData(operators) {
  const roleMap = {};

  operators.forEach((operator) => {
    const role = operator.role || "Unknown";
    roleMap[role] = (roleMap[role] || 0) + 1;
  });

  return Object.entries(roleMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Helper function to get operators per farmer data
function getOperatorsPerFarmerData(operators, farmers) {
  // Count operators per farmer
  const farmerOperatorCount = {};

  operators.forEach((operator) => {
    const farmerId = operator.farmer_id;
    if (farmerId) {
      farmerOperatorCount[farmerId] = (farmerOperatorCount[farmerId] || 0) + 1;
    }
  });

  // Count how many farmers have X operators
  const distribution = {};

  Object.values(farmerOperatorCount).forEach((count) => {
    distribution[count] = (distribution[count] || 0) + 1;
  });

  // Count farmers with no operators
  const farmersWithOperators = Object.keys(farmerOperatorCount).length;
  const farmersWithoutOperators = farmers.length - farmersWithOperators;

  if (farmersWithoutOperators > 0) {
    distribution[0] = farmersWithoutOperators;
  }

  return Object.entries(distribution)
    .map(([operatorCount, farmerCount]) => ({
      name:
        operatorCount === "0"
          ? "No operators"
          : `${operatorCount} operator${operatorCount === "1" ? "" : "s"}`,
      count: farmerCount,
    }))
    .sort((a, b) => {
      // Special sort to put "No operators" first
      if (a.name === "No operators") return -1;
      if (b.name === "No operators") return 1;
      return Number.parseInt(a.name) - Number.parseInt(b.name);
    });
}

export default Analytics;
