"use client";
import RiceDetails from "./rice-details";
import SpiceDetails from "./spice-details";
import LegumesDetails from "./legumes-details";
import BananaDetails from "./banana-details";
import VegetableDetails from "./vegetable-details";
import HighValueCrops from "./high-value-crops";

const CropInformation = ({
  formData,
  handleInputChange,
  handleSelectChange,
  additionalRiceDetails,
  handleAdditionalRiceChange,
  handleRemoveAdditionalRice,
  handleAddAdditionalRice,
  additionalSpiceDetails,
  handleAdditionalSpiceChange,
  handleRemoveAdditionalSpice,
  handleAddAdditionalSpice,
  additionalLegumesDetails,
  handleAdditionalLegumesChange,
  handleRemoveAdditionalLegumes,
  handleAddAdditionalLegumes,
  additionalBananaDetails,
  handleAdditionalBananaChange,
  handleRemoveAdditionalBanana,
  handleAddAdditionalBanana,
  additionalVegetableDetails,
  handleAdditionalVegetableChange,
  handleRemoveAdditionalVegetable,
  handleAddAdditionalVegetable,
  highValueCropOptions,
}) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-3 font-medium text-white bg-emerald-700">
        Crop Information
      </div>
      <div className="p-4 bg-emerald-50 hide-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Crop Type
            </label>
            <select
              name="crop_type"
              value={formData.crop_type}
              onChange={(e) => handleSelectChange("crop_type", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Crop Type</option>
              <option value="Rice">Rice</option>
              <option value="Spices">Spices</option>
              <option value="Legumes">Legumes</option>
              <option value="Banana">Banana</option>
              <option value="Vegetable">Vegetable</option>
              <option value="High Value Crops">High Value Crops</option>
            </select>
          </div>

          {formData.crop_type === "High Value Crops" && (
            <HighValueCrops
              formData={formData}
              handleInputChange={handleInputChange}
              highValueCropOptions={highValueCropOptions}
            />
          )}

          {formData.crop_type !== "Rice" &&
            formData.crop_type !== "High Value Crops" &&
            formData.crop_type !== "" && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Area (hectare)
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
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cropping Intensity
                  </label>
                  <select
                    name="cropping_intensity"
                    value={formData.cropping_intensity || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Cropping Intensity</option>
                    <option value="year_round">Year Round</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="annually">Annually</option>
                    <option value="twice_a_month">Twice a Month</option>
                  </select>
                </div>
              </>
            )}

          {/* Spices Section */}
          {formData.crop_type === "Spices" && (
            <SpiceDetails
              additionalSpiceDetails={additionalSpiceDetails}
              handleAdditionalSpiceChange={handleAdditionalSpiceChange}
              handleRemoveAdditionalSpice={handleRemoveAdditionalSpice}
              handleAddAdditionalSpice={handleAddAdditionalSpice}
            />
          )}

          {/* Legumes Section */}
          {formData.crop_type === "Legumes" && (
            <LegumesDetails
              additionalLegumesDetails={additionalLegumesDetails}
              handleAdditionalLegumesChange={handleAdditionalLegumesChange}
              handleRemoveAdditionalLegumes={handleRemoveAdditionalLegumes}
              handleAddAdditionalLegumes={handleAddAdditionalLegumes}
            />
          )}

          {/* Banana Section */}
          {formData.crop_type === "Banana" && (
            <BananaDetails
              additionalBananaDetails={additionalBananaDetails}
              handleAdditionalBananaChange={handleAdditionalBananaChange}
              handleRemoveAdditionalBanana={handleRemoveAdditionalBanana}
              handleAddAdditionalBanana={handleAddAdditionalBanana}
            />
          )}

          {/* Vegetable Section */}
          {formData.crop_type === "Vegetable" && (
            <VegetableDetails
              additionalVegetableDetails={additionalVegetableDetails}
              handleAdditionalVegetableChange={handleAdditionalVegetableChange}
              handleRemoveAdditionalVegetable={handleRemoveAdditionalVegetable}
              handleAddAdditionalVegetable={handleAddAdditionalVegetable}
            />
          )}

          {/* Rice Details */}
          {formData.crop_type === "Rice" && (
            <RiceDetails
              additionalRiceDetails={additionalRiceDetails}
              handleAdditionalRiceChange={handleAdditionalRiceChange}
              handleRemoveAdditionalRice={handleRemoveAdditionalRice}
              handleAddAdditionalRice={handleAddAdditionalRice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CropInformation;
