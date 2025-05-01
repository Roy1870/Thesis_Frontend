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

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-md">
          <p className="mb-1 text-sm font-medium text-gray-600">
            {payload[0].name}
          </p>
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
      "#81C784", // light green
      "#FFB74D", // light orange
      "#64B5F6", // light blue
      "#BA68C8", // light purple
    ];
    return colors[index % colors.length];
  };

  // Take top 10 items for the pie chart
  const chartData = data.slice(0, 10);

  // Custom legend renderer
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center px-2 py-1 rounded-full bg-gray-50"
          >
            <div
              className="w-3 h-3 mr-1 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[280px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
                  nameKey="name"
                  label={false}
                  animationDuration={800}
                  animationBegin={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColorForIndex(index)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
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
                {chartData.slice(0, 5).map((item, index) => (
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
              {data.length > 5 && (
                <div className="pt-2 mt-3 text-center border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    +{data.length - 5} more items not shown
                  </span>
                </div>
              )}
            </div>
          </div>
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
          <p className="text-lg font-medium">No item data available</p>
          <p className="mt-2 text-sm text-gray-400">
            Add items to see breakdown
          </p>
        </div>
      )}
    </div>
  );
}
