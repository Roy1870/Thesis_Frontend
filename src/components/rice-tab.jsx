"use client";

import { useState, useEffect, useCallback } from "react";
import { farmerAPI } from "./services/api";

const RiceTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [rice, setRice] = useState([]);
  const [isRiceModalVisible, setIsRiceModalVisible] = useState(false);
  const [isEditingRice, setIsEditingRice] = useState(false);
  const [currentRice, setCurrentRice] = useState(null);
  const [riceModalLoading, setRiceModalLoading] = useState(false);
  const [riceLoading, setRiceLoading] = useState(true);
  const [modalTitle, setModalTitle] = useState("Add New Rice");

  // Form state
  const [formValues, setFormValues] = useState({
    area_type: "",
    seed_type: "",
    area_harvested: "",
    production: "",
    ave_yield: "",
  });

  const fetchRiceData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (rice.length === 0) {
        setRiceLoading(true);
      }

      // Get farmer data which includes rice
      const response = await farmerAPI.getFarmerById(farmerId);

      setRice(response.rice || []);
      setRiceLoading(false);
    } catch (err) {
      console.error("Error fetching rice data:", err);
      setRiceLoading(false);
    }
  }, [farmerId, rice.length]);

  useEffect(() => {
    if (farmerId) {
      fetchRiceData();
    }
  }, [farmerId, fetchRiceData]);

  // Rice Modal Functions
  const showAddRiceModal = () => {
    setIsEditingRice(false);
    setCurrentRice(null);
    setModalTitle("Add New Rice");
    setFormValues({
      area_type: "",
      seed_type: "",
      area_harvested: "",
      production: "",
      ave_yield: "",
    });
    setIsRiceModalVisible(true);
  };

  const showEditRiceModal = (rice) => {
    setIsEditingRice(true);
    setCurrentRice(rice);
    setModalTitle(`Edit Rice (${rice.area_type} - ${rice.seed_type})`);

    setFormValues({
      area_type: rice.area_type,
      seed_type: rice.seed_type,
      area_harvested: rice.area_harvested,
      production: rice.production,
      ave_yield: rice.ave_yield,
    });

    setIsRiceModalVisible(true);
  };

  const handleRiceModalCancel = () => {
    setIsRiceModalVisible(false);
    setFormValues({
      area_type: "",
      seed_type: "",
      area_harvested: "",
      production: "",
      ave_yield: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleRiceModalSubmit = async () => {
    // Basic validation
    if (
      !formValues.area_type ||
      !formValues.seed_type ||
      !formValues.area_harvested ||
      !formValues.production ||
      !formValues.ave_yield
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setRiceModalLoading(true);

      if (isEditingRice && currentRice) {
        // For updates, use the updateRice endpoint with the exact format required
        const riceData = {
          rice: [
            {
              area_type: formValues.area_type,
              seed_type: formValues.seed_type,
              area_harvested: formValues.area_harvested,
              production: formValues.production,
              ave_yield: formValues.ave_yield,
            },
          ],
        };

        console.log("Updating rice data:", JSON.stringify(riceData, null, 2));
        await farmerAPI.updateRice(farmerId, currentRice.rice_id, riceData);
        alert("Rice data updated successfully.");
      } else {
        // For new entries, use the same format
        const riceData = {
          rice: [
            {
              area_type: formValues.area_type,
              seed_type: formValues.seed_type,
              area_harvested: formValues.area_harvested,
              production: formValues.production,
              ave_yield: formValues.ave_yield,
            },
          ],
        };

        console.log("Creating rice data:", JSON.stringify(riceData, null, 2));
        await farmerAPI.addRice(farmerId, riceData);
        alert("Rice data added successfully.");
      }

      // Refresh rice data
      await fetchRiceData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setRiceModalLoading(false);
      setIsRiceModalVisible(false);
      setFormValues({
        area_type: "",
        seed_type: "",
        area_harvested: "",
        production: "",
        ave_yield: "",
      });
    } catch (error) {
      console.error("Error submitting rice form:", error);
      alert(
        `Failed to ${isEditingRice ? "update" : "add"} rice data. ${
          error.message
        }`
      );
      setRiceModalLoading(false);
    }
  };

  const handleDeleteRice = async (riceId) => {
    if (!confirm("Delete this rice entry? This action cannot be undone.")) {
      return;
    }

    try {
      await farmerAPI.deleteRice(farmerId, riceId);
      alert("Rice entry deleted successfully.");

      // Refresh rice data
      await fetchRiceData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      alert(`Failed to delete rice entry. ${error.message}`);
    }
  };

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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => showEditRiceModal(record)}
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
            onClick={() => handleDeleteRice(record.rice_id)}
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

  const hasRice = rice && rice.length > 0;

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
              Rice Information
            </span>
          </div>
          <button
            onClick={() => showAddRiceModal("rice")}
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
            Add Rice
          </button>
        </div>

        {riceLoading ? (
          <div className="flex justify-center py-8 sm:py-10">
            <div className="w-6 h-6 border-t-2 border-b-2 border-green-500 rounded-full sm:w-8 sm:h-8 animate-spin"></div>
            <span className="ml-2 text-xs sm:text-sm">
              Loading rice records...
            </span>
          </div>
        ) : hasRice ? (
          <div className="px-3 overflow-x-auto sm:px-4">
            <table className="min-w-full text-xs divide-y divide-gray-200 sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {riceColumns.slice(0, -1).map((column) => (
                    <th
                      key={column.key || column.dataIndex}
                      className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3"
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
                {rice.map((record, index) => (
                  <tr
                    key={record.rice_id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {riceColumns.slice(0, -1).map((column) => (
                      <td
                        key={`${record.rice_id || index}-${
                          column.key || column.dataIndex
                        }`}
                        className="px-2 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap"
                      >
                        {record[column.dataIndex]}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-xs font-medium text-right sm:px-6 sm:py-4 sm:text-sm whitespace-nowrap">
                      {riceColumns[riceColumns.length - 1].render(null, record)}
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
            <p className="text-xs sm:text-sm">No rice information available</p>
          </div>
        )}
      </div>

      {/* Add Rice Modal */}
      {isRiceModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b sm:p-4">
              <h3 className="text-base font-medium sm:text-lg">{modalTitle}</h3>
              <button
                onClick={handleRiceModalCancel}
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

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Area Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="area_type"
                    value={formValues.area_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Area Type</option>
                    <option value="Irrigated">Irrigated</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Seed Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="seed_type"
                    value={formValues.seed_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Seed Type</option>
                    <option value="Hybrid Seeds">Hybrid Seeds</option>
                    <option value="Certified Seeds">Certified Seeds</option>
                    <option value="Good Seeds">Good Seeds</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Area Harvested <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="area_harvested"
                    value={formValues.area_harvested}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter area harvested"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Production <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="production"
                    value={formValues.production}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter production"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Average Yield <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="ave_yield"
                    value={formValues.ave_yield}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter average yield"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end p-3 border-t sm:p-4">
              <button
                onClick={handleRiceModalCancel}
                className="px-3 py-1 mr-2 text-xs font-medium text-gray-800 bg-gray-100 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRiceModalSubmit}
                disabled={riceModalLoading}
                className="flex items-center px-3 py-1 text-xs font-medium text-white bg-[#5A8C79] rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-green-700"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {riceModalLoading && (
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
                {isEditingRice ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RiceTab;
