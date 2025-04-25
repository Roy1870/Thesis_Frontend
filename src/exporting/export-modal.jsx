"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  dataType,
  filters,
  barangayOptions,
  cropTypeOptions,
  allData,
}) {
  // State for filter selections
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Add a new state for high value crop type selection
  const [selectedHighValueCropType, setSelectedHighValueCropType] =
    useState("");

  // Add a new state for area type selection (for rice)
  const [selectedAreaType, setSelectedAreaType] = useState("");

  // Add a new state for cultured species selection (for operators)
  const [selectedCulturedSpecies, setSelectedCulturedSpecies] = useState("");

  // Add a new state for operational status selection (for operators)
  const [selectedOperationalStatus, setSelectedOperationalStatus] =
    useState("");

  // Add endMonth state and update the getDateRangeText function
  // Add this after the other state declarations:
  const [endMonth, setEndMonth] = useState("");

  // Reset filters when modal opens or filters prop changes
  useEffect(() => {
    if (isOpen) {
      // Only set these values if they're not already set
      // This prevents resetting selections when other filters change
      if (!selectedBarangay) setSelectedBarangay(filters.barangay || "");
      if (!selectedCropType) setSelectedCropType(filters.cropType || "");
      if (!startMonth) setStartMonth(filters.month || "");
      if (!selectedYear)
        setSelectedYear(filters.year || new Date().getFullYear().toString());

      // Always set includeFilters to true when opening
    }
  }, [isOpen, filters]);

  // Add a separate effect to handle modal closing
  useEffect(() => {
    if (!isOpen) {
      // Reset all filters when the modal closes
      // This ensures a fresh start next time it opens
      setSelectedBarangay("");
      setSelectedCropType("");
      setStartMonth("");
      setEndMonth(""); // Reset end month too
      setSelectedHighValueCropType(""); // Reset high value crop type too
      setSelectedAreaType(""); // Reset area type too
      setSelectedCulturedSpecies(""); // Reset cultured species too
      setSelectedOperationalStatus(""); // Reset operational status too
    }
  }, [isOpen]);

  // Extract unique cultured species from operator data
  const culturedSpeciesOptions = useMemo(() => {
    if (dataType !== "operators" || !allData || allData.length === 0) {
      return [];
    }

    return [
      ...new Set(allData.map((item) => item.cultured_species).filter(Boolean)),
    ].sort();
  }, [dataType, allData]);

  // Extract unique animal types from livestock data
  const animalTypeOptions = useMemo(() => {
    if (dataType !== "livestock" || !allData || allData.length === 0) {
      return [];
    }

    return [
      ...new Set(allData.map((item) => item.animal_type).filter(Boolean)),
    ].sort();
  }, [dataType, allData]);

  // Dynamically compute available years based on data
  const availableYears = useMemo(() => {
    if (!allData || allData.length === 0) {
      const currentYear = new Date().getFullYear();
      return [currentYear.toString()];
    }

    // Extract unique years from data
    const years = [
      ...new Set(
        allData
          .map((item) =>
            item.created_at ? new Date(item.created_at).getFullYear() : null
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a); // Sort descending (newest first)

    // If no years found, use current year
    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      return [currentYear.toString()];
    }

    return years.map((year) => year.toString());
  }, [allData]);

  // Dynamically compute available barangays based on filtered data
  const availableBarangays = useMemo(() => {
    if (!allData || allData.length === 0) {
      return barangayOptions;
    }

    let filteredData = [...allData];

    // Apply crop type filter if selected
    if (selectedCropType && dataType === "crops") {
      filteredData = filteredData.filter(
        (item) => item.crop_type === selectedCropType
      );
    }

    // Apply cultured species filter if selected
    if (selectedCulturedSpecies && dataType === "operators") {
      filteredData = filteredData.filter(
        (item) => item.cultured_species === selectedCulturedSpecies
      );
    }

    // Apply year filter if selected
    if (selectedYear) {
      filteredData = filteredData.filter((item) => {
        if (!item.created_at) return false;
        const itemYear = new Date(item.created_at).getFullYear().toString();
        return itemYear === selectedYear;
      });
    }

    // Extract unique barangays from filtered data
    return [
      ...new Set(filteredData.map((item) => item.barangay).filter(Boolean)),
    ].sort();
  }, [
    allData,
    selectedCropType,
    selectedCulturedSpecies,
    selectedYear,
    barangayOptions,
    dataType,
  ]);

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (year, month) => {
    // month is 1-indexed in our UI but Date expects 0-indexed month
    return new Date(year, month, 0).getDate();
  };

  // Get record count for selected filters
  const filteredRecordCount = useMemo(() => {
    if (!allData || allData.length === 0) {
      return 0;
    }

    if (!true) {
      return allData.length;
    }

    let filtered = [...allData];

    // Apply crop type filter
    if (selectedCropType && dataType === "crops") {
      filtered = filtered.filter((item) => item.crop_type === selectedCropType);
    }

    // Apply cultured species filter for operators
    if (selectedCulturedSpecies && dataType === "operators") {
      filtered = filtered.filter(
        (item) => item.cultured_species === selectedCulturedSpecies
      );
    }

    // Apply operational status filter for operators
    if (selectedOperationalStatus && dataType === "operators") {
      filtered = filtered.filter((item) => {
        const status = (item.operational_status || "").toLowerCase();
        if (selectedOperationalStatus === "operational") {
          return status.includes("operational") || status.includes("active");
        } else if (selectedOperationalStatus === "non-operational") {
          return (
            status.includes("non-operational") ||
            status.includes("inactive") ||
            status.includes("non operational")
          );
        }
        return true;
      });
    }

    // Apply barangay filter
    if (selectedBarangay) {
      filtered = filtered.filter((item) => item.barangay === selectedBarangay);
    }

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter((item) => {
        if (!item.created_at) return false;
        const itemYear = new Date(item.created_at).getFullYear().toString();
        return itemYear === selectedYear;
      });
    }

    // Apply area type filter for rice
    if (dataType === "rice" && selectedAreaType) {
      filtered = filtered.filter(
        (item) =>
          item.area_type &&
          item.area_type.toLowerCase() === selectedAreaType.toLowerCase()
      );
    }

    // Apply month filter based on data type
    if (dataType === "highValueCrops") {
      // For high value crops, use January as start month and the selected month as end month
      if (startMonth) {
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          const itemMonth = (
            new Date(item.created_at).getMonth() + 1
          ).toString();
          const month = Number.parseInt(itemMonth);
          // Include data from January (1) up to and including the selected month
          return month >= 1 && month <= Number.parseInt(startMonth);
        });
      }
    } else if (dataType === "rice") {
      // For rice, use single month filter
      if (startMonth) {
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          const itemMonth = (
            new Date(item.created_at).getMonth() + 1
          ).toString();
          return itemMonth === startMonth;
        });
      }
    } else if (dataType !== "operators" && dataType !== "livestock") {
      // For regular crops (but not operators or livestock), use start/end month range
      if (startMonth && endMonth) {
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          const itemMonth = (
            new Date(item.created_at).getMonth() + 1
          ).toString();
          const month = Number.parseInt(itemMonth);
          // Include data within the month range
          return (
            month >= Number.parseInt(startMonth) &&
            month <= Number.parseInt(endMonth)
          );
        });
      } else if (startMonth) {
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          const itemMonth = (
            new Date(item.created_at).getMonth() + 1
          ).toString();
          return itemMonth === startMonth;
        });
      } else if (endMonth) {
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          const itemMonth = (
            new Date(item.created_at).getMonth() + 1
          ).toString();
          const month = Number.parseInt(itemMonth);
          // Include all data up to and including the end month
          return month <= Number.parseInt(endMonth);
        });
      }
    }

    return filtered.length;
  }, [
    allData,
    selectedCropType,
    selectedCulturedSpecies,
    selectedOperationalStatus,
    selectedBarangay,
    selectedYear,
    startMonth,
    endMonth,
    dataType,
    selectedAreaType,
  ]);

  // Format month for display
  const getMonthName = (monthNum) => {
    if (!monthNum) return "";
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const index = Number.parseInt(monthNum) - 1;
    return index >= 0 && index < 12 ? months[index] : "";
  };

  // Generate date range text
  const getDateRangeText = () => {
    if (!startMonth && !endMonth) return "";

    if (dataType === "rice") {
      return `${getMonthName(startMonth)} ${selectedYear}`;
    } else if (dataType === "highValueCrops") {
      return `As of ${getMonthName(startMonth)} ${selectedYear}`;
    } else if (startMonth && endMonth) {
      return `${getMonthName(startMonth)} - ${getMonthName(
        endMonth
      )} ${selectedYear}`;
    } else if (startMonth) {
      return `From ${getMonthName(startMonth)} ${selectedYear}`;
    } else if (endMonth) {
      return `Until ${getMonthName(endMonth)} ${selectedYear}`;
    }

    return "";
  };

  const handleExport = () => {
    // Take a snapshot of the data at export time
    console.log("Exporting data:", allData.length, "records");

    // Get the filtered data based on current selections
    let dataToExport = [...allData];

    if (true) {
      // Apply crop type filter
      if (selectedCropType && dataType === "crops") {
        dataToExport = dataToExport.filter(
          (item) => item.crop_type === selectedCropType
        );
      }

      // Apply barangay filter
      if (selectedBarangay) {
        dataToExport = dataToExport.filter(
          (item) => item.barangay === selectedBarangay
        );
      }

      // Apply year filter
      if (selectedYear) {
        dataToExport = dataToExport.filter((item) => {
          if (!item.created_at) return false;
          const itemYear = new Date(item.created_at).getFullYear().toString();
          return itemYear === selectedYear;
        });
      }

      // Apply area type filter for rice
      if (dataType === "rice" && selectedAreaType) {
        dataToExport = dataToExport.filter(
          (item) =>
            item.area_type &&
            item.area_type.toLowerCase() === selectedAreaType.toLowerCase()
        );
      }

      // Apply month filter based on data type
      if (dataType === "highValueCrops") {
        // For high value crops, use January as start month and the selected month as end month
        if (startMonth) {
          dataToExport = dataToExport.filter((item) => {
            if (!item.created_at) return false;
            const itemMonth = (
              new Date(item.created_at).getMonth() + 1
            ).toString();
            const month = Number.parseInt(itemMonth);
            // Include data from January (1) up to and including the selected month
            return month >= 1 && month <= Number.parseInt(startMonth);
          });
          console.log(
            `${dataType} - filtering from January to month:`,
            startMonth,
            getMonthName(startMonth)
          );
        }
      } else if (dataType === "rice") {
        // For rice, use single month filter
        if (startMonth) {
          dataToExport = dataToExport.filter((item) => {
            if (!item.created_at) return false;
            const itemMonth = (
              new Date(item.created_at).getMonth() + 1
            ).toString();
            return itemMonth === startMonth;
          });
        }
      } else if (dataType !== "operators" && dataType !== "livestock") {
        // For regular crops (but not operators or livestock), use start/end month range
        if (startMonth && endMonth) {
          dataToExport = dataToExport.filter((item) => {
            if (!item.created_at) return false;
            const itemMonth = (
              new Date(item.created_at).getMonth() + 1
            ).toString();
            const month = Number.parseInt(itemMonth);
            // Include data within the month range
            return (
              month >= Number.parseInt(startMonth) &&
              month <= Number.parseInt(endMonth)
            );
          });
        } else if (startMonth) {
          dataToExport = dataToExport.filter((item) => {
            if (!item.created_at) return false;
            const itemMonth = (
              new Date(item.created_at).getMonth() + 1
            ).toString();
            return itemMonth === startMonth;
          });
        } else if (endMonth) {
          dataToExport = dataToExport.filter((item) => {
            if (!item.created_at) return false;
            const itemMonth = (
              new Date(item.created_at).getMonth() + 1
            ).toString();
            const month = Number.parseInt(itemMonth);
            // Include all data up to and including the end month
            return month <= Number.parseInt(endMonth);
          });
        }
      }
    }

    // Calculate start and end dates for the export
    let startDate = null;
    let endDate = null;

    if (selectedYear) {
      const year = Number.parseInt(selectedYear);

      if (dataType === "rice") {
        // For rice, use the selected month
        if (startMonth) {
          const month = Number.parseInt(startMonth);
          startDate = new Date(year, month - 1, 1); // First day of month
          const lastDay = getLastDayOfMonth(year, month);
          endDate = new Date(year, month - 1, lastDay); // Last day of month
        }
      } else if (dataType === "highValueCrops") {
        // For high value crops, start date is January 1st
        startDate = new Date(year, 0, 1); // January 1st (month is 0-indexed in Date)

        if (startMonth) {
          // End date is the last day of the selected month
          const month = Number.parseInt(startMonth);
          const lastDay = getLastDayOfMonth(year, month);
          endDate = new Date(year, month - 1, lastDay); // month is 0-indexed in Date
        } else {
          // If no month selected, use December 31st
          endDate = new Date(year, 11, 31); // December 31st
        }
      } else if (dataType === "operators" || dataType === "livestock") {
        // For operators and livestock, use the entire year (no month filtering)
        startDate = new Date(year, 0, 1); // January 1st
        endDate = new Date(year, 11, 31); // December 31st
      } else {
        // For regular crops
        if (startMonth) {
          const startMonthNum = Number.parseInt(startMonth);
          startDate = new Date(year, startMonthNum - 1, 1); // First day of start month
        }

        if (endMonth) {
          const endMonthNum = Number.parseInt(endMonth);
          const lastDay = getLastDayOfMonth(year, endMonthNum);
          endDate = new Date(year, endMonthNum - 1, lastDay); // Last day of end month
        } else if (startMonth) {
          // If only start month is provided, end date is the last day of that month
          const startMonthNum = Number.parseInt(startMonth);
          const lastDay = getLastDayOfMonth(year, startMonthNum);
          endDate = new Date(year, startMonthNum - 1, lastDay);
        }
      }
    }

    // Format dates for logging
    const formatDate = (date) => {
      if (!date) return "not set";
      return date.toISOString().split("T")[0]; // YYYY-MM-DD format
    };

    console.log("Date range for export:", {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });

    // Create a new filters object with the selected values
    let exportFilters = {
      barangay: true ? selectedBarangay : "",
      cropType: true ? selectedCropType : "",
      startMonth: true
        ? dataType === "highValueCrops"
          ? "1"
          : dataType === "operators" || dataType === "livestock"
          ? "" // No month filtering for operators or livestock
          : startMonth
        : "",
      endMonth: true
        ? dataType === "highValueCrops"
          ? startMonth
          : dataType === "operators" || dataType === "livestock"
          ? "" // No month filtering for operators or livestock
          : dataType === "rice"
          ? startMonth // For rice, use the same month for both start and end
          : endMonth
        : "",
      month:
        true && dataType !== "operators" && dataType !== "livestock"
          ? startMonth
          : "", // Keep for backward compatibility, but not for operators or livestock
      year: true ? selectedYear : "",
      isHighValueCrop: dataType === "highValueCrops",
      highValueCropType:
        true && dataType === "highValueCrops" ? selectedHighValueCropType : "",
      // Add the month name for high value crops and rice
      monthName:
        true &&
        (dataType === "highValueCrops" || dataType === "rice") &&
        startMonth
          ? getMonthName(startMonth)
          : "",
      // Add formatted dates with proper end dates (last day of month)
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      // Add day information to ensure we're using the last day of the month
      startDay: startDate ? 1 : null, // Always first day of month
      endDay: endDate ? endDate.getDate() : null, // Last day of the month
      // Add area type for rice
      areaType: true && dataType === "rice" ? selectedAreaType : "",
    };

    // For livestock, only use barangay and year filters
    if (dataType === "livestock") {
      exportFilters = {
        ...exportFilters,
        barangay: true ? selectedBarangay : "",
        year: true ? selectedYear : "",
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      };
    }

    console.log("Exporting data count:", dataToExport.length);

    // Pass the filtered data directly to the export function
    onExport("excel", true, exportFilters, dataToExport);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export {dataType}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">
            Export your {dataType} data to Excel.
          </p>

          <div className="p-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Filters</h4>
            </div>

            <div className="mt-3 space-y-3">
              {dataType === "crops" && (
                <div>
                  <label
                    htmlFor="crop-type"
                    className="block mb-1 text-xs font-medium text-gray-700"
                  >
                    Crop Type
                  </label>
                  <select
                    id="crop-type"
                    value={selectedCropType}
                    onChange={(e) => {
                      const newCropType = e.target.value;
                      console.log("Crop type changed to:", newCropType);
                      setSelectedCropType(newCropType);
                    }}
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
              )}

              {dataType === "highValueCrops" && (
                <div>
                  <label
                    htmlFor="high-value-crop-type"
                    className="block mb-1 text-xs font-medium text-gray-700"
                  >
                    High Value Crop Type
                  </label>
                  <select
                    id="high-value-crop-type"
                    value={selectedHighValueCropType}
                    onChange={(e) =>
                      setSelectedHighValueCropType(e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                  >
                    <option value="">Default (High Value Crop)</option>
                    <option value="CACAO">Cacao</option>
                    <option value="COFFEE">Coffee</option>
                    <option value="MANGO">Mango</option>
                    <option value="RUBBER">Rubber</option>
                    <option value="OIL PALM">Oil Palm</option>
                    <option value="DURIAN">Durian</option>
                    <option value="COCONUT">Coconut</option>
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="year"
                  className="block mb-1 text-xs font-medium text-gray-700"
                >
                  Year
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="barangay"
                  className="block mb-1 text-xs font-medium text-gray-700"
                >
                  Barangay
                </label>
                <select
                  id="barangay"
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                >
                  <option value="">Select Barangay</option>
                  {availableBarangays.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Type Filter - Only for Rice */}
              {dataType === "rice" && (
                <div>
                  <label
                    htmlFor="area-type"
                    className="block mb-1 text-xs font-medium text-gray-700"
                  >
                    Area Type
                  </label>
                  <select
                    id="area-type"
                    value={selectedAreaType}
                    onChange={(e) => setSelectedAreaType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                  >
                    <option value="">All (Both Irrigated & Rainfed)</option>
                    <option value="irrigated">Irrigated Only</option>
                    <option value="rainfed">Rainfed Only</option>
                  </select>
                </div>
              )}

              {/* Month filters - Only show for highValueCrops and rice, not for operators or livestock */}
              {dataType === "highValueCrops" ? (
                <div>
                  <label
                    htmlFor="as-of-month"
                    className="block mb-1 text-xs font-medium text-gray-700"
                  >
                    Month (As of)
                  </label>
                  <select
                    id="as-of-month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month.toString()}>
                          {getMonthName(month.toString())}
                        </option>
                      )
                    )}
                  </select>

                  {startMonth && (
                    <div className="p-2 mt-2 text-xs text-center text-gray-700 bg-gray-100 rounded">
                      <span className="font-medium">Export period:</span>{" "}
                      January 1 - {getMonthName(startMonth)}{" "}
                      {getLastDayOfMonth(
                        Number.parseInt(selectedYear),
                        Number.parseInt(startMonth)
                      )}
                      , {selectedYear}
                    </div>
                  )}
                </div>
              ) : dataType === "rice" ? (
                <div>
                  <label
                    htmlFor="rice-month"
                    className="block mb-1 text-xs font-medium text-gray-700"
                  >
                    Month
                  </label>
                  <select
                    id="rice-month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month.toString()}>
                          {getMonthName(month.toString())}
                        </option>
                      )
                    )}
                  </select>

                  {startMonth && (
                    <div className="p-2 mt-2 text-xs text-center text-gray-700 bg-gray-100 rounded">
                      <span className="font-medium">Export month:</span>{" "}
                      {getMonthName(startMonth)} {selectedYear}
                    </div>
                  )}
                </div>
              ) : dataType === "operators" || dataType === "livestock" ? (
                // No month filters for operators or livestock
                <div className="p-2 mt-2 text-xs text-center text-gray-700 bg-gray-100 rounded">
                  <span className="font-medium">Export period:</span> Full year{" "}
                  {selectedYear}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="start-month"
                        className="block mb-1 text-xs font-medium text-gray-700"
                      >
                        Start Month
                      </label>
                      <select
                        id="start-month"
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                      >
                        <option value="">Select Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month.toString()}>
                              {getMonthName(month.toString())}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="end-month"
                        className="block mb-1 text-xs font-medium text-gray-700"
                      >
                        End Month
                      </label>
                      <select
                        id="end-month"
                        value={endMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6A9C89] focus:border-[#6A9C89]"
                      >
                        <option value="">Select Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month.toString()}>
                              {getMonthName(month.toString())}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {(startMonth || endMonth) && (
                    <div className="p-2 mt-2 text-xs text-center text-gray-700 bg-gray-100 rounded">
                      <span className="font-medium">Export period:</span>{" "}
                      {startMonth && (
                        <>
                          {getMonthName(startMonth)} 1
                          {endMonth
                            ? " - "
                            : ` - ${getMonthName(
                                startMonth
                              )} ${getLastDayOfMonth(
                                Number.parseInt(selectedYear),
                                Number.parseInt(startMonth)
                              )}`}
                        </>
                      )}
                      {endMonth && (
                        <>
                          {!startMonth && "January 1 - "}
                          {getMonthName(endMonth)}{" "}
                          {getLastDayOfMonth(
                            Number.parseInt(selectedYear),
                            Number.parseInt(endMonth)
                          )}
                        </>
                      )}
                      , {selectedYear}
                    </div>
                  )}
                </>
              )}

              {/* Record count preview */}
              <div className="p-2 mt-2 text-xs text-center text-gray-700 bg-gray-100 rounded">
                <span className="font-medium">Records to export:</span>{" "}
                {filteredRecordCount}
              </div>
            </div>
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
            className="px-4 py-2 text-sm font-medium text-white bg-[#5A8C79] rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={filteredRecordCount === 0}
          >
            {filteredRecordCount === 0
              ? "No Data to Export"
              : "Export to Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}
