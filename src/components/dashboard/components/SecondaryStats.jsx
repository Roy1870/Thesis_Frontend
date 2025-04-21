import { User, MilkIcon as Cow, Fish } from "lucide-react";

const SecondaryStats = ({ dashboardData, formatNumber }) => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Registered Farmers
          </h3>
          <div className="p-2 rounded-lg bg-blue-50">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatNumber(dashboardData.totalFarmers)}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Active agricultural producers
        </p>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Livestock Count
          </h3>
          <div className="p-2 rounded-lg bg-purple-50">
            <Cow className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatNumber(dashboardData.categoryData.livestock.total)}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Total heads of livestock and poultry
        </p>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Aquaculture Production
          </h3>
          <div className="p-2 rounded-lg bg-cyan-50">
            <Fish className="w-5 h-5 text-cyan-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatNumber(dashboardData.categoryData.fish.total.toFixed(2))}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Metric tons of fish and seafood
        </p>
      </div>
    </div>
  );
};

export default SecondaryStats;
