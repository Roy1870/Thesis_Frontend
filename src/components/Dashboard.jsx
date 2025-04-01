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
  LineChart,
  Line,
} from "recharts";
import { BarChart2, TrendingUp, Sprout, Wheat, Loader2 } from "lucide-react";

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
  });

  // Theme colors - matching your existing color scheme
  const colors = {
    primary: "#6A9C89",
    secondary: "#E6F5E4",
    accent: "#4F6F7D",
    error: "#D32F2F",
    warning: "#FFA000",
    success: "#388E3C",
    textDark: "#333333",
    textLight: "#666666",
    border: "#E0E0E0",
    background: "#F5F7F9",
  };

  // Colors for pie chart
  const COLORS = [
    colors.primary,
    colors.accent,
    colors.success,
    "#FF8042",
    "#FFBB28",
    "#8884d8",
  ];

  // Get current date with month name and year
  const currentDate = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch farmers data
        const farmersResponse = await farmerAPI.getAllFarmers(1, 100); // Get up to 100 farmers
        const farmers = Array.isArray(farmersResponse)
          ? farmersResponse
          : farmersResponse.data || [];

        // Process data for production metrics
        let totalProduction = 0;
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
              const area = Number.parseFloat(crop.area || 0);
              const harvest_date =
                crop.harvest_date ||
                crop.created_at ||
                new Date().toISOString();

              // Add to total production
              totalProduction += yield_amount;

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

              // Add to harvests array for recent harvests table
              if (yield_amount > 0) {
                allHarvests.push({
                  id: crop.id || Math.random().toString(),
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
              const variety = rice.variety || "Rice";
              const yield_amount = Number.parseFloat(
                rice.yield_amount || rice.production || 0
              );
              const area = Number.parseFloat(rice.area || 0);
              const harvest_date =
                rice.harvest_date ||
                rice.created_at ||
                new Date().toISOString();

              // Add to total production
              totalProduction += yield_amount;

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

              // Add to harvests array
              if (yield_amount > 0) {
                allHarvests.push({
                  id: rice.id || Math.random().toString(),
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
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#6A9C89] mb-2" />
          <p className="text-gray-600">Loading production data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <h4 className="text-xl font-semibold text-[#D32F2F] mb-2">
          Error Loading Dashboard
        </h4>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-[#F5F7F9] h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#333333]">
        Agricultural Production Dashboard
      </h2>
      <p className="mb-6 block text-[#666666]">
        Overview of crop production and yields as of {formattedDate}
      </p>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#6A9C89] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <BarChart2 className="w-5 h-5 mr-2" />
            <p className="text-lg font-semibold text-white">Total Production</p>
          </div>
          <p className="mb-1 text-3xl font-bold">
            {dashboardData.totalProduction.toFixed(2)}
          </p>
          <p className="text-sm text-white opacity-80">
            Metric tons of produce
          </p>
        </div>

        <div className="bg-[#4F6F7D] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <p className="text-lg font-semibold text-white">Avg. Yield</p>
          </div>
          <p className="mb-1 text-3xl font-bold">
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
          <p className="text-sm text-white opacity-80">Tons per hectare</p>
        </div>

        <div className="bg-[#388E3C] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <Sprout className="w-5 h-5 mr-2" />
            <p className="text-lg font-semibold text-white">Crop Varieties</p>
          </div>
          <p className="mb-1 text-3xl font-bold">
            {dashboardData.cropProduction.length}
          </p>
          <p className="text-sm text-white opacity-80">Different crops grown</p>
        </div>

        <div className="bg-[#8884d8] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <Wheat className="w-5 h-5 mr-2" />
            <p className="text-lg font-semibold text-white">Top Crop</p>
          </div>
          <p className="mb-1 text-3xl font-bold">
            {dashboardData.topPerformingCrops.length > 0
              ? dashboardData.topPerformingCrops[0].name
              : "None"}
          </p>
          <p className="text-sm text-white opacity-80">Highest production</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow">
          <h4 className="mb-4 text-lg font-semibold">
            Crop Production Distribution
          </h4>
          {dashboardData.cropProduction.length > 0 ? (
            <div className="h-[300px]">
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
                    outerRadius={80}
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
                      `${value.toFixed(2)} tons`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <svg
                className="w-12 h-12 mb-2"
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
              <p>No production data available</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h4 className="mb-4 text-lg font-semibold">Monthly Production</h4>
          {dashboardData.monthlyProduction.some(
            (item) => item.production > 0
          ) ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardData.monthlyProduction}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toFixed(2)} tons`,
                      "Production",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Production (tons)"
                    stroke={colors.primary}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <svg
                className="w-12 h-12 mb-2"
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
              <p>No monthly production data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Barangay Production Distribution */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <h4 className="mb-4 text-lg font-semibold">Production by Barangay</h4>
        {dashboardData.productionByBarangay.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.productionByBarangay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${value.toFixed(2)} tons`,
                    "Production",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Production (tons)"
                  fill={colors.primary}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <svg
              className="w-12 h-12 mb-2"
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
            <p>No barangay production data available</p>
          </div>
        )}
      </div>

      {/* Recent Harvests */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h4 className="mb-4 text-lg font-semibold">Recent Harvests</h4>
        {dashboardData.recentHarvests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Farmer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Crop
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Yield (tons)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Area (ha)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Yield/ha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Harvest Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentHarvests.map((harvest) => (
                  <tr key={harvest.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {harvest.farmer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-[#E6F5E4] text-[#6A9C89]">
                        {harvest.crop_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {harvest.yield_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {harvest.area.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {harvest.yield_per_hectare}
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
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg
              className="w-12 h-12 mb-2"
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
            <p>No recent harvests</p>
          </div>
        )}
      </div>
    </div>
  );
}
