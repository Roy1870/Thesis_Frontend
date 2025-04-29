"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

export default function ProductionByBarangayChart({
  loading,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedDataType,
  setSelectedDataType,
  getBarangayData,
  availableYears,
  className = "",
}) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to get color for index
  const getColorForIndex = (index) => {
    const colors = [
      "#6A9C89", // primary
      "#4F6F7D", // accent
      "#388E3C", // success
      "#FFA000", // warning
      "#0288D1", // info
      "#8884d8", // purple
      "#8DB5A5", // primaryLight
      "#6F8F9D", // accentLight
    ];
    return colors[index % colors.length];
  };

  const barangayData = getBarangayData(selectedDataType);

  return (
    <div
      className={`overflow-hidden bg-white shadow-sm rounded-xl ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Production by Barangay
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="All">All Months</option>
            {[
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
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
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
          <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-gray-400">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
            <p className="text-lg font-medium">Loading data...</p>
          </div>
        ) : barangayData && barangayData.length > 0 ? (
          <div className="h-[300px] md:h-[400px] overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barangayData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barSize={30}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E0E0E0"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#666666" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: "#666666" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(value.toFixed(2))} ${
                      selectedDataType === "Livestock" ? "heads" : "tons"
                    }`,
                    `${selectedDataType} Production`,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  name={`${selectedDataType} Production ${
                    selectedDataType === "Livestock" ? "(heads)" : "(tons)"
                  }`}
                  radius={[4, 4, 0, 0]}
                >
                  {barangayData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColorForIndex(index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-gray-400">
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
    </div>
  );
}
