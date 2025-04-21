"use client";

import { SearchIcon, FileDown, ChevronDownIcon } from "lucide-react";

const SearchAndFilters = ({
  searchText,
  handleSearchInputChange,
  showFilters,
  setShowFilters,
  barangayFilter,
  monthFilter,
  yearFilter,
  clearAllFilters,
  totalRecords,
  loading,
  allData,
  selectedDataType,
  handleExportToExcel,
  barangayOptions,
  monthOptions,
  yearOptions,
  handleFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-3.5 h-3.5 text-[#6A9C89]" />
          </div>
          <input
            type="text"
            placeholder={`Search ${selectedDataType}`}
            value={searchText}
            onChange={handleSearchInputChange}
            className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md w-full sm:w-[250px] focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent text-sm"
          />
          {searchText && (
            <button
              onClick={() => handleSearchInputChange({ target: { value: "" } })}
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
            onClick={handleExportToExcel}
            disabled={loading || allData.length === 0}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-[#5A8C79] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-3.5 h-3.5 mr-1" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="w-full p-2 mb-3 bg-white border border-gray-200 rounded-md shadow-sm">
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
                  onChange={(e) => handleFilterChange("month", e.target.value)}
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
                  onChange={(e) => handleFilterChange("year", e.target.value)}
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
                    onClick={() => handleFilterChange("barangay", "")}
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
                    onClick={() => handleFilterChange("month", "")}
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
                    onClick={() => handleFilterChange("year", "")}
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
    </div>
  );
};

export default SearchAndFilters;
