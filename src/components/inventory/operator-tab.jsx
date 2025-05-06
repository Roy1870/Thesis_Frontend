"use client";

import { useState, useEffect, useRef } from "react";
import { operatorAPI } from "../services/api";
import LocationMap from "../add-data/location-map";

const OperatorTab = ({ farmerId, farmerData, colors, onDataChange }) => {
  const [operatorData, setOperatorData] = useState([]);
  const [isOperatorModalVisible, setIsOperatorModalVisible] = useState(false);
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [operatorModalLoading, setOperatorModalLoading] = useState(false);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [viewingRemarks, setViewingRemarks] = useState(null);
  const [showOperatorMap, setShowOperatorMap] = useState(false);
  const operatorMapRef = useRef(null);
  const operatorMarkerRef = useRef(null);
  const operatorMapInstanceRef = useRef(null);

  // Form state
  const [formValues, setFormValues] = useState({
    fishpond_location: "",
    cultured_species: "",
    productive_area_sqm: "",
    stocking_density: "",
    date_of_stocking: "",
    production_kg: "",
    date_of_harvest: "",
    remarks: "",
    operator_location_longitude: "",
    operator_location_latitude: "",
  });

  // Function to handle CORS issues when making API requests
  const fetchWithCorsProxy = async (url, options = {}) => {
    try {
      // Try direct fetch first (many modern browsers allow this now)
      try {
        const directResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "User-Agent": "Agricultural Inventory App",
          },
        });

        if (directResponse.ok) {
          return directResponse;
        }
      } catch (directError) {
        console.log("Direct fetch failed, trying alternatives...");
      }

      // Try multiple CORS proxies in sequence
      const corsProxies = [
        "https://corsproxy.io/?",
        "https://api.allorigins.win/raw?url=",
        "https://cors-anywhere.herokuapp.com/",
      ];

      let lastError = null;

      for (const proxy of corsProxies) {
        try {
          const response = await fetch(proxy + url, {
            ...options,
            headers: {
              ...options.headers,
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          if (response.ok) {
            return response;
          }
        } catch (error) {
          lastError = error;
          console.log(`Proxy ${proxy} failed, trying next...`);
        }
      }

      throw lastError || new Error("All proxies failed");
    } catch (error) {
      console.error("Error fetching with CORS proxies:", error);
      throw error;
    }
  };

  // Fix the fetchLocationName function to preserve all form values
  const fetchLocationName = async (
    latitude,
    longitude,
    locationField = "fishpond_location"
  ) => {
    try {
      // Try OpenStreetMap's Nominatim API first
      try {
        const response = await fetchWithCorsProxy(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Agricultural Inventory App",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Extract relevant location information
          let locationName = "";

          if (data.display_name) {
            const addressParts = [];

            if (data.address) {
              if (data.address.water) addressParts.push(data.address.water);
              if (data.address.hamlet) addressParts.push(data.address.hamlet);
              if (data.address.village) addressParts.push(data.address.village);
              if (data.address.town) addressParts.push(data.address.town);
              if (data.address.city) addressParts.push(data.address.city);
              if (data.address.municipality)
                addressParts.push(data.address.municipality);
              if (data.address.county) addressParts.push(data.address.county);
              if (data.address.state) addressParts.push(data.address.state);
            }

            locationName =
              addressParts.length > 0
                ? addressParts.join(", ")
                : data.display_name.split(",").slice(0, 3).join(",");

            setFormValues((prevValues) => ({
              ...prevValues,
              [locationField]: locationName,
            }));
            return;
          }
        }
      } catch (nominatimError) {
        console.error("Nominatim error:", nominatimError);
      }

      // Fallback to BigDataCloud API if Nominatim fails
      try {
        const response = await fetchWithCorsProxy(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          const locationParts = [];
          if (data.locality) locationParts.push(data.locality);
          if (data.city) locationParts.push(data.city);
          if (data.principalSubdivision)
            locationParts.push(data.principalSubdivision);

          const locationName =
            locationParts.length > 0
              ? locationParts.join(", ")
              : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setFormValues((prevValues) => ({
            ...prevValues,
            [locationField]: locationName,
          }));
          return;
        }
      } catch (bigDataCloudError) {
        console.error("BigDataCloud error:", bigDataCloudError);
      }

      // If all APIs fail, use coordinates
      throw new Error("Could not retrieve location name from any service");
    } catch (error) {
      console.error("Error fetching location name:", error);

      // Fallback to coordinates
      setFormValues((prevValues) => ({
        ...prevValues,
        [locationField]: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }));
    }
  };

  // Fix the getOperatorCurrentLocation function to preserve all form values
  const getOperatorCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            setFormValues((prevValues) => ({
              ...prevValues,
              operator_location_latitude: latitude.toFixed(6),
              operator_location_longitude: longitude.toFixed(6),
            }));

            // Update map view and marker if map is initialized
            if (operatorMapInstanceRef.current && operatorMarkerRef.current) {
              operatorMarkerRef.current.setLatLng([latitude, longitude]);
              operatorMapInstanceRef.current.setView([latitude, longitude], 15);
            }

            // Fetch location name based on coordinates
            try {
              await fetchLocationName(latitude, longitude, "fishpond_location");
              resolve();
            } catch (error) {
              console.error("Error fetching location name:", error);
              resolve(); // Still resolve the promise even if location name fetch fails
            }
          },
          (error) => {
            console.error("Error getting location:", error);

            let errorMessage = "Unable to retrieve your location.";

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  " Location permission denied. Please check your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += " Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage += " The request to get location timed out.";
                break;
              default:
                errorMessage += " An unknown error occurred.";
            }

            alert(errorMessage);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        const errorMessage = "Geolocation is not supported by this browser.";
        alert(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  };

  useEffect(() => {
    if (farmerId) {
      // If farmerData already has operator data, use it directly
      if (
        farmerData &&
        farmerData.operatorData &&
        farmerData.operatorData.length > 0
      ) {
        setOperatorData(farmerData.operatorData);
        setOperatorLoading(false);
      } else {
        // Only fetch if we don't have the data
        fetchOperatorData();
      }
    }
  }, [farmerId, farmerData]);

  const fetchOperatorData = async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (operatorData.length === 0) {
        setOperatorLoading(true);
      }

      // Check if operator data is already available in the farmerData object
      if (
        farmerData &&
        farmerData.operatorData &&
        farmerData.operatorData.length > 0
      ) {
        setOperatorData(farmerData.operatorData);
        setOperatorLoading(false);
        return;
      }

      // Get all operators
      const response = await operatorAPI.getAllOperators();

      // Filter records for this farmer
      const operator = response.filter(
        (operator) => operator.farmer_id === farmerId
      );

      setOperatorData(operator);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator records:", err);
      setOperatorLoading(false);
    }
  };

  // Operator Modal Functions
  const showAddOperatorModal = () => {
    setIsEditingOperator(false);
    setCurrentOperator(null);
    setFormValues({
      fishpond_location: "",
      cultured_species: "",
      productive_area_sqm: "",
      stocking_density: "",
      date_of_stocking: "",
      production_kg: "",
      date_of_harvest: "",
      remarks: "",
      operator_location_longitude: "",
      operator_location_latitude: "",
    });
    setIsOperatorModalVisible(true);
  };

  const showEditOperatorModal = (operator) => {
    setIsEditingOperator(true);
    setCurrentOperator(operator);

    setFormValues({
      fishpond_location: operator.fishpond_location || "",
      cultured_species: operator.cultured_species || "",
      productive_area_sqm: operator.productive_area_sqm || "",
      stocking_density: operator.stocking_density || "",
      date_of_stocking: operator.date_of_stocking || "",
      production_kg: operator.production_kg || "",
      date_of_harvest: operator.date_of_harvest || "",
      remarks: operator.remarks || "",
      operator_location_latitude: operator.operator_location_latitude || "",
      operator_location_longitude: operator.operator_location_longitude || "",
    });

    setIsOperatorModalVisible(true);
  };

  const handleOperatorModalCancel = () => {
    setIsOperatorModalVisible(false);
    setFormValues({
      fishpond_location: "",
      cultured_species: "",
      productive_area_sqm: "",
      stocking_density: "",
      date_of_stocking: "",
      production_kg: "",
      date_of_harvest: "",
      remarks: "",
      operator_location_latitude: "",
      operator_location_longitude: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleOperatorModalSubmit = async () => {
    // Basic validation - removed operational_status from required fields
    if (
      !formValues.fishpond_location ||
      !formValues.cultured_species ||
      !formValues.productive_area_sqm ||
      !formValues.stocking_density ||
      !formValues.date_of_stocking ||
      !formValues.production_kg ||
      !formValues.remarks
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setOperatorModalLoading(true);

      // Structure the data with farmer and operator objects
      const FarmersData = {
        farmer_id: farmerData.farmer_id,
        name: farmerData.name,
        contact_number: farmerData.contact_number || "",
        facebook_email: farmerData.facebook_email || "",
        home_address: farmerData.home_address || "",
        barangay: farmerData.barangay || "",
        operators: [
          {
            fishpond_location: formValues.fishpond_location,
            cultured_species: formValues.cultured_species,
            productive_area_sqm: formValues.productive_area_sqm,
            stocking_density: formValues.stocking_density,
            date_of_stocking: formValues.date_of_stocking,
            production_kg: formValues.production_kg,
            date_of_harvest: formValues.date_of_harvest,
            remarks: formValues.remarks,
            operator_location_longitude:
              formValues.operator_location_longitude || "",
            operator_location_latitude:
              formValues.operator_location_latitude || "",
          },
        ],
      };

      if (isEditingOperator && currentOperator) {
        // Update existing operator
        await operatorAPI.updateOperator(
          currentOperator.farmer_id || currentOperator.id,
          FarmersData
        );
        alert("Operator data updated successfully.");
      } else {
        // Add new operator
        await operatorAPI.addOperator(FarmersData);
        alert("Operator data added successfully.");
      }

      // Refresh operator data
      await fetchOperatorData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }

      setOperatorModalLoading(false);
      setIsOperatorModalVisible(false);
      setFormValues({
        fishpond_location: "",
        cultured_species: "",
        productive_area_sqm: "",
        stocking_density: "",
        date_of_stocking: "",
        production_kg: "",
        date_of_harvest: "",
        remarks: "",
        operator_location_latitude: "",
        operator_location_longitude: "",
      });
    } catch (error) {
      console.error("Error submitting operator form:", error);
      alert(
        `Failed to ${isEditingOperator ? "update" : "add"} operator data. ${
          error.message
        }`
      );
      setOperatorModalLoading(false);
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    if (
      !confirm("Delete this operator record? This action cannot be undone.")
    ) {
      return;
    }

    try {
      await operatorAPI.deleteOperator(operatorId);
      alert("Operator data deleted successfully.");

      // Refresh operator data
      await fetchOperatorData();

      // Notify parent component to refresh data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      alert(`Failed to delete operator data. ${error.message}`);
    }
  };

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
      title: "Remarks",
      dataIndex: "remarks",
      key: "status",
      render: (remarks) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            remarks === "operational"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {remarks === "operational" ? "Operational" : "Non-operational"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => showEditOperatorModal(record)}
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
            onClick={() =>
              handleDeleteOperator(record.operator_id || record.id)
            }
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

  const hasOperator = operatorData && operatorData.length > 0;

  return (
    <>
      <style jsx>{`
        .map-container {
          width: 100%;
          height: 300px;
          border-radius: 0.375rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .map-coordinates {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>
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
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-base font-medium">Operator Information</span>
          </div>
          <button
            onClick={showAddOperatorModal}
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
            Add Operator
          </button>
        </div>

        {operatorLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
            <span className="ml-2">Loading operator records...</span>
          </div>
        ) : hasOperator ? (
          <div className="-mx-3 overflow-x-auto sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {operatorColumns.slice(0, -1).map((column) => (
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
                {operatorData.map((record, index) => (
                  <tr
                    key={
                      record.operator_id ||
                      record.id ||
                      Math.random().toString()
                    }
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {operatorColumns.slice(0, -1).map((column) => (
                      <td
                        key={`${index}-${column.key || column.dataIndex}`}
                        className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                      >
                        {column.render && column.dataIndex
                          ? column.render(record[column.dataIndex], record)
                          : record[column.dataIndex]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      {operatorColumns[operatorColumns.length - 1].render(
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
            <p>No operator information available</p>
          </div>
        )}
      </div>

      {/* Add Operator Modal */}
      {isOperatorModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-medium">
                {isEditingOperator ? "Edit Operator" : "Add New Operator"}
              </h3>
              <button
                onClick={handleOperatorModalCancel}
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

            <div className="p-4 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Fishpond Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fishpond_location"
                  value={formValues.fishpond_location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter fishpond location"
                  required
                />
              </div>

              <LocationMap
                showMap={showOperatorMap}
                formData={formValues}
                setFormData={setFormValues}
                mapRef={operatorMapRef}
                markerRef={operatorMarkerRef}
                mapInstanceRef={operatorMapInstanceRef}
                fetchLocationName={fetchLocationName}
                getCurrentLocation={getOperatorCurrentLocation}
                setShowMap={setShowOperatorMap}
                coordinateField="operator_location"
                locationField="fishpond_location"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Location Longitude
                  </label>
                  <input
                    type="number"
                    name="operator_location_longitude"
                    value={formValues.operator_location_longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter longitude"
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Location Latitude
                  </label>
                  <input
                    type="number"
                    name="operator_location_latitude"
                    value={formValues.operator_location_latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter latitude"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cultured Species <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cultured_species"
                    value={formValues.cultured_species}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Productive Area (sqm){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="productive_area_sqm"
                    value={formValues.productive_area_sqm}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter productive area in square meters"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Stocking Density <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stocking_density"
                    value={formValues.stocking_density}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter stocking density"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Date of Stocking <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_stocking"
                    value={formValues.date_of_stocking}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Production (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="production_kg"
                    value={formValues.production_kg}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter production in kilograms"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Date of Harvest
                  </label>
                  <input
                    type="date"
                    name="date_of_harvest"
                    value={formValues.date_of_harvest}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="remarks"
                    value={formValues.remarks}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="operational">Operational</option>
                    <option value="non-operational">Non-operational</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end p-4 bg-white border-t">
              <button
                onClick={handleOperatorModalCancel}
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleOperatorModalSubmit}
                disabled={operatorModalLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-700 hover:bg-emerald-800"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                }}
              >
                {operatorModalLoading && (
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
                {isEditingOperator ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Remarks Modal - Removed since remarks is now a dropdown */}
    </>
  );
};

export default OperatorTab;
