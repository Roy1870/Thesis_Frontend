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
        ) : data && data.some((item) => item.production > 0) ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
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
                <Area
                  type="monotone"
                  dataKey="production"
                  name={`Production (${unit})`}
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
