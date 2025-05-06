"use client";

const RiceDetails = ({
  additionalRiceDetails,
  handleAdditionalRiceChange,
  handleRemoveAdditionalRice,
  handleAddAdditionalRice,
}) => {
  // Function to calculate average yield
  const calculateAveYield = (production, area_harvested) => {
    if (!production || !area_harvested || area_harvested === 0) return "";
    const yield_value =
      Number.parseFloat(production) / Number.parseFloat(area_harvested);
    return yield_value.toFixed(2); // Format to 2 decimal places
  };

  return (
    <div className="sm:col-span-2">
      <div className="p-4 mb-4 border border-gray-300 rounded-md">
        <h3 className="mb-3 text-lg font-medium">Rice Details</h3>

        {additionalRiceDetails.map((rice, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Area Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={rice.area_type}
                  onChange={(e) =>
                    handleAdditionalRiceChange(
                      index,
                      "area_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Area Type</option>
                  <option value="Irrigated">Irrigated</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Seed Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={rice.seed_type}
                  onChange={(e) =>
                    handleAdditionalRiceChange(
                      index,
                      "seed_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Seed Type</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Certified Seeds">Certified Seeds</option>
                  <option value="Good Seeds">Good Seeds</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Area Harvested (ha) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={rice.area_harvested}
                  onChange={(e) => {
                    handleAdditionalRiceChange(
                      index,
                      "area_harvested",
                      e.target.value
                    );
                    // Calculate and update ave_yield when area_harvested changes
                    const newYield = calculateAveYield(
                      rice.production,
                      e.target.value
                    );
                    handleAdditionalRiceChange(index, "ave_yield", newYield);
                  }}
                  placeholder="Enter area harvested"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Production (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={rice.production}
                  onChange={(e) => {
                    handleAdditionalRiceChange(
                      index,
                      "production",
                      e.target.value
                    );
                    // Calculate and update ave_yield when production changes
                    const newYield = calculateAveYield(
                      e.target.value,
                      rice.area_harvested
                    );
                    handleAdditionalRiceChange(index, "ave_yield", newYield);
                  }}
                  placeholder="Enter production"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Average Yield (mt/ha)
                </label>
                <input
                  type="text"
                  value={
                    rice.ave_yield ||
                    calculateAveYield(rice.production, rice.area_harvested)
                  }
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Auto-calculated"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Formula: Production ÷ Area Harvested
                </p>
              </div>
            </div>

            {index > 0 && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalRice(index)}
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddAdditionalRice}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Rice Details
        </button>
      </div>
    </div>
  );
};

export default RiceDetails;
