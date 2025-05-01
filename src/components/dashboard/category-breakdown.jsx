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
        bgHover: "hover:bg-purple-50",
      },
      rice: {
        name: "Rice",
        icon: Wheat,
        color: "from-green-500 to-green-700",
        lightColor: "bg-green-50",
        iconColor: "text-green-600",
        bgHover: "hover:bg-green-50",
      },
      banana: {
        name: "Banana",
        icon: Banana,
        color: "from-yellow-500 to-yellow-700",
        lightColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
        bgHover: "hover:bg-yellow-50",
      },
      legumes: {
        name: "Legumes",
        icon: Sprout,
        color: "from-emerald-500 to-emerald-700",
        lightColor: "bg-emerald-50",
        iconColor: "text-emerald-600",
        bgHover: "hover:bg-emerald-50",
      },
      spices: {
        name: "Spices",
        icon: Leaf,
        color: "from-red-500 to-red-700",
        lightColor: "bg-red-50",
        iconColor: "text-red-600",
        bgHover: "hover:bg-red-50",
      },
      fish: {
        name: "Fish",
        icon: Fish,
        color: "from-blue-500 to-blue-700",
        lightColor: "bg-blue-50",
        iconColor: "text-blue-600",
        bgHover: "hover:bg-blue-50",
      },
      vegetables: {
        name: "Vegetables",
        icon: Carrot,
        color: "from-orange-500 to-orange-700",
        lightColor: "bg-orange-50",
        iconColor: "text-orange-600",
        bgHover: "hover:bg-orange-50",
      },
      highValueCrops: {
        name: "High Value Crops",
        icon: Sparkles,
        color: "from-amber-500 to-amber-700",
        lightColor: "bg-amber-50",
        iconColor: "text-amber-600",
        bgHover: "hover:bg-amber-50",
      },
    };

    return (
      categoryInfo[category] || {
        name: category,
        icon: Sprout,
        color: "from-gray-500 to-gray-700",
        lightColor: "bg-gray-50",
        iconColor: "text-gray-600",
        bgHover: "hover:bg-gray-50",
      }
    );
  };

  return (
    <div className="mb-10">
      <h3 className="px-1 mb-4 text-xl font-semibold text-gray-800">
        Category Breakdown
      </h3>
      <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(categoryData).map(([category, data]) => {
              const {
                name,
                icon: Icon,
                color,
                lightColor,
                iconColor,
                bgHover,
              } = getCategoryInfo(category);

              // Calculate percentage of total for progress bar
              const maxValue =
                data.items.length > 0
                  ? Math.max(...data.items.map((item) => item.value))
                  : 0;

              return (
                <div
                  key={category}
                  className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:-translate-y-1"
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
                          <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
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
                        <span
                          className={`px-3 py-1.5 text-xs font-medium rounded-full ${lightColor} ${iconColor}`}
                        >
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
    </div>
  );
}
