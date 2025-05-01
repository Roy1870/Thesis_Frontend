"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ProductionDistributionChart({
  cropProduction,
  totalProduction,
  loading,
}) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-md">
          <p className="mb-1 text-sm font-medium text-gray-600">
            {payload[0].name}
          </p>
          <p className="text-base font-semibold text-green-700">
            {payload[0].name === "Livestock & Poultry"
              ? `${formatNumber(payload[0].value)} heads`
              : `${formatNumber(payload[0].value.toFixed(2))} tons`}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / totalProduction) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center md:flex-row">
      <div className="w-full md:w-3/5 h-[280px] md:h-[320px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
            <p className="text-lg font-medium">Loading data...</p>
          </div>
        ) : cropProduction && cropProduction.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cropProduction}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={false}
                animationDuration={800}
                animationBegin={0}
              >
                {cropProduction.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorForIndex(index)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry, index) => (
                  <span className="text-sm font-medium text-gray-700">
                    {value}
                  </span>
                )}
              />
            </PieChart>
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
            <p className="text-lg font-medium">No production data available</p>
            <p className="mt-2 text-sm text-gray-400">
              Add production data to see distribution
            </p>
          </div>
        )}
      </div>

      {/* Legend/stats section */}
      {cropProduction && cropProduction.length > 0 && (
        <div className="w-full pl-0 mt-4 md:w-2/5 md:mt-0 md:pl-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-500">
              Production Breakdown
            </h3>
            <div className="space-y-3">
              {cropProduction.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 mr-2 rounded-sm"
                    style={{
                      backgroundColor: getColorForIndex(index),
                    }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span
                        className="text-sm font-medium truncate max-w-[120px]"
                        title={entry.name}
                      >
                        {entry.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {((entry.value / totalProduction) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(entry.value / totalProduction) * 100}%`,
                          backgroundColor: getColorForIndex(index),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
