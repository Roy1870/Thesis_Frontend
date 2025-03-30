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
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden">
      {/* Header with back button and farmer name */}
      <div className="p-2 mb-3 bg-white rounded-lg shadow-sm sm:p-3">
        <div className="flex items-center justify-between w-full">
          <button
            className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm sm:px-3 sm:py-2 sm:text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            <ArrowLeft className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Back</span>
          </button>
        </div>

        {/* Navigation buttons - scrollable on mobile */}
        <div className="flex gap-2 px-2 pb-2 mt-3 mb-2 -mx-2 overflow-x-auto flex-nowrap sm:gap-5 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeTab === "info"
                ? `bg-[${colors.primary}] text-white`
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setActiveTab("info")}
            style={{
              backgroundColor: activeTab === "info" ? colors.primary : "",
              borderColor: activeTab === "info" ? colors.primary : "",
            }}
          >
            <User className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Farmer Info</span>
          </button>

          <button
            className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeTab === "crops"
                ? `bg-[${colors.primary}] text-white`
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setActiveTab("crops")}
            style={{
              backgroundColor: activeTab === "crops" ? colors.primary : "",
              borderColor: activeTab === "crops" ? colors.primary : "",
            }}
          >
            <Info className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Crops</span>
            {hasCrops && (
              <span
                className={`ml-1 px-1 py-0.5 text-xs rounded-full ${
                  activeTab === "crops"
                    ? "bg-white text-[#6A9C89]"
                    : `bg-[${colors.primary}] text-white`
                }`}
                style={{
                  backgroundColor:
                    activeTab === "crops" ? "#fff" : colors.primary,
                  color: activeTab === "crops" ? colors.primary : "#fff",
                }}
              >
                {farmerData.crops.length}
              </span>
            )}
          </button>

          <button
            className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeTab === "rice"
                ? `bg-[${colors.primary}] text-white`
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setActiveTab("rice")}
            style={{
              backgroundColor: activeTab === "rice" ? colors.primary : "",
              borderColor: activeTab === "rice" ? colors.primary : "",
            }}
          >
            <Info className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Rice</span>
            {hasRice && (
              <span
                className={`ml-1 px-1 py-0.5 text-xs rounded-full ${
                  activeTab === "rice"
                    ? "bg-white text-[#6A9C89]"
                    : `bg-[${colors.primary}] text-white`
                }`}
                style={{
                  backgroundColor:
                    activeTab === "rice" ? "#fff" : colors.primary,
                  color: activeTab === "rice" ? colors.primary : "#fff",
                }}
              >
                {farmerData.rice.length}
              </span>
            )}
          </button>

          <button
            className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeTab === "livestock"
                ? `bg-[${colors.primary}] text-white`
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setActiveTab("livestock")}
            style={{
              backgroundColor: activeTab === "livestock" ? colors.primary : "",
              borderColor: activeTab === "livestock" ? colors.primary : "",
            }}
          >
            <Info className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Livestock</span>
            {hasLivestock && (
              <span
                className={`ml-1 px-1 py-0.5 text-xs rounded-full ${
                  activeTab === "livestock"
                    ? "bg-white text-[#6A9C89]"
                    : `bg-[${colors.primary}] text-white`
                }`}
                style={{
                  backgroundColor:
                    activeTab === "livestock" ? "#fff" : colors.primary,
                  color: activeTab === "livestock" ? colors.primary : "#fff",
                }}
              >
                {livestockRecords.length}
              </span>
            )}
          </button>

          <button
            className={`flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              activeTab === "operator"
                ? `bg-[${colors.primary}] text-white`
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setActiveTab("operator")}
            style={{
              backgroundColor: activeTab === "operator" ? colors.primary : "",
              borderColor: activeTab === "operator" ? colors.primary : "",
            }}
          >
            <MapPin className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
            <span>Operators</span>
            {hasOperators && (
              <span
                className={`ml-1 px-1 py-0.5 text-xs rounded-full ${
                  activeTab === "operator"
                    ? "bg-white text-[#6A9C89]"
                    : `bg-[${colors.primary}] text-white`
                }`}
                style={{
                  backgroundColor:
                    activeTab === "operator" ? "#fff" : colors.primary,
                  color: activeTab === "operator" ? colors.primary : "#fff",
                }}
              >
                {operatorData.length}
              </span>
            )}
          </button>
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
              className="mt-4 sm:mt-6 flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-[#6A9C89] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
              ) : (
                <Save className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
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
