"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CategoryComparisonChart({ data, categories, loading }) {
  const [visibleCategories, setVisibleCategories] = useState(
    categories.map((c) => c.id)
  );

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Toggle category visibility
  const toggleCategory = (categoryId) => {
    if (visibleCategories.includes(categoryId)) {
      setVisibleCategories(visibleCategories.filter((id) => id !== categoryId));
    } else {
      setVisibleCategories([...visibleCategories, categoryId]);
    }
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-md">
          <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => {
              const category = categories.find((c) => c.id === entry.dataKey);
              if (!category) return null;

              return (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: entry.color }}
                  >
                    {category.name}:
                  </span>
                  <span className="ml-1 text-sm text-gray-700">
                    {formatNumber(
                      entry.value.toFixed(category.unit === "heads" ? 0 : 1)
                    )}{" "}
                    {category.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get color for category
  const getCategoryColor = (categoryId) => {
    const colorMap = {
      rice: "#4CAF50", // green
      livestock: "#9C27B0", // purple
      banana: "#FFC107", // amber/yellow
      vegetables: "#FF9800", // orange
      legumes: "#2DCE89", // emerald
      spices: "#F44336", // red
      fish: "#2196F3", // blue
      highValueCrops: "#8BC34A", // light green
    };
    return colorMap[categoryId] || "#9E9E9E"; // default gray
  };

  return (
    <div className="h-[350px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="h-full">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                  visibleCategories.includes(category.id)
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 mr-1 rounded-full ${
                    visibleCategories.includes(category.id)
                      ? "opacity-100"
                      : "opacity-40"
                  }`}
                  style={{ backgroundColor: getCategoryColor(category.id) }}
                ></div>
                {category.name}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#666666" }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={() => null} />{" "}
              {/* Hide default legend, we have custom toggles */}
              {categories.map(
                (category) =>
                  visibleCategories.includes(category.id) && (
                    <Line
                      key={category.id}
                      type="monotone"
                      dataKey={category.id}
                      name={category.name}
                      stroke={getCategoryColor(category.id)}
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 1, fill: "white" }}
                      activeDot={{
                        r: 6,
                        stroke: getCategoryColor(category.id),
                        strokeWidth: 2,
                        fill: "white",
                      }}
                      animationDuration={800}
                      animationBegin={0}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
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
          <p className="text-lg font-medium">No comparison data available</p>
          <p className="mt-2 text-sm text-gray-400">
            Select categories to compare production trends
          </p>
        </div>
      )}
    </div>
  );
}
