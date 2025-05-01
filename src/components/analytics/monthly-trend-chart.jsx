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

export default function MonthlyTrendChart({ data, title, unit, loading }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-md">
          <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
          <p className="text-base font-semibold text-green-700">
            {formatNumber(payload[0].value.toFixed(unit === "heads" ? 0 : 2))}{" "}
            {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[280px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      ) : data && data.some((item) => item.production > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
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
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#666666" }}
              axisLine={{ stroke: "#E0E0E0" }}
              tickLine={false}
              tickFormatter={(value) => (value === 0 ? "0" : value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="production"
              name={`Production (${unit})`}
              stroke="#4CAF50"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProduction)"
              animationDuration={800}
              activeDot={{
                r: 6,
                stroke: "#4CAF50",
                strokeWidth: 2,
                fill: "white",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
  );
}
