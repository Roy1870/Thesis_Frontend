"use client";

import { useState, useEffect, useCallback } from "react";
import { farmerAPI } from "./services/api";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import Highlighter from "react-highlight-words";
import EditFarmer from "./EditFarmer";
import ViewFarmer from "./ViewFarmer";

const Inventory = () => {
  console.log("InventoryModern component rendering");

  const [farmerData, setFarmerData] = useState([]);
  const [allFarmerData, setAllFarmerData] = useState([]); // Store all data for client-side filtering
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState(""); // For debounced search
  const [searchedColumn, setSearchedColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Theme colors - we'll use Tailwind classes instead of these directly
  const colors = {
    primary: "#6A9C89",
    secondary: "#E6F5E4",
    accent: "#4F6F7D",
    error: "#D32F2F",
    warning: "#FFA000",
    success: "#388E3C",
    textDark: "#333333",
    textLight: "#666666",
    border: "#E0E0E0",
    background: "#F5F7F9",
  };

  // Debounce search text to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch all data once on initial load
  useEffect(() => {
    fetchAllFarmerData();
  }, []);

  // Handle pagination and debounced search
  useEffect(() => {
    if (debouncedSearchText) {
      // If search is active, do client-side filtering
      filterFarmerData();
    } else {
      // Only fetch from API when not searching
      fetchFarmerData(currentPage);
    }
  }, [currentPage, pageSize, debouncedSearchText]);

  // Fetch all farmer data once for client-side filtering
  const fetchAllFarmerData = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getAllFarmers(1, 1000); // Get a large batch
      setAllFarmerData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching all data:", err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  // Client-side filtering function
  const filterFarmerData = useCallback(() => {
    if (!debouncedSearchText.trim()) {
      fetchFarmerData(currentPage);
      return;
    }

    setLoading(true);
    const searchLower = debouncedSearchText.toLowerCase().trim();

    // Filter from all data to ensure we catch everything
    const filtered = allFarmerData.filter(
      (farmer) =>
        (farmer.name && farmer.name.toLowerCase().includes(searchLower)) ||
        (farmer.contact_number &&
          farmer.contact_number.toLowerCase().includes(searchLower)) ||
        (farmer.facebook_email &&
          farmer.facebook_email.toLowerCase().includes(searchLower)) ||
        (farmer.home_address &&
          farmer.home_address.toLowerCase().includes(searchLower)) ||
        (farmer.barangay && farmer.barangay.toLowerCase().includes(searchLower))
    );

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);

    setFarmerData(paginatedResults);
    setTotalRecords(filtered.length);
    setLoading(false);
  }, [allFarmerData, debouncedSearchText, currentPage, pageSize]);

  const fetchFarmerData = async (page = 1, search = "") => {
    console.log("Fetching farmer data...");
    try {
      setLoading(true);

      // Only use API for non-search or initial load
      const response = await farmerAPI.getAllFarmers(page, pageSize, search);

      // Laravel pagination returns data in a specific format
      setFarmerData(response.data); // The actual items are in the data property
      setTotalRecords(response.total); // Total number of records
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
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

  const handleDelete = async (farmerId) => {
    try {
      await farmerAPI.deleteFarmer(farmerId);

      // Refresh data after deletion
      fetchFarmerData(currentPage, searchText);
      showToast("Farmer deleted successfully", "success");
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting farmer:", err);
      showToast(`Failed to delete farmer: ${err.message}`, "error");
    }
  };

  const handleView = (record) => {
    setCurrentFarmer(record);
    setIsViewMode(true);
  };

  const handleEdit = (record) => {
    setCurrentFarmer(record);
    setIsEditMode(true);

    // Listen for the editFarmer event from ViewFarmer component
    window.addEventListener(
      "editFarmer",
      (event) => {
        setCurrentFarmer(event.detail);
        setIsEditMode(true);
      },
      { once: true }
    );
  };

  const handleCloseView = () => {
    setIsViewMode(false);
    setCurrentFarmer(null);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setCurrentFarmer(null);
    // Refresh data after editing
    fetchAllFarmerData(); // Refresh all data
    if (searchText) {
      filterFarmerData();
    } else {
      fetchFarmerData(currentPage);
    }
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
  if (isEditMode && currentFarmer) {
    return (
      <EditFarmer
        farmer={currentFarmer}
        onClose={handleCloseEdit}
        colors={colors}
      />
    );
  }

  // If in view mode, show a detailed view of the farmer
  if (isViewMode && currentFarmer) {
    return (
      <ViewFarmer
        farmer={currentFarmer}
        onClose={handleCloseView}
        colors={colors}
      />
    );
  }

  return (
    <div className="p-2 sm:p-3 bg-[#F5F7F9] min-h-screen max-w-full overflow-hidden">
      <div className="mb-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-start justify-between p-3 border-b sm:flex-row sm:items-center sm:p-4">
          <h4 className="m-0 mb-2 text-base font-semibold sm:text-lg sm:mb-0">
            Farmer Inventory
          </h4>
          <button
            onClick={() => (window.location.href = "/add-data")}
            className="flex items-center gap-1 bg-[#6A9C89] text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-opacity-90 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Add New Farmer
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex flex-col items-start justify-between w-full gap-2 mb-4 sm:flex-row sm:items-center sm:gap-0">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-[#6A9C89]" />
              </div>
              <input
                type="text"
                placeholder="Search farmers"
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
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#6A9C89]"></div>
              </div>
            )}

            <div className="-mx-3 overflow-x-auto sm:mx-0">
              <table className="min-w-full text-xs border divide-y divide-gray-200 sm:text-sm">
                <thead className="bg-gray-50">
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
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farmerData.map((farmer) => (
                    <tr key={farmer.farmer_id} className="hover:bg-gray-50">
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
                            onClick={() =>
                              setShowDeleteConfirm(farmer.farmer_id)
                            }
                            className="text-[#D32F2F] hover:text-opacity-70"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          {showDeleteConfirm === farmer.farmer_id && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30">
                              <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-xl sm:p-6">
                                <h3 className="mb-2 text-base font-medium sm:text-lg">
                                  Delete this farmer?
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
                                    onClick={() =>
                                      handleDelete(farmer.farmer_id)
                                    }
                                    className="px-3 py-1 sm:px-4 sm:py-2 bg-[#D32F2F] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-opacity-90"
                                  >
                                    Yes
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {farmerData.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-2 text-xs text-center text-gray-500 sm:px-6 sm:py-4 sm:text-sm"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
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
    </div>
  );
};

export default Inventory;
