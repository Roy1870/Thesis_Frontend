"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ItemBreakdownChart({ data, title, unit, loading }) {
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
      "#81C784", // green
      "#FFB74D", // orange
      "#64B5F6", // blue
      "#BA68C8", // purple
    ];
    return colors[index % colors.length];
  };

  // Take top 10 items for the pie chart
  const chartData = data.slice(0, 10);

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
        ) : chartData && chartData.length > 0 ? (
          <div className="flex flex-col items-center md:flex-row">
            <div className="w-full md:w-3/5 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getColorForIndex(index)}
                      />
                    ))}
                  </Pie>
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
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend/stats section */}
            <div className="w-full pl-0 mt-4 md:w-2/5 md:mt-0 md:pl-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="mb-3 text-sm font-medium text-gray-500">
                  Top Items
                </h4>
                <div className="space-y-3">
                  {chartData.map((item, index) => (
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
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatNumber(
                              item.value.toFixed(unit === "heads" ? 0 : 2)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {data.length > 10 && (
                  <div className="pt-2 mt-3 text-center border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      +{data.length - 10} more items not shown
                    </span>
                  </div>
                )}
              </div>
            </div>
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
            <p className="text-lg font-medium">No item data available</p>
            <p className="mt-2 text-sm text-gray-400">
              Add items to see breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
