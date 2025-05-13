"use client";

import { useState, useMemo } from "react";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BarangaySummary({ rawData, categories, loading }) {
  const [sortField, setSortField] = useState("totalProduction");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCategories, setVisibleCategories] = useState(
    categories ? categories.map((cat) => cat.id) : []
  );
  const [isExporting, setIsExporting] = useState(false);

  // Process data to get barangay summary
  const barangaySummaryData = useMemo(() => {
    if (!rawData || loading) return [];

    // Create a map to store data by barangay
    const barangayMap = new Map();

    // Helper function to add production to barangay data
    const addToBarangay = (barangay, category, value) => {
      if (!barangay || barangay === "Unknown" || isNaN(value) || value <= 0)
        return;

      if (!barangayMap.has(barangay)) {
        // Initialize barangay data with all categories set to 0
        const barangayData = {
          name: barangay,
          totalProduction: 0,
        };

        // Initialize all category values to 0
        categories.forEach((cat) => {
          barangayData[cat.id] = 0;
        });

        barangayMap.set(barangay, barangayData);
      }

      // Update the category value and total
      const barangayData = barangayMap.get(barangay);
      barangayData[category] = (barangayData[category] || 0) + value;
      barangayData.totalProduction += value;
    };

    // Process rice data
    rawData.rice.forEach((rice) => {
      const production = Number.parseFloat(
        rice.production || rice.yield_amount || 0
      );
      addToBarangay(rice.barangay, "rice", production);
    });

    // Process crops data
    rawData.crops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );

      // Determine category based on crop type
      const cropType = (crop.crop_type || "").toLowerCase();
      const cropValue = (crop.crop_value || "").toLowerCase();

      let category = "highValueCrops"; // Default category

      if (cropType.includes("banana") || cropValue.includes("banana")) {
        category = "banana";
      } else if (
        cropType.includes("vegetable") ||
        cropValue.includes("vegetable") ||
        cropType.includes("tomato") ||
        cropValue.includes("tomato") ||
        cropType.includes("eggplant") ||
        cropValue.includes("eggplant") ||
        cropType.includes("cabbage") ||
        cropValue.includes("cabbage")
      ) {
        category = "vegetables";
      } else if (
        cropType.includes("legume") ||
        cropValue.includes("legume") ||
        cropType.includes("bean") ||
        cropValue.includes("bean")
      ) {
        category = "legumes";
      } else if (cropType.includes("spice") || cropValue.includes("spice")) {
        category = "spices";
      }

      addToBarangay(crop.barangay, category, production);
    });

    // Process high value crops
    rawData.highValueCrops.forEach((crop) => {
      const production = Number.parseFloat(
        crop.yield_amount || crop.production || crop.quantity || 0
      );
      addToBarangay(crop.barangay, "highValueCrops", production);
    });

    // Process livestock data
    rawData.livestock.forEach((item) => {
      const quantity = Number.parseFloat(item.quantity || 0);
      addToBarangay(item.barangay, "livestock", quantity);
    });

    // Process fish data from operators
    rawData.operators.forEach((operator) => {
      if (operator.cultured_species || operator.category === "Fish") {
        const production = Number.parseFloat(
          operator.production_kg || operator.production_volume || 0
        );
        addToBarangay(operator.barangay, "fish", production);
      }
    });

    // Calculate highest and lowest categories for each barangay
    const processedData = Array.from(barangayMap.values()).map((barangay) => {
      // Find highest category
      let highestCategory = null;
      let highestValue = Number.NEGATIVE_INFINITY;
      let lowestCategory = null;
      let lowestValue = Number.POSITIVE_INFINITY;

      categories.forEach((cat) => {
        const value = barangay[cat.id] || 0;

        // Update highest
        if (value > highestValue) {
          highestValue = value;
          highestCategory = cat.id;
        }

        // Update lowest (only consider values > 0)
        if (value > 0 && value < lowestValue) {
          lowestValue = value;
          lowestCategory = cat.id;
        }
      });

      return {
        ...barangay,
        highestCategory,
        highestValue,
        lowestCategory,
        lowestValue,
      };
    });

    return processedData;
  }, [rawData, categories, loading]);

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    if (!barangaySummaryData.length) return [];

    // Filter by search term
    let filteredData = barangaySummaryData;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = barangaySummaryData.filter((item) =>
        item.name.toLowerCase().includes(term)
      );
    }

    // When sorting by highest/lowest category, only show that category
    if (sortField === "highestCategory" || sortField === "lowestCategory") {
      filteredData = filteredData.map((barangay) => {
        // Create a new object with all categories set to 0
        const newBarangay = {
          ...barangay,
        };

        // Reset all category values to 0
        categories.forEach((cat) => {
          newBarangay[cat.id] = 0;
        });

        // Set only the relevant category to its value
        if (sortField === "highestCategory" && barangay.highestCategory) {
          newBarangay[barangay.highestCategory] = barangay.highestValue;
        } else if (sortField === "lowestCategory" && barangay.lowestCategory) {
          newBarangay[barangay.lowestCategory] = barangay.lowestValue;
        }

        return newBarangay;
      });
    }

    // Sort data
    return [...filteredData].sort((a, b) => {
      if (sortField === "highestCategory") {
        // Sort by highest category value
        const aValue = a.highestValue || 0;
        const bValue = b.highestValue || 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (sortField === "lowestCategory") {
        // Sort by lowest category value (excluding zeros)
        const aValue = a.lowestValue || Number.POSITIVE_INFINITY;
        const bValue = b.lowestValue || Number.POSITIVE_INFINITY;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        // Standard sorting by specific field
        const aValue = a[sortField] || 0;
        const bValue = b[sortField] || 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }, [barangaySummaryData, sortField, sortDirection, searchTerm]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Toggle category visibility
  const toggleCategory = (categoryId) => {
    setVisibleCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Get chart colors for categories
  const getCategoryColor = (categoryId) => {
    const colors = {
      rice: "#4CAF50", // green
      livestock: "#9C27B0", // purple
      banana: "#FFC107", // yellow
      vegetables: "#FF9800", // orange
      legumes: "#26A69A", // teal
      spices: "#F44336", // red
      fish: "#2196F3", // blue
      highValueCrops: "#8BC34A", // light green
    };
    return colors[categoryId] || "#9E9E9E"; // default to grey
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter out entries with zero values
      const nonZeroEntries = payload.filter((entry) => entry.value > 0);

      return (
        <div className="p-3 bg-white border border-gray-200 rounded-md shadow-md">
          <p className="font-semibold">{label}</p>
          {nonZeroEntries.length > 0 ? (
            <div className="mt-2">
              {nonZeroEntries.map((entry, index) => (
                <div
                  key={`tooltip-${index}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">
                    {entry.name}: {formatNumber(entry.value)}
                  </span>
                </div>
              ))}

              {/* Show highest/lowest category info only when not already sorting by them */}
              {!["highestCategory", "lowestCategory"].includes(sortField) &&
                sortedAndFilteredData.find((item) => item.name === label) && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const barangay = sortedAndFilteredData.find(
                          (item) => item.name === label
                        );
                        if (!barangay) return null;

                        return (
                          <>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-medium">Highest:</span>
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getCategoryColor(
                                    barangay.highestCategory
                                  ),
                                }}
                              ></div>
                              <span>
                                {getCategoryName(barangay.highestCategory)} (
                                {formatNumber(barangay.highestValue)})
                              </span>
                            </div>
                            {barangay.lowestCategory && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-medium">Lowest:</span>
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: getCategoryColor(
                                      barangay.lowestCategory
                                    ),
                                  }}
                                ></div>
                                <span>
                                  {getCategoryName(barangay.lowestCategory)} (
                                  {formatNumber(barangay.lowestValue)})
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No production data</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper function to safely merge cells
  const safeMergeCells = (worksheet, range) => {
    try {
      // Check if any of the cells in the range are already merged
      let alreadyMerged = false;
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (
          rowNumber >= range.split(":")[0].replace(/[A-Z]/g, "") &&
          rowNumber <= range.split(":")[1].replace(/[A-Z]/g, "")
        ) {
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (cell.isMerged) {
              alreadyMerged = true;
            }
          });
        }
      });

      // Only merge if not already merged
      if (!alreadyMerged) {
        worksheet.mergeCells(range);
      }
    } catch (error) {
      console.warn(`Could not merge cells ${range}: ${error.message}`);
    }
  };

  // Function to download file
  const downloadFile = (data, filename, mimeType) => {
    // Create a Blob from the buffer
    const blob = new Blob([data], { type: mimeType });

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Function to export data to Excel
  const exportDataToExcel = async () => {
    try {
      setIsExporting(true);

      // Make sure ExcelJS is loaded
      if (!window.ExcelJS) {
        console.error("ExcelJS library not loaded");
        alert("ExcelJS library not loaded. Please try again.");
        setIsExporting(false);
        return;
      }

      // Create a new workbook
      const workbook = new window.ExcelJS.Workbook();

      // Create main summary worksheet
      const summarySheet = workbook.addWorksheet("Barangay Summary");

      // Set column widths
      summarySheet.columns = [
        { width: 5 }, // No.
        { width: 30 }, // Barangay
        { width: 15 }, // Total Production
        ...categories
          .filter((cat) => visibleCategories.includes(cat.id))
          .map(() => ({ width: 15 })), // Category columns
        { width: 20 }, // Highest Category
        { width: 15 }, // Highest Value
        { width: 20 }, // Lowest Category
        { width: 15 }, // Lowest Value
      ];

      // Add title and header
      safeMergeCells(summarySheet, "A1:Z1");
      const titleCell = summarySheet.getCell("A1");
      titleCell.value = "BARANGAY PRODUCTION SUMMARY";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { bold: true, size: 16 };

      safeMergeCells(summarySheet, "A2:Z2");
      const dateCell = summarySheet.getCell("A2");
      dateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      dateCell.alignment = { horizontal: "center", vertical: "middle" };
      dateCell.font = { size: 12, italic: true };

      // Add a blank row
      summarySheet.addRow([]);

      // Add column headers
      const headerRow = summarySheet.addRow([
        "No.",
        "Barangay",
        "Total Production",
        ...categories
          .filter((cat) => visibleCategories.includes(cat.id))
          .map((cat) => cat.name),
        "Highest Category",
        "Highest Value",
        "Lowest Category",
        "Lowest Value",
      ]);

      // Style header row
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Color category headers based on their category color
        if (colNumber > 3 && colNumber <= 3 + visibleCategories.length) {
          const categoryIndex = colNumber - 4;
          const visibleCategoryIds = categories
            .filter((cat) => visibleCategories.includes(cat.id))
            .map((cat) => cat.id);

          if (categoryIndex >= 0 && categoryIndex < visibleCategoryIds.length) {
            const categoryId = visibleCategoryIds[categoryIndex];
            const color = getCategoryColor(categoryId);

            // Convert hex color to ARGB (remove # and add alpha channel)
            const argbColor = color.replace("#", "");

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: argbColor },
            };

            // Use white text for dark backgrounds
            const isDarkColor = [
              "#9C27B0",
              "#26A69A",
              "#F44336",
              "#2196F3",
            ].includes(color);
            if (isDarkColor) {
              cell.font = { bold: true, color: { argb: "FFFFFF" } };
            }
          }
        } else {
          // Default header background
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4CAF50" }, // Green
          };
          cell.font = { bold: true, color: { argb: "FFFFFF" } };
        }
      });

      // Add data rows
      let rowIndex = 5;
      sortedAndFilteredData.forEach((barangay, index) => {
        const rowData = [
          index + 1, // No.
          barangay.name, // Barangay
          barangay.totalProduction, // Total Production
        ];

        // Add category values
        categories
          .filter((cat) => visibleCategories.includes(cat.id))
          .forEach((cat) => {
            rowData.push(barangay[cat.id] || 0);
          });

        // Add highest/lowest category data
        rowData.push(
          barangay.highestCategory
            ? getCategoryName(barangay.highestCategory)
            : "",
          barangay.highestValue || 0,
          barangay.lowestCategory
            ? getCategoryName(barangay.lowestCategory)
            : "",
          barangay.lowestValue || 0
        );

        const row = summarySheet.addRow(rowData);

        // Style data row
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Format numbers with 2 decimal places
          if (colNumber > 2) {
            cell.numFmt = "#,##0.00";
          }

          // Align text
          if (colNumber === 2) {
            cell.alignment = { horizontal: "left" };
          } else {
            cell.alignment = { horizontal: "center" };
          }

          // Alternate row colors
          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F9F9F9" },
            };
          }
        });

        rowIndex++;
      });

      // Add total row
      const totalRow = summarySheet.addRow([
        "", // No.
        "TOTAL", // Barangay
        sortedAndFilteredData.reduce(
          (sum, item) => sum + (item.totalProduction || 0),
          0
        ), // Total Production
      ]);

      // Calculate category totals
      categories
        .filter((cat) => visibleCategories.includes(cat.id))
        .forEach((cat) => {
          const categoryTotal = sortedAndFilteredData.reduce(
            (sum, item) => sum + (item[cat.id] || 0),
            0
          );
          totalRow.getCell(totalRow.cellCount + 1).value = categoryTotal;
        });

      // Style total row
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "double" },
          right: { style: "thin" },
        };

        if (colNumber > 2) {
          cell.numFmt = "#,##0.00";
        }

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E8F5E9" }, // Light green
        };
      });

      // Add a category breakdown sheet
      const categorySheet = workbook.addWorksheet("Category Breakdown");

      // Set column widths
      categorySheet.columns = [
        { width: 5 }, // No.
        { width: 30 }, // Category
        { width: 20 }, // Total Production
        { width: 20 }, // % of Total
        { width: 20 }, // Top Barangay
        { width: 15 }, // Top Value
      ];

      // Add title
      safeMergeCells(categorySheet, "A1:F1");
      const catTitleCell = categorySheet.getCell("A1");
      catTitleCell.value = "PRODUCTION BY CATEGORY";
      catTitleCell.alignment = { horizontal: "center", vertical: "middle" };
      catTitleCell.font = { bold: true, size: 16 };

      // Add date
      safeMergeCells(categorySheet, "A2:F2");
      const catDateCell = categorySheet.getCell("A2");
      catDateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      catDateCell.alignment = { horizontal: "center", vertical: "middle" };
      catDateCell.font = { size: 12, italic: true };

      // Add a blank row
      categorySheet.addRow([]);

      // Add column headers
      const catHeaderRow = categorySheet.addRow([
        "No.",
        "Category",
        "Total Production",
        "% of Total",
        "Top Barangay",
        "Top Value",
      ]);

      // Style header row
      catHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4CAF50" }, // Green
        };
      });

      // Calculate total production across all categories
      const totalProduction = sortedAndFilteredData.reduce(
        (sum, item) => sum + (item.totalProduction || 0),
        0
      );

      // Add category data
      categories.forEach((category, index) => {
        // Calculate category total
        const categoryTotal = sortedAndFilteredData.reduce(
          (sum, item) => sum + (item[category.id] || 0),
          0
        );
        const percentOfTotal =
          totalProduction > 0 ? (categoryTotal / totalProduction) * 100 : 0;

        // Find top barangay for this category
        let topBarangay = "";
        let topValue = 0;

        sortedAndFilteredData.forEach((barangay) => {
          const value = barangay[category.id] || 0;
          if (value > topValue) {
            topValue = value;
            topBarangay = barangay.name;
          }
        });

        // Add row
        const catRow = categorySheet.addRow([
          index + 1,
          category.name,
          categoryTotal,
          percentOfTotal,
          topBarangay,
          topValue,
        ]);

        // Style row
        catRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Format numbers
          if (colNumber === 3 || colNumber === 6) {
            cell.numFmt = "#,##0.00";
          } else if (colNumber === 4) {
            cell.numFmt = "0.00%";
          }

          // Align text
          cell.alignment = { horizontal: "center" };
          if (colNumber === 2) {
            cell.alignment = { horizontal: "left" };
          }

          // Add category color
          if (colNumber === 2) {
            const color = getCategoryColor(category.id);
            const argbColor = color.replace("#", "");

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: argbColor },
            };

            // Use white text for dark backgrounds
            const isDarkColor = [
              "#9C27B0",
              "#26A69A",
              "#F44336",
              "#2196F3",
            ].includes(color);
            if (isDarkColor) {
              cell.font = { color: { argb: "FFFFFF" } };
            }
          }

          // Alternate row colors
          if (index % 2 === 1 && colNumber !== 2) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F9F9F9" },
            };
          }
        });
      });

      // Add top barangays sheet
      const topBarangaysSheet = workbook.addWorksheet("Top Barangays");

      // Set column widths
      topBarangaysSheet.columns = [
        { width: 5 }, // Rank
        { width: 30 }, // Barangay
        { width: 20 }, // Total Production
        { width: 20 }, // % of Total
        { width: 20 }, // Top Category
        { width: 15 }, // Top Value
      ];

      // Add title
      safeMergeCells(topBarangaysSheet, "A1:F1");
      const topTitleCell = topBarangaysSheet.getCell("A1");
      topTitleCell.value = "TOP PRODUCING BARANGAYS";
      topTitleCell.alignment = { horizontal: "center", vertical: "middle" };
      topTitleCell.font = { bold: true, size: 16 };

      // Add date
      safeMergeCells(topBarangaysSheet, "A2:F2");
      const topDateCell = topBarangaysSheet.getCell("A2");
      topDateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
      topDateCell.alignment = { horizontal: "center", vertical: "middle" };
      topDateCell.font = { size: 12, italic: true };

      // Add a blank row
      topBarangaysSheet.addRow([]);

      // Add column headers
      const topHeaderRow = topBarangaysSheet.addRow([
        "Rank",
        "Barangay",
        "Total Production",
        "% of Total",
        "Top Category",
        "Top Value",
      ]);

      // Style header row
      topHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4CAF50" }, // Green
        };
      });

      // Sort barangays by total production
      const sortedBarangays = [...sortedAndFilteredData].sort(
        (a, b) => b.totalProduction - a.totalProduction
      );

      // Add top barangay data (top 15 or all if less than 15)
      const topCount = Math.min(15, sortedBarangays.length);
      for (let i = 0; i < topCount; i++) {
        const barangay = sortedBarangays[i];
        const percentOfTotal =
          totalProduction > 0
            ? (barangay.totalProduction / totalProduction) * 100
            : 0;

        // Add row
        const topRow = topBarangaysSheet.addRow([
          i + 1,
          barangay.name,
          barangay.totalProduction,
          percentOfTotal,
          barangay.highestCategory
            ? getCategoryName(barangay.highestCategory)
            : "",
          barangay.highestValue || 0,
        ]);

        // Style row
        topRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Format numbers
          if (colNumber === 3 || colNumber === 6) {
            cell.numFmt = "#,##0.00";
          } else if (colNumber === 4) {
            cell.numFmt = "0.00%";
          }

          // Align text
          cell.alignment = { horizontal: "center" };
          if (colNumber === 2) {
            cell.alignment = { horizontal: "left" };
          }

          // Highlight top 3
          if (i < 3) {
            cell.font = { bold: true };

            if (i === 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD700" }, // Gold
              };
            } else if (i === 1) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "C0C0C0" }, // Silver
              };
            } else if (i === 2) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "CD7F32" }, // Bronze
              };
            }
          } else if (i % 2 === 1) {
            // Alternate row colors
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F9F9F9" },
            };
          }
        });
      }

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();

      // Download the file
      downloadFile(
        buffer,
        `barangay-production-summary-${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      setIsExporting(false);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message}`);
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full h-8 mb-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full bg-gray-100 rounded h-80 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Barangay Production Summary
        </h2>
        <p className="text-gray-600">
          Agricultural production by barangay across all categories
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row">
        {/* Search input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="totalProduction">Total Production</option>
            <option value="highestCategory">Highest Category</option>
            <option value="lowestCategory">Lowest Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {sortDirection === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Download button */}
        <button
          onClick={exportDataToExcel}
          disabled={isExporting}
          className={`flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md ${
            isExporting ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
          title="Download as Excel"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? "Exporting..." : "Excel"}</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              visibleCategories.includes(category.id)
                ? "bg-white text-gray-800 border border-gray-300 shadow-sm"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getCategoryColor(category.id) }}
            ></span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Sorting mode description */}
      {(sortField === "highestCategory" || sortField === "lowestCategory") && (
        <div className="p-3 mb-4 text-sm text-blue-700 rounded-md bg-blue-50">
          <span>
            {sortField === "highestCategory"
              ? "Showing only the highest producing category for each barangay"
              : "Showing only the lowest producing category for each barangay (excluding zero values)"}
          </span>
        </div>
      )}

      {/* Chart */}
      {sortedAndFilteredData.length > 0 ? (
        <div
          className="mt-4"
          style={{
            height: `${Math.max(500, sortedAndFilteredData.length * 30)}px`,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedAndFilteredData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) => (
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    <span>{value}</span>
                  </span>
                )}
              />
              {categories
                .filter((cat) => visibleCategories.includes(cat.id))
                .map((category) => (
                  <Bar
                    key={category.id}
                    dataKey={category.id}
                    name={category.name}
                    stackId="a"
                    fill={getCategoryColor(category.id)}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg h-80 bg-gray-50">
          <p className="text-gray-500">
            {searchTerm
              ? "No barangays match your search"
              : "No data available"}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {sortedAndFilteredData.length} of {barangaySummaryData.length}{" "}
        barangays
      </div>
    </div>
  );
}
