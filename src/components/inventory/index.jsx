"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "../services/api";
import EditFarmer from "./EditFarmer";
import ViewFarmer from "./ViewFarmer";
import { prefetchRouteData, prefetchFarmerDetails } from "../services/api";

// Import components
import DataTypeSelector from "./components/DataTypeSelector";
import SearchAndFilters from "./components/SearchAndFilters";
import InventoryTable from "./components/InventoryTable";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useInventoryData } from "./hooks/useInventoryData";
import { exportToExcel } from "./utils/exportUtils";

const Inventory = () => {
  // Data type selection
  const [selectedDataType, setSelectedDataType] = useState("farmers");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search and filter states
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // View/Edit states
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Refs for cleanup
  const abortControllerRef = useRef(null);

  // Use custom hook for data fetching and processing
  const {
    data,
    allData,
    loading,
    error,
    totalRecords,
    currentPage,
    setCurrentPage,
    pageSize,
    barangayOptions,
    monthOptions,
    yearOptions,
    fetchAllData,
    filterData,
    paginateData,
  } = useInventoryData(
    selectedDataType,
    debouncedSearchText,
    barangayFilter,
    monthFilter,
    yearFilter,
    abortControllerRef
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

    setSearchText("");
    setDebouncedSearchText("");
    setBarangayFilter(""); // Clear barangay filter
    setMonthFilter(""); // Clear month filter
    setYearFilter(""); // Clear year filter

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
  }, [selectedDataType, fetchAllData, setCurrentPage]);

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
    // Skip initial render when allData is empty
    if (allData.length === 0) return;

    console.log("Pagination effect running with currentPage:", currentPage);

    // Use a timeout to ensure state updates have settled
    const timeoutId = setTimeout(() => {
      if (debouncedSearchText || barangayFilter || monthFilter || yearFilter) {
        // If search or any filter is active, do client-side filtering
        filterData();
      } else {
        // Only paginate from already fetched data when not searching or filtering
        paginateData();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [
    pageSize,
    debouncedSearchText,
    barangayFilter,
    monthFilter,
    yearFilter,
    allData.length,
    filterData,
    paginateData,
  ]);

  // Add a separate useEffect specifically for handling page changes
  // This ensures pagination works correctly without resetting
  useEffect(() => {
    if (allData.length === 0) return;

    console.log("Page change effect running, current page:", currentPage);

    // Simple timeout to ensure this runs after other state updates
    const timeoutId = setTimeout(() => {
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedResults = allData.slice(startIndex, startIndex + pageSize);

      // Apply any active filters to the paginated results
      if (debouncedSearchText || barangayFilter || monthFilter || yearFilter) {
        filterData();
      } else {
        paginateData();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentPage, pageSize, allData]);

  const handleSearch = useCallback(
    (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
      setCurrentPage(1);
    },
    [setCurrentPage]
  );

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

  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchText(value);
      setCurrentPage(1); // Reset to first page when searching
    },
    [setCurrentPage]
  );

  // Simple toast notification function
  const showToast = useCallback((message, type = "info") => {
    // In a real app, you'd use a toast library or custom component
    alert(message);
  }, []);

  const handleFilterChange = useCallback(
    (filterType, value) => {
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
    },
    [setCurrentPage]
  );

  // Add this function to clear all filters
  const clearAllFilters = useCallback(() => {
    setBarangayFilter("");
    setMonthFilter("");
    setYearFilter("");
    setSearchText("");
    setDebouncedSearchText("");
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Handle export to Excel
  const handleExportToExcel = useCallback(() => {
    exportToExcel(selectedDataType, allData, showToast);
  }, [allData, selectedDataType, showToast]);

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

          {/* Data Type Selector Component */}
          <DataTypeSelector
            selectedDataType={selectedDataType}
            setSelectedDataType={setSelectedDataType}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        </div>

        <div className="p-3 sm:p-4">
          {/* Search and Filters Component */}
          <SearchAndFilters
            searchText={searchText}
            handleSearchInputChange={handleSearchInputChange}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            barangayFilter={barangayFilter}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            clearAllFilters={clearAllFilters}
            totalRecords={totalRecords}
            loading={loading}
            allData={allData}
            selectedDataType={selectedDataType}
            handleExportToExcel={handleExportToExcel}
            barangayOptions={barangayOptions}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
            handleFilterChange={handleFilterChange}
          />

          {error && (
            <div className="px-3 py-2 mb-4 text-xs text-red-700 bg-red-100 border border-red-400 rounded sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          {/* Inventory Table Component */}
          <InventoryTable
            loading={loading}
            data={data}
            selectedDataType={selectedDataType}
            searchText={searchText}
            searchedColumn={searchedColumn}
            handleView={handleView}
            handleEdit={handleEdit}
            setShowDeleteConfirm={setShowDeleteConfirm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDelete={handleDelete}
        selectedDataType={selectedDataType}
      />
    </div>
  );
};

export default Inventory;
