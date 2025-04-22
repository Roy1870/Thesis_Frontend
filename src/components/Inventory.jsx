"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Coffee,
  FileDown,
  RefreshCw,
} from "lucide-react";
import Highlighter from "react-highlight-words";
import EditFarmer from "./inventory/EditFarmer";
import ViewFarmer from "./inventory/ViewFarmer";
import { exportDataToExcel } from "./utils/excel-export";

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
  const [loading, setLoading] = useState(false); // Start with loading false
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);

  // View/Edit states
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Filters
  const [barangayFilter, setBarangayFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [monthOptions] = useState([
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]);
  const [yearOptions, setYearOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // New refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Refs for cleanup
  const abortControllerRef = useRef(null);

  // Data type options - memoized to prevent recreating on each render
  const dataTypes = useMemo(
    () => [
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
    ],
    []
  );

  // Debounce search text to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Initial data fetch with AbortController for cleanup
  useEffect(() => {
    // Create a new AbortController for this effect
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Fetch fresh data for initial load
    fetchAllData(signal, true);

    // Load ExcelJS library if not already loaded
    if (!window.ExcelJS) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/exceljs/dist/exceljs.min.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // Abort any in-flight requests when component unmounts or effect re-runs
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array for initial load only

  // Reset page when data type changes
  useEffect(() => {
    // Clear data first before fetching new data
    setCurrentPage(1);
    setSearchText("");
    setDebouncedSearchText("");
    setBarangayFilter(""); // Clear barangay filter
    setMonthFilter(""); // Clear month filter
    setYearFilter(""); // Clear year filter
    setData([]); // Clear current data immediately
    setAllData([]); // Clear all data immediately
    setTotalRecords(0); // Reset total records

    // Create a new AbortController for this effect
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Always fetch fresh data when changing data type
    fetchAllData(signal, true);

    return () => {
      // Abort any in-flight requests when component unmounts or effect re-runs
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedDataType]);

  // Handle pagination, debounced search, and filters
  useEffect(() => {
    if (allData.length > 0) {
      if (debouncedSearchText || barangayFilter || monthFilter || yearFilter) {
        // If search or any filter is active, do client-side filtering
        filterData();
      } else {
        // Only paginate from already fetched data when not searching or filtering
        paginateData();
      }
    } else if (!loading) {
      // If there's no data and we're not loading, make sure the data state is empty
      setData([]);
      setTotalRecords(0);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchText,
    barangayFilter,
    monthFilter,
    yearFilter,
    allData.length,
    loading,
  ]);

  // Paginate data function - memoized with useCallback
  const paginateData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = allData.slice(startIndex, startIndex + pageSize);

    setData(paginatedResults);
    setTotalRecords(allData.length);
  }, [allData, currentPage, pageSize]);

  // Helper function to parse production_data - memoized with useCallback
  const parseProductionData = useCallback((crop) => {
    let productionData = {};
    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
      } catch (e) {
        // Silent error - continue with empty production data
      }
    } else if (
      crop.production_data &&
      typeof crop.production_data === "object"
    ) {
      productionData = crop.production_data;
    }
    return productionData;
  }, []);

  // Extract unique barangays and years from data - memoized with useCallback
  const extractFilterOptions = useCallback((data) => {
    // Extract unique barangays
    const barangays = [
      ...new Set(data.map((item) => item.barangay).filter(Boolean)),
    ].sort();
    setBarangayOptions(barangays);

    // Extract unique years from created_at dates
    const years = [
      ...new Set(
        data
          .map((item) =>
            item.created_at ? new Date(item.created_at).getFullYear() : null
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a); // Sort descending

    // If no years found, add current year
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }

    setYearOptions(years);
  }, []);

  // Add a manual refresh function to get fresh data
  const refreshData = useCallback(() => {
    setIsRefreshing(true);

    // Create a new AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Fetch fresh data
    fetchAllData(signal, true)
      .then(() => {
        // Update last refresh timestamp
        setLastRefresh(new Date());
        // Show success toast
        showToast("Data refreshed successfully", "success");
      })
      .catch((err) => {
        console.error("Error refreshing data:", err);
        showToast("Failed to refresh data", "error");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, []);

  // Modify the fetchAllData function to avoid clearing existing data during refreshes
  const fetchAllData = useCallback(
    async (signal, forceRefresh = false) => {
      try {
        // Always use background refreshing, even on initial load
        setIsBackgroundRefreshing(true);

        setError(null);

        // Don't clear existing data during refreshes to keep the table visible
        // Only store new data in temporary variables until ready to update UI
        let response;
        let processedData = [];

        switch (selectedDataType) {
          case "farmers":
            response = await farmerAPI.getAllFarmers(1, 1000, "", [], {
              forceRefresh,
            });
            processedData = Array.isArray(response)
              ? response
              : response.data || [];
            break;

          case "crops":
            // First get all farmers
            const farmersResponse = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              { forceRefresh }
            );
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
                  // Parse production_data
                  const productionData = parseProductionData(crop);

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
                    // Keep original production_data for reference
                    production_data: crop.production_data,
                  };
                });
                allCrops.push(...farmerCrops);
              }
            }

            processedData = allCrops;
            break;

          case "highValueCrops":
            // First get all farmers
            const farmersForHVC = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              { forceRefresh }
            );
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
                  // Parse production_data
                  const productionData = parseProductionData(crop);

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
                    crop_value: productionData.crop || crop.crop_value || "",
                    quantity: productionData.quantity || crop.quantity || "",
                    // Keep original production_data for reference
                    production_data: crop.production_data,
                  };
                });
                allHighValueCrops.push(...farmerHVCs);
              }
            }

            processedData = allHighValueCrops;
            break;

          case "rice":
            // First get all farmers
            const farmersForRice = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              { forceRefresh }
            );
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
              1000,
              "",
              { forceRefresh }
            );
            const livestockRecords = Array.isArray(livestockResponse)
              ? livestockResponse
              : livestockResponse.data || [];

            // Get all farmers to add farmer information to livestock records
            const farmersForLivestock = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              { forceRefresh }
            );

            // Create a map of farmer_id to farmer data for quick lookup
            const farmersMap = {};
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
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim()
                  : "Unknown",
                barangay: farmer ? farmer.barangay : "Unknown",
              };
            });

            processedData = enrichedLivestockRecords;
            break;

          case "operators":
            // Get all operators
            const operatorsResponse = await operatorAPI.getAllOperators(
              1,
              1000,
              "",
              { forceRefresh }
            );
            const operators = Array.isArray(operatorsResponse)
              ? operatorsResponse
              : operatorsResponse.data || [];

            // Get all farmers to add farmer information to operators
            const farmersForOperators = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              { forceRefresh }
            );

            // Create a map of farmer_id to farmer data for quick lookup
            const farmerOperatorMap = {};
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
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim()
                  : "Unknown",
                barangay: farmer ? farmer.barangay : "Unknown",
                operational_status:
                  operator.operational_status || operator.remarks || "N/A",
                fishpond_location: operator.fishpond_location || "N/A",
                cultured_species: operator.cultured_species || "N/A",
                productive_area_sqm:
                  operator.productive_area_sqm || operator.area || "N/A",
                production_kg:
                  operator.production_kg || operator.production || "N/A",
              };
            });

            processedData = enrichedOperators;
            break;

          default:
            processedData = [];
        }

        // Extract filter options from the data
        extractFilterOptions(processedData);

        // Only update the UI once all data is ready
        setAllData(processedData);

        // Apply pagination to the fetched data
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedResults = processedData.slice(
          startIndex,
          startIndex + pageSize
        );

        setData(paginatedResults);
        setTotalRecords(processedData.length);

        // Always turn off loading when done
        setLoading(false);
        setIsBackgroundRefreshing(false);
      } catch (err) {
        // Only set error if not an abort error (which happens during cleanup)
        if (err.name !== "AbortError") {
          console.error(`Error fetching ${selectedDataType} data:`, err);
          setError(`Failed to fetch ${selectedDataType} data: ${err.message}`);
          setLoading(false);
          setIsBackgroundRefreshing(false);
        }
      }
    },
    [
      selectedDataType,
      parseProductionData,
      extractFilterOptions,
      currentPage,
      pageSize,
      data.length,
      allData.length,
    ]
  );

  // Client-side filtering function - memoized with useCallback
  const filterData = useCallback(() => {
    const shouldPaginateDirectly =
      !debouncedSearchText.trim() &&
      !barangayFilter &&
      !monthFilter &&
      !yearFilter;

    if (shouldPaginateDirectly) {
      paginateData();
      return;
    }

    setLoading(true);
    const searchLower = debouncedSearchText.toLowerCase().trim();
    let filtered = [...allData]; // Start with all data

    // Apply text search if provided
    if (searchLower) {
      switch (selectedDataType) {
        case "farmers":
          filtered = filtered.filter(
            (farmer) =>
              (farmer.name &&
                farmer.name.toLowerCase().includes(searchLower)) ||
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
          filtered = filtered.filter((crop) => {
            // Get crop value from production_data if available
            let cropValue = crop.crop_value || "";
            let quantity = crop.quantity || "";

            // Try to parse production_data if it's a string
            if (crop.production_data) {
              const productionData = parseProductionData(crop);
              if (productionData.crop) {
                cropValue = productionData.crop;
              }
              if (productionData.quantity) {
                quantity = productionData.quantity;
              }
            }

            return (
              (crop.crop_type &&
                crop.crop_type.toLowerCase().includes(searchLower)) ||
              (cropValue && cropValue.toLowerCase().includes(searchLower)) ||
              (crop.area_hectare &&
                crop.area_hectare.toString().includes(searchLower)) ||
              (quantity && quantity.toString().includes(searchLower)) ||
              (crop.farmer_name &&
                crop.farmer_name.toLowerCase().includes(searchLower)) ||
              (crop.barangay &&
                crop.barangay.toLowerCase().includes(searchLower))
            );
          });
          break;

        case "highValueCrops":
          filtered = filtered.filter((crop) => {
            // Get crop value and month from production_data if available
            let cropValue = crop.crop_value || "";
            let month = crop.month || "";
            let quantity = crop.quantity || "";

            // Try to parse production_data if it's a string
            if (crop.production_data) {
              const productionData = parseProductionData(crop);
              if (productionData.crop) {
                cropValue = productionData.crop;
              }
              if (productionData.month) {
                month = productionData.month;
              }
              if (productionData.quantity) {
                quantity = productionData.quantity;
              }
            }

            return (
              (cropValue && cropValue.toLowerCase().includes(searchLower)) ||
              (month && month.toLowerCase().includes(searchLower)) ||
              (crop.variety_clone &&
                crop.variety_clone.toLowerCase().includes(searchLower)) ||
              (crop.area_hectare &&
                crop.area_hectare.toString().includes(searchLower)) ||
              (quantity && quantity.toString().includes(searchLower)) ||
              (crop.farmer_name &&
                crop.farmer_name.toLowerCase().includes(searchLower)) ||
              (crop.barangay &&
                crop.barangay.toLowerCase().includes(searchLower))
            );
          });
          break;

        case "rice":
          filtered = filtered.filter(
            (rice) =>
              (rice.area_type &&
                rice.area_type.toLowerCase().includes(searchLower)) ||
              (rice.seed_type &&
                rice.seed_type.toLowerCase().includes(searchLower)) ||
              (rice.area_harvested &&
                rice.area_harvested.toString().includes(searchLower)) ||
              (rice.farmer_name &&
                rice.farmer_name.toLowerCase().includes(searchLower)) ||
              (rice.barangay &&
                rice.barangay.toLowerCase().includes(searchLower))
          );
          break;

        case "livestock":
          filtered = filtered.filter(
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
          filtered = filtered.filter(
            (operator) =>
              (operator.fishpond_location &&
                operator.fishpond_location
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.cultured_species &&
                operator.cultured_species
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.productive_area_sqm &&
                operator.productive_area_sqm
                  .toString()
                  .includes(searchLower)) ||
              (operator.production_kg &&
                operator.production_kg.toString().includes(searchLower)) ||
              (operator.operational_status &&
                operator.operational_status
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.farmer_name &&
                operator.farmer_name.toLowerCase().includes(searchLower))
          );
          break;

        default:
          break;
      }
    }

    // Apply barangay filter if selected
    if (barangayFilter) {
      filtered = filtered.filter(
        (item) => item.barangay && item.barangay === barangayFilter
      );
    }

    // Apply year and month filters if selected
    if (yearFilter || monthFilter) {
      filtered = filtered.filter((item) => {
        if (!item.created_at) return false;

        const date = new Date(item.created_at);
        const itemYear = date.getFullYear().toString();
        const itemMonth = (date.getMonth() + 1).toString(); // JavaScript months are 0-indexed

        // If both year and month are specified, both must match
        if (yearFilter && monthFilter) {
          return itemYear === yearFilter && itemMonth === monthFilter;
        }
        // If only year is specified
        else if (yearFilter) {
          return itemYear === yearFilter;
        }
        // If only month is specified
        else if (monthFilter) {
          return itemMonth === monthFilter;
        }

        return true;
      });
    }

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);

    setData(paginatedResults);
    setTotalRecords(filtered.length);
    setLoading(false);
  }, [
    allData,
    barangayFilter,
    currentPage,
    debouncedSearchText,
    monthFilter,
    pageSize,
    paginateData,
    parseProductionData,
    selectedDataType,
    yearFilter,
  ]);

  const handleSearch = useCallback((selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback((clearFilters) => {
    clearFilters();
    setSearchText("");
  }, []);

  // Add a new state for tracking background refreshes
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Modify the handleDelete function to use background refreshing
  const handleDelete = useCallback(
    async (id) => {
      try {
        setIsBackgroundRefreshing(true);

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

        // Create a new AbortController for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Refresh data after deletion - always fetch fresh data
        await fetchAllData(signal, true);

        // Update last refresh timestamp
        setLastRefresh(new Date());

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
      } finally {
        setIsBackgroundRefreshing(false);
      }
    },
    [currentItem, selectedDataType, fetchAllData]
  );

  // Modified handleView to fetch fresh data
  const handleView = useCallback((record) => {
    // Set the current item first
    setCurrentItem(record);
    setIsViewMode(true);

    // If we have a farmer_id but not complete data, fetch in the background
    if (record && record.farmer_id && !record.crops) {
      // Fetch fresh farmer details in the background
      farmerAPI
        .getFarmerById(record.farmer_id, { forceRefresh: true })
        .then((freshData) => {
          // Update the current item with fresh data
          setCurrentItem(freshData);
        })
        .catch((err) => {
          console.error("Error fetching farmer details for viewing:", err);
        });
    }
  }, []);

  // Modify the handleEdit function to match the handleView pattern
  const handleEdit = useCallback((record) => {
    // Set the current item first and immediately transition to edit mode
    setCurrentItem(record);
    setIsEditMode(true);

    // If we have a farmer_id but not complete data, fetch in the background
    if (record && record.farmer_id && !record.crops) {
      // Fetch fresh farmer details in the background without blocking UI
      farmerAPI
        .getFarmerById(record.farmer_id, { forceRefresh: true })
        .then((freshData) => {
          // Update the current item with fresh data
          setCurrentItem(freshData);
        })
        .catch((err) => {
          console.error(
            "Error fetching fresh farmer details for editing:",
            err
          );
        });
    }
  }, []);

  const handleCloseView = useCallback(() => {
    setIsViewMode(false);
    setCurrentItem(null);
  }, []);

  // Modify the handleCloseEdit function to use background refreshing
  const handleCloseEdit = useCallback(() => {
    setIsEditMode(false);
    setCurrentItem(null);

    // Create a new AbortController for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Use background refreshing for a smoother experience
    setIsBackgroundRefreshing(true);

    // Always fetch fresh data after editing
    fetchAllData(signal, true).finally(() => {
      setIsBackgroundRefreshing(false);
    });
  }, [fetchAllData]);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Simple toast notification function
  const showToast = useCallback((message, type = "info") => {
    // In a real app, you'd use a toast library or custom component
    alert(message);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1); // Reset to first page when filters change

    switch (filterType) {
      case "barangay":
        setBarangayFilter(value);
        break;
      case "month":
        setMonthFilter(value);
        break;
      case "year":
        setYearFilter(value);
        break;
      default:
        break;
    }
  }, []);

  // Add this function to clear all filters - memoized with useCallback
  const clearAllFilters = useCallback(() => {
    setBarangayFilter("");
    setMonthFilter("");
    setYearFilter("");
    setSearchText("");
    setDebouncedSearchText("");
    setCurrentPage(1);
  }, []);

  // Export to Excel function using the separated utility
  const handleExportToExcel = useCallback(async () => {
    if (selectedDataType === "farmers") return; // Skip export for farmers

    // Show loading state
    setLoading(true);

    try {
      await exportDataToExcel(
        selectedDataType,
        allData,
        barangayFilter,
        monthFilter,
        yearFilter,
        monthOptions,
        showToast
      );
    } finally {
      setLoading(false);
    }
  }, [
    allData,
    selectedDataType,
    barangayFilter,
    monthFilter,
    yearFilter,
    monthOptions,
    showToast,
  ]);

  // Function to determine the export button text
  const getExportButtonText = useCallback(() => {
    if (loading) {
      return "Exporting...";
    } else if (allData.length === 0) {
      return "No Data to Export";
    } else {
      return "Export to Excel";
    }
  }, [loading, allData.length]);

  // Render table columns based on selected data type - memoized with useCallback
  const renderTableColumns = useCallback(() => {
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
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Quantity
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Date Recorded
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
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Month
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Quantity
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Date Recorded
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
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Area (ha)
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Production
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Date Recorded
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
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Quantity
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Date Recorded
            </th>
          </tr>
        );

      case "operators":
        return (
          <tr>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Location
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Species
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Area (sqm)
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Production (kg)
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Remarks
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Farmer
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Barangay
            </th>
            <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6 sm:py-3">
              Date Recorded
            </th>
          </tr>
        );

      default:
        return null;
    }
  }, [selectedDataType]);

  // Render table rows based on selected data type - memoized with useCallback
  const renderTableRows = useCallback(() => {
    if (data.length === 0 && !loading) {
      return (
        <tr>
          <td
            colSpan={selectedDataType === "farmers" ? 6 : 6}
            className="px-2 py-2 text-xs text-center text-gray-500 sm:px-6 sm:py-3 sm:text-sm"
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
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
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
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">
                  {farmer.contact_number || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <MailIcon className="w-4 h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {farmer.facebook_email || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <HomeIcon className="w-4 h-4 mr-1 sm:mr-2 text-[#4F6F7D]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {farmer.home_address || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {farmer.barangay || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 text-xs font-medium sm:px-6 sm:py-3 whitespace-nowrap sm:text-sm">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleView(farmer)}
                  className="text-[#6A9C89] hover:text-opacity-70"
                  title="View Details"
                >
                  <EyeIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleEdit(farmer)}
                  className="text-[#FFA000] hover:text-opacity-70"
                  title="Edit"
                >
                  <PencilIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(farmer.farmer_id)}
                  className="text-[#D32F2F] hover:text-opacity-70"
                  title="Delete"
                >
                  <TrashIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
              </div>
            </td>
          </tr>
        ));

      case "crops":
        return data.map((crop) => {
          // Parse production_data if needed
          const productionData = parseProductionData(crop);
          const cropValue = productionData.crop || crop.crop_value || "Unknown";
          const quantity = productionData.quantity || crop.quantity || "N/A";

          return (
            <tr
              key={crop.id || Math.random().toString()}
              className="hover:bg-gray-50"
            >
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <Wheat className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                  <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                    {crop.crop_type || "Unknown"}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {cropValue}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {crop.area_hectare
                    ? Number.parseFloat(crop.area_hectare).toFixed(2)
                    : "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {quantity}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {crop.farmer_name || "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                  {crop.barangay || "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-500 sm:text-sm">
                  {crop.created_at
                    ? new Date(crop.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </td>
            </tr>
          );
        });

      case "highValueCrops":
        return data.map((crop) => {
          // Parse production_data if needed
          const productionData = parseProductionData(crop);
          const cropValue = productionData.crop || crop.crop_value || "Unknown";
          const month = productionData.month || crop.month || "N/A";
          const quantity = productionData.quantity || crop.quantity || "N/A";

          return (
            <tr
              key={crop.id || Math.random().toString()}
              className="hover:bg-gray-50"
            >
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <Coffee className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                  <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                    {cropValue}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {crop.variety_clone || "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {month}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {crop.area_hectare
                    ? Number.parseFloat(crop.area_hectare).toFixed(2)
                    : "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-900 sm:text-sm">
                  {quantity}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {crop.farmer_name || "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                  {crop.barangay || "N/A"}
                </span>
              </td>
              <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                <span className="text-xs text-gray-500 sm:text-sm">
                  {crop.created_at
                    ? new Date(crop.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </td>
            </tr>
          );
        });

      case "rice":
        return data.map((rice) => (
          <tr
            key={rice.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <Sprout className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {rice.area_type || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.seed_type || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.area_harvested
                  ? Number.parseFloat(rice.area_harvested).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {rice.production
                  ? Number.parseFloat(rice.production).toFixed(2)
                  : "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {rice.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {rice.barangay || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-500 sm:text-sm">
                {rice.created_at
                  ? new Date(rice.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </td>
          </tr>
        ));

      case "livestock":
        return data.map((livestock) => (
          <tr
            key={livestock.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <MilkIcon className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {livestock.animal_type || "Unknown"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {livestock.subcategory || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {livestock.quantity || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {livestock.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {livestock.barangay || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-500 sm:text-sm">
                {livestock.created_at
                  ? new Date(livestock.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </td>
          </tr>
        ));

      case "operators":
        return data.map((operator) => (
          <tr
            key={operator.id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 sm:mr-2 text-[#6A9C89]" />
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {operator.fishpond_location || "N/A"}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {operator.cultured_species || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-900 sm:text-sm">
                {operator.productive_area_sqm || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {operator.production_kg || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${
                  operator.operational_status === "Active" ||
                  operator.operational_status === "operational"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {operator.operational_status || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {operator.farmer_name || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-[#E6F5E4] text-[#6A9C89]">
                {operator.barangay || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span className="text-xs text-gray-500 sm:text-sm">
                {operator.created_at
                  ? new Date(operator.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </td>
          </tr>
        ));

      default:
        return null;
    }
  }, [
    data,
    handleEdit,
    handleView,
    loading,
    parseProductionData,
    searchText,
    searchedColumn,
    selectedDataType,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Modify the polling mechanism to use background refreshing
  useEffect(() => {
    // Set up polling interval to check for new data
    const pollInterval = setInterval(() => {
      // Only poll if not already refreshing and not in edit/view mode
      if (!isRefreshing && !isEditMode && !isViewMode) {
        // Create a new AbortController for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Set background refreshing state instead of regular refreshing
        setIsBackgroundRefreshing(true);

        // Fetch fresh data
        fetchAllData(signal, true)
          .then(() => {
            // Update last refresh timestamp
            setLastRefresh(new Date());
          })
          .catch((err) => {
            // Only log error if not an abort error
            if (err.name !== "AbortError") {
              console.error("Error during auto-refresh:", err);
            }
          })
          .finally(() => {
            setIsBackgroundRefreshing(false);
          });
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchAllData, isRefreshing, isEditMode, isViewMode]);

  // Add a function to handle real-time updates from API changes
  // This would be called by any component that creates or updates data
  const handleDataChange = useCallback(() => {
    // Only refresh if not already refreshing
    if (!isRefreshing && !isBackgroundRefreshing) {
      // Create a new AbortController for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Set background refreshing state
      setIsBackgroundRefreshing(true);

      // Fetch fresh data
      fetchAllData(signal, true)
        .then(() => {
          // Update last refresh timestamp
          setLastRefresh(new Date());
        })
        .catch((err) => {
          // Only log error if not an abort error
          if (err.name !== "AbortError") {
            console.error("Error during data change refresh:", err);
          }
        })
        .finally(() => {
          setIsBackgroundRefreshing(false);
        });
    }
  }, [fetchAllData, isRefreshing, isBackgroundRefreshing]);

  if (isViewMode && currentItem) {
    return (
      <ViewFarmer farmer={currentItem} onClose={handleCloseView} colors={{}} />
    );
  }

  if (isEditMode && currentItem) {
    return (
      <EditFarmer farmer={currentItem} onClose={handleCloseEdit} colors={{}} />
    );
  }

  return (
    <div className="p-2 sm:p-3 bg-[#F5F7F9] min-h-screen max-w-full overflow-hidden flex flex-col">
      <div className="mb-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-start justify-between p-3 border-b sm:flex-row sm:items-center sm:p-4">
          <h4 className="m-0 mb-2 text-base font-semibold sm:text-lg sm:mb-0">
            Agricultural Inventory
          </h4>

          {/* Data Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-[#5A8C79] rounded-md sm:w-[180px] hover:bg-opacity-90"
            >
              <div className="flex items-center">
                {dataTypes.find((type) => type.id === selectedDataType)?.icon}
                <span>
                  {dataTypes.find((type) => type.id === selectedDataType)
                    ?.label || "Select Type"}
                </span>
              </div>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
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
                    className={`flex items-center w-full px-2.5 py-1.5 text-xs sm:text-sm text-left hover:bg-gray-100 ${
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
          <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="w-3.5 h-3.5 text-[#6A9C89]" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${
                    dataTypes.find((type) => type.id === selectedDataType)
                      ?.label || "items"
                  }`}
                  value={searchText}
                  onChange={handleSearchInputChange}
                  className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md w-full sm:w-[250px] focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm"
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

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-[#6A9C89] rounded-md sm:text-sm hover:bg-opacity-90 transition-colors"
              >
                <span>Filters</span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isBackgroundRefreshing && (
                <div className="flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md sm:text-sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}

              {(barangayFilter || monthFilter || yearFilter) && (
                <button
                  onClick={clearAllFilters}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors border border-gray-300 rounded-md sm:text-sm hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#6A9C89] text-white">
                Total Records: {totalRecords}
              </span>

              {/* Last refresh time indicator */}
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-gray-100 text-gray-700">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>

              {selectedDataType !== "farmers" && (
                <button
                  onClick={handleExportToExcel}
                  disabled={loading || allData.length === 0}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-[#5A8C79] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" />
                  {getExportButtonText()}
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel - In document flow with proper spacing */}
          {showFilters && (
            <div className="p-2 mb-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                {/* Barangay Filter - Always shown */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Barangay
                  </label>
                  <div className="relative">
                    <select
                      value={barangayFilter}
                      onChange={(e) =>
                        handleFilterChange("barangay", e.target.value)
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89] appearance-none bg-white pr-6"
                    >
                      <option value="">All</option>
                      {barangayOptions.map((barangay) => (
                        <option key={barangay} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                      <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Month Filter - Only shown for non-farmer data types */}
                {selectedDataType !== "farmers" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Month
                    </label>
                    <div className="relative">
                      <select
                        value={monthFilter}
                        onChange={(e) =>
                          handleFilterChange("month", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89] appearance-none bg-white pr-6"
                      >
                        <option value="">All</option>
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Year Filter - Only shown for non-farmer data types */}
                {selectedDataType !== "farmers" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Year
                    </label>
                    <div className="relative">
                      <select
                        value={yearFilter}
                        onChange={(e) =>
                          handleFilterChange("year", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89] appearance-none bg-white pr-6"
                      >
                        <option value="">All</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              {(barangayFilter || monthFilter || yearFilter) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {barangayFilter && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
                      {barangayFilter}
                      <button
                        onClick={() => setBarangayFilter("")}
                        className="ml-1 text-[#6A9C89] hover:text-[#5A8C79] focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {monthFilter && selectedDataType !== "farmers" && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
                      {monthOptions.find((m) => m.value === monthFilter)?.label}
                      <button
                        onClick={() => setMonthFilter("")}
                        className="ml-1 text-[#6A9C89] hover:text-[#5A9C79] focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {yearFilter && selectedDataType !== "farmers" && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
                      {yearFilter}
                      <button
                        onClick={() => setYearFilter("")}
                        className="ml-1 text-[#6A9C89] hover:text-[#5A9C79] focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="px-3 py-2 mb-4 text-xs text-red-700 bg-red-100 border border-red-400 rounded sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          {/* Loading state removed */}

          {!loading && (
            <div className="relative">
              <div className="-mx-3 overflow-x-auto sm:mx-0">
                <table className="min-w-full text-xs border divide-y divide-gray-200 sm:text-sm">
                  <thead className="bg-gray-50">{renderTableColumns()}</thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-3">
                <nav
                  className="inline-flex items-center rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium border-t border-b border-l border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <div className="hidden sm:flex">
                    {(() => {
                      const totalPages = Math.ceil(totalRecords / pageSize);
                      const pageNumbers = [];

                      // Logic to show current page, first, last, and pages around current
                      for (let i = 1; i <= totalPages; i++) {
                        if (
                          i === 1 || // First page
                          i === totalPages || // Last page
                          (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
                        ) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              aria-current={
                                currentPage === i ? "page" : undefined
                              }
                              className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium border ${
                                currentPage === i
                                  ? "z-10 bg-[#6A9C89] text-white border-[#6A9C89]"
                                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        } else if (
                          (i === 2 && currentPage > 3) || // Show ellipsis after first page
                          (i === totalPages - 1 && currentPage < totalPages - 2) // Show ellipsis before last page
                        ) {
                          pageNumbers.push(
                            <span
                              key={`ellipsis-${i}`}
                              className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300"
                            >
                              ...
                            </span>
                          );
                        }
                      }

                      return pageNumbers;
                    })()}
                  </div>

                  {/* Mobile page indicator */}
                  <span className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 sm:hidden">
                    {currentPage} / {Math.ceil(totalRecords / pageSize)}
                  </span>

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
                    className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.ceil(totalRecords / pageSize))
                    }
                    disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                    className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <h3 className="mb-2 text-sm font-medium sm:text-lg">
              Delete this {selectedDataType.slice(0, -1)}?
            </h3>
            <p className="mb-4 text-xs text-gray-500 sm:text-sm">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#D32F2F] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-opacity-90"
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
