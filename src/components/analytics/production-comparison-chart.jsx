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

export default function ProductionComparisonChart({
  data,
  title,
  unit,
  loading,
}) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to get color for index
  const getColorForIndex = (index) => {
    const colors = [
      "#4F6F7D", // older year
      "#6F8F9D", // previous year
      "#6A9C89", // current year
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
            <p className="text-lg font-medium">Loading data...</p>
          </div>
        ) : data && data.some((item) => item.value > 0) ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barSize={60}
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
                />
                <YAxis
                  tick={{ fill: "#666666" }}
                  axisLine={{ stroke: "#E0E0E0" }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(
                      value.toFixed(unit === "heads" ? 0 : 2)
                    )} ${unit}`,
                    "Production",
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
                  name={`Production (${unit})`}
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
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
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
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
              No yearly comparison data available
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Add data from multiple years to see comparison
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
