"use client";

import { useState, useEffect, useCallback } from "react";
import { farmerAPI } from "../services/api";

const CropsTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [cropDataType, setCropDataType] = useState("Crop");
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isEditingCrop, setIsEditingCrop] = useState(false);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [cropModalLoading, setCropModalLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [highValueCrops, setHighValueCrops] = useState([]);
  const [cropLoading, setCropLoading] = useState(true);
  const [selectedCropType, setSelectedCropType] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Crop");
  const [activeTab, setActiveTab] = useState("crops"); // 'crops' or 'highValueCrops'

  // High Value Crop options
  const highValueCropOptions = [
    "Cacao",
    "Mango",
    "Coffee",
    "Rubber",
    "Oil Palm",
    "Durian",
    "Coconut",
  ];

  // Form state
  const [formValues, setFormValues] = useState({
    crop_type: "",
    variety_clone: "",
    area_hectare: "",
    production_type: "seasonal",
    crop_value: "",
    month_value: "",
    quantity: "",
    high_value_crop: "",
  });

  const fetchCropData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (crops.length === 0 && highValueCrops.length === 0) {
        setCropLoading(true);
      }

      // Use the farmer data passed from parent instead of fetching it again
      let response = farmerData;

      // Only fetch if we don't have complete data
      if (!farmerData.crops && farmerId) {
        response = await farmerAPI.getFarmerById(farmerId);
      }

      // Process the crops data to extract JSON values
      if (response.crops && response.crops.length > 0) {
        const processedCrops = response.crops.map((crop) => {
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
              console.error("Error parsing production data:", e);
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

        // Separate high value crops from regular crops
        const highValue = processedCrops.filter(
          (crop) => crop.crop_type === "High Value Crops"
        );
        const regular = processedCrops.filter(
          (crop) => crop.crop_type !== "High Value Crops"
        );

        setHighValueCrops(highValue);
        setCrops(regular);
      } else {
        setHighValueCrops([]);
        setCrops([]);
      }

      setCropLoading(false);
    } catch (err) {
      console.error("Error fetching crop data:", err);
      setCropLoading(false);
    }
  }, [farmerId, crops.length, highValueCrops.length, farmerData]);

  useEffect(() => {
    if (farmerId) {
      // If farmerData already has crops, process them directly
      if (
        farmerData &&
        farmerData.crops &&
        farmerData.crops.length > 0 &&
        crops.length === 0 &&
        highValueCrops.length === 0
      ) {
        setCropLoading(true);

        const processedCrops = farmerData.crops.map((crop) => {
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
              console.error("Error parsing production data:", e);
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

        // Separate high value crops from regular crops
        const highValue = processedCrops.filter(
          (crop) => crop.crop_type === "High Value Crops"
        );
        const regular = processedCrops.filter(
          (crop) => crop.crop_type !== "High Value Crops"
        );

        setHighValueCrops(highValue);
        setCrops(regular);
        setCropLoading(false);
      } else {
        // Only fetch if we don't have the data
        fetchCropData();
      }
    }
  }, [
    farmerId,
    fetchCropData,
    farmerData,
    crops.length,
    highValueCrops.length,
  ]);

  // Crop Modal Functions
  const showAddCropModal = (type = "crops") => {
    setIsEditingCrop(false);
    setCurrentCrop(null);
    setSelectedCropType(type === "highValueCrops" ? "High Value Crops" : null);
    setModalTitle(
      `Add New ${type === "highValueCrops" ? "High Value Crop" : "Crop"}`
    );
    setFormValues({
      crop_type: type === "highValueCrops" ? "High Value Crops" : "",
      variety_clone: "",
      area_hectare: "",
      production_type: "seasonal",
      crop_value: "",
      month_value: "",
      quantity: "",
      high_value_crop: "",
    });
    setIsCropModalVisible(true);
  };

  const showEditCropModal = (crop) => {
    setIsEditingCrop(true);
    setCurrentCrop(crop);
    setSelectedCropType(crop.crop_type);

    // Set a more descriptive title
    let cropName = "";
    try {
      if (crop.production_data) {
        const productionData = JSON.parse(crop.production_data);
        if (crop.crop_type === "High Value Crops") {
          cropName = `${productionData.crop || "Unknown crop"} (${
            productionData.month || "Unknown month"
          })`;
        } else {
          cropName = productionData.crop || crop.crop_type;
        }
      } else {
        cropName = crop.crop_type;
      }
    } catch (e) {
      cropName = crop.crop_type;
    }

    setModalTitle(`Edit ${cropName}`);

    // Parse production data to set form values
    let productionData = {};
    try {
      if (crop.production_data) {
        productionData = JSON.parse(crop.production_data);
      }
    } catch (e) {
      console.error("Error parsing production data:", e);
    }

    // Set form values
    setFormValues({
      crop_type: crop.crop_type,
      variety_clone: crop.variety_clone || "",
      area_hectare: crop.area_hectare,
      production_type: crop.production_type || "seasonal",
      crop_value: productionData.crop || "",
      month_value: productionData.month || "",
      quantity: productionData.quantity || "",
      high_value_crop:
        crop.crop_type === "High Value Crops" ? productionData.crop || "" : "",
    });

    setIsCropModalVisible(true);
  };

  const handleCropModalCancel = () => {
    setIsCropModalVisible(false);
    setFormValues({
      crop_type: "",
      variety_clone: "",
      area_hectare: "",
      production_type: "seasonal",
      crop_value: "",
      month_value: "",
      quantity: "",
      high_value_crop: "",
    });
    setSelectedCropType(null);
  };

  const handleSelectChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (name === "crop_type") {
      setSelectedCropType(value);

      // Reset crop-specific values when changing crop type
      setFormValues((prev) => ({
        ...prev,
        crop_value: "",
        high_value_crop: "",
      }));
    }
  };

  // Add crop-specific options based on crop type
  const getCropOptions = (cropType) => {
    switch (cropType) {
      case "Spices":
        return ["Black Pepper", "Ginger", "Turmeric", "Lemongrass", "Chili"];
      case "Legumes":
        return ["Mung Bean", "Peanut", "Soybean", "Pigeon Pea", "Cowpea"];
      case "Vegetable":
        return [
          "Leafy Vegetables",
          "Root Vegetables",
          "Fruit Vegetables",
          "Tomato",
          "Eggplant",
          "Okra",
        ];
      case "Banana":
        return ["Lakatan", "Latundan", "Cardava"];
      default:
        return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCropModalSubmit = async () => {
    // Basic validation
    if (
      !formValues.crop_type ||
      !formValues.area_hectare ||
      !formValues.production_type ||
      (formValues.crop_type === "High Value Crops" &&
        (!formValues.high_value_crop || !formValues.month_value)) ||
      (formValues.crop_type !== "High Value Crops" &&
        (!formValues.crop_value || !formValues.month_value)) ||
      !formValues.quantity
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCropModalLoading(true);

      if (isEditingCrop && currentCrop) {
        // Update existing crop
        let productionData = {};

        if (formValues.crop_type === "High Value Crops") {
          productionData = {
            crop: formValues.high_value_crop,
            month: formValues.month_value,
            quantity: formValues.quantity,
          };
        } else {
          productionData = {
            crop: formValues.crop_value,
            month: formValues.month_value || "",
            quantity: formValues.quantity,
          };
        }

        const cropEntry = {
          crop_type: formValues.crop_type,
          variety_clone: formValues.variety_clone || "",
          area_hectare: formValues.area_hectare
            ? Number.parseFloat(formValues.area_hectare)
            : 0,
          production_type: formValues.production_type || "seasonal",
          production_data: JSON.stringify(productionData),
        };

        const cropData = {
          crops: [cropEntry],
        };

        await farmerAPI.updateCrop(farmerId, currentCrop.crop_id, cropData);
        alert("Crop updated successfully.");
      } else {
        // Add new crop
        let productionData = {};

        if (formValues.crop_type === "High Value Crops") {
          productionData = {
            crop: formValues.high_value_crop,
            month: formValues.month_value,
            quantity: formValues.quantity,
          };
        } else {
          productionData = {
            crop: formValues.crop_value,
            month: formValues.month_value || "",
            quantity: formValues.quantity,
          };
        }

        const cropEntry = {
          crop_type: formValues.crop_type,
          variety_clone:
            formValues.crop_type === "High Value Crops"
              ? formValues.variety_clone || ""
              : "",
          area_hectare: formValues.area_hectare
            ? Number.parseFloat(formValues.area_hectare)
            : 0,
          production_type: formValues.production_type || "seasonal",
          production_data: JSON.stringify(productionData),
        };

        const cropsData = {
          crops: [cropEntry],
        };

        await farmerAPI.addCrops(farmerId, cropsData);
        alert("Crop added successfully.");
      }

      // Refresh crop data
      await fetchCropData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setCropModalLoading(false);
      setIsCropModalVisible(false);
      setFormValues({
        crop_type: "",
        variety_clone: "",
        area_hectare: "",
        production_type: "seasonal",
        crop_value: "",
        month_value: "",
        quantity: "",
        high_value_crop: "",
      });
      setSelectedCropType(null);
    } catch (error) {
      console.error("Error submitting crop form:", error);
      alert(
        `Failed to ${isEditingCrop ? "update" : "add"} crop. ${error.message}`
      );
      setCropModalLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!confirm("Delete this crop entry? This action cannot be undone.")) {
      return;
    }

    try {
      await farmerAPI.deleteCrop(farmerId, cropId);
      alert("Crop entry deleted successfully.");

      // Refresh crop data
      await fetchCropData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      alert(`Failed to delete crop entry. ${error.message}`);
    }
  };

  const regularCropColumns = [
    {
      title: "Crop Type",
      dataIndex: "crop_type",
      key: "crop_type",
    },
    {
      title: "Crop",
      key: "crop",
      render: (_, record) => record.crop_value,
    },
    {
      title: "Area (Hectare)",
      dataIndex: "area_hectare",
      key: "area_hectare",
    },
    {
      title: "Cropping Intensity",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => showEditCropModal(record)}
            className="text-yellow-500 hover:text-yellow-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteCrop(record.crop_id)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const highValueCropColumns = [
    {
      title: "Crop",
      key: "crop",
      render: (_, record) => record.crop_value,
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
      title: "Cropping Intensity",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Month",
      key: "month",
      render: (_, record) => record.month_value,
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => showEditCropModal(record)}
            className="text-yellow-500 hover:text-yellow-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteCrop(record.crop_id)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const hasCrops = crops && crops.length > 0;
  const hasHighValueCrops = highValueCrops && highValueCrops.length > 0;

  return (
    <>
      <div className="mt-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2 text-green-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-base font-medium">Crop Information</span>
          </div>
          <div className="flex space-x-2">
            {activeTab === "crops" && (
              <button
                onClick={() => showAddCropModal("crops")}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Crop
              </button>
            )}
            {activeTab === "highValueCrops" && (
              <button
                onClick={() => showAddCropModal("highValueCrops")}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add High Value Crop
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "crops"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("crops")}
          >
            Regular Crops
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "highValueCrops"
                ? "text-emerald-700 border-b-2 border-emerald-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("highValueCrops")}
          >
            High Value Crops
          </button>
        </div>

        {cropLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
            <span className="ml-2">Loading crop records...</span>
          </div>
        ) : activeTab === "crops" ? (
          // Regular Crops Tab
          hasCrops ? (
            <div className="px-3 overflow-x-auto sm:px-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {regularCropColumns.slice(0, -1).map((column) => (
                      <th
                        key={column.key || column.dataIndex}
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        {column.title}
                      </th>
                    ))}
                    <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crops.map((record, index) => (
                    <tr
                      key={record.crop_id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {regularCropColumns.slice(0, -1).map((column) => (
                        <td
                          key={`${record.crop_id || index}-${
                            column.key || column.dataIndex
                          }`}
                          className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                        >
                          {column.render
                            ? column.render(null, record)
                            : record[column.dataIndex]}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        {regularCropColumns[
                          regularCropColumns.length - 1
                        ].render(null, record)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mb-2 text-gray-300"
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
              <p>No regular crop information available</p>
            </div>
          )
        ) : // High Value Crops Tab
        hasHighValueCrops ? (
          <div className="px-3 overflow-x-auto sm:px-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {highValueCropColumns.slice(0, -1).map((column) => (
                    <th
                      key={column.key || column.dataIndex}
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highValueCrops.map((record, index) => (
                  <tr
                    key={record.crop_id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {highValueCropColumns.slice(0, -1).map((column) => (
                      <td
                        key={`${record.crop_id || index}-${
                          column.key || column.dataIndex
                        }`}
                        className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                      >
                        {column.render
                          ? column.render(null, record)
                          : record[column.dataIndex]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      {highValueCropColumns[
                        highValueCropColumns.length - 1
                      ].render(null, record)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-2 text-gray-300"
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
            <p>No high value crop information available</p>
          </div>
        )}
      </div>

      {/* Add/Edit Crop Modal */}
      {isCropModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{modalTitle}</h3>
              <button
                onClick={handleCropModalCancel}
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

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
                {selectedCropType !== "High Value Crops" && (
                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Crop <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="crop_type"
                      value={formValues.crop_type}
                      onChange={(e) =>
                        handleSelectChange("crop_type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                      disabled={isEditingCrop}
                    >
                      <option value="">Select Crop Type</option>
                      <option value="Spices">Spices</option>
                      <option value="Legumes">Legumes</option>
                      <option value="Vegetable">Vegetable</option>
                      <option value="Banana">Banana</option>
                    </select>
                  </div>
                )}

                {/* Common fields for all crop types */}
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Area (Hectare) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="area_hectare"
                    value={formValues.area_hectare}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter area in hectares"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cropping Intensity <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="production_type"
                    value={formValues.production_type}
                    onChange={(e) =>
                      handleSelectChange("production_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="year_round">Year Round</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="annually">Annually</option>
                    <option value="twice_a_month">Twice a Month</option>
                  </select>
                </div>

                {/* High Value Crops specific fields */}
                {selectedCropType === "High Value Crops" && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Variety/Clone
                      </label>
                      <input
                        type="text"
                        name="variety_clone"
                        value={formValues.variety_clone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter variety or clone"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Crop <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="high_value_crop"
                        value={formValues.high_value_crop}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select Crop</option>
                        {highValueCropOptions.map((crop) => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="month_value"
                        value={formValues.month_value}
                        onChange={(e) =>
                          handleSelectChange("month_value", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select month</option>
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
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formValues.quantity}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter quantity"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Fields for other crop types */}
                {selectedCropType &&
                  selectedCropType !== "High Value Crops" && (
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Crop <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="crop_value"
                        value={formValues.crop_value}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select Crop</option>
                        {getCropOptions(selectedCropType).map((crop) => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                {selectedCropType &&
                  selectedCropType !== "High Value Crops" && (
                    <>
                      <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Month <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="month_value"
                          value={formValues.month_value}
                          onChange={(e) =>
                            handleSelectChange("month_value", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="">Select month</option>
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
                      <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formValues.quantity}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter quantity"
                          required
                        />
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handleCropModalCancel}
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCropModalSubmit}
                disabled={cropModalLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {cropModalLoading && (
                  <svg
                    className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isEditingCrop ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CropsTab;
