import {
  Wheat,
  Banana,
  Sprout,
  Leaf,
  Fish,
  Beef,
  Sparkles,
  Carrot,
} from "lucide-react";

export default function CategoryBreakdown({ categoryData }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get category name, icon and color for display
  const getCategoryInfo = (category) => {
    const categoryInfo = {
      livestock: {
        name: "Livestock & Poultry",
        icon: Beef,
        color: "from-purple-500 to-purple-700",
        lightColor: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      rice: {
        name: "Rice",
        icon: Wheat,
        color: "from-green-500 to-green-700",
        lightColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      banana: {
        name: "Banana",
        icon: Banana,
        color: "from-yellow-500 to-yellow-700",
        lightColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
      },
      legumes: {
        name: "Legumes",
        icon: Sprout,
        color: "from-emerald-500 to-emerald-700",
        lightColor: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      spices: {
        name: "Spices",
        icon: Leaf,
        color: "from-red-500 to-red-700",
        lightColor: "bg-red-50",
        iconColor: "text-red-600",
      },
      fish: {
        name: "Fish",
        icon: Fish,
        color: "from-blue-500 to-blue-700",
        lightColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      vegetables: {
        name: "Vegetables",
        icon: Carrot,
        color: "from-orange-500 to-orange-700",
        lightColor: "bg-orange-50",
        iconColor: "text-orange-600",
      },
      highValueCrops: {
        name: "High Value Crops",
        icon: Sparkles,
        color: "from-amber-500 to-amber-700",
        lightColor: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    };

    return (
      categoryInfo[category] || {
        name: category,
        icon: Sprout,
        color: "from-gray-500 to-gray-700",
        lightColor: "bg-gray-50",
        iconColor: "text-gray-600",
      }
    );
  };

  return (
    <div className="mb-8 transition-all duration-200 bg-white border border-gray-100 shadow-md hover:shadow-lg rounded-xl">
      <div className="p-6">
        <h4 className="mb-6 text-xl font-semibold text-gray-800">
          Category Breakdown
        </h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(categoryData).map(([category, data]) => {
            const {
              name,
              icon: Icon,
              color,
              lightColor,
              iconColor,
            } = getCategoryInfo(category);

            // Calculate percentage of total for progress bar
            const maxValue =
              data.items.length > 0
                ? Math.max(...data.items.map((item) => item.value))
                : 0;

            return (
              <div
                key={category}
                className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl hover:translate-y-[-2px]"
              >
                <div className={`h-2 bg-gradient-to-r ${color}`}></div>
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 mr-3 rounded-lg ${lightColor}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <h5 className="text-base font-semibold text-gray-800">
                      {name}
                    </h5>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatNumber(
                          data.total.toFixed(category === "livestock" ? 0 : 2)
                        )}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {category === "livestock" ? "heads" : "tons"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Total production
                    </div>
                  </div>

                  {/* Top 3 items in category */}
                  <div className="mt-5 space-y-3">
                    {data.items.slice(0, 3).map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-sm font-medium text-gray-700 truncate max-w-[70%]"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatNumber(
                              item.value.toFixed(
                                category === "livestock" ? 0 : 2
                              )
                            )}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color}`}
                            style={{
                              width: `${
                                maxValue ? (item.value / maxValue) * 100 : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show count of additional items */}
                  {data.items.length > 3 && (
                    <div className="pt-3 mt-4 text-xs text-center border-t border-gray-100">
                      <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        +{data.items.length - 3} more varieties
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
