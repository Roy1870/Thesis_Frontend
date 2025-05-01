"use client";
import LocationMap from "./location-map";

const GrowerInformation = ({
  formData,
  handleInputChange,
  showMap,
  setShowMap,
  mapRef,
  markerRef,
  mapInstanceRef,
  fetchGrowerLocationName,
  getCurrentLocation,
  setFormData,
}) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-3 font-medium text-white bg-emerald-700">
        Grower Information
      </div>
      <div className="p-4 bg-emerald-50 hide-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LocationMap
            showMap={showMap}
            formData={formData}
            setFormData={setFormData}
            mapRef={mapRef}
            markerRef={markerRef}
            mapInstanceRef={mapInstanceRef}
            fetchLocationName={fetchGrowerLocationName}
            getCurrentLocation={getCurrentLocation}
            setShowMap={setShowMap}
            coordinateField="farm_location"
            locationField="farm_address"
          />

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Farm Address
            </label>
            <input
              type="text"
              name="farm_address"
              value={formData.farm_address}
              onChange={handleInputChange}
              placeholder="Enter farm address"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Farm Location Longitude
            </label>
            <input
              type="number"
              name="farm_location_longitude"
              value={formData.farm_location_longitude}
              onChange={handleInputChange}
              placeholder="Enter farm longitude"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Farm Location Latitude
            </label>
            <input
              type="number"
              name="farm_location_latitude"
              value={formData.farm_location_latitude}
              onChange={handleInputChange}
              placeholder="Enter farm latitude"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Market Outlet Location
            </label>
            <input
              type="text"
              name="market_outlet_location"
              value={formData.market_outlet_location}
              onChange={handleInputChange}
              placeholder="Enter market outlet location"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Buyer Name
            </label>
            <input
              type="text"
              name="buyer_name"
              value={formData.buyer_name}
              onChange={handleInputChange}
              placeholder="Enter buyer name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Association/Organization
            </label>
            <input
              type="text"
              name="association_organization"
              value={formData.association_organization}
              onChange={handleInputChange}
              placeholder="Enter association/organization"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowerInformation;
