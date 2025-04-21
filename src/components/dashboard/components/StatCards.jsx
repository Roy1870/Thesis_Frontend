import { BarChart2, TrendingUp, Sprout, Award } from "lucide-react";

const StatCards = ({ dashboardData, colors, formatNumber }) => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gradient-to-br from-[#6A9C89] to-[#4A7C69] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Total Production
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(dashboardData.totalProduction.toFixed(2))}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Metric tons of produce across all categories
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#4F6F7D] to-[#3A5A68] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Average Yield
            </p>
            <p className="text-2xl font-bold">
              {dashboardData.recentHarvests.length > 0
                ? (
                    dashboardData.recentHarvests.reduce(
                      (sum, harvest) =>
                        sum +
                        (harvest.yield_per_hectare !== "N/A"
                          ? Number.parseFloat(harvest.yield_per_hectare)
                          : 0),
                      0
                    ) /
                    dashboardData.recentHarvests.filter(
                      (h) => h.yield_per_hectare !== "N/A"
                    ).length
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Tons per hectare across all farms
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Total Area
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(dashboardData.totalArea.toFixed(2))}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Hectares of cultivated land and water
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#0288D1] to-[#0277BD] rounded-xl text-white p-6 shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            {dashboardData.topPerformingItems &&
            dashboardData.topPerformingItems.length > 0 ? (
              <>
                <p className="text-sm font-medium text-white opacity-80">
                  Top{" "}
                  {getCategoryName(
                    dashboardData.topPerformingItems[0].category
                  ).replace(" & Poultry", "")}
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData.topPerformingItems[0].name}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-white opacity-80">
                  Top Producer
                </p>
                <p className="text-2xl font-bold">None</p>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          {dashboardData.topPerformingItems &&
          dashboardData.topPerformingItems.length > 0
            ? `${formatNumber(
                dashboardData.topPerformingItems[0].value.toFixed(2)
              )} ${
                dashboardData.topPerformingItems[0].category === "livestock"
                  ? "heads"
                  : "tons"
              }`
            : "No production data available"}
        </p>
      </div>
    </div>
  );
};

// Helper function to get category name for display
function getCategoryName(category) {
  const categoryNames = {
    livestock: "Livestock & Poultry",
    rice: "Rice",
    banana: "Banana",
    legumes: "Legumes",
    spices: "Spices",
    fish: "Fish",
    highValueCrops: "High Value Crops",
  };

  return categoryNames[category] || category;
}

export default StatCards;
