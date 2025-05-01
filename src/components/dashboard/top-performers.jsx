export default function TopPerformers({ topPerformingItems }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get category name for display
  const getCategoryName = (category) => {
    const categoryNames = {
      livestock: "Livestock & Poultry",
      rice: "Rice",
      banana: "Banana",
      legumes: "Legumes",
      spices: "Spices",
      fish: "Fish",
      highValueCrops: "High Value Crops",
      vegetables: "Vegetables",
    };

    return categoryNames[category] || category;
  };

  // Get badge color for item rank
  const getItemBadgeColor = (index) => {
    const colors = {
      0: "bg-yellow-100 text-yellow-800 border-yellow-200",
      1: "bg-gray-100 text-gray-800 border-gray-200",
      2: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colors[index] || "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="mb-10">
      <h3 className="px-1 mb-4 text-xl font-semibold text-gray-800">
        Top Performing Items
      </h3>
      <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-800">
              By Production Volume
            </h4>
            <span className="px-4 py-1.5 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-full">
              Highest Yields
            </span>
          </div>

          {topPerformingItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {topPerformingItems.map((item, index) => (
                <div
                  key={index}
                  className="p-6 transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${getItemBadgeColor(
                        index
                      )} border`}
                    >
                      {index + 1}
                    </div>
                    <h5
                      className="text-base font-medium text-gray-800 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h5>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(item.value.toFixed(2))}
                    </div>
                    <div className="mb-3 text-sm text-gray-600">
                      {item.category === "livestock" ? "heads" : "metric tons"}
                    </div>
                  </div>
                  <div className="w-full h-2.5 overflow-hidden bg-gray-100 rounded-full">
                    <div
                      className={`h-2.5 ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-500"
                          : index === 2
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      } rounded-full`}
                      style={{
                        width: `${
                          (item.value / topPerformingItems[0].value) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-gray-600 bg-gray-50 rounded-full px-2.5 py-1 inline-block">
                    {getCategoryName(item.category)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 rounded-lg bg-gray-50">
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
                No production data available
              </p>
              <p className="mt-2 text-sm">
                Add production data to see top performing items
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
