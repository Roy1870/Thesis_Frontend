"use client";
import LocationMap from "./location-map";

const OperatorInformation = ({
  formData,
  handleInputChange,
  showOperatorMap,
  setShowOperatorMap,
  operatorMapRef,
  operatorMarkerRef,
  operatorMapInstanceRef,
  fetchLocationName,
  getOperatorCurrentLocation,
  setFormData,
}) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-3 font-medium text-white bg-emerald-700">
        Operator Information
      </div>
      <div className="p-4 bg-emerald-50 hide-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LocationMap
            showMap={showOperatorMap}
            formData={formData}
            setFormData={setFormData}
            mapRef={operatorMapRef}
            markerRef={operatorMarkerRef}
            mapInstanceRef={operatorMapInstanceRef}
            fetchLocationName={fetchLocationName}
            getCurrentLocation={getOperatorCurrentLocation}
            setShowMap={setShowOperatorMap}
            coordinateField="operator_location"
            locationField="fishpond_location"
          />

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Fishpond Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fishpond_location"
              value={formData.fishpond_location}
              onChange={handleInputChange}
              placeholder="Enter fishpond location"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Operator Location Longitude
            </label>
            <input
              type="number"
              name="operator_location_longitude"
              value={formData.operator_location_longitude}
              onChange={handleInputChange}
              placeholder="Enter longitude"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Operator Location Latitude
            </label>
            <input
              type="number"
              name="operator_location_latitude"
              value={formData.operator_location_latitude}
              onChange={handleInputChange}
              placeholder="Enter latitude"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Cultured Species <span className="text-red-500">*</span>
            </label>
            <select
              name="cultured_species"
              value={formData.cultured_species}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select Species</option>
              <option value="Tilapia">Tilapia</option>
              <option value="Bangus (Milkfish)">Bangus (Milkfish)</option>
              <option value="Catfish">Catfish</option>
              <option value="Carp">Carp</option>
              <option value="Shrimp">Shrimp</option>
              <option value="Prawn">Prawn</option>
              <option value="Mudcrab">Mudcrab</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Productive Area (sqm)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="Enter productive area"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Stocking Density
            </label>
            <input
              type="number"
              name="stocking_density"
              value={formData.stocking_density}
              onChange={handleInputChange}
              placeholder="Enter stocking density"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Date of Stocking
            </label>
            <input
              type="date"
              name="date_of_stocking"
              value={formData.date_of_stocking}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Production (kg)
            </label>
            <input
              type="number"
              name="production"
              value={formData.production}
              onChange={handleInputChange}
              placeholder="Enter production"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Date of Harvest
            </label>
            <input
              type="date"
              name="date_of_harvest"
              value={formData.date_of_harvest}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Remarks <span className="text-red-500">*</span>
            </label>
            <select
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select Status</option>
              <option value="operational">Operational</option>
              <option value="non-operational">Non-operational</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorInformation;
