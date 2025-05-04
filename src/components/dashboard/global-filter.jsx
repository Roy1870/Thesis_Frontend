"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function GlobalFilter({
  availableYears,
  selectedYear,
  setSelectedYear,
  onFilterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.closest(".year-filter-container")) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle year selection
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setIsOpen(false);
    onFilterChange({ year, month: "All" });
  };

  // Reset filter
  const handleReset = () => {
    setSelectedYear("All");
    onFilterChange({ year: "All", month: "All" });
  };

  // Check if filter is applied
  const isFiltered = selectedYear !== "All";

  return (
    <div className="relative mb-6 year-filter-container">
      <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">Year:</span>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center px-3 py-1.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span>{selectedYear === "All" ? "All Years" : selectedYear}</span>
              <ChevronDown size={16} className="ml-1.5 text-gray-500" />
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-36 animate-fadeIn">
                <div className="py-1 overflow-auto max-h-60">
                  <button
                    onClick={() => handleYearChange("All")}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      selectedYear === "All"
                        ? "bg-[#6A9C89]/10 text-[#6A9C89] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    All Years
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        selectedYear === year
                          ? "bg-[#6A9C89]/10 text-[#6A9C89] font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700"
          >
            <X size={14} className="mr-1" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
