export default function CategoryDetails({ categoryData }) {
  // Helper function to format numbers with commas and handle kg/tons conversion
  const formatNumber = (num, convertToTons = false) => {
    // Handle null, undefined or NaN values
    if (num === null || num === undefined || isNaN(num)) {
      return "0.00";
    }

    // Parse the number if it's a string
    const numValue = typeof num === "string" ? Number.parseFloat(num) : num;

    // If we need to convert to tons and the value is >= 1000kg
    if (convertToTons && numValue >= 1000) {
      return (numValue / 1000)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Otherwise format with appropriate decimal places
    return numValue
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to get custom color for each category
  const getCategoryColor = (category) => {
    const colors = {
      rice: {
        bg: "bg-green-50",
        border: "border-green-100",
        textTitle: "text-green-800",
        textTotal: "text-green-700",
      },
      banana: {
        bg: "bg-yellow-50",
        border: "border-yellow-100",
        textTitle: "text-yellow-800",
        textTotal: "text-yellow-700",
      },
      vegetables: {
        bg: "bg-orange-50",
        border: "border-orange-100",
        textTitle: "text-orange-800",
        textTotal: "text-orange-700",
      },
      legumes: {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        textTitle: "text-emerald-800",
        textTotal: "text-emerald-700",
      },
      spices: {
        bg: "bg-red-50",
        border: "border-red-100",
        textTitle: "text-red-800",
        textTotal: "text-red-700",
      },
      fish: {
        bg: "bg-blue-50",
        border: "border-blue-100",
        textTitle: "text-blue-800",
        textTotal: "text-blue-700",
      },
      highValueCrops: {
        bg: "bg-amber-50",
        border: "border-amber-100",
        textTitle: "text-amber-800",
        textTotal: "text-amber-700",
      },
      livestock: {
        bg: "bg-purple-50",
        border: "border-purple-100",
        textTitle: "text-purple-800",
        textTotal: "text-purple-700",
      },
    };

    return (
      colors[category] || {
        bg: "bg-gray-50",
        border: "border-gray-100",
        textTitle: "text-gray-800",
        textTotal: "text-gray-700",
      }
    );
  };

  return (
    <div className="mb-10">
      <h3 className="px-1 mb-4 text-xl font-semibold text-gray-800">
        Detailed Category Totals
      </h3>
      <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Rice Section */}
            {Object.entries(categoryData).map(([category, data]) => {
              const colors = getCategoryColor(category);

              return (
                <div
                  key={category}
                  className={`p-5 border rounded-xl ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
                >
                  <h5
                    className={`mb-4 text-base font-semibold ${colors.textTitle}`}
                  >
                    {category === "rice"
                      ? "Rice Varieties"
                      : category === "banana"
                      ? "Banana Varieties"
                      : category === "vegetables"
                      ? "Vegetables"
                      : category === "legumes"
                      ? "Legumes"
                      : category === "spices"
                      ? "Spices"
                      : category === "fish"
                      ? "Fish & Seafood"
                      : category === "highValueCrops"
                      ? "High Value Crops"
                      : category === "livestock"
                      ? "Livestock & Poultry"
                      : category}
                  </h5>

                  <div className="space-y-2">
                    {data.items.length > 0 ? (
                      data.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700">
                            {item.name}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {category === "livestock"
                              ? formatNumber(item.value || 0)
                              : item.value < 1000
                              ? `${formatNumber(item.value || 0, false)} kg`
                              : `${formatNumber(item.value || 0, true)} tons`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        No data available
                      </div>
                    )}

                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${colors.textTotal}`}
                        >
                          Total
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {category === "livestock"
                            ? formatNumber(data.total || 0)
                            : data.total < 1000
                            ? `${formatNumber(data.total || 0, false)} kg`
                            : `${formatNumber(data.total || 0, true)} tons`}
                        </span>
                      </div>
                    </div>
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
