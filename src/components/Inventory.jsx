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
} from "lucide-react";
import Highlighter from "react-highlight-words";
import EditFarmer from "./inventory/EditFarmer";
import ViewFarmer from "./inventory/ViewFarmer";

// Add this at the top of the file, after the imports
import { prefetchRouteData, prefetchFarmerDetails } from "./services/api";

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
  const [pageSize, setPageSize] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);

  // View/Edit states
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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

    fetchAllData(signal);

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

    // Then fetch new data with AbortController
    fetchAllData(signal);

    return () => {
      // Abort any in-flight requests when component unmounts or effect re-runs
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedDataType]);

  // Add this inside the Inventory component, after the useEffect hooks
  // Prefetch data for other routes when inventory is loaded
  useEffect(() => {
    // Prefetch dashboard data when inventory is loaded
    prefetchRouteData("/dashboard");

    // Prefetch analytics data with a delay
    const analyticsTimer = setTimeout(() => {
      prefetchRouteData("/analytics");
    }, 5000); // 5 second delay

    // Prefetch first few farmers for ViewFarmer and EditFarmer components
    const prefetchFarmersTimer = setTimeout(() => {
      if (allData.length > 0 && selectedDataType === "farmers") {
        // Only prefetch the first 3 farmers to avoid too many requests
        const farmersToPreload = allData.slice(0, 3);

        // Prefetch each farmer's details with a delay between each
        farmersToPreload.forEach((farmer, index) => {
          setTimeout(() => {
            if (farmer && farmer.farmer_id) {
              console.log(`Prefetching data for farmer ${farmer.farmer_id}`);
              prefetchFarmerDetails(farmer.farmer_id);
            }
          }, index * 1000); // 1 second between each farmer prefetch
        });
      }
    }, 2000); // Start after 2 seconds to ensure main UI is responsive first

    return () => {
      clearTimeout(analyticsTimer);
      clearTimeout(prefetchFarmersTimer);
    };
  }, [allData, selectedDataType]);

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

  // Fetch all data for client-side filtering
  const fetchAllData = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        // Clear existing data to prevent mixing
        setData([]);

        let response;
        let processedData = [];

        switch (selectedDataType) {
          case "farmers":
            response = await farmerAPI.getAllFarmers(1, 1000, "", [], signal);
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
              signal
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
              signal
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
              signal
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
              signal
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
              signal
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
              signal
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
              signal
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
              };
            });

            processedData = enrichedOperators;
            break;

          default:
            processedData = [];
        }

        // Extract filter options from the data
        extractFilterOptions(processedData);

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
        // Only set error if not an abort error (which happens during cleanup)
        if (err.name !== "AbortError") {
          console.error(`Error fetching ${selectedDataType} data:`, err);
          setError(`Failed to fetch ${selectedDataType} data: ${err.message}`);
          setLoading(false);
          setAllData([]);
          setData([]);
          setTotalRecords(0);
        }
      }
    },
    [
      selectedDataType,
      parseProductionData,
      extractFilterOptions,
      currentPage,
      pageSize,
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

  const handleDelete = useCallback(
    async (id) => {
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

        // Create a new AbortController for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Refresh data after deletion
        await fetchAllData(signal);

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
    },
    [currentItem, selectedDataType, fetchAllData]
  );

  // Modify the handleView function to prefetch additional data
  // Replace the existing handleView function with this corrected version
  const handleView = useCallback((record) => {
    // Set the current item first to ensure the component has data to work with
    setCurrentItem(record);
    setIsViewMode(true);

    // Then prefetch additional data for this farmer
    if (record && record.farmer_id) {
      console.log(`Prefetching additional data for farmer ${record.farmer_id}`);

      // Explicitly fetch the farmer details to ensure we have the latest data
      farmerAPI
        .getFarmerById(record.farmer_id)
        .then((data) => {
          console.log("Successfully fetched farmer details for viewing");
        })
        .catch((err) => {
          console.error("Error fetching farmer details for viewing:", err);
        });

      // Also prefetch data that might be needed for editing this farmer
      setTimeout(() => {
        console.log(`Prefetching edit data for farmer ${record.farmer_id}`);
        prefetchFarmerDetails(record.farmer_id);
      }, 500); // Small delay to prioritize view data first
    }
  }, []);

  const handleEdit = useCallback((record) => {
    setCurrentItem(record);
    setIsEditMode(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setIsViewMode(false);
    setCurrentItem(null);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditMode(false);
    setCurrentItem(null);

    // Create a new AbortController for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Refresh data after editing
    fetchAllData(signal);
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

  // Export to Excel function - memoized with useCallback
  const exportToExcel = useCallback(() => {
    if (selectedDataType === "farmers") return; // Skip export for farmers

    // Show loading state
    setLoading(true);

    try {
      // Create a workbook with a worksheet
      const workbook = new window.ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(selectedDataType);

      // Define columns based on data type
      let columns = [];

      switch (selectedDataType) {
        case "crops":
          columns = [
            { header: "Crop Type", key: "crop_type" },
            { header: "Crop", key: "crop_value" },
            { header: "Area (ha)", key: "area_hectare" },
            { header: "Quantity", key: "quantity" },
            { header: "Farmer", key: "farmer_name" },
            { header: "Barangay", key: "barangay" },
            { header: "Date Recorded", key: "created_at" },
          ];
          break;

        case "highValueCrops":
          columns = [
            { header: "Crop", key: "crop_value" },
            { header: "Variety/Clone", key: "variety_clone" },
            { header: "Month", key: "month" },
            { header: "Area (ha)", key: "area_hectare" },
            { header: "Quantity", key: "quantity" },
            { header: "Farmer", key: "farmer_name" },
            { header: "Barangay", key: "barangay" },
            { header: "Date Recorded", key: "created_at" },
          ];
          break;

        case "rice":
          columns = [
            { header: "Area Type", key: "area_type" },
            { header: "Seed Type", key: "seed_type" },
            { header: "Area (ha)", key: "area_harvested" },
            { header: "Production", key: "production" },
            { header: "Farmer", key: "farmer_name" },
            { header: "Barangay", key: "barangay" },
            { header: "Date Recorded", key: "created_at" },
          ];
          break;

        case "livestock":
          columns = [
            { header: "Animal Type", key: "animal_type" },
            { header: "Subcategory", key: "subcategory" },
            { header: "Quantity", key: "quantity" },
            { header: "Farmer", key: "farmer_name" },
            { header: "Barangay", key: "barangay" },
            { header: "Date Recorded", key: "created_at" },
          ];
          break;

        case "operators":
          columns = [
            { header: "Location", key: "fishpond_location" },
            { header: "Species", key: "cultured_species" },
            { header: "Area (sqm)", key: "productive_area_sqm" },
            { header: "Production (kg)", key: "production_kg" },
            { header: "Status", key: "operational_status" },
            { header: "Farmer", key: "farmer_name" },
            { header: "Barangay", key: "barangay" },
            { header: "Date Recorded", key: "created_at" },
          ];
          break;

        default:
          break;
      }

      // Set the columns
      worksheet.columns = columns;

      // Process data for export
      const dataToExport = allData.map((item) => {
        // Create a new object with processed values
        const processedItem = { ...item };

        // Format date fields
        if (processedItem.created_at) {
          processedItem.created_at = new Date(
            processedItem.created_at
          ).toLocaleDateString();
        }

        // Process production_data for crops and highValueCrops
        if (
          (selectedDataType === "crops" ||
            selectedDataType === "highValueCrops") &&
          processedItem.production_data
        ) {
          const productionData = parseProductionData(processedItem);
          processedItem.crop_value =
            productionData.crop || processedItem.crop_value || "";
          processedItem.quantity =
            productionData.quantity || processedItem.quantity || "";

          if (selectedDataType === "highValueCrops") {
            processedItem.month =
              productionData.month || processedItem.month || "";
          }
        }

        // Format numeric fields
        if (processedItem.area_hectare) {
          processedItem.area_hectare = Number.parseFloat(
            processedItem.area_hectare
          ).toFixed(2);
        }

        if (processedItem.area_harvested) {
          processedItem.area_harvested = Number.parseFloat(
            processedItem.area_harvested
          ).toFixed(2);
        }

        if (processedItem.production) {
          processedItem.production = Number.parseFloat(
            processedItem.production
          ).toFixed(2);
        }

        return processedItem;
      });

      // Add rows to the worksheet
      worksheet.addRows(dataToExport);

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6F5E4" },
      };

      // Auto-size columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 30);
      });

      // Generate Excel file
      workbook.xlsx.writeBuffer().then((buffer) => {
        // Create a blob from the buffer
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedDataType}_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast(`${selectedDataType} data exported successfully`, "success");
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast(`Failed to export data: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [allData, parseProductionData, selectedDataType, showToast]);

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
              Status
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
              <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                {operator.production_kg || "N/A"}
              </span>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${
                  operator.operational_status === "Active"
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

              {selectedDataType !== "farmers" && (
                <button
                  onClick={exportToExcel}
                  disabled={loading || allData.length === 0}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-[#5A8C79] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" />
                  Export to Excel
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel - In document flow with proper spacing */}
          {showFilters && (
            <div className="p-2 mb-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                {/* Barangay Filter */}
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

                {/* Month Filter */}
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

                {/* Year Filter */}
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
                  {monthFilter && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
                      {monthOptions.find((m) => m.value === monthFilter)?.label}
                      <button
                        onClick={() => setMonthFilter("")}
                        className="ml-1 text-[#6A9C89] hover:text-[#5A8C79] focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {yearFilter && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
                      {yearFilter}
                      <button
                        onClick={() => setYearFilter("")}
                        className="ml-1 text-[#6A9C89] hover:text-[#5A8C79] focus:outline-none"
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

          {loading && (
            <div className="relative">
              <div className="p-3 sm:p-4">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
                </div>

                {/* Buttons skeleton */}
                <div className="flex mb-6 space-x-2">
                  <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Table skeleton */}
                <div className="-mx-3 overflow-x-auto sm:mx-0">
                  <div className="min-w-full border divide-y divide-gray-200">
                    {/* Table header skeleton */}
                    <div className="h-12 bg-gray-50">
                      <div className="flex">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex-1 px-2 py-2 sm:px-6 sm:py-3"
                          >
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Table body skeleton */}
                    <div className="bg-white divide-y divide-gray-200">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex">
                          {[1, 2, 3, 4, 5, 6].map((j) => (
                            <div key={j} className="flex-1 px-2 py-4 sm:px-6">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pagination skeleton */}
                <div className="flex justify-center mt-3">
                  <div className="w-64 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

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
