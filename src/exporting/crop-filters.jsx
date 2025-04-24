"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Filter } from "lucide-react";

export default function CropFilters({
  barangayOptions,
  cropTypeOptions,
  onFilterChange,
  currentFilters,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [barangay, setBarangay] = useState(currentFilters.barangay || "");
  const [cropType, setCropType] = useState(currentFilters.cropType || "");

  // Update local state when props change
  useEffect(() => {
    setBarangay(currentFilters.barangay || "");
    setCropType(currentFilters.cropType || "");
  }, [currentFilters]);

  const handleApplyFilters = () => {
    onFilterChange({ barangay, cropType });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setBarangay("");
    setCropType("");
    onFilterChange({ barangay: "", cropType: "" });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute right-0 z-10 w-64 p-3 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">
                Barangay
              </label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
              >
                <option value="">All Barangays</option>
                {barangayOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
              >
                <option value="">All Crop Types</option>
                {cropTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-2 py-1 text-xs text-white bg-[#5A8C79] rounded-md hover:bg-opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display active filters */}
      {(barangay || cropType) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {barangay && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
              Barangay: {barangay}
              <button
                onClick={() => {
                  setBarangay("");
                  onFilterChange({ barangay: "", cropType });
                }}
                className="ml-1 text-[#6A9C89] hover:text-[#5A8C79] focus:outline-none"
              >
                ×
              </button>
            </span>
          )}
          {cropType && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F5E4] text-[#6A9C89] rounded-md">
              Crop Type: {cropType}
              <button
                onClick={() => {
                  setCropType("");
                  onFilterChange({ barangay, cropType: "" });
                }}
                className="ml-1 text-[#6A9C89] hover:text-[#5A8C79] focus:outline-none"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
