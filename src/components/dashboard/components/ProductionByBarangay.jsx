import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const ProductionByBarangay = ({ data, colors, formatNumber }) => {
  return (
    <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
      <h4 className="mb-6 text-lg font-semibold text-gray-800">
        Production by Barangay
      </h4>
      {data.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barSize={40}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E0E0E0"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: colors.textLight }}
                axisLine={{ stroke: colors.border }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: colors.textLight }}
                axisLine={{ stroke: colors.border }}
              />
              <Tooltip
                formatter={(value) => [
                  `${formatNumber(value.toFixed(2))} units`,
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
              <Bar
                dataKey="value"
                name="Production (units)"
                fill={colors.primary}
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index % 2 === 0 ? colors.primary : colors.primaryLight
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
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
            No barangay production data available
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Add barangay information to see distribution
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductionByBarangay;
