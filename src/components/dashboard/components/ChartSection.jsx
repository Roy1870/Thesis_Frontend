import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const ChartSection = ({ dashboardData, colors, formatNumber }) => {
  // Colors for pie chart
  const COLORS = [
    colors.primary,
    colors.accent,
    colors.success,
    colors.warning,
    colors.info,
    "#8884d8",
    colors.primaryLight,
    colors.accentLight,
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">
          Production Distribution
        </h4>
        {dashboardData.cropProduction.length > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.cropProduction}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.cropProduction.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    name === "Livestock & Poultry"
                      ? `${formatNumber(value)} heads`
                      : `${formatNumber(value.toFixed(2))} tons`,
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
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-gray-400">
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

      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">
          Monthly Production Trend
        </h4>
        {dashboardData.monthlyProduction.some((item) => item.production > 0) ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dashboardData.monthlyProduction}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorProduction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.primary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.textLight }}
                  axisLine={{ stroke: colors.border }}
                />
                <YAxis
                  tick={{ fill: colors.textLight }}
                  axisLine={{ stroke: colors.border }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(value.toFixed(2))} tons`,
                    "Production",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #E0E0E0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="production"
                  name="Production (tons)"
                  stroke={colors.primary}
                  fillOpacity={1}
                  fill="url(#colorProduction)"
                  activeDot={{
                    r: 8,
                    stroke: colors.primary,
                    strokeWidth: 2,
                    fill: "white",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-gray-400">
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
};

export default ChartSection;
