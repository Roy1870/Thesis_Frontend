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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import { Loader2 } from "lucide-react";

// Production Insights component
const ProductionInsights = ({ productionData }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Production Insights</h3>
        <p className="text-sm text-gray-500">
          Key metrics and trends for agricultural production
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-lg bg-gray-50">
          <h4 className="mb-2 text-base font-medium">Top Performing Crops</h4>
          <ul className="space-y-2">
            {productionData.topCrops.map((crop, index) => (
              <li key={index} className="flex justify-between">
                <span>{crop.name}</span>
                <span className="font-medium">
                  {crop.value.toFixed(2)} tons
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-gray-50">
          <h4 className="mb-2 text-base font-medium">Growth Trends</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Year-over-year</span>
              <span className="font-medium text-green-600">
                +{productionData.growthYoY}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Quarter-over-quarter</span>
              <span className="font-medium text-green-600">
                +{productionData.growthQoQ}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Month-over-month</span>
              <span className="font-medium text-green-600">
                +{productionData.growthMoM}%
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    farmers: [],
    crops: [],
    livestock: [],
    cropProduction: [],
    riceProduction: [],
    livestockProduction: [],
    monthlyProduction: [],
    barangayProduction: [],
    yieldComparison: [],
    productionTrends: [],
    productionInsights: {
      topCrops: [],
      growthYoY: 12,
      growthQoQ: 4,
      growthMoM: 1.5,
    },
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

        // Extract all crops from farmers
        const crops = [];
        farmers.forEach((farmer) => {
          if (farmer.crops && Array.isArray(farmer.crops)) {
            crops.push(...farmer.crops);
          }
        });

        // Generate crop production data
        const cropProductionMap = {};
        const riceProductionMap = {};
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

        // Yield comparison data
        const yieldComparisonData = [];

        // Process farmers for production data
        farmers.forEach((farmer) => {
          const barangay = farmer.barangay || "Unknown";

          // Process crops
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

              // Add to crop production map
              cropProductionMap[cropType] =
                (cropProductionMap[cropType] || 0) + yield_amount;

              // Add to barangay production map
              barangayProductionMap[barangay] =
                (barangayProductionMap[barangay] || 0) + yield_amount;

              // Add to monthly production
              const harvestDate = new Date(harvest_date);
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + yield_amount;

              // Add to yield comparison if area is available
              if (area > 0) {
                yieldComparisonData.push({
                  name: cropType,
                  barangay: barangay,
                  area: area,
                  production: yield_amount,
                  yieldPerHectare: yield_amount / area,
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

              // Add to rice production map
              riceProductionMap[variety] =
                (riceProductionMap[variety] || 0) + yield_amount;

              // Add to barangay production map
              barangayProductionMap[barangay] =
                (barangayProductionMap[barangay] || 0) + yield_amount;

              // Add to monthly production
              const harvestDate = new Date(harvest_date);
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + yield_amount;

              // Add to yield comparison if area is available
              if (area > 0) {
                yieldComparisonData.push({
                  name: variety,
                  barangay: barangay,
                  area: area,
                  production: yield_amount,
                  yieldPerHectare: yield_amount / area,
                });
              }
            });
          }
        });

        // Convert crop production map to array for chart
        const cropProduction = Object.entries(cropProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Convert rice production map to array for chart
        const riceProduction = Object.entries(riceProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Generate livestock production data
        const livestockProductionMap = {};
        livestock.forEach((record) => {
          const animalType = record.animal_type || "Unknown";
          const quantity = Number.parseInt(record.quantity || 1);
          const weight = Number.parseFloat(
            record.weight || record.production || 0
          );

          // Calculate production (weight * quantity)
          const production = weight * quantity;

          livestockProductionMap[animalType] =
            (livestockProductionMap[animalType] || 0) + production;
        });

        // Convert livestock production map to array for chart
        const livestockProduction = Object.entries(livestockProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Convert barangay production map to array for chart
        const barangayProduction = Object.entries(barangayProductionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Top 10 barangays

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

        // Generate production trends (simulated historical data)
        const productionTrends = generateProductionTrends();

        // Get top crops for insights
        const topCrops = [...cropProduction, ...riceProduction]
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setAnalyticsData({
          farmers,
          crops,
          livestock,
          cropProduction,
          riceProduction,
          livestockProduction,
          monthlyProduction,
          barangayProduction,
          yieldComparison: yieldComparisonData,
          productionTrends,
          productionInsights: {
            topCrops,
            growthYoY: 12,
            growthQoQ: 4,
            growthMoM: 1.5,
          },
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Helper function to generate production trends
  const generateProductionTrends = () => {
    const years = [2019, 2020, 2021, 2022, 2023];
    const cropTypes = ["Rice", "Corn", "Vegetables", "Fruits"];

    const trends = [];

    cropTypes.forEach((crop) => {
      let baseValue = Math.random() * 1000 + 500; // Random base value between 500-1500

      years.forEach((year) => {
        // Add some random growth each year (between -5% and +20%)
        const growth = Math.random() * 0.25 - 0.05;
        baseValue = baseValue * (1 + growth);

        trends.push({
          year,
          crop,
          production: baseValue,
        });
      });
    });

    return trends;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 mr-2 text-green-500 animate-spin" />
        <span className="ml-2">Loading production analytics data...</span>
      </div>
    );
  }

  return (
    <div className="container max-h-screen p-4 mx-auto space-y-6 overflow-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">
          Agricultural Production Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into crop yields, production trends, and
          performance metrics
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
              activeTab === "crops"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("crops")}
          >
            Crop Production
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "livestock"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("livestock")}
          >
            Livestock Production
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "trends"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("trends")}
          >
            Production Trends
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stat Cards */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    Total Farmers
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.farmers.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    Contributing to production
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    Total Crop Types
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.cropProduction.length +
                      analyticsData.riceProduction.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    Varieties in production
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    Total Production
                  </div>
                  <div className="text-2xl font-bold">
                    {(
                      analyticsData.cropProduction.reduce(
                        (sum, item) => sum + item.value,
                        0
                      ) +
                      analyticsData.riceProduction.reduce(
                        (sum, item) => sum + item.value,
                        0
                      )
                    ).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">Metric tons</p>
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    Avg. Yield
                  </div>
                  <div className="text-2xl font-bold">
                    {analyticsData.yieldComparison.length > 0
                      ? (
                          analyticsData.yieldComparison.reduce(
                            (sum, item) => sum + item.yieldPerHectare,
                            0
                          ) / analyticsData.yieldComparison.length
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                  <p className="text-xs text-gray-500">Tons per hectare</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Production Chart */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Monthly Production</h3>
                    <p className="text-sm text-gray-500">
                      Crop production by month (metric tons)
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.monthlyProduction}>
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
                          name="Production"
                          stroke="#6A9C89"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Barangay Production Chart */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Production by Location
                    </h3>
                    <p className="text-sm text-gray-500">
                      Metric tons by barangay
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.barangayProduction}>
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
                        <Bar dataKey="value" name="Production" fill="#4F6F7D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crops Tab */}
          {activeTab === "crops" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Crop Production Distribution Chart */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Crop Production Distribution
                    </h3>
                    <p className="text-sm text-gray-500">
                      Production by crop type (metric tons)
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.cropProduction}
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
                          {analyticsData.cropProduction.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(2)} tons`,
                            "Production",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rice Variety Production Chart */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">
                      Rice Production by Variety
                    </h3>
                    <p className="text-sm text-gray-500">
                      Production by rice variety (metric tons)
                    </p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.riceProduction}
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
                          {analyticsData.riceProduction.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(2)} tons`,
                            "Production",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Yield Comparison Chart */}
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Yield Comparison</h3>
                  <p className="text-sm text-gray-500">
                    Yield per hectare by crop type
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="area"
                        name="Area"
                        unit=" ha"
                        label={{
                          value: "Area (hectares)",
                          position: "insideBottomRight",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="yieldPerHectare"
                        name="Yield"
                        unit=" t/ha"
                        label={{
                          value: "Yield (tons/ha)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <ZAxis
                        type="number"
                        dataKey="production"
                        range={[50, 400]}
                        name="Production"
                        unit=" tons"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "Yield")
                            return [`${value.toFixed(2)} t/ha`, name];
                          if (name === "Area")
                            return [`${value.toFixed(2)} ha`, name];
                          if (name === "Production")
                            return [`${value.toFixed(2)} tons`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Scatter
                        name="Crop Yields"
                        data={analyticsData.yieldComparison}
                        fill="#6A9C89"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Production Insights */}
              <ProductionInsights
                productionData={analyticsData.productionInsights}
              />
            </div>
          )}

          {/* Livestock Tab */}
          {activeTab === "livestock" && (
            <div className="space-y-4">
              {/* Livestock Production Chart */}
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Livestock Production</h3>
                  <p className="text-sm text-gray-500">
                    Production by animal type (metric tons)
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.livestockProduction}>
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
                      <Bar dataKey="value" name="Production" fill="#4F6F7D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Livestock Insights */}
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Livestock Insights</h3>
                  <p className="text-sm text-gray-500">
                    Key metrics and trends for livestock production
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h4 className="mb-2 text-base font-medium">
                      Top Livestock Types
                    </h4>
                    <ul className="space-y-2">
                      {analyticsData.livestockProduction
                        .slice(0, 3)
                        .map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-medium">
                              {item.value.toFixed(2)} tons
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h4 className="mb-2 text-base font-medium">
                      Production Metrics
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Total Production</span>
                        <span className="font-medium">
                          {analyticsData.livestockProduction
                            .reduce((sum, item) => sum + item.value, 0)
                            .toFixed(2)}{" "}
                          tons
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Average per Type</span>
                        <span className="font-medium">
                          {analyticsData.livestockProduction.length > 0
                            ? (
                                analyticsData.livestockProduction.reduce(
                                  (sum, item) => sum + item.value,
                                  0
                                ) / analyticsData.livestockProduction.length
                              ).toFixed(2)
                            : "0.00"}{" "}
                          tons
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Growth Trend</span>
                        <span className="font-medium text-green-600">
                          +8.5%
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-4">
              {/* Production Trends Chart */}
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Production Trends by Year
                  </h3>
                  <p className="text-sm text-gray-500">
                    Historical production data by crop type (metric tons)
                  </p>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.productionTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toFixed(2)} tons`,
                          "Production",
                        ]}
                      />
                      <Legend />
                      {Array.from(
                        new Set(
                          analyticsData.productionTrends.map(
                            (item) => item.crop
                          )
                        )
                      ).map((crop, index) => (
                        <Line
                          key={crop}
                          type="monotone"
                          dataKey="production"
                          name={crop}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          data={analyticsData.productionTrends.filter(
                            (item) => item.crop === crop
                          )}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Production Growth Analysis */}
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Production Growth Analysis
                  </h3>
                  <p className="text-sm text-gray-500">
                    Year-over-year growth rates by crop type
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          Crop Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          2020 Growth
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          2021 Growth
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          2022 Growth
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          2023 Growth
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          Average
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from(
                        new Set(
                          analyticsData.productionTrends.map(
                            (item) => item.crop
                          )
                        )
                      ).map((crop) => {
                        // Calculate growth rates
                        const cropData = analyticsData.productionTrends.filter(
                          (item) => item.crop === crop
                        );
                        const growthRates = [];

                        for (let i = 1; i < cropData.length; i++) {
                          const prevYear = cropData[i - 1].production;
                          const currentYear = cropData[i].production;
                          const growthRate =
                            ((currentYear - prevYear) / prevYear) * 100;
                          growthRates.push(growthRate);
                        }

                        const avgGrowth =
                          growthRates.reduce((sum, rate) => sum + rate, 0) /
                          growthRates.length;

                        return (
                          <tr key={crop}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {crop}
                            </td>
                            {growthRates.map((rate, index) => (
                              <td
                                key={index}
                                className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                              >
                                <span
                                  className={
                                    rate >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {rate >= 0 ? "+" : ""}
                                  {rate.toFixed(2)}%
                                </span>
                              </td>
                            ))}
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <span
                                className={
                                  avgGrowth >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {avgGrowth >= 0 ? "+" : ""}
                                {avgGrowth.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
