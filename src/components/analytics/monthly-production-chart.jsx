"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function MonthlyProductionChart({
  loading,
  selectedYear,
  setSelectedYear,
  selectedDataType,
  setSelectedDataType,
  getMonthlyData,
  availableYears,
}) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const monthlyData = getMonthlyData(selectedDataType);

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
      <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Monthly Production Trend
        </h2>
        <div className="flex items-center mt-2 space-x-2 sm:mt-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="flex items-center bg-white border border-gray-200 rounded-md">
            <button
              onClick={() => {
                const dataTypes = [
                  "Total",
                  "Livestock",
                  "Rice",
                  "Crops",
                  "Fish",
                ];
                const currentIndex = dataTypes.indexOf(selectedDataType);
                const prevIndex =
                  (currentIndex - 1 + dataTypes.length) % dataTypes.length;
                setSelectedDataType(dataTypes[prevIndex]);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="px-2 py-1 text-sm font-medium text-gray-800 border-l border-r border-gray-200">
              {selectedDataType}
            </span>
            <button
              onClick={() => {
                const dataTypes = [
                  "Total",
                  "Livestock",
                  "Rice",
                  "Crops",
                  "Fish",
                ];
                const currentIndex = dataTypes.indexOf(selectedDataType);
                const nextIndex = (currentIndex + 1) % dataTypes.length;
                setSelectedDataType(dataTypes[nextIndex]);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[280px] md:h-[320px] text-gray-400">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
            <p className="text-lg font-medium">Loading data...</p>
          </div>
        ) : monthlyData && monthlyData.some((item) => item.production > 0) ? (
          <div className="h-[280px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorProduction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6A9C89" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6A9C89" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E0E0E0"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#666666" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <YAxis
                  tick={{ fill: "#666666" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(value.toFixed(2))} ${
                      selectedDataType === "Livestock" ? "heads" : "tons"
                    }`,
                    "Production",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  name={`${selectedDataType} Production ${
                    selectedDataType === "Livestock" ? "(heads)" : "(tons)"
                  }`}
                  stroke="#6A9C89"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProduction)"
                  activeDot={{
                    r: 6,
                    stroke: "#6A9C89",
                    strokeWidth: 2,
                    fill: "white",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] md:h-[320px] text-gray-400">
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
  );
}
