"use client";

const HighValueCrops = ({
  formData,
  handleInputChange,
  highValueCropOptions,
}) => {
  return (
    <>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Month <span className="text-red-500">*</span>
        </label>
        <select
          name="month"
          value={formData.month}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          required
        >
          <option value="">Select Month</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          High Value Crop <span className="text-red-500">*</span>
        </label>
        <select
          name="high_value_crop"
          value={formData.high_value_crop}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          required
        >
          <option value="">Select High Value Crop</option>
          {highValueCropOptions.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
          <option value="Other Crop (specify)">Other Crop (specify)</option>
        </select>
      </div>

      {formData.high_value_crop === "Other Crop (specify)" && (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Specify Other Crop
          </label>
          <input
            type="text"
            name="other_high_value_crop"
            value={formData.other_high_value_crop || ""}
            onChange={handleInputChange}
            placeholder="Specify crop type"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      )}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Variety/Clone
        </label>
        <input
          type="text"
          name="variety_clone"
          value={formData.variety_clone}
          onChange={handleInputChange}
          placeholder="Enter variety/clone"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Area (hectare) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="area_hectare"
          value={formData.area_hectare || ""}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          placeholder="Enter Area in Hectares"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Quantity (kg) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="Enter quantity"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Cropping Intensity <span className="text-red-500">*</span>
        </label>
        <select
          name="cropping_intensity"
          value={formData.cropping_intensity || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          required
        >
          <option value="">Select Cropping Intensity</option>
          <option value="year_round">Year Round</option>
          <option value="quarterly">Quarterly</option>
          <option value="seasonal">Seasonal</option>
          <option value="annually">Annually</option>
          <option value="twice_a_month">Twice a Month</option>
          <option value="other">Other (specify)</option>
        </select>
      </div>

      {formData.cropping_intensity === "other" && (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Specify Other Cropping Intensity
          </label>
          <input
            type="text"
            name="other_cropping_intensity"
            value={formData.other_cropping_intensity || ""}
            onChange={handleInputChange}
            placeholder="Specify cropping intensity"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      )}
    </>
  );
};

export default HighValueCrops;
