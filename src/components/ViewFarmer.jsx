"use client";

import { useState, useEffect } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import EditFarmer from "./EditFarmer";

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

  // Function to fetch farmer details (declared here to be accessible in handleCloseEdit)
  const fetchFarmerDetails = async () => {
    try {
      setFetchLoading(true);

      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

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

  // Fetch the farmer data, livestock records, and operator data
  useEffect(() => {
    fetchFarmerDetails();
    fetchLivestockRecords();
    fetchOperatorData();
  }, [farmer.farmer_id]);

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
      title: cropDataType,
      key: "crop_or_month",
      render: (_, record) => {
        return cropDataType === "Crop" ? record.crop_value : record.month_value;
      },
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
    },
  ];

  const handleEdit = (farmer) => {
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
    fetchFarmerDetails();
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
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
        <span className="ml-3">Loading farmer details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="p-4 text-red-800 border border-red-200 rounded-lg bg-red-50">
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

  return (
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden">
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
              className="inline-flex items-center rounded-md h-[30px] sm:h-[34px] shadow-sm bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm"
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
        <div className="flex gap-2 pb-2 mb-2 overflow-x-auto flex-nowrap sm:gap-4 hide-scrollbar">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "info"
                ? "bg-green-600 text-white"
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
                  ? "bg-green-600 text-white"
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
                    : "bg-green-600 text-white"
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
                  ? "bg-green-600 text-white"
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
                    : "bg-green-600 text-white"
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
                  ? "bg-green-600 text-white"
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
                    : "bg-green-600 text-white"
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
                  ? "bg-green-600 text-white"
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
                    : "bg-green-600 text-white"
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
                <h3 className="text-base font-medium sm:text-lg">
                  Personal Information
                </h3>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Name
                </div>
                <div className="text-sm font-medium sm:text-base">
                  {farmerData.name}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Contact Number
                </div>
                <div className="text-sm sm:text-base">
                  {farmerData.contact_number || "N/A"}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Email
                </div>
                <div className="text-sm sm:text-base">
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
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <h3 className="text-base font-medium sm:text-lg">
                  Address Information
                </h3>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Home Address
                </div>
                <div className="text-sm sm:text-base">
                  {farmerData.home_address || "N/A"}
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Farm Address
                </div>
                <div className="text-sm sm:text-base">
                  {farmerData.farm_address || "N/A"}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500 sm:text-sm">
                  Farm Location
                </div>
                <div className="text-sm sm:text-base">
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
            <h3 className="text-base font-medium sm:text-lg">
              Rice Information
            </h3>
          </div>

          {hasRice ? (
            <div className="overflow-x-auto">
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
              <p className="text-sm sm:text-base">
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
            <h3 className="text-base font-medium sm:text-lg">
              Crop Information
            </h3>
          </div>

          {hasCrops ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {cropColumns.map((column) => (
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
                  {farmerData.crops.map((crop, index) => (
                    <tr
                      key={crop.crop_id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {cropColumns.map((column) => (
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
              <p className="text-sm sm:text-base">
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
            <h3 className="text-base font-medium sm:text-lg">
              Livestock Records
            </h3>
          </div>

          {livestockLoading ? (
            <div className="flex justify-center py-8 sm:py-10">
              <div className="w-6 h-6 border-t-2 border-b-2 border-green-500 rounded-full sm:w-8 sm:h-8 animate-spin"></div>
              <span className="ml-2 text-sm sm:text-base">
                Loading livestock records...
              </span>
            </div>
          ) : hasLivestock ? (
            <div className="overflow-x-auto">
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
              <p className="text-sm sm:text-base">
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
            <h3 className="text-base font-medium sm:text-lg">
              Operator Information
            </h3>
          </div>

          {operatorLoading ? (
            <div className="flex justify-center py-8 sm:py-10">
              <div className="w-6 h-6 border-t-2 border-b-2 border-green-500 rounded-full sm:w-8 sm:h-8 animate-spin"></div>
              <span className="ml-2 text-sm sm:text-base">
                Loading operator records...
              </span>
            </div>
          ) : hasOperators ? (
            <div className="overflow-x-auto">
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
              <p className="text-sm sm:text-base">
                No operator information available
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Full Remarks Modal */}
      {viewingRemarks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-3 bg-white rounded-lg shadow-xl sm:max-w-2xl">
            <div className="flex items-center justify-between p-3 border-b sm:p-4">
              <h3 className="text-base font-medium sm:text-lg">Remarks</h3>
              <button
                onClick={() => setViewingRemarks(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
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
            <div className="p-4 overflow-y-auto sm:p-6 max-h-60 sm:max-h-96">
              <p className="text-sm whitespace-pre-wrap sm:text-base">
                {viewingRemarks}
              </p>
            </div>
            <div className="flex justify-end p-3 border-t sm:p-4">
              <button
                onClick={() => setViewingRemarks(null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
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
