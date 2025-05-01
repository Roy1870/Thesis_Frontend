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

export default function BarangayDistributionChart({
  data,
  title,
  unit,
  loading,
}) {
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

  // Helper function to get color for index
  const getColorForIndex = (index) => {
    const colors = [
      "#4CAF50", // green
      "#9C27B0", // purple
      "#FFC107", // yellow
      "#FF9800", // orange
      "#2DCE89", // emerald
      "#F44336", // red
      "#2196F3", // blue
      "#8BC34A", // light green
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="h-[280px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#666666" }}
              axisLine={{ stroke: "#E0E0E0" }}
              tickFormatter={(value) => `${value}`}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name={`Production (${unit})`}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorForIndex(index)} />
              ))}
            </Bar>
          </BarChart>
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
          <p className="text-lg font-medium">No barangay data available</p>
          <p className="mt-2 text-sm text-gray-400">
            Add barangay information to see distribution
          </p>
        </div>
      )}
    </div>
  );
}
