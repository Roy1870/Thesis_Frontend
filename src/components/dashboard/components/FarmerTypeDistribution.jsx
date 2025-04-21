import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const FarmerTypeDistribution = ({ data, colors, formatNumber }) => {
  return (
    <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
      <h4 className="mb-6 text-lg font-semibold text-gray-800">
        Farmer Type Distribution
      </h4>
      {data && data.length > 0 ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Raiser"
                        ? colors.raiser
                        : entry.name === "Operator"
                        ? colors.operator
                        : colors.grower
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${formatNumber(value)} farmers`,
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
          <p className="text-lg font-medium">No farmer type data available</p>
          <p className="mt-2 text-sm text-gray-400">
            Add farmer data to see distribution
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmerTypeDistribution;
