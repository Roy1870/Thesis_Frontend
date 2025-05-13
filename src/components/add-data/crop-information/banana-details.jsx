"use client";

const BananaDetails = ({
  additionalBananaDetails,
  handleAdditionalBananaChange,
  handleRemoveAdditionalBanana,
  handleAddAdditionalBanana,
}) => {
  return (
    <div className="sm:col-span-2">
      <div className="p-4 mb-4 border border-gray-300 rounded-md">
        <h3 className="mb-3 text-lg font-medium">Banana Details</h3>

        {additionalBananaDetails.map((banana, index) => (
          <div
            key={index}
            className="p-3 mb-4 border border-gray-300 rounded-md"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Banana Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={banana.banana_type}
                  onChange={(e) =>
                    handleAdditionalBananaChange(
                      index,
                      "banana_type",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Banana Type</option>
                  <option value="Lakatan">Lakatan</option>
                  <option value="Latundan">Latundan</option>
                  <option value="Saba">Saba</option>
                  <option value="Cavendish">Cavendish</option>
                  <option value="Señorita">Señorita</option>
                  <option value="Other Crop (specify)">
                    Other Crop (specify)
                  </option>
                </select>
              </div>

              {banana.banana_type === "Other Crop (specify)" && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Specify Other Banana
                  </label>
                  <input
                    type="text"
                    value={banana.other_banana || ""}
                    onChange={(e) =>
                      handleAdditionalBananaChange(
                        index,
                        "other_banana",
                        e.target.value
                      )
                    }
                    placeholder="Specify banana type"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={banana.quantity}
                  onChange={(e) =>
                    handleAdditionalBananaChange(
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
                  onClick={() => handleRemoveAdditionalBanana(index)}
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
          onClick={handleAddAdditionalBanana}
          className="px-4 py-2 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Add Banana
        </button>
      </div>
    </div>
  );
};

export default BananaDetails;
