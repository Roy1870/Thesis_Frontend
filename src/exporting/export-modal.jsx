"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  dataType,
  filters,
  barangayOptions,
  cropTypeOptions,
}) {
  const [exportFormat, setExportFormat] = useState("excel");
  const [includeFilters, setIncludeFilters] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState(
    filters.barangay || ""
  );
  const [selectedCropType, setSelectedCropType] = useState(
    filters.cropType || ""
  );

  // Update local state when filters prop changes
  useEffect(() => {
    setSelectedBarangay(filters.barangay || "");
    setSelectedCropType(filters.cropType || "");
  }, [filters]);

  if (!isOpen) return null;

  const handleExport = () => {
    // Create a new filters object with the selected values
    const exportFilters = includeFilters
      ? {
          barangay: selectedBarangay,
          cropType: selectedCropType,
          month: filters.month,
          year: filters.year,
        }
      : { barangay: "", cropType: "", month: "", year: "" };

    onExport(exportFormat, includeFilters, exportFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export {dataType}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">
            Export your {dataType} data in the selected format.
          </p>

          <div className="p-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="mb-2 text-sm font-medium">Export Format</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={() => setExportFormat("excel")}
                  className="w-4 h-4 text-[#6A9C89] border-gray-300 focus:ring-[#6A9C89]"
                />
                <span className="text-sm">Excel (.xlsx)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="w-4 h-4 text-[#6A9C89] border-gray-300 focus:ring-[#6A9C89]"
                />
                <span className="text-sm">CSV (.csv)</span>
              </label>
            </div>
          </div>

          <div className="p-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Filters</h4>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeFilters}
                  onChange={() => setIncludeFilters(!includeFilters)}
                  className="w-4 h-4 text-[#6A9C89] border-gray-300 rounded focus:ring-[#6A9C89]"
                />
                <span className="text-sm">Include filters</span>
              </label>
            </div>

            {includeFilters && (
              <div className="mt-3 space-y-3">
                {dataType === "crops" && (
                  <>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-700">
                        Barangay
                      </label>
                      <select
                        value={selectedBarangay}
                        onChange={(e) => setSelectedBarangay(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                      >
                        <option value="">Select Barangay</option>
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
                        value={selectedCropType}
                        onChange={(e) => setSelectedCropType(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                      >
                        <option value="">Select Crop Type</option>
                        {cropTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {filters.month && (
                  <p className="text-xs text-gray-500">
                    Month: {filters.month}
                  </p>
                )}
                {filters.year && (
                  <p className="text-xs text-gray-500">Year: {filters.year}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-opacity-90"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
