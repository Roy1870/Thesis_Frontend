import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function CropSection({ cropProduction }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Colors for the pie chart
  const COLORS = [
    "#6A9C89", // primary
    "#4F6F7D", // accent
    "#388E3C", // success
    "#FFA000", // warning
    "#0288D1", // info
    "#8884d8", // purple
    "#8DB5A5", // primaryLight
    "#6F8F9D", // accentLight
  ];

  return (
    <div className="p-6 mb-8 transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
      <h4 className="mb-6 text-lg font-semibold text-gray-800">
        Production by Category
      </h4>
      {cropProduction && cropProduction.length > 0 ? (
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="w-full md:w-2/3 h-[280px] sm:h-[320px] mt-4">
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
                  label={false} // Remove inline labels for cleaner look
                >
                  {cropProduction.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${formatNumber(value.toFixed(2))} tons`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
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

          {/* Add a separate legend/stats section for better readability */}
          <div className="grid w-full grid-cols-2 gap-2 mt-4 text-sm md:w-1/3 md:mt-0 sm:grid-cols-3 md:grid-cols-1">
            {cropProduction.map((entry, index) => {
              const totalProduction = cropProduction.reduce(
                (sum, item) => sum + item.value,
                0
              );
              const color = COLORS[index % COLORS.length];

              return (
                <div
                  key={index}
                  className="flex items-center p-2 rounded-md hover:bg-gray-50"
                >
                  <div
                    className="w-3 h-3 mr-2 rounded-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.name}</span>
                    <span className="text-gray-600">
                      {formatNumber(entry.value.toFixed(2))} tons
                      <span className="ml-1 text-xs text-gray-500">
                        ({((entry.value / totalProduction) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] sm:h-[320px] text-gray-400">
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
  );
}
