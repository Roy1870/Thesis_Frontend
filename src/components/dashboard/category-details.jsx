export default function CategoryDetails({ categoryData }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="mb-8 transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
      <div className="p-6">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">
          Detailed Category Totals
        </h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Rice Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Rice Varieties
            </h5>
            <div className="space-y-2">
              {categoryData.rice.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Rice
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.rice.total.toFixed(2))} tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Banana Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Banana Varieties
            </h5>
            <div className="space-y-2">
              {categoryData.banana.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Banana
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.banana.total.toFixed(2))} tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vegetables Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Vegetables
            </h5>
            <div className="space-y-2">
              {categoryData.vegetables && categoryData.vegetables.items ? (
                categoryData.vegetables.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatNumber(item.value.toFixed(2))} tons
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  No vegetable data available
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Vegetables
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(
                      (categoryData.vegetables?.total || 0).toFixed(2)
                    )}{" "}
                    tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legumes Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Legumes
            </h5>
            <div className="space-y-2">
              {categoryData.legumes.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Legumes
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.legumes.total.toFixed(2))} tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spices Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Spices
            </h5>
            <div className="space-y-2">
              {categoryData.spices.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Spices
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.spices.total.toFixed(2))} tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fish Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Fish & Seafood
            </h5>
            <div className="space-y-2">
              {categoryData.fish.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Fish
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.fish.total.toFixed(2))} tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* High Value Crops Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              High Value Crops
            </h5>
            <div className="space-y-2">
              {categoryData.highValueCrops.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value.toFixed(2))} tons
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total HVC
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.highValueCrops.total.toFixed(2))}{" "}
                    tons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Livestock Section */}
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h5 className="mb-3 text-base font-semibold text-gray-800">
              Livestock & Poultry
            </h5>
            <div className="space-y-2">
              {categoryData.livestock.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatNumber(item.value)} heads
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Livestock
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatNumber(categoryData.livestock.total)} heads
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
