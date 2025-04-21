"use client";

import { useState, useEffect } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "../services/api";
import EditFarmer from "./EditFarmer";
// Add this at the top of the file, after the imports
import { prefetchRouteData } from "../services/api";

const ViewFarmer = ({ farmer, onClose, colors }) => {
  const [farmerData, setFarmerData] = useState(null);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [cropDataType, setCropDataType] = useState("Crop"); // Default column title
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingRemarks, setViewingRemarks] = useState(null);
  const [cropSubTab, setCropSubTab] = useState("regular"); // "regular" or "highValue"

  // Function to fetch farmer details (declared here to be accessible in handleCloseEdit)
  const fetchFarmerDetails = async (farmerId) => {
    try {
      setFetchLoading(true);

      const response = await farmerAPI.getFarmerById(farmerId);

      // Determine the crop data type from the first crop item
      if (response.crops && response.crops.length > 0) {
        try {
          const firstCrop = response.crops[0];
          if (firstCrop.production_data) {
            const data = JSON.parse(firstCrop.production_data);
            if (data.month) {
              setCropDataType("Month");
            } else if (data.crop) {
              setCropDataType("Crop");
            }
          }
        } catch (e) {
          console.error("Error parsing crop data:", e);
        }
      }

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
      setFetchLoading(false);
    } catch (err) {
      console.error("Error fetching farmer details:", err);
      setError(`Failed to fetch farmer details: ${err.message}`);
      setFetchLoading(false);
    }
  };

  // Fetch livestock records separately
  const fetchLivestockRecords = async () => {
    try {
      setLivestockLoading(true);

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
  };

  // Fetch operator data separately
  const fetchOperatorData = async () => {
    try {
      setOperatorLoading(true);

      // Get operators for this farmer using getOperatorById
      const response = await operatorAPI.getAllOperators();

      // Filter records for this farmer
      const Operator = response.filter(
        (Operator) => Operator.farmer_id === farmer.farmer_id
      );

      setOperatorData(Operator);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator data:", err);
      setOperatorLoading(false);
    }
  };

  // Add this inside the ViewFarmer component, after the useEffect hooks
  // Prefetch edit data when viewing a farmer
  useEffect(() => {
    // First check if we already have the data in cache before fetching
    const checkCacheAndFetch = async () => {
      try {
        // Try to get the farmer data directly from the API service
        // The API service will return cached data if available
        const farmerResponse = await farmerAPI.getFarmerById(farmer.farmer_id);

        // Process the data as before
        if (farmerResponse) {
          // Determine the crop data type from the first crop item
          if (farmerResponse.crops && farmerResponse.crops.length > 0) {
            try {
              const firstCrop = farmerResponse.crops[0];
              if (firstCrop.production_data) {
                const data = JSON.parse(firstCrop.production_data);
                if (data.month) {
                  setCropDataType("Month");
                } else if (data.crop) {
                  setCropDataType("Crop");
                }
              }
            } catch (e) {
              console.error("Error parsing crop data:", e);
            }
          }

          // Process the crops data to extract JSON values
          if (farmerResponse.crops && farmerResponse.crops.length > 0) {
            farmerResponse.crops = farmerResponse.crops.map((crop) => {
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

          setFarmerData(farmerResponse);
          setFetchLoading(false);

          // After setting the main farmer data, fetch related data
          fetchLivestockRecords();
          fetchOperatorData();
        }
      } catch (err) {
        console.error("Error fetching farmer details:", err);
        setError(`Failed to fetch farmer details: ${err.message}`);
        setFetchLoading(false);
      }
    };

    // Start the fetch process
    setFetchLoading(true);
    checkCacheAndFetch();

    // Prefetch data for inventory page for when they go back
    prefetchRouteData("/inventory");
  }, [farmer]);

  const riceColumns = [
    {
      title: "Area Type",
      dataIndex: "area_type",
      key: "area_type",
    },
    {
      title: "Seed Type",
      dataIndex: "seed_type",
      key: "seed_type",
    },
    {
      title: "Area Harvested",
      dataIndex: "area_harvested",
      key: "area_harvested",
    },
    {
      title: "Production",
      dataIndex: "production",
      key: "production",
    },
    {
      title: "Average Yield",
      dataIndex: "ave_yield",
      key: "ave_yield",
    },
  ];

  const cropColumns = [
    {
      title: "Crop Type",
      dataIndex: "crop_type",
      key: "crop_type",
    },
    {
      title: "Variety/Clone",
      dataIndex: "variety_clone",
      key: "variety_clone",
    },
    {
      title: "Area (Hectare)",
      dataIndex: "area_hectare",
      key: "area_hectare",
    },
    {
      title: "Production Type",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
    },
  ];

  // Define separate columns for regular crops (without Variety/Clone)
  const regularCropColumns = [
    {
      title: "Crop Type",
      dataIndex: "crop_type",
      key: "crop_type",
    },
    {
      title: "Crop",
      dataIndex: "crop_value",
      key: "crop_value",
    },
    {
      title: "Area (Hectare)",
      dataIndex: "area_hectare",
      key: "area_hectare",
    },
    {
      title: "Production Type",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
    },
  ];

  const livestockColumns = [
    {
      title: "Animal Type",
      dataIndex: "animal_type",
      key: "animal_type",
    },
    {
      title: "Subcategory",
      dataIndex: "subcategory",
      key: "subcategory",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Updated By",
      dataIndex: "updated_by",
      key: "updated_by",
    },
  ];

  const operatorColumns = [
    {
      title: "Fishpond Location",
      dataIndex: "fishpond_location",
      key: "fishpond_location",
    },
    {
      title: "Cultured Species",
      dataIndex: "cultured_species",
      key: "cultured_species",
    },
    {
      title: "Area (sqm)",
      dataIndex: "productive_area_sqm",
      key: "productive_area_sqm",
    },
    {
      title: "Stocking Density",
      dataIndex: "stocking_density",
      key: "stocking_density",
    },
    {
      title: "Production (kg)",
      dataIndex: "production_kg",
      key: "production_kg",
    },
    {
      title: "Status",
      dataIndex: "operational_status",
      key: "operational_status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (remarks) => (
        <div className="max-w-xs">
          {remarks ? (
            <div
              className="text-blue-600 truncate cursor-pointer hover:text-blue-800 hover:underline"
              title="Click to view full remarks"
              onClick={() => setViewingRemarks(remarks)}
            >
              {remarks}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
  ];

  // Enhance the handleEdit function to ensure data is ready before editing
  const handleEdit = (farmer) => {
    // Ensure we have the latest data before transitioning to edit mode
    if (farmer && farmer.farmer_id) {
      // Quick prefetch to ensure fresh data
      prefetchFarmerDetails(farmer.farmer_id);
    }

    setIsEditMode(true);
  };

  const handleDelete = async (farmerId) => {
    try {
      await farmerAPI.deleteFarmer(farmerId);
      alert("Farmer deleted successfully.");
      onClose();
    } catch (error) {
      alert(`Failed to delete farmer: ${error.message}`);
    }
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    // Refresh farmer data after editing
    fetchFarmerDetails(farmerData.farmer_id);
    fetchLivestockRecords();
    fetchOperatorData();
  };

  // If in edit mode, show the edit page instead of the view
  if (isEditMode && farmerData) {
    return (
      <EditFarmer
        farmer={farmerData}
        onClose={handleCloseEdit}
        colors={colors}
      />
    );
  }

  if (fetchLoading) {
    return (
      <div className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-24 h-8 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Info section skeleton */}
        <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-3 border border-gray-200 rounded-lg sm:p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 mr-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mb-3">
                  <div className="w-20 h-4 mb-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="p-3 border border-gray-200 rounded-lg sm:p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 mr-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-3">
                  <div className="w-20 h-4 mb-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4">
        <div className="p-3 text-red-800 border border-red-200 rounded-lg sm:p-4 bg-red-50">
          <div className="font-bold">Error</div>
          <div>{error}</div>
          <button
            onClick={onClose}
            className="px-3 py-1 mt-3 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if rice, crop, livestock, and operator data exists
  const hasRice = farmerData?.rice && farmerData.rice.length > 0;
  const hasCrops = farmerData?.crops && farmerData.crops.length > 0;
  const hasLivestock = livestockRecords.length > 0;
  const hasOperators = operatorData.length > 0;

  // Function to prefetch farmer details
  const prefetchFarmerDetails = async (farmerId) => {
    try {
      // Trigger the API call to prefetch farmer details
      await farmerAPI.getFarmerById(farmerId);
      console.log(`Prefetched farmer details for farmer ${farmerId}`);
    } catch (error) {
      console.error("Error prefetching farmer details:", error);
    }
  };

  return (
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden pb-20">
      {/* Header with back button and action buttons */}
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
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(farmerData)}
              className="inline-flex items-center rounded-md h-[30px] sm:h-[34px] shadow-sm bg-[#5A8C79] hover:bg-green-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm"
              style={{
                backgroundColor: colors.warning,
                borderColor: colors.warning,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 mr-1 sm:w-4 sm:h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => {
                if (
                  confirm("Delete this farmer? This action cannot be undone.")
                ) {
                  handleDelete(farmerData.farmer_id);
                }
              }}
              className="inline-flex items-center rounded-md h-[30px] sm:h-[34px] shadow-sm bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 mr-1 sm:w-4 sm:h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          </div>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Info
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Crops
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Rice
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

          {/* Only show livestock button if records exist */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Livestock
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

          {/* Only show operator button if records exist */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Operator
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-full p-3 border border-gray-200 rounded-lg sm:p-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-sm font-medium sm:text-base">
                  Personal Information
                </h3>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Name
                </div>
                <div className="text-xs font-medium sm:text-sm">
                  {farmerData.name}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Contact Number
                </div>
                <div className="text-xs sm:text-sm">
                  {farmerData.contact_number || "N/A"}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Email
                </div>
                <div className="text-xs sm:text-sm">
                  {farmerData.facebook_email || "N/A"}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Barangay
                </div>
                <div>
                  <span className="inline-block px-2 py-1 mt-1 text-xs text-green-800 bg-green-100 rounded-md">
                    {farmerData.barangay || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-full p-3 border border-gray-200 rounded-lg sm:p-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <h3 className="text-sm font-medium sm:text-base">
                  Address Information
                </h3>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Home Address
                </div>
                <div className="text-xs sm:text-sm">
                  {farmerData.home_address || "N/A"}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Farm Address
                </div>
                <div className="text-xs sm:text-sm">
                  {farmerData.farm_address || "N/A"}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Farm Location
                </div>
                <div className="text-xs sm:text-sm">
                  {farmerData.farm_location_longitude &&
                  farmerData.farm_location_latitude
                    ? `${farmerData.farm_location_longitude}, ${farmerData.farm_location_latitude}`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rice" && (
        <div className="mt-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center p-3 border-b sm:p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium sm:text-base">
              Rice Information
            </h3>
          </div>

          {hasRice ? (
            <div className="px-3 overflow-x-auto sm:px-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {riceColumns.map((column) => (
                      <th
                        key={column.key || column.dataIndex}
                        className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farmerData.rice.map((rice, index) => (
                    <tr
                      key={rice.rice_id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {riceColumns.map((column) => (
                        <td
                          key={`${rice.rice_id || index}-${
                            column.key || column.dataIndex
                          }`}
                          className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                        >
                          {rice[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-xs sm:text-sm">
                No rice information available
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "crops" && (
        <div className="mt-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center p-3 border-b sm:p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium sm:text-base">
              Crop Information
            </h3>
          </div>

          {/* Sub-tabs for crops */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                cropSubTab === "regular"
                  ? "text-emerald-700 border-b-2 border-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setCropSubTab("regular")}
            >
              Regular Crops
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                cropSubTab === "highValue"
                  ? "text-emerald-700 border-b-2 border-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setCropSubTab("highValue")}
            >
              High Value Crops
            </button>
          </div>

          {hasCrops ? (
            <div className="px-3 overflow-x-auto sm:px-4">
              {cropSubTab === "regular" ? (
                // Regular crops table
                <>
                  {farmerData.crops.filter(
                    (crop) => crop.crop_type !== "High Value Crops"
                  ).length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {regularCropColumns.map((column) => (
                            <th
                              key={column.key || column.dataIndex}
                              className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
                            >
                              {column.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {farmerData.crops
                          .filter(
                            (crop) => crop.crop_type !== "High Value Crops"
                          )
                          .map((crop, index) => (
                            <tr
                              key={crop.crop_id || index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              {regularCropColumns.map((column) => (
                                <td
                                  key={`${crop.crop_id || index}-${
                                    column.key || column.dataIndex
                                  }`}
                                  className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                                >
                                  {column.render
                                    ? column.render(crop, crop)
                                    : crop[column.dataIndex]}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm">
                        No regular crop information available
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // High value crops table
                <>
                  {farmerData.crops.filter(
                    (crop) => crop.crop_type === "High Value Crops"
                  ).length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Crop
                          </th>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Variety/Clone
                          </th>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Area (Hectare)
                          </th>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Production Type
                          </th>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Month
                          </th>
                          <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {farmerData.crops
                          .filter(
                            (crop) => crop.crop_type === "High Value Crops"
                          )
                          .map((crop, index) => (
                            <tr
                              key={crop.crop_id || index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.crop_value}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.variety_clone || "-"}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.area_hectare}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.production_type}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.month_value}
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                                {crop.quantity_value}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm">
                        No high value crop information available
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-xs sm:text-sm">
                No crop information available
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "livestock" && (
        <div className="mt-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center p-3 border-b sm:p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium sm:text-base">
              Livestock Records
            </h3>
          </div>

          {livestockLoading ? (
            <div className="px-3 py-4 sm:px-4">
              <div className="p-2 bg-gray-50">
                <div className="flex mb-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-1 px-2 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex mb-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex-1 px-2 py-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : hasLivestock ? (
            <div className="px-3 overflow-x-auto sm:px-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {livestockColumns.map((column) => (
                      <th
                        key={column.key || column.dataIndex}
                        className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {livestockRecords.map((record, index) => (
                    <tr
                      key={
                        record.record_id ||
                        `${record.animal_type}-${
                          record.subcategory
                        }-${Math.random()}`
                      }
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {livestockColumns.map((column) => (
                        <td
                          key={`${index}-${column.key || column.dataIndex}`}
                          className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                        >
                          {record[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-xs sm:text-sm">
                No livestock records available
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "operator" && (
        <div className="mt-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center p-3 border-b sm:p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2 text-green-600 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium sm:text-base">
              Operator Information
            </h3>
          </div>

          {operatorLoading ? (
            <div className="px-3 py-4 sm:px-4">
              <div className="p-2 bg-gray-50">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 px-2 py-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex mb-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <div key={j} className="flex-1 px-2 py-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : hasOperators ? (
            <div className="px-3 overflow-x-auto sm:px-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {operatorColumns.map((column) => (
                      <th
                        key={column.key || column.dataIndex}
                        className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operatorData.map((record, index) => (
                    <tr
                      key={
                        record.operator_id ||
                        record.id ||
                        Math.random().toString()
                      }
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {operatorColumns.map((column) => (
                        <td
                          key={`${index}-${column.key || column.dataIndex}`}
                          className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                        >
                          {column.render
                            ? column.render(record[column.dataIndex], record)
                            : record[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-2 text-gray-300 sm:w-12 sm:h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-xs sm:text-sm">
                No operator information available
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Full Remarks Modal */}
      {viewingRemarks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl sm:max-w-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-medium">Remarks</h3>
              <button
                onClick={() => setViewingRemarks(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-96">
              <p className="text-sm whitespace-pre-wrap sm:text-base">
                {viewingRemarks}
              </p>
            </div>
            <div className="sticky bottom-0 z-10 flex justify-end p-4 bg-white border-t">
              <button
                onClick={() => setViewingRemarks(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewFarmer;
