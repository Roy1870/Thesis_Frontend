"use client";

const LegumesDetails = ({
  additionalLegumesDetails,
  handleAdditionalLegumesChange,
  handleRemoveAdditionalLegumes,
  handleAddAdditionalLegumes,
}) => {
  return (
    <div className="sm:col-span-2">
      <div className="p-4 mb-4 border border-gray-300 rounded-md">
        <h3 className="mb-3 text-lg font-medium">Legumes Details</h3>

        {additionalLegumesDetails.map((legume, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Legume Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={legume.legumes_type}
                  onChange={(e) =>
                    handleAdditionalLegumesChange(
                      index,
                      "legumes_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Legume Type</option>
                  <option value="Mungbean">Mungbean</option>
                  <option value="Peanut">Peanut</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cowpea">Cowpea</option>
                  <option value="Pigeon Pea">Pigeon Pea</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={legume.quantity}
                  onChange={(e) =>
                    handleAdditionalLegumesChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {index > 0 && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalLegumes(index)}
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
          onClick={handleAddAdditionalLegumes}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Legume
        </button>
      </div>
    </div>
  );
};

export default LegumesDetails;
