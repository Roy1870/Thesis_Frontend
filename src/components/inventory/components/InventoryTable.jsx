"use client";

import { useCallback } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import Pagination from "./Pagination";
import { Wheat, Coffee, Sprout, MilkIcon, Users } from "lucide-react";

const parseProductionData = (data) => {
  try {
    if (typeof data.production_data === "string") {
      return JSON.parse(data.production_data);
    }
    return data.production_data || {};
  } catch (e) {
    console.error("Error parsing production_data:", e);
    return {};
  }
};

const InventoryTable = ({
  loading,
  data,
  selectedDataType,
  searchText,
  searchedColumn,
  handleView,
  handleEdit,
  setShowDeleteConfirm,
  currentPage,
  setCurrentPage,
  pageSize,
  totalRecords,
}) => {
  // Render table columns based on selected data type
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

  // Render table rows based on selected data type
  const renderTableRows = useCallback(() => {
    if (data.length === 0) {
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

    // Render rows based on data type
    switch (selectedDataType) {
      case "farmers":
        return data.map((farmer) => (
          <tr
            key={farmer.farmer_id || Math.random().toString()}
            className="hover:bg-gray-50"
          >
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-none">
                  {farmer.name}
                </span>
              </div>
            </td>
            <td className="px-2 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">
                  {farmer.contact_number || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 md:table-cell sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px] xl:max-w-none">
                  {farmer.facebook_email || "N/A"}
                </span>
              </div>
            </td>
            <td className="hidden px-2 py-2 lg:table-cell sm:px-6 sm:py-3 whitespace-nowrap">
              <div className="flex items-center">
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
    searchText,
    searchedColumn,
    selectedDataType,
    setShowDeleteConfirm,
  ]);

  return (
    <div className="relative">
      {loading ? (
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
                    <div key={i} className="flex-1 px-2 py-2 sm:px-6 sm:py-3">
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
      ) : (
        <div>
          <div className="-mx-3 overflow-x-auto sm:mx-0">
            <table className="min-w-full text-xs border divide-y divide-gray-200 sm:text-sm">
              <thead className="bg-gray-50">{renderTableColumns()}</thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableRows()}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
