"use client";

import { useState, useEffect } from "react";
import { Filter, Check } from "lucide-react";

export default function GlobalFilter({
  availableYears,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  onFilterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const months = [
    "All",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target.closest(".filter-container")) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle filter changes
  const handleYearChange = (year) => {
    setSelectedYear(year);
    onFilterChange({ year, month: selectedMonth });
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    onFilterChange({ year: selectedYear, month });
  };

  // Reset filters
  const handleReset = () => {
    setSelectedYear("All");
    setSelectedMonth("All");
    onFilterChange({ year: "All", month: "All" });
  };

  // Apply filters
  const handleApply = () => {
    setIsOpen(false);
    onFilterChange({ year: selectedYear, month: selectedMonth });
  };

  // Check if filters are applied
  const isFiltered = selectedYear !== "All" || selectedMonth !== "All";

  return (
    <div className="relative mb-6 filter-container">
      <div className="p-5 bg-white border border-gray-100 shadow-md rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-[#6A9C89]/10 rounded-full">
              <Filter size={18} className="text-[#6A9C89]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Filter Dashboard
              </h3>
              <p className="text-sm text-gray-500">
                {isFiltered
                  ? `Showing data for ${
                      selectedYear !== "All"
                        ? `year ${selectedYear}`
                        : "all years"
                    }${
                      selectedMonth !== "All" ? `, month ${selectedMonth}` : ""
                    }`
                  : "Showing all data (no filters applied)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
            >
              {isOpen ? "Hide Filters" : "Show Filters"}
            </button>

            {isFiltered && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-100 rounded-lg bg-red-50 hover:bg-red-100"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 animate-fadeIn">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select Year
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  <button
                    onClick={() => handleYearChange("All")}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedYear === "All"
                        ? "bg-[#6A9C89] text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    All Years
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                        selectedYear === year
                          ? "bg-[#6A9C89] text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {selectedYear === year && (
                        <Check size={12} className="mr-1" />
                      )}
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select Month
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => handleMonthChange(month)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                        selectedMonth === month
                          ? "bg-[#6A9C89] text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {selectedMonth === month && (
                        <Check size={12} className="mr-1" />
                      )}
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-[#6A9C89] rounded-md hover:bg-[#5A8C79] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
