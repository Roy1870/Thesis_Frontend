"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Save, User, Home, Info, MapPin, Loader } from "lucide-react";
import { farmerAPI } from "../services/api";
import { livestockAPI } from "../services/api";
import { operatorAPI } from "../services/api";
import OperatorTab from "./operator-tab";
import LivestockTab from "./livestock-tab";
import RiceTab from "./rice-tab";
import CropsTab from "./crops-tab";
// Add this at the top of the file, after the imports
import { prefetchRouteData, prefetchFarmerDetails } from "../services/api";

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
    rsbsa_id: "", // Add this line
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
  const [showMap, setShowMap] = useState(false);
  const [mapRef, setMapRef] = useState(useRef(null));
  const [markerRef, setMarkerRef] = useState(useRef(null));
  const [mapInstanceRef, setMapInstanceRef] = useState(useRef(null));

  // Function to trigger a refresh of all data
  const refreshAllData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Fetch the farmer data
  const fetchFarmerDetails = useCallback(async () => {
    try {
      setFetchLoading(true);

      // Use the farmer data passed from inventory instead of fetching it again
      let response = farmer;

      // If we have a complete farmer object with all details, use it directly
      if (!farmer.crops && farmer.farmer_id) {
        // Only fetch if we don't have complete data
        response = await farmerAPI.getFarmerById(farmer.farmer_id);
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
        rsbsa_id: response.rsbsa_id || "", // Add this line
      });

      setFetchLoading(false);
    } catch (err) {
      console.error("Error fetching farmer details:", err);
      setError(`Failed to fetch farmer details: ${err.message}`);
      setFetchLoading(false);
    }
  }, [farmer]);

  const fetchLivestockRecords = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (livestockRecords.length === 0) {
        setLivestockLoading(true);
      }

      // Check if livestock data is already available in the farmer object
      if (farmer.livestockRecords && farmer.livestockRecords.length > 0) {
        setLivestockRecords(farmer.livestockRecords);
        setLivestockLoading(false);
        return;
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
  }, [farmer, livestockRecords.length]);

  const fetchOperatorData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (operatorData.length === 0) {
        setOperatorLoading(true);
      }

      // Check if operator data is already available in the farmer object
      if (farmer.operatorData && farmer.operatorData.length > 0) {
        setOperatorData(farmer.operatorData);
        setOperatorLoading(false);
        return;
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
  }, [farmer, operatorData.length]);

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

  // Enhanced prefetching for EditFarmer component
  useEffect(() => {
    // When editing a farmer, prefetch data for the inventory page for when they go back
    prefetchRouteData("/inventory");

    // Also prefetch data for ViewFarmer in case they want to view instead of edit
    if (farmer && farmer.farmer_id) {
      // Prefetch related farmers that might be viewed next
      setTimeout(async () => {
        try {
          // Get a list of farmers to find related ones
          const farmersResponse = await farmerAPI.getAllFarmers(1, 10, "", [
            "farmer_id",
            "name",
            "barangay",
          ]);
          const farmers = Array.isArray(farmersResponse)
            ? farmersResponse
            : farmersResponse.data || [];

          // Find the current farmer's index
          const currentIndex = farmers.findIndex(
            (f) => f.farmer_id === farmer.farmer_id
          );

          if (currentIndex !== -1) {
            // Prefetch the next farmer if available (user might navigate to next)
            if (currentIndex < farmers.length - 1) {
              const nextFarmer = farmers[currentIndex + 1];

              prefetchFarmerDetails(nextFarmer.farmer_id);
            }

            // Prefetch the previous farmer if available (user might navigate to previous)
            if (currentIndex > 0) {
              const prevFarmer = farmers[currentIndex - 1];

              prefetchFarmerDetails(prevFarmer.farmer_id);
            }
          }
        } catch (err) {
          console.error("Error prefetching related farmers:", err);
        }
      }, 2000); // Delay to ensure main data is loaded first
    }
  }, [farmer]);

  // Initialize map when component mounts and showMap is true
  useEffect(() => {
    if (showMap && typeof window !== "undefined") {
      // Dynamically import Leaflet only on client side
      const loadLeaflet = async () => {
        // Only load if not already loaded
        if (!window.L) {
          // Add Leaflet CSS
          const linkEl = document.createElement("link");
          linkEl.rel = "stylesheet";
          linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          linkEl.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          linkEl.crossOrigin = "";
          document.head.appendChild(linkEl);

          // Wait for CSS to load
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Add Leaflet JS
          const scriptEl = document.createElement("script");
          scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          scriptEl.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
          scriptEl.crossOrigin = "";
          document.body.appendChild(scriptEl);

          // Wait for script to load
          await new Promise((resolve) => {
            scriptEl.onload = resolve;
          });
        }

        initializeMap();
      };

      loadLeaflet();
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (
      markerRef.current &&
      formData.farm_location_latitude &&
      formData.farm_location_longitude
    ) {
      const lat = Number.parseFloat(formData.farm_location_latitude);
      const lng = Number.parseFloat(formData.farm_location_longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView(
          [lat, lng],
          mapInstanceRef.current.getZoom()
        );
      }
    }
  }, [formData.farm_location_latitude, formData.farm_location_longitude]);

  // Add a tab change handler that prefetches data for the selected tab
  const handleTabChange = useCallback(
    (newTab) => {
      setActiveTab(newTab);

      // Prefetch data specific to the selected tab
      switch (newTab) {
        case "crops":
          // Prefetch any additional crops data if needed
          if (farmerData && farmerData.farmer_id) {
            // This will use the cached data if available
            farmerAPI.getFarmerById(farmerData.farmer_id);
          }
          break;
        case "livestock":
          // Prefetch livestock data

          fetchLivestockRecords();
          break;
        case "operator":
          // Prefetch operator data

          fetchOperatorData();
          break;
        default:
          break;
      }
    },
    [farmerData, fetchLivestockRecords, fetchOperatorData]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default coordinates for Philippines (can be adjusted to your specific region)
    const defaultLat = formData.farm_location_latitude
      ? Number.parseFloat(formData.farm_location_latitude)
      : 8.9456;
    const defaultLng = formData.farm_location_longitude
      ? Number.parseFloat(formData.farm_location_longitude)
      : 125.5456;

    // Initialize map
    const L = window.L;
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker
    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(map);

    // Handle marker drag events
    marker.on("dragend", (e) => {
      const position = marker.getLatLng();
      setFormData({
        ...formData,
        farm_location_latitude: position.lat.toFixed(6),
        farm_location_longitude: position.lng.toFixed(6),
      });
    });

    // Handle map click events
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setFormData({
        ...formData,
        farm_location_latitude: e.latlng.lat.toFixed(6),
        farm_location_longitude: e.latlng.lng.toFixed(6),
      });
    });

    // Store references
    setMarkerRef(marker);
    setMapInstanceRef(map);

    // Fix map display issue by triggering a resize after a short delay
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setFormData({
            ...formData,
            farm_location_latitude: latitude.toFixed(6),
            farm_location_longitude: longitude.toFixed(6),
          });

          // Update map view and marker if map is initialized
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapInstanceRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to retrieve your location. Please check your device settings."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await farmerAPI.updateFarmer(farmer.farmer_id, formData);
      alert("Farmer updated successfully.");
      refreshAllData(); // Refresh data after update
      setLoading(false);

      // After successful update, prefetch inventory data for when they go back
      prefetchRouteData("/inventory");
    } catch (error) {
      alert(`Failed to update farmer. ${error.message}`);
      setLoading(false);
    }
  };

  if (fetchLoading || livestockLoading || operatorLoading) {
    return (
      <div className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-24 h-8 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Form skeleton */}
        <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-3 bg-white rounded-lg shadow sm:p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 mr-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mb-4">
                  <div className="w-24 h-4 mb-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white rounded-lg shadow sm:p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 mr-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4">
                  <div className="w-24 h-4 mb-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
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

  // Calculate counts with fallbacks for when data doesn't exist
  const cropsCount = farmerData?.crops?.length || 0;
  const riceCount = farmerData?.rice?.length || 0;
  const livestockCount = livestockRecords?.length || 0;
  const operatorCount = operatorData?.length || 0;

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

        .map-container {
          height: 300px;
          width: 100%;
          border-radius: 0.375rem;
          position: relative;
        }

        .map-coordinates {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.8);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
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

        {/* Navigation buttons - Always show all tabs */}
        <div className="flex gap-2 px-1 pb-2 mb-2 -mx-1 overflow-x-auto flex-nowrap sm:gap-4 hide-scrollbar sm:mx-0 sm:px-0">
          <button
            onClick={() => handleTabChange("info")}
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

          <button
            onClick={() => handleTabChange("crops")}
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
              {cropsCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("rice")}
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
              {riceCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("livestock")}
            className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "livestock"
                ? "bg-[#5A8C79] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: activeTab === "livestock" ? colors.primary : "",
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
              {livestockCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("operator")}
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
              {operatorCount}
            </span>
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
                    RSBSA ID
                  </label>
                  <input
                    type="text"
                    name="rsbsa_id"
                    value={formData.rsbsa_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm sm:text-base"
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center px-2 py-1 text-xs text-white rounded bg-emerald-600 hover:bg-emerald-700"
                        >
                          {showMap ? "Hide Map" : "Show Map"}
                        </button>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="flex items-center px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Get Current Location
                        </button>
                      </div>
                    </div>

                    {showMap && (
                      <div className="p-2 mb-4 border border-gray-300 rounded-md">
                        <p className="mb-2 text-xs text-gray-600">
                          Click on the map to set the farm location coordinates
                        </p>
                        <div className="relative map-container">
                          <div ref={mapRef} className="w-full h-full"></div>
                          {formData.farm_location_latitude &&
                            formData.farm_location_longitude && (
                              <div className="map-coordinates">
                                Lat: {formData.farm_location_latitude}, Lng:{" "}
                                {formData.farm_location_longitude}
                              </div>
                            )}
                        </div>
                      </div>
                    )}

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
