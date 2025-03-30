"use client";

import { useState, useEffect, useCallback } from "react";
import { farmerAPI } from "./services/api";

const CropsTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [cropDataType, setCropDataType] = useState("Crop");
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  const [isEditingCrop, setIsEditingCrop] = useState(false);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [cropModalLoading, setCropModalLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [cropLoading, setCropLoading] = useState(true);
  const [selectedCropType, setSelectedCropType] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Crop");

  // Form state
  const [formValues, setFormValues] = useState({
    crop_type: "",
    variety_clone: "",
    area_hectare: "",
    production_type: "seasonal",
    crop_value: "",
    month_value: "",
    quantity: "",
  });

  const fetchCropData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (crops.length === 0) {
        setCropLoading(true);
      }

      // Get farmer data which includes crops
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
      }

      setCrops(response.crops || []);
      setCropLoading(false);
    } catch (err) {
      console.error("Error fetching crop data:", err);
      setCropLoading(false);
    }
  }, [farmerId, crops.length]);

  useEffect(() => {
    if (farmerId) {
      fetchCropData();
    }
  }, [farmerId, fetchCropData]);

  // Crop Modal Functions
  const showAddCropModal = () => {
    setIsEditingCrop(false);
    setCurrentCrop(null);
    setSelectedCropType(null);
    setModalTitle("Add New Crop");
    setFormValues({
      crop_type: "",
      variety_clone: "",
      area_hectare: "",
      production_type: "seasonal",
      crop_value: "",
      month_value: "",
      quantity: "",
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
        if (crop.crop_type === "Cacao") {
          cropName = `${crop.variety_clone || "Cacao"} (${
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
    });
    setSelectedCropType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (name === "crop_type") {
      setSelectedCropType(value);
    }
  };

  const handleCropModalSubmit = async () => {
    // Basic validation
    if (
      !formValues.crop_type ||
      !formValues.area_hectare ||
      !formValues.production_type ||
      (selectedCropType === "Cacao" &&
        (!formValues.variety_clone || !formValues.month_value)) ||
      (selectedCropType !== "Cacao" && !formValues.crop_value) ||
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

        if (formValues.crop_type === "Cacao") {
          productionData = {
            month: formValues.month_value,
            quantity: formValues.quantity,
          };
        } else {
          productionData = {
            crop: formValues.crop_value,
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

        console.log("Updating crop data:", JSON.stringify(cropData, null, 2));
        await farmerAPI.updateCrop(farmerId, currentCrop.crop_id, cropData);
        alert("Crop updated successfully.");
      } else {
        // Add new crop
        let productionData = {};

        if (formValues.crop_type === "Cacao") {
          productionData = {
            month: formValues.month_value,
            quantity: formValues.quantity,
          };
        } else {
          productionData = {
            crop: formValues.crop_value,
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

        const cropsData = {
          crops: [cropEntry],
        };

        console.log("Creating crop data:", JSON.stringify(cropsData, null, 2));
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
      title: "Cropping Intensity",
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
          <button
            onClick={showAddCropModal}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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
        </div>

        {cropLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
            <span className="ml-2">Loading crop records...</span>
          </div>
        ) : hasCrops ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {cropColumns.slice(0, -1).map((column) => (
                    <th
                      key={column.key || column.dataIndex}
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
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
                    {cropColumns.slice(0, -1).map((column) => (
                      <td
                        key={`${record.crop_id || index}-${
                          column.key || column.dataIndex
                        }`}
                        className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                      >
                        {column.render && column.key === "crop_or_month"
                          ? column.render(null, record)
                          : record[column.dataIndex]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      {cropColumns[cropColumns.length - 1].render(null, record)}
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
            <p>No crop information available</p>
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      {isCropModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Crop Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="crop_type"
                    value={formValues.crop_type}
                    onChange={(e) =>
                      handleSelectChange("crop_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Crop Type</option>
                    <option value="Spices">Spices</option>
                    <option value="Legumes">Legumes</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Cacao">Cacao</option>
                    <option value="Banana">Banana</option>
                  </select>
                </div>

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

                {/* Variety/Clone field only for Cacao */}
                {selectedCropType === "Cacao" && (
                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Variety/Clone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="variety_clone"
                      value={formValues.variety_clone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter variety or clone"
                      required
                    />
                  </div>
                )}

                {/* Cacao specific fields */}
                {selectedCropType === "Cacao" && (
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
                )}

                {/* Fields for other crop types */}
                {selectedCropType && selectedCropType !== "Cacao" && (
                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Crop <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="crop_value"
                      value={formValues.crop_value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter crop"
                      required
                    />
                  </div>
                )}

                {/* Quantity field for all crop types */}
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
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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
