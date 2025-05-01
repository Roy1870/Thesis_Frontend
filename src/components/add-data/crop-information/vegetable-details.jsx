"use client";

const VegetableDetails = ({
  additionalVegetableDetails,
  handleAdditionalVegetableChange,
  handleRemoveAdditionalVegetable,
  handleAddAdditionalVegetable,
}) => {
  return (
    <div className="sm:col-span-2">
      <div className="p-4 mb-4 border border-gray-300 rounded-md">
        <h3 className="mb-3 text-lg font-medium">Vegetable Details</h3>

        {additionalVegetableDetails.map((vegetable, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Vegetable Type
                </label>
                <select
                  value={vegetable.vegetable_type}
                  onChange={(e) =>
                    handleAdditionalVegetableChange(
                      index,
                      "vegetable_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select Vegetable Type</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Eggplant">Eggplant</option>
                  <option value="Bitter Gourd">Bitter Gourd</option>
                  <option value="Squash">Squash</option>
                  <option value="String Beans">String Beans</option>
                  <option value="Okra">Okra</option>
                  <option value="Cabbage">Cabbage</option>
                  <option value="Carrot">Carrot</option>
                  <option value="Cucumber">Cucumber</option>
                  <option value="Lettuce">Lettuce</option>
                  <option value="Pechay">Pechay</option>
                  <option value="Potato">Potato</option>
                  <option value="Sweet Potato">Sweet Potato</option>
                  <option value="Cassava">Cassava</option>
                  <option value="Other Crop (specify)">
                    Other Crop (specify)
                  </option>
                </select>
              </div>

              {vegetable.vegetable_type === "Other Crop (specify)" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Specify Other Vegetable
                  </label>
                  <input
                    type="text"
                    value={vegetable.other_vegetable}
                    onChange={(e) =>
                      handleAdditionalVegetableChange(
                        index,
                        "other_vegetable",
                        e.target.value
                      )
                    }
                    placeholder="Specify vegetable type"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  value={vegetable.quantity}
                  onChange={(e) =>
                    handleAdditionalVegetableChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {index > 0 && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalVegetable(index)}
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
          onClick={handleAddAdditionalVegetable}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Vegetable
        </button>
      </div>
    </div>
  );
};

export default VegetableDetails;
