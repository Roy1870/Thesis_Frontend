"use client";

import { useState, useEffect } from "react";
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
  Wheat,
  Loader2,
  Calendar,
  Map,
  Award,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react";

import { farmerAPI } from "./services/api"; // Import the API services

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProduction: 0,
    cropProduction: [],
    monthlyProduction: [],
    productionByBarangay: [],
    topPerformingCrops: [],
    recentHarvests: [],
    productionTrend: 0, // Percentage change from previous period
    totalFarmers: 0,
    totalArea: 0,
  });

  // Theme colors - enhanced color scheme
  const colors = {
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
  };

  // Colors for pie chart
  const COLORS = [
    colors.primary,
    colors.accent,
    colors.success,
    colors.warning,
    colors.info,
    "#8884d8",
    colors.primaryLight,
    colors.accentLight,
  ];

  // Get current date with month name and year
  const currentDate = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch farmers data
        const farmersResponse = await farmerAPI.getAllFarmers(1, 1000); // Get up to 1000 farmers
        const farmers = Array.isArray(farmersResponse)
          ? farmersResponse
          : farmersResponse.data || [];

        // Process data for production metrics
        let totalProduction = 0;
        let totalArea = 0;
        const cropProductionMap = {};
        const barangayProductionMap = {};
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

        // For production trend calculation
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        let currentYearProduction = 0;
        let lastYearProduction = 0;

        // Recent harvests array
        const allHarvests = [];

        // Process farmer data to extract production information
        farmers.forEach((farmer) => {
          // Process crops for production data
          if (farmer.crops && Array.isArray(farmer.crops)) {
            farmer.crops.forEach((crop) => {
              const cropType = crop.crop_type || crop.name || "Unknown";
              const yield_amount = Number.parseFloat(
                crop.yield_amount || crop.production || 0
              );
              const area = Number.parseFloat(
                crop.area_hectare || crop.area || 0
              );
              const harvest_date =
                crop.harvest_date ||
                crop.created_at ||
                new Date().toISOString();

              // Add to total production
              totalProduction += yield_amount;

              // Add to total area
              totalArea += area;

              // Add to crop production map
              cropProductionMap[cropType] =
                (cropProductionMap[cropType] || 0) + yield_amount;

              // Add to barangay production map
              const barangay = farmer.barangay || "Unknown";
              barangayProductionMap[barangay] =
                (barangayProductionMap[barangay] || 0) + yield_amount;

              // Add to monthly production
              const harvestDate = new Date(harvest_date);
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + yield_amount;

              // For production trend
              const harvestYear = harvestDate.getFullYear();
              if (harvestYear === currentYear) {
                currentYearProduction += yield_amount;
              } else if (harvestYear === lastYear) {
                lastYearProduction += yield_amount;
              }

              // Add to harvests array for recent harvests table
              if (yield_amount > 0) {
                allHarvests.push({
                  id: crop.id || Math.random().toString(),
                  farmer_id: farmer.farmer_id || farmer.id,
                  farmer_name:
                    farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim() ||
                    "Unknown",
                  crop_type: cropType,
                  yield_amount: yield_amount,
                  area: area,
                  yield_per_hectare:
                    area > 0 ? (yield_amount / area).toFixed(2) : "N/A",
                  harvest_date: harvestDate,
                  barangay: barangay,
                });
              }
            });
          }

          // Process rice data if available
          if (farmer.rice && Array.isArray(farmer.rice)) {
            farmer.rice.forEach((rice) => {
              const variety = rice.seed_type || "Rice";
              const yield_amount = Number.parseFloat(
                rice.production || rice.yield_amount || 0
              );
              const area = Number.parseFloat(
                rice.area_harvested || rice.area || 0
              );
              const harvest_date =
                rice.harvest_date ||
                rice.created_at ||
                new Date().toISOString();

              // Add to total production
              totalProduction += yield_amount;

              // Add to total area
              totalArea += area;

              // Add to crop production map
              cropProductionMap[variety] =
                (cropProductionMap[variety] || 0) + yield_amount;

              // Add to barangay production map
              const barangay = farmer.barangay || "Unknown";
              barangayProductionMap[barangay] =
                (barangayProductionMap[barangay] || 0) + yield_amount;

              // Add to monthly production
              const harvestDate = new Date(harvest_date);
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + yield_amount;

              // For production trend
              const harvestYear = harvestDate.getFullYear();
              if (harvestYear === currentYear) {
                currentYearProduction += yield_amount;
              } else if (harvestYear === lastYear) {
                lastYearProduction += yield_amount;
              }

              // Add to harvests array
              if (yield_amount > 0) {
                allHarvests.push({
                  id: rice.id || Math.random().toString(),
                  farmer_id: rice.farmer_id || rice.id,
                  farmer_name:
                    farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim() ||
                    "Unknown",
                  crop_type: variety,
                  yield_amount: yield_amount,
                  area: area,
                  yield_per_hectare:
                    area > 0 ? (yield_amount / area).toFixed(2) : "N/A",
                  harvest_date: harvestDate,
                  barangay: barangay,
                });
              }
            });
          }
        });

        // Calculate production trend
        const productionTrend =
          lastYearProduction > 0
            ? ((currentYearProduction - lastYearProduction) /
                lastYearProduction) *
              100
            : 0;

        // Convert crop production map to array for chart
        const cropProduction = Object.entries(cropProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Get top performing crops (by yield)
        const topPerformingCrops = [...cropProduction].slice(0, 5);

        // Convert barangay production map to array for chart
        const productionByBarangay = Object.entries(barangayProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Top 8 barangays by production

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

        // Sort harvests by date (most recent first) and take top 5
        const recentHarvests = allHarvests
          .sort((a, b) => b.harvest_date - a.harvest_date)
          .slice(0, 5);

        setDashboardData({
          totalProduction,
          cropProduction,
          monthlyProduction,
          productionByBarangay,
          topPerformingCrops,
          recentHarvests,
          productionTrend,
          totalFarmers: farmers.length,
          totalArea,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7F9]">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin text-[#6A9C89] mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading agricultural production data...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we gather the latest information
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl p-8 mx-auto mt-20 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 text-red-600 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
        <h4 className="text-xl font-semibold text-center text-[#D32F2F] mb-2">
          Error Loading Dashboard
        </h4>
        <p className="text-center text-gray-700">{error}</p>
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#6A9C89] text-white rounded-md hover:bg-[#4A7C69] transition-colors"
          >
            Try Again
          </button>
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
              Overview of crop production and yields as of {formattedDate}
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
            Metric tons of produce across all crops
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
            Hectares of cultivated farmland
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#0288D1] to-[#0277BD] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-center mb-4">
            <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white opacity-80">
                Top Crop
              </p>
              <p className="text-2xl font-bold">
                {dashboardData.topPerformingCrops.length > 0
                  ? dashboardData.topPerformingCrops[0].name
                  : "None"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-white opacity-80">
            {dashboardData.topPerformingCrops.length > 0
              ? `${formatNumber(
                  dashboardData.topPerformingCrops[0].value.toFixed(2)
                )} tons produced`
              : "No production data available"}
          </p>
        </div>
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
              Crop Varieties
            </h3>
            <div className="p-2 rounded-lg bg-green-50">
              <Wheat className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData.cropProduction.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Different crops being cultivated
          </p>
        </div>

        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Barangays</h3>
            <div className="p-2 rounded-lg bg-amber-50">
              <Map className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dashboardData.productionByBarangay.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Areas with agricultural activity
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
          <h4 className="mb-6 text-lg font-semibold text-gray-800">
            Crop Production Distribution
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
                      `${formatNumber(value.toFixed(2))} tons`,
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
                Add crop data to see distribution
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
                <Bar
                  dataKey="value"
                  name="Production (tons)"
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

      {/* Top Performing Crops */}
      <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Top Performing Crops
          </h4>
          <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            By Production Volume
          </span>
        </div>

        {dashboardData.topPerformingCrops.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {dashboardData.topPerformingCrops.map((crop, index) => (
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
                    title={crop.name}
                  >
                    {crop.name}
                  </h5>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(crop.value.toFixed(2))}
                  </div>
                  <div className="text-xs text-gray-500">metric tons</div>
                </div>
                <div className="w-full h-2 mt-3 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{
                      width: `${
                        (crop.value /
                          dashboardData.topPerformingCrops[0].value) *
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
            <p>No crop production data available</p>
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
                    Crop
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                  >
                    Yield (tons)
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
                      <span className="px-2 py-1 text-xs rounded-full bg-[#E6F5E4] text-[#6A9C89] font-medium">
                        {harvest.crop_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {harvest.yield_amount.toFixed(2)}
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
