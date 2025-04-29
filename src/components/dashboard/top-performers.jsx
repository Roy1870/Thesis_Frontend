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
    };

    return categoryNames[category] || category;
  };

  return (
    <div className="mb-8 transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Top Performing Items
          </h4>
          <span className="px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
            By Production Volume
          </span>
        </div>

        {topPerformingItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {topPerformingItems.map((item, index) => (
              <div
                key={index}
                className="p-6 transition-all duration-200 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md hover:bg-white"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-200 text-gray-700"
                        : index === 2
                        ? "bg-amber-100 text-amber-700"
                        : index === 3
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h5
                    className="text-base font-medium text-gray-800"
                    title={item.name}
                  >
                    {item.name}
                  </h5>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(item.value.toFixed(2))}
                  </div>
                  <div className="mb-3 text-sm text-gray-500">
                    {item.category === "livestock" ? "heads" : "metric tons"}
                  </div>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{
                      width: `${
                        (item.value / topPerformingItems[0].value) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {getCategoryName(item.category)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
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
            <p>No production data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
