"use client";

const SpiceDetails = ({
  additionalSpiceDetails,
  handleAdditionalSpiceChange,
  handleRemoveAdditionalSpice,
  handleAddAdditionalSpice,
}) => {
  return (
    <div className="sm:col-span-2">
      <div className="p-4 mb-4 border border-gray-300 rounded-md">
        <h3 className="mb-3 text-lg font-medium">Spice Details</h3>

        {additionalSpiceDetails.map((spice, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Spice Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={spice.spices_type}
                  onChange={(e) =>
                    handleAdditionalSpiceChange(
                      index,
                      "spices_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Spice Type</option>
                  <option value="Ginger">Ginger</option>
                  <option value="Turmeric">Turmeric</option>
                  <option value="Black Pepper">Black Pepper</option>
                  <option value="Chili">Chili</option>
                  <option value="Lemongrass">Lemongrass</option>
                  <option value="Garlic">Garlic</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={spice.quantity}
                  onChange={(e) =>
                    handleAdditionalSpiceChange(
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
                  onClick={() => handleRemoveAdditionalSpice(index)}
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
          onClick={handleAddAdditionalSpice}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Spice
        </button>
      </div>
    </div>
  );
};

export default SpiceDetails;
