"use client";

import { useState, useEffect } from "react";
import { livestockAPI } from "./services/api";

const LivestockTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [isLivestockModalVisible, setIsLivestockModalVisible] = useState(false);
  const [isEditingLivestock, setIsEditingLivestock] = useState(false);
  const [currentLivestock, setCurrentLivestock] = useState(null);
  const [livestockModalLoading, setLivestockModalLoading] = useState(false);
  const [livestockLoading, setLivestockLoading] = useState(true);

  // Form state
  const [formValues, setFormValues] = useState({
    animal_type: "",
    subcategory: "",
    quantity: "",
  });

  useEffect(() => {
    if (farmerId) {
      fetchLivestockRecords();
    }
  }, [farmerId]);

  const fetchLivestockRecords = async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (livestockRecords.length === 0) {
        setLivestockLoading(true);
      }

      // Get all livestock records
      const response = await livestockAPI.getAllLivestockRecords();

      // Filter records for this farmer
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmerId
      );

      setLivestockRecords(farmerLivestockRecords);
      setLivestockLoading(false);
    } catch (err) {
      console.error("Error fetching livestock records:", err);
      setLivestockLoading(false);
    }
  };

  // Livestock Modal Functions
  const showAddLivestockModal = () => {
    setIsEditingLivestock(false);
    setCurrentLivestock(null);
    setFormValues({
      animal_type: "",
      subcategory: "",
      quantity: "",
    });
    setIsLivestockModalVisible(true);
  };

  const showEditLivestockModal = (livestock) => {
    setIsEditingLivestock(true);
    setCurrentLivestock(livestock);

    setFormValues({
      animal_type: livestock.animal_type,
      subcategory: livestock.subcategory,
      quantity: livestock.quantity,
    });

    setIsLivestockModalVisible(true);
  };

  const handleLivestockModalCancel = () => {
    setIsLivestockModalVisible(false);
    setFormValues({
      animal_type: "",
      subcategory: "",
      quantity: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleLivestockModalSubmit = async () => {
    // Basic validation
    if (
      !formValues.animal_type ||
      !formValues.subcategory ||
      !formValues.quantity
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLivestockModalLoading(true);
      const currentUser = localStorage.getItem("userName") || "System";

      // Structure the data with livestock records only
      const livestockData = {
        name: farmerData.name,
        contact_number: farmerData.contact_number || "",
        facebook_email: farmerData.facebook_email || "",
        home_address: farmerData.home_address || "",
        barangay: farmerData.barangay || "",
        livestock_records: [
          {
            animal_type: formValues.animal_type,
            subcategory: formValues.subcategory,
            quantity: Number.parseInt(formValues.quantity, 10),
            updated_by: currentUser,
          },
        ],
      };

      if (isEditingLivestock && currentLivestock) {
        // Update existing livestock record
        console.log(
          "Updating livestock record with data:",
          JSON.stringify(livestockData, null, 2)
        );
        await livestockAPI.updateLivestockRecord(
          currentLivestock.record_id,
          livestockData
        );
        alert("Livestock record updated successfully.");
      } else {
        // Add new livestock record with farmer details
        const dataWithFarmerId = {
          farmer_id: farmerId,
          name: farmerData.name,
          contact_number: farmerData.contact_number || "",
          facebook_email: farmerData.facebook_email || "",
          home_address: farmerData.home_address || "",
          barangay: farmerData.barangay || "",
          ...livestockData,
        };
        console.log(
          "Creating livestock record with data:",
          JSON.stringify(dataWithFarmerId, null, 2)
        );
        await livestockAPI.createLivestockRecords(dataWithFarmerId);
        alert("Livestock record added successfully.");
      }

      // Refresh livestock records
      await fetchLivestockRecords();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setLivestockModalLoading(false);
      setIsLivestockModalVisible(false);
      setFormValues({
        animal_type: "",
        subcategory: "",
        quantity: "",
      });
    } catch (error) {
      console.error("Error submitting livestock form:", error);
      alert(
        `Failed to ${isEditingLivestock ? "update" : "add"} livestock record. ${
          error.message
        }`
      );
      setLivestockModalLoading(false);
    }
  };

  const handleDeleteLivestock = async (recordId) => {
    if (
      !confirm("Delete this livestock record? This action cannot be undone.")
    ) {
      return;
    }

    try {
      if (!recordId) {
        console.error("Error: Record ID is undefined");
        alert("Failed to delete livestock record: Record ID is missing");
        return;
      }

      console.log(`Deleting livestock record with ID: ${recordId}`);

      // Use the API function from the provided API service
      await livestockAPI.deleteLivestockRecord(recordId);
      alert("Livestock record deleted successfully.");

      // Refresh livestock records
      await fetchLivestockRecords();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error deleting livestock record:", error);
      alert(`Failed to delete livestock record. ${error.message}`);
    }
  };

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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => showEditLivestockModal(record)}
            className="text-yellow-500 hover:text-yellow-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteLivestock(record.record_id)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
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

  const hasLivestock = livestockRecords.length > 0;

  // Helper function to get subcategories based on animal type
  const getSubcategories = (animalType) => {
    switch (animalType) {
      case "Cattle":
      case "Carabao":
        return [
          { value: "Carabull", label: "Carabull" },
          { value: "Caracow", label: "Caracow" },
        ];
      case "Goat":
      case "Rabbit":
        return [
          { value: "Buck", label: "Buck" },
          { value: "Doe", label: "Doe" },
        ];
      case "Sheep":
        return [
          { value: "Ram", label: "Ram" },
          { value: "Ewe", label: "Ewe" },
        ];
      case "Swine":
        return [
          { value: "Sow", label: "Sow" },
          { value: "Piglet", label: "Piglet" },
          { value: "Boar", label: "Boar" },
          { value: "Fatteners", label: "Fatteners" },
        ];
      case "Chicken":
        return [
          { value: "Broiler", label: "Broiler" },
          { value: "Layer", label: "Layer" },
          { value: "Freerange", label: "Freerange" },
          { value: "Gamefowl", label: "Gamefowl" },
          { value: "Fighting Cocks", label: "Fighting Cocks" },
        ];
      case "Duck":
      case "Quail":
      case "Turkey":
        return [
          { value: "Drake", label: "Drake" },
          { value: "Hen", label: "Hen" },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="mt-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b sm:p-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-1 text-green-600 sm:w-5 sm:h-5 sm:mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium sm:text-base">
              Livestock Records
            </span>
          </div>
          <button
            onClick={showAddLivestockModal}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-md sm:px-3 sm:py-1 sm:text-sm hover:bg-green-700"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 mr-1 sm:w-4 sm:h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Livestock
          </button>
        </div>

        {livestockLoading ? (
          <div className="flex justify-center py-8 sm:py-10">
            <div className="w-6 h-6 border-t-2 border-b-2 border-green-500 rounded-full sm:w-8 sm:h-8 animate-spin"></div>
            <span className="ml-2 text-xs sm:text-sm">
              Loading livestock records...
            </span>
          </div>
        ) : hasLivestock ? (
          <div className="px-3 overflow-x-auto sm:px-4">
            <table className="min-w-full text-xs divide-y divide-gray-200 sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {livestockColumns.slice(0, -1).map((column) => (
                    <th
                      key={column.key || column.dataIndex}
                      className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase sm:px-6 sm:py-3">
                    Actions
                  </th>
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
                    {livestockColumns.slice(0, -1).map((column) => (
                      <td
                        key={`${index}-${column.key || column.dataIndex}`}
                        className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                      >
                        {record[column.dataIndex]}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-xs font-medium text-right sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                      {livestockColumns[livestockColumns.length - 1].render(
                        null,
                        record
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 sm:py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mb-2 text-gray-300 sm:w-12 sm:h-12"
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
            <p className="text-xs sm:text-sm">No livestock records available</p>
          </div>
        )}
      </div>

      {/* Add Livestock Modal */}
      {isLivestockModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-white border-b sm:p-4">
              <h3 className="text-base font-medium sm:text-lg">
                {isEditingLivestock ? "Edit Livestock" : "Add New Livestock"}
              </h3>
              <button
                onClick={handleLivestockModalCancel}
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

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Animal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="animal_type"
                    value={formValues.animal_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Animal Type</option>
                    <option value="Cattle">Cattle</option>
                    <option value="Carabao">Carabao</option>
                    <option value="Goat">Goat</option>
                    <option value="Sheep">Sheep</option>
                    <option value="Swine">Swine</option>
                    <option value="Chicken">Chicken</option>
                    <option value="Duck">Duck</option>
                    <option value="Quail">Quail</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Rabbit">Rabbit</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subcategory"
                    value={formValues.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                    disabled={!formValues.animal_type}
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategories(formValues.animal_type).map(
                      (subcategory) => (
                        <option
                          key={subcategory.value}
                          value={subcategory.value}
                        >
                          {subcategory.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formValues.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end p-3 bg-white border-t sm:p-4">
              <button
                onClick={handleLivestockModalCancel}
                className="px-3 py-1 mr-2 text-xs font-medium text-gray-800 bg-gray-100 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLivestockModalSubmit}
                disabled={livestockModalLoading}
                className="flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {livestockModalLoading && (
                  <svg
                    className="w-3 h-3 mr-1 -ml-1 text-white sm:w-4 sm:h-4 sm:mr-2 animate-spin"
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
                {isEditingLivestock ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LivestockTab;
