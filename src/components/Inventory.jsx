"use client";

import { useState, useEffect } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  HomeIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Wheat,
  Sprout,
  Users,
  Loader2,
  Coffee,
} from "lucide-react";
import Highlighter from "react-highlight-words";
import EditFarmer from "./EditFarmer";
import ViewFarmer from "./ViewFarmer";

// Custom MilkIcon component since it's not in lucide-react
const MilkIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 2h8" />
    <path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2" />
    <path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
  </svg>
);

const Inventory = () => {
  // Data type selection
  const [selectedDataType, setSelectedDataType] = useState("farmers");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Data states
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState(""); // For debounced search
  const [searchedColumn, setSearchedColumn] = useState("");
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // View/Edit states
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Data type options
  const dataTypes = [
    {
      id: "farmers",
      label: "Farmers",
      icon: <UserIcon className="w-4 h-4 mr-2" />,
    },
    { id: "crops", label: "Crops", icon: <Wheat className="w-4 h-4 mr-2" /> },
    { id: "rice", label: "Rice", icon: <Sprout className="w-4 h-4 mr-2" /> },
    {
      id: "livestock",
      label: "Livestock",
      icon: <MilkIcon className="w-4 h-4 mr-2" />,
    },
    {
      id: "operators",
      label: "Operators",
      icon: <Users className="w-4 h-4 mr-2" />,
    },
    {
      id: "highValueCrops",
      label: "High Value Crops",
      icon: <Coffee className="w-4 h-4 mr-2" />,
    },
  ];

  // Debounce search text to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []); // Empty dependency array for initial load only

  // Reset page when data type changes
  useEffect(() => {
    // Clear data first before fetching new data
    setCurrentPage(1);
    setSearchText("");
    setDebouncedSearchText("");
    setData([]); // Clear current data immediately
    setAllData([]); // Clear all data immediately
    setTotalRecords(0); // Reset total records

    // Then fetch new data
    fetchAllData();
  }, [selectedDataType]);

  // Handle pagination and debounced search
  useEffect(() => {
    if (allData.length > 0) {
      if (debouncedSearchText) {
        // If search is active, do client-side filtering
        filterData();
      } else {
        // Only paginate from already fetched data when not searching
        paginateData();
      }
    } else if (!loading) {
      // If there's no data and we're not loading, make sure the data state is empty
      setData([]);
      setTotalRecords(0);
    }
  }, [currentPage, pageSize, debouncedSearchText, allData.length, loading]);

  // Paginate data function
  const paginateData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = allData.slice(startIndex, startIndex + pageSize);

    setData(paginatedResults);
    setTotalRecords(allData.length);
  };

  // Fetch all data for client-side filtering
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear existing data to prevent mixing
      setData([]);

      let response;
      let processedData = [];

      switch (selectedDataType) {
        case "farmers":
          response = await farmerAPI.getAllFarmers(1, 1000);
          processedData = Array.isArray(response)
            ? response
            : response.data || [];
          break;

        case "crops":
          // First get all farmers
          const farmersResponse = await farmerAPI.getAllFarmers(1, 1000);
          const farmers = Array.isArray(farmersResponse)
            ? farmersResponse
            : farmersResponse.data || [];

          // Extract all crops from farmers
          const allCrops = [];
          for (const farmer of farmers) {
            if (farmer.crops && Array.isArray(farmer.crops)) {
              // Filter out high value crops (they'll be in their own section)
              const regularCrops = farmer.crops.filter(
                (crop) => crop.crop_type !== "High Value Crops"
              );

              // Add farmer info to each crop
              const farmerCrops = regularCrops.map((crop) => {
                // Parse production_data if it exists and is a string
                let productionData = {};
                if (
                  crop.production_data &&
                  typeof crop.production_data === "string"
                ) {
                  try {
                    productionData = JSON.parse(crop.production_data);
                  } catch (e) {
                    console.error("Error parsing production data:", e);
                  }
                }

                return {
                  ...crop,
                  farmer_id: farmer.farmer_id,
                  farmer_name:
                    farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim() ||
                    "Unknown",
                  barangay: farmer.barangay,
                  // Add parsed production data fields
                  crop_value: productionData.crop || crop.crop_value || "",
                  quantity: productionData.quantity || crop.quantity || "",
                };
              });
              allCrops.push(...farmerCrops);
            }
          }

          processedData = allCrops;
          break;

        case "highValueCrops":
          // First get all farmers
          const farmersForHVC = await farmerAPI.getAllFarmers(1, 1000);
          const farmersDataForHVC = Array.isArray(farmersForHVC)
            ? farmersForHVC
            : farmersForHVC.data || [];

          // Extract all high value crops from farmers
          const allHighValueCrops = [];
          for (const farmer of farmersDataForHVC) {
            if (farmer.crops && Array.isArray(farmer.crops)) {
              // Filter only high value crops
              const highValueCrops = farmer.crops.filter(
                (crop) => crop.crop_type === "High Value Crops"
              );

              // Add farmer info to each crop
              const farmerHVCs = highValueCrops.map((crop) => {
                // Parse production_data if it exists and is a string
                let productionData = {};
                if (
                  crop.production_data &&
                  typeof crop.production_data === "string"
                ) {
                  try {
                    productionData = JSON.parse(crop.production_data);
                  } catch (e) {
                    console.error("Error parsing production data:", e);
                  }
                }

                return {
                  ...crop,
                  farmer_id: farmer.farmer_id,
                  farmer_name:
                    farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim() ||
                    "Unknown",
                  barangay: farmer.barangay,
                  // Add parsed production data fields
                  month: productionData.month || "",
                  crop_value: productionData.crop || "",
                  quantity: productionData.quantity || "",
                };
              });
              allHighValueCrops.push(...farmerHVCs);
            }
          }

          processedData = allHighValueCrops;
          break;

        case "rice":
          // First get all farmers
          const farmersForRice = await farmerAPI.getAllFarmers(1, 1000);
          const farmersDataForRice = Array.isArray(farmersForRice)
            ? farmersForRice
            : farmersForRice.data || [];

          // Extract all rice data from farmers
          const allRice = [];
          for (const farmer of farmersDataForRice) {
            if (farmer.rice && Array.isArray(farmer.rice)) {
              // Add farmer info to each rice entry
              const farmerRice = farmer.rice.map((rice) => ({
                ...rice,
                farmer_id: farmer.farmer_id,
                farmer_name:
                  farmer.name ||
                  `${farmer.first_name || ""} ${
                    farmer.last_name || ""
                  }`.trim() ||
                  "Unknown",
                barangay: farmer.barangay,
              }));
              allRice.push(...farmerRice);
            }
          }

          processedData = allRice;
          break;

        case "livestock":
          // Get all livestock records
          const livestockResponse = await livestockAPI.getAllLivestockRecords(
            1,
            1000
          );
          const livestockRecords = Array.isArray(livestockResponse)
            ? livestockResponse
            : livestockResponse.data || [];

          // Get all farmers to add farmer information to livestock records
          const farmersForLivestock = await farmerAPI.getAllFarmers(1, 1000);
          const farmersMap = {};

          // Create a map of farmer_id to farmer data for quick lookup
          const farmersForLivestockData = Array.isArray(farmersForLivestock)
            ? farmersForLivestock
            : farmersForLivestock.data || [];
          farmersForLivestockData.forEach((farmer) => {
            farmersMap[farmer.farmer_id] = farmer;
          });

          // Enrich livestock records with farmer information
          const enrichedLivestockRecords = livestockRecords.map((record) => {
            const farmer = farmersMap[record.farmer_id];
            return {
              ...record,
              farmer_name: farmer
                ? farmer.name ||
                  `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim()
                : "Unknown",
              barangay: farmer ? farmer.barangay : "Unknown",
            };
          });

          processedData = enrichedLivestockRecords;
          break;

        case "operators":
          // Get all operators
          const operatorsResponse = await operatorAPI.getAllOperators(1, 1000);
          const operators = Array.isArray(operatorsResponse)
            ? operatorsResponse
            : operatorsResponse.data || [];

          // Get all farmers to add farmer information to operators
          const farmersForOperators = await farmerAPI.getAllFarmers(1, 1000);
          const farmerOperatorMap = {};

          // Create a map of farmer_id to farmer data for quick lookup
          const farmersForOperatorsData = Array.isArray(farmersForOperators)
            ? farmersForOperators
            : farmersForOperators.data || [];
          farmersForOperatorsData.forEach((farmer) => {
            farmerOperatorMap[farmer.farmer_id] = farmer;
          });

          // Enrich operators with farmer information
          const enrichedOperators = operators.map((operator) => {
            const farmer = farmerOperatorMap[operator.farmer_id];
            return {
              ...operator,
              farmer_name: farmer
                ? farmer.name ||
                  `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim()
                : "Unknown",
              barangay: farmer ? farmer.barangay : "Unknown",
            };
          });

          processedData = enrichedOperators;
          break;

        default:
          processedData = [];
      }

      // Set the new data
      setAllData(processedData);

      // Apply pagination to the fetched data
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedResults = processedData.slice(
        startIndex,
        startIndex + pageSize
      );

      setData(paginatedResults);
      setTotalRecords(processedData.length);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${selectedDataType} data:`, err);
      setError(`Failed to fetch ${selectedDataType} data: ${err.message}`);
      setLoading(false);
      setAllData([]);
      setData([]);
      setTotalRecords(0);
    }
  };

  // Client-side filtering function
  const filterData = () => {
    if (!debouncedSearchText.trim()) {
      paginateData();
      return;
    }

    setLoading(true);
    const searchLower = debouncedSearchText.toLowerCase().trim();
    let filtered = [];

    // Filter based on data type
    switch (selectedDataType) {
      case "farmers":
        filtered = allData.filter(
          (farmer) =>
            (farmer.name && farmer.name.toLowerCase().includes(searchLower)) ||
            (farmer.contact_number &&
              farmer.contact_number.toLowerCase().includes(searchLower)) ||
            (farmer.facebook_email &&
              farmer.facebook_email.toLowerCase().includes(searchLower)) ||
            (farmer.home_address &&
              farmer.home_address.toLowerCase().includes(searchLower)) ||
            (farmer.barangay &&
              farmer.barangay.toLowerCase().includes(searchLower))
        );
        break;

      case "crops":
        filtered = allData.filter(
          (crop) =>
            (crop.crop_type &&
              crop.crop_type.toLowerCase().includes(searchLower)) ||
            (crop.crop_value &&
              crop.crop_value.toLowerCase().includes(searchLower)) ||
            (crop.area_hectare &&
              crop.area_hectare.toString().includes(searchLower)) ||
            (crop.farmer_name &&
              crop.farmer_name.toLowerCase().includes(searchLower)) ||
            (crop.barangay && crop.barangay.toLowerCase().includes(searchLower))
        );
        break;

      case "highValueCrops":
        filtered = allData.filter(
          (crop) =>
            (crop.crop_value &&
              crop.crop_value.toLowerCase().includes(searchLower)) ||
            (crop.month && crop.month.toLowerCase().includes(searchLower)) ||
            (crop.variety_clone &&
              crop.variety_clone.toLowerCase().includes(searchLower)) ||
            (crop.area_hectare &&
              crop.area_hectare.toString().includes(searchLower)) ||
            (crop.farmer_name &&
              crop.farmer_name.toLowerCase().includes(searchLower)) ||
            (crop.barangay && crop.barangay.toLowerCase().includes(searchLower))
        );
        break;

      case "rice":
        filtered = allData.filter(
          (rice) =>
            (rice.area_type &&
              rice.area_type.toLowerCase().includes(searchLower)) ||
            (rice.seed_type &&
              rice.seed_type.toLowerCase().includes(searchLower)) ||
            (rice.area_harvested &&
              rice.area_harvested.toString().includes(searchLower)) ||
            (rice.farmer_name &&
              rice.farmer_name.toLowerCase().includes(searchLower)) ||
            (rice.barangay && rice.barangay.toLowerCase().includes(searchLower))
        );
        break;

      case "livestock":
        filtered = allData.filter(
          (livestock) =>
            (livestock.animal_type &&
              livestock.animal_type.toLowerCase().includes(searchLower)) ||
            (livestock.subcategory &&
              livestock.subcategory.toLowerCase().includes(searchLower)) ||
            (livestock.quantity &&
              livestock.quantity.toString().includes(searchLower)) ||
            (livestock.farmer_name &&
              livestock.farmer_name.toLowerCase().includes(searchLower))
        );
        break;

      case "operators":
        filtered = allData.filter(
          (operator) =>
            (operator.name &&
              operator.name.toLowerCase().includes(searchLower)) ||
            (operator.role &&
              operator.role.toLowerCase().includes(searchLower)) ||
            (operator.contact_number &&
              operator.contact_number.toLowerCase().includes(searchLower)) ||
            (operator.cultured_species &&
              operator.cultured_species.toLowerCase().includes(searchLower)) ||
            (operator.fishpond_location &&
              operator.fishpond_location.toLowerCase().includes(searchLower))
        );
        break;

      default:
        filtered = [];
    }

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);

    setData(paginatedResults);
    setTotalRecords(filtered.length);
    setLoading(false);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setCurrentPage(1);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleDelete = async (id) => {
    try {
      switch (selectedDataType) {
        case "farmers":
          await farmerAPI.deleteFarmer(id);
          break;
        case "crops":
        case "highValueCrops":
          // Need farmer_id and crop_id
          if (currentItem && currentItem.farmer_id) {
            await farmerAPI.deleteCrop(currentItem.farmer_id, id);
          }
          break;
        case "rice":
          // Need farmer_id and rice_id
          if (currentItem && currentItem.farmer_id) {
            await farmerAPI.deleteRice(currentItem.farmer_id, id);
          }
          break;
        case "livestock":
          await livestockAPI.deleteLivestockRecord(id);
          break;
        case "operators":
          await operatorAPI.deleteOperator(id);
          break;
      }

      // Refresh data after deletion
      fetchAllData();
      showToast(
        `${selectedDataType.slice(0, -1)} deleted successfully`,
        "success"
      );
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(`Error deleting ${selectedDataType.slice(0, -1)}:`, err);
      showToast(
        `Failed to delete ${selectedDataType.slice(0, -1)}: ${err.message}`,
        "error"
      );
    }
  };

  const handleView = (record) => {
    setCurrentItem(record);
    setIsViewMode(true);
  };

  const handleEdit = (record) => {
    setCurrentItem(record);
    setIsEditMode(true);
  };

  const handleCloseView = () => {
    setIsViewMode(false);
    setCurrentItem(null);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setCurrentItem(null);
    // Refresh data after editing
    fetchAllData();
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Simple toast notification function
  const showToast = (message, type = "info") => {
    // In a real app, you'd use a toast library or custom component
    alert(message);
  };

  // If in edit mode, show the edit page instead of the inventory list
  if (isEditMode && currentItem) {
    // For now, we only support editing farmers
    if (selectedDataType === "farmers") {
      return (
        <EditFarmer
          farmer={currentItem}
          onClose={handleCloseEdit}
          colors={{}}
        />
      );
    } else {
      // For other data types, just close edit mode
      setIsEditMode(false);
      return null;
    }
  }

  // If in view mode, show a detailed view of the item
  if (isViewMode && currentItem) {
    // For now, we only support viewing farmers
    if (selectedDataType === "farmers") {
      return (
        <ViewFarmer
          farmer={currentItem}
          onClose={handleCloseView}
          colors={{}}
        />
      );
    } else {
      // For other data types, just close view mode
      setIsViewMode(false);
      return null;
    }
  }

  // Render table columns based on selected data type
  const renderTableColumns = () => {
    switch (selectedDataType) {
      case "farmers":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Name
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Contact
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Email
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Address
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      case "crops":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Crop Type
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Crop
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Quantity
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      case "highValueCrops":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Crop
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Variety/Clone
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Month
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      case "rice":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Area Type
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Seed Type
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Production
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      case "livestock":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Animal Type
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Subcategory
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Quantity
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Date Recorded
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      case "operators":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Name
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Location
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Species
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="hidden px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell sm:px-6 sm:py-3">
              Status
            </th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[180px]">
              Actions
            </th>
          </tr>
        );

      default:
        return null;
    }
  };

  // Render table rows based on selected data type
  const renderTableRows = () => {
    if (data.length === 0 && !loading) {
      return (
        <tr>
          <td
            colSpan={6}
            className="px-2 py-2 text-xs text-center text-gray-500 sm:px-6 sm:py-4 sm:text-sm"
          >
            No data found
          </td>
        </tr>
      );
    }

    switch (selectedDataType) {
      case "farmers":
        return data.map((farmer) => (
          <tr
            key={farmer.farmer_id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {searchedColumn === "name" ? (
                    <Highlighter
                      highlightStyle={{
                        backgroundColor: "#ffc069",
                        padding: 0,
                      }}
                      searchWords={[searchText]}
                      autoEscape
                      textToHighlight={
                        farmer.name ? farmer.name.toString() : ""
                      }
                    />
                  ) : (
                    farmer.name
                  )}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">
                  {farmer.contact_number || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <MailIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {farmer.facebook_email || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {farmer.home_address || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {farmer.barangay || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(farmer)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(farmer)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(farmer.farmer_id)}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "crops":
        return data.map((crop) => (
          <tr
            key={crop.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Wheat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {crop.crop_type || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.crop_value || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.area_hectare
                  ? Number.parseFloat(crop.area_hectare).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.quantity || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {crop.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(crop)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(crop)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentItem(crop);
                    setShowDeleteConfirm(crop.id);
                  }}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "highValueCrops":
        return data.map((crop) => (
          <tr
            key={crop.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Coffee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {crop.crop_value || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.variety_clone || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.month || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {crop.area_hectare
                  ? Number.parseFloat(crop.area_hectare).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {crop.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(crop)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(crop)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentItem(crop);
                    setShowDeleteConfirm(crop.id);
                  }}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "rice":
        return data.map((rice) => (
          <tr
            key={rice.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Sprout className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {rice.area_type || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.seed_type || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.area_harvested
                  ? Number.parseFloat(rice.area_harvested).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.production
                  ? Number.parseFloat(rice.production).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {rice.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(rice)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(rice)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentItem(rice);
                    setShowDeleteConfirm(rice.id);
                  }}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "livestock":
        return data.map((livestock) => (
          <tr
            key={livestock.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <MilkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {livestock.animal_type || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {livestock.subcategory || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {livestock.quantity || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {livestock.farmer_name || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-500 sm:text-sm">
                {livestock.created_at
                  ? new Date(livestock.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(livestock)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(livestock)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(livestock.id)}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "operators":
        return data.map((operator) => (
          <tr
            key={operator.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <div className="flex items-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {operator.name || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {operator.fishpond_location || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {operator.cultured_species || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {operator.farmer_name || "N/A"}
              </span>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {operator.operational_status || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-4 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(operator)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(operator)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(operator.id)}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      default:
        return null;
    }
  };

  return (
    <div className="p-2 sm:p-3 bg-[#F5F7F9] min-h-screen max-w-full overflow-hidden">
      <div className="mb-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-start justify-between p-3 border-b sm:flex-row sm:items-center sm:p-4">
          <h4 className="m-0 mb-2 text-base font-semibold sm:text-lg sm:mb-0">
            Agricultural Inventory
          </h4>

          {/* Data Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium text-white bg-[#4F6F7D] rounded-md sm:w-[180px] hover:bg-opacity-90"
            >
              <div className="flex items-center">
                {dataTypes.find((type) => type.id === selectedDataType)?.icon}
                <span>
                  {dataTypes.find((type) => type.id === selectedDataType)
                    ?.label || "Select Type"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {dataTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedDataType(type.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-gray-100 ${
                      selectedDataType === type.id
                        ? "bg-gray-100 font-medium"
                        : ""
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex flex-col items-start justify-between w-full gap-2 mb-4 sm:flex-row sm:items-center sm:gap-0">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-[#6A9C89]" />
              </div>
              <input
                type="text"
                placeholder={`Search ${
                  dataTypes.find((type) => type.id === selectedDataType)
                    ?.label || "items"
                }`}
                value={searchText}
                onChange={handleSearchInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-[250px] focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <span className="text-gray-400 hover:text-gray-600">×</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end w-full sm:w-auto">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#6A9C89] text-white">
                <span className="px-2">Total Records: {totalRecords}</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 mb-4 text-xs text-red-700 bg-red-100 border border-red-400 rounded sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-[#6A9C89]" />
              </div>
            )}

            <div className="-mx-3 overflow-x-auto sm:mx-0">
              <table className="min-w-full text-xs border divide-y divide-gray-200 sm:text-sm">
                <thead className="bg-gray-50">{renderTableColumns()}</thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTableRows()}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-1 py-1 mr-1 border border-gray-300 rounded-md sm:px-2 sm:py-1 sm:mr-2 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex space-x-1">
                  {[
                    ...Array(Math.min(3, Math.ceil(totalRecords / pageSize))),
                  ].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm ${
                          currentPage === pageNum
                            ? "bg-[#6A9C89] text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {Math.ceil(totalRecords / pageSize) > 3 && (
                    <span className="flex items-center px-1 text-xs sm:px-2 sm:text-sm">
                      ...
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(totalRecords / pageSize),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                  className="px-1 py-1 ml-1 border border-gray-300 rounded-md sm:px-2 sm:py-1 sm:ml-2 disabled:opacity-50"
                >
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30">
          <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <h3 className="mb-2 text-base font-medium sm:text-lg">
              Delete this {selectedDataType.slice(0, -1)}?
            </h3>
            <p className="mb-4 text-xs text-gray-500 sm:text-sm">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-[#D32F2F] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-opacity-90"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
