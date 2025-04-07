"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Home,
  Info,
  MapPin,
  Loader,
} from "lucide-react";
import { farmerAPI } from "./services/api";
import { livestockAPI } from "./services/api";
import { operatorAPI } from "./services/api";
import OperatorTab from "./operator-tab";
import LivestockTab from "./livestock-tab";
import RiceTab from "./rice-tab";
import CropsTab from "./crops-tab";

const EditFarmer = ({ farmer, onClose, colors }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_number: "",
    facebook_email: "",
    home_address: "",
    farm_address: "",
    farm_location_longitude: "",
    farm_location_latitude: "",
    market_outlet_location: "",
    buyer_name: "",
    association_organization: "",
    barangay: "",
  });
  const [loading, setLoading] = useState(false);
  const [farmerData, setFarmerData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of all data
  const refreshAllData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Fetch the farmer data
  const fetchFarmerDetails = useCallback(async () => {
    try {
      setFetchLoading(true);

      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

      // Process the crops data to extract JSON values
      if (response.crops && response.crops.length > 0) {
        response.crops = response.crops.map((crop) => {
          if (crop.production_data) {
            try {
              const data = JSON.parse(crop.production_data);
              return {
                ...crop,
                crop_value: data.crop || null,
                month_value: data.month || null,
                quantity_value: data.quantity || null,
              };
            } catch (e) {
              return {
                ...crop,
                crop_value: null,
                month_value: null,
                quantity_value: null,
              };
            }
          }
          return crop;
        });
      }

      setFarmerData(response);

      // Set form values
      setFormData({
        name: response.name || "",
        contact_number: response.contact_number || "",
        facebook_email: response.facebook_email || "",
        home_address: response.home_address || "",
        farm_address: response.farm_address || "",
        farm_location_longitude: response.farm_location_longitude || "",
        farm_location_latitude: response.farm_location_latitude || "",
        market_outlet_location: response.market_outlet_location || "",
        buyer_name: response.buyer_name || "",
        association_organization: response.association_organization || "",
        barangay: response.barangay || "",
      });

      setFetchLoading(false);
    } catch (err) {
      console.error("Error fetching farmer details:", err);
      setError(`Failed to fetch farmer details: ${err.message}`);
      setFetchLoading(false);
    }
  }, [farmer.farmer_id]);

  const fetchLivestockRecords = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (livestockRecords.length === 0) {
        setLivestockLoading(true);
      }

      // Get all livestock records
      const response = await livestockAPI.getAllLivestockRecords();
      // Filter records for this farmer
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmer.farmer_id
      );
      setLivestockRecords(farmerLivestockRecords);
      setLivestockLoading(false);
    } catch (err) {
      console.error("Error fetching livestock records:", err);
      setLivestockLoading(false);
    }
  }, [farmer.farmer_id, livestockRecords.length]);

  const fetchOperatorData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (operatorData.length === 0) {
        setOperatorLoading(true);
      }

      // Get all operators
      const response = await operatorAPI.getAllOperators();

      // Filter records for this farmer
      const farmerOperators = response.filter(
        (operator) => operator.farmer_id === farmer.farmer_id
      );

      setOperatorData(farmerOperators);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator data:", err);
      setOperatorLoading(false);
    }
  }, [farmer.farmer_id, operatorData.length]);

  useEffect(() => {
    fetchFarmerDetails();
    fetchLivestockRecords();
    fetchOperatorData();
  }, [
    fetchFarmerDetails,
    fetchLivestockRecords,
    fetchOperatorData,
    refreshTrigger,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Updating farmer with data:", formData);
      await farmerAPI.updateFarmer(farmer.farmer_id, formData);
      alert("Farmer updated successfully.");
      refreshAllData(); // Refresh data after update
      setLoading(false);
    } catch (error) {
      alert(`Failed to update farmer. ${error.message}`);
      setLoading(false);
    }
  };

  if (fetchLoading || livestockLoading || operatorLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#6A9C89] mb-2" />
          <p className="text-sm text-gray-600 sm:text-base">
            Loading farmer details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-5">
        <div
          className="relative px-3 py-2 mb-4 text-red-700 bg-red-100 border border-red-400 rounded sm:px-4 sm:py-3"
          role="alert"
        >
          <strong className="text-sm font-bold sm:text-base">Error!</strong>
          <span className="block text-sm sm:inline sm:text-base"> {error}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 mt-2 text-sm font-bold text-white bg-red-600 rounded sm:mt-3 hover:bg-red-700 sm:py-2 sm:px-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if rice, crop, livestock data exists
  const hasRice = farmerData?.rice && farmerData.rice.length > 0;
  const hasCrops = farmerData?.crops && farmerData.crops.length > 0;
  const hasLivestock = livestockRecords && livestockRecords.length > 0;
  const hasOperators = operatorData && operatorData.length > 0;

  return (
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden pb-safe">
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 640px) {
          .pb-safe {
            padding-bottom: 80px;
          }
        }
      `}</style>
      {/* Header with back button and farmer name */}
      <div className="p-3 mb-3 bg-white rounded-lg shadow-sm sm:p-4">
        <div className="flex flex-col justify-between w-full gap-2 mb-4 sm:flex-row sm:items-center">
          <button
            onClick={onClose}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-1 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 px-1 pb-2 mb-2 -mx-1 overflow-x-auto flex-nowrap sm:gap-4 hide-scrollbar sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "info"
                ? "bg-[#5A8C79] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: activeTab === "info" ? colors.primary : "",
            }}
          >
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
            <span>Info</span>
          </button>

          {hasCrops && (
            <button
              onClick={() => setActiveTab("crops")}
              className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "crops"
                  ? "bg-[#5A8C79] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: activeTab === "crops" ? colors.primary : "",
              }}
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>Crops</span>
              <span
                className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "crops"
                    ? "bg-white text-green-600"
                    : "bg-[#5A8C79] text-white"
                }`}
              >
                {farmerData.crops.length}
              </span>
            </button>
          )}

          {hasRice && (
            <button
              onClick={() => setActiveTab("rice")}
              className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "rice"
                  ? "bg-[#5A8C79] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: activeTab === "rice" ? colors.primary : "",
              }}
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>Rice</span>
              <span
                className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "rice"
                    ? "bg-white text-green-600"
                    : "bg-[#5A8C79] text-white"
                }`}
              >
                {farmerData.rice.length}
              </span>
            </button>
          )}

          {hasLivestock && (
            <button
              onClick={() => setActiveTab("livestock")}
              className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "livestock"
                  ? "bg-[#5A8C79] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor:
                  activeTab === "livestock" ? colors.primary : "",
              }}
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>Livestock</span>
              <span
                className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "livestock"
                    ? "bg-white text-green-600"
                    : "bg-[#5A8C79] text-white"
                }`}
              >
                {livestockRecords.length}
              </span>
            </button>
          )}

          {hasOperators && (
            <button
              onClick={() => setActiveTab("operator")}
              className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "operator"
                  ? "bg-[#5A8C79] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: activeTab === "operator" ? colors.primary : "",
              }}
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>Operator</span>
              <span
                className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "operator"
                    ? "bg-white text-green-600"
                    : "bg-[#5A8C79] text-white"
                }`}
              >
                {operatorData.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "info" && (
        <div className="p-3 mb-4 bg-white rounded-lg shadow-sm sm:p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
              <div className="p-3 bg-white rounded-lg shadow sm:p-4">
                <div className="flex items-center mb-2 sm:mb-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-[#6A9C89]" />
                  <h3 className="text-base font-medium sm:text-lg">
                    Personal Information
                  </h3>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    name="facebook_email"
                    value={formData.facebook_email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Barangay
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow sm:p-4">
                <div className="flex items-center mb-2 sm:mb-3">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-[#6A9C89]" />
                  <h3 className="text-base font-medium sm:text-lg">
                    Address Information
                  </h3>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Home Address
                  </label>
                  <input
                    type="text"
                    name="home_address"
                    value={formData.home_address}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Farm Address
                  </label>
                  <input
                    type="text"
                    name="farm_address"
                    value={formData.farm_address}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Farm Location
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      name="farm_location_longitude"
                      value={formData.farm_location_longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                    />
                    <input
                      type="text"
                      name="farm_location_latitude"
                      value={formData.farm_location_latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude"
                      className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 sm:mt-8 flex items-center justify-center px-6 py-2 bg-[#5A8C79] hover:bg-emerald-800 text-white rounded-md transition-colors text-sm sm:text-base shadow-md fixed bottom-4 left-0 right-0 mx-auto w-[calc(100%-2rem)] sm:w-auto sm:static"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === "crops" && (
        <CropsTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "rice" && (
        <RiceTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "livestock" && (
        <LivestockTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}

      {activeTab === "operator" && (
        <OperatorTab
          farmerId={farmer.farmer_id}
          farmerData={farmerData}
          colors={colors}
          onDataChange={refreshAllData}
        />
      )}
    </div>
  );
};

export default EditFarmer;
