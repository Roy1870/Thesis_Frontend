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
} from "recharts";
import {
  UserIcon,
  InfoIcon,
  ClipboardCheckIcon,
  UsersIcon,
  LoaderPinwheelIcon as SpinnerIcon,
} from "lucide-react";

import { farmerAPI, livestockAPI, operatorAPI } from "./services/api"; // Import the API services

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    farmers: [],
    totalFarmers: 0,
    totalCrops: 0,
    totalLivestock: 0,
    totalOperators: 0,
    recentFarmers: [],
    cropDistribution: [],
    livestockDistribution: [],
    barangayDistribution: [],
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

        // Fetch livestock data
        const livestockResponse = await livestockAPI.getAllLivestockRecords(
          1,
          100
        );
        const livestock = Array.isArray(livestockResponse)
          ? livestockResponse
          : livestockResponse.data || [];

        // Fetch operators data
        const operatorsResponse = await operatorAPI.getAllOperators(1, 100);
        const operators = Array.isArray(operatorsResponse)
          ? operatorsResponse
          : operatorsResponse.data || [];

        // Process data for dashboard
        const totalFarmers = farmers.length;

        // Calculate total crops (assuming each farmer has a crops array)
        let totalCrops = 0;
        const cropTypes = {};
        farmers.forEach((farmer) => {
          if (farmer.crops && Array.isArray(farmer.crops)) {
            totalCrops += farmer.crops.length;

            // Count crop types for distribution chart
            farmer.crops.forEach((crop) => {
              const cropType = crop.crop_type || "Unknown";
              cropTypes[cropType] = (cropTypes[cropType] || 0) + 1;
            });
          }
        });

        // Create crop distribution data for chart
        const cropDistribution = Object.keys(cropTypes).map((type) => ({
          name: type,
          value: cropTypes[type],
        }));

        // Calculate total livestock
        const totalLivestock = livestock.length;

        // Count livestock types for distribution
        const livestockTypes = {};
        livestock.forEach((record) => {
          const type = record.animal_type || "Unknown";
          livestockTypes[type] = (livestockTypes[type] || 0) + 1;
        });

        // Create livestock distribution data for chart
        const livestockDistribution = Object.keys(livestockTypes).map(
          (type) => ({
            name: type,
            value: livestockTypes[type],
          })
        );

        // Count farmers by barangay
        const barangays = {};
        farmers.forEach((farmer) => {
          const barangay = farmer.barangay || "Unknown";
          barangays[barangay] = (barangays[barangay] || 0) + 1;
        });

        // Create barangay distribution data
        const barangayDistribution = Object.keys(barangays).map((barangay) => ({
          name: barangay,
          value: barangays[barangay],
        }));

        // Get 5 most recent farmers
        const recentFarmers = [...farmers]
          .sort((a, b) => {
            // Sort by created_at or registration_date if available
            const dateA = a.created_at || a.registration_date || 0;
            const dateB = b.created_at || b.registration_date || 0;
            return new Date(dateB) - new Date(dateA);
          })
          .slice(0, 5);

        setDashboardData({
          farmers,
          totalFarmers,
          totalCrops,
          totalLivestock,
          totalOperators: operators.length,
          recentFarmers,
          cropDistribution,
          livestockDistribution,
          barangayDistribution,
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
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <SpinnerIcon className="w-10 h-10 animate-spin text-[#6A9C89] mb-2" />
          <p className="text-gray-600">Loading dashboard data...</p>
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
        Agricultural Management Dashboard
      </h2>
      <p className="mb-6 block text-[#666666]">
        Overview of farmers, crops, and livestock as of {formattedDate}
      </p>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#6A9C89] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <UserIcon className="w-5 h-5 mr-2" />
            <p className="text-white text-lg font-semibold">Total Farmers</p>
          </div>
          <p className="text-3xl font-bold mb-1">
            {dashboardData.totalFarmers}
          </p>
          <p className="text-sm text-white opacity-80">
            Registered in the system
          </p>
        </div>

        <div className="bg-[#4F6F7D] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <InfoIcon className="w-5 h-5 mr-2" />
            <p className="text-white text-lg font-semibold">Total Crops</p>
          </div>
          <p className="text-3xl font-bold mb-1">{dashboardData.totalCrops}</p>
          <p className="text-sm text-white opacity-80">Across all farmers</p>
        </div>

        <div className="bg-[#388E3C] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <ClipboardCheckIcon className="w-5 h-5 mr-2" />
            <p className="text-white text-lg font-semibold">
              Livestock Records
            </p>
          </div>
          <p className="text-3xl font-bold mb-1">
            {dashboardData.totalLivestock}
          </p>
          <p className="text-sm text-white opacity-80">
            Total livestock entries
          </p>
        </div>

        <div className="bg-[#8884d8] rounded-lg text-white p-4 shadow">
          <div className="flex items-center mb-2">
            <UsersIcon className="w-5 h-5 mr-2" />
            <p className="text-white text-lg font-semibold">Operators</p>
          </div>
          <p className="text-3xl font-bold mb-1">
            {dashboardData.totalOperators}
          </p>
          <p className="text-sm text-white opacity-80">Registered operators</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-lg font-semibold mb-4">Crop Distribution</h4>
          {dashboardData.cropDistribution.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.cropDistribution}
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
                    {dashboardData.cropDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} crops`, name]}
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
              <p>No crop data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-lg font-semibold mb-4">Livestock Distribution</h4>
          {dashboardData.livestockDistribution.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.livestockDistribution}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill={colors.accent} />
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
              <p>No livestock data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Barangay Distribution */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h4 className="text-lg font-semibold mb-4">Farmers by Barangay</h4>
        {dashboardData.barangayDistribution.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.barangayDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Farmers" fill={colors.primary} />
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
            <p>No barangay data available</p>
          </div>
        )}
      </div>

      {/* Recent Farmers */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-lg font-semibold mb-4">
          Recently Registered Farmers
        </h4>
        {dashboardData.recentFarmers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Barangay
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Crops
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentFarmers.map((farmer) => {
                  const fullName =
                    [
                      farmer.first_name || "",
                      farmer.middle_name || "",
                      farmer.last_name || "",
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    farmer.name ||
                    "N/A";

                  return (
                    <tr
                      key={
                        farmer.farmer_id ||
                        farmer.id ||
                        Math.random().toString()
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farmer.barangay || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farmer.crops &&
                        Array.isArray(farmer.crops) &&
                        farmer.crops.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {farmer.crops.slice(0, 2).map((crop, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded-full bg-[#E6F5E4] text-[#6A9C89]"
                              >
                                {crop.crop_type || "Crop"}
                              </span>
                            ))}
                            {farmer.crops.length > 2 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                +{farmer.crops.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {farmer.created_at || farmer.registration_date
                          ? new Date(
                              farmer.created_at || farmer.registration_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}
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
            <p>No recent farmers</p>
          </div>
        )}
      </div>
    </div>
  );
}
