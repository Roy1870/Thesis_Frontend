// Fix for the cell merging issue in the exportDataToExcel function

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

// Helper function to fetch complete farmer data
const fetchCompleteFarmerData = async (farmerId) => {
  try {
    // Try to fetch complete farmer data from the API
    const response = await fetch(`/api/farmers/${farmerId}`);
    if (response.ok) {
      const farmerData = await response.json();
      console.log(`Fetched complete data for farmer ${farmerId}:`, farmerData);
      return farmerData;
    }
  } catch (error) {
    console.warn(
      `Could not fetch complete data for farmer ${farmerId}:`,
      error
    );
  }
  return null;
};

// Replace the entire exportDataToExcel function with this updated version
export const exportDataToExcel = async (
  dataType,
  data,
  barangayFilter,
  startMonthFilter,
  yearFilter,
  monthOptions,
  showToast,
  cropTypeFilter = "",
  endMonthFilter = "",
  filters = {}
) => {
  try {
    // Make sure ExcelJS is loaded
    if (!window.ExcelJS) {
      showToast("ExcelJS library not loaded. Please try again.", "error");
      return;
    }

    // Apply filters to data before export
    let filteredData = [...data];

    // Enrich farmer data if possible
    if (dataType === "crops" || dataType === "highValueCrops") {
      console.log("Attempting to enrich farmer data for export...");

      // Create a map of unique farmer IDs
      const farmerIds = new Set();
      data.forEach((item) => {
        if (item.farmer_id) {
          farmerIds.add(item.farmer_id);
        }
      });

      console.log(`Found ${farmerIds.size} unique farmers to enrich`);

      // Try to fetch complete data for each farmer
      const farmerDataMap = {};
      for (const farmerId of farmerIds) {
        const completeData = await fetchCompleteFarmerData(farmerId);
        if (completeData) {
          farmerDataMap[farmerId] = completeData;
        }
      }

      // Enrich the data with complete farmer information
      if (Object.keys(farmerDataMap).length > 0) {
        console.log(
          `Successfully enriched data for ${
            Object.keys(farmerDataMap).length
          } farmers`
        );

        data = data.map((item) => {
          if (item.farmer_id && farmerDataMap[item.farmer_id]) {
            const farmerData = farmerDataMap[item.farmer_id];
            return {
              ...item,
              name:
                farmerData.name ||
                `${farmerData.first_name || ""} ${
                  farmerData.last_name || ""
                }`.trim() ||
                item.name ||
                "",
              contact_number:
                farmerData.contact_number ||
                farmerData.phone ||
                item.contact_number ||
                "",
              facebook_email:
                farmerData.facebook_email ||
                farmerData.email ||
                item.facebook_email ||
                "",
              home_address:
                farmerData.home_address ||
                farmerData.address ||
                item.home_address ||
                "",
              farm_address: farmerData.farm_address || item.farm_address || "",
              farm_location_longitude:
                farmerData.farm_location_longitude ||
                farmerData.longitude ||
                item.farm_location_longitude ||
                "",
              farm_location_latitude:
                farmerData.farm_location_latitude ||
                farmerData.latitude ||
                item.farm_location_latitude ||
                "",
              market_outlet_location:
                farmerData.market_outlet_location ||
                item.market_outlet_location ||
                "",
              buyer_name: farmerData.buyer_name || item.buyer_name || "",
              association_organization:
                farmerData.association_organization ||
                farmerData.organization ||
                item.association_organization ||
                "",
            };
          }
          return item;
        });
      }
    }

    // Debug the data
    console.log("Excel export - initial data:", {
      dataType,
      totalRecords: data.length,
      sampleRecord: data.length > 0 ? data[0] : null,
      filters: {
        barangayFilter,
        startMonthFilter,
        endMonthFilter,
        yearFilter,
        cropTypeFilter,
      },
    });

    // Apply barangay filter if selected
    if (barangayFilter) {
      filteredData = filteredData.filter(
        (item) => item.barangay && item.barangay === barangayFilter
      );
    }

    // Apply crop type filter if selected
    if (cropTypeFilter && dataType === "crops") {
      filteredData = filteredData.filter(
        (item) => item.crop_type && item.crop_type === cropTypeFilter
      );
    }

    // Apply year and month filters if selected
    if (yearFilter || startMonthFilter) {
      filteredData = filteredData.filter((item) => {
        if (!item.created_at) return false;

        const date = new Date(item.created_at);
        const itemYear = date.getFullYear().toString();
        const itemMonth = (date.getMonth() + 1).toString(); // JavaScript months are 0-indexed

        // If year filter is specified, it must match
        if (yearFilter && itemYear !== yearFilter) {
          return false;
        }

        // If both start and end month are specified, check if item month is in range
        if (startMonthFilter && endMonthFilter) {
          const startMonth = Number.parseInt(startMonthFilter);
          const endMonth = Number.parseInt(endMonthFilter);
          const month = Number.parseInt(itemMonth);
          return month >= startMonth && month <= endMonth;
        }
        // If only start month is specified
        else if (startMonthFilter) {
          return itemMonth === startMonthFilter;
        }

        return true;
      });
    }

    // Debug the filtered data
    console.log("Excel export - filtered data:", {
      filteredCount: filteredData.length,
      sampleFilteredRecord: filteredData.length > 0 ? filteredData[0] : null,
    });

    // Create a new workbook
    const workbook = new window.ExcelJS.Workbook();

    // Get month name for title
    const monthName = startMonthFilter
      ? monthOptions.find((m) => m.value === startMonthFilter)?.label || ""
      : "";

    // Get end month name if specified
    const endMonthName = endMonthFilter
      ? monthOptions.find((m) => m.value === endMonthFilter)?.label || ""
      : "";

    // Create a combined month string based on data type
    let monthString = "";
    if (dataType === "highValueCrops") {
      // For high value crops, use only the "as of" month
      monthString = monthName;
    } else {
      // For other data types, use the range if both are specified
      monthString =
        startMonthFilter &&
        endMonthFilter &&
        startMonthFilter !== endMonthFilter
          ? `${monthName} - ${endMonthName}`
          : monthName;
    }

    // Get year for title
    const year = yearFilter || new Date().getFullYear();

    // Create worksheet based on data type
    switch (dataType) {
      case "rice":
        await createRiceReport(
          workbook,
          filteredData,
          barangayFilter,
          monthString,
          year
        );
        break;
      case "crops":
        // For crops, check if it's a specific crop type that has a specialized template
        if (cropTypeFilter && cropTypeFilter.toLowerCase() === "banana") {
          // Import and use the banana template
          const { createBananaReport } = await import(
            "../../exporting/banana-template"
          );
          console.log("Using banana template with data:", {
            recordCount: filteredData.length,
            sampleRecord: filteredData.length > 0 ? filteredData[0] : null,
          });
          await createBananaReport(
            workbook,
            filteredData,
            barangayFilter,
            monthString,
            year,
            safeMergeCells
          );
        } else if (
          cropTypeFilter &&
          (cropTypeFilter.toLowerCase() === "legume" ||
            cropTypeFilter.toLowerCase() === "legumes" ||
            cropTypeFilter.toLowerCase().includes("peanut") ||
            cropTypeFilter.toLowerCase().includes("mungbean") ||
            cropTypeFilter.toLowerCase().includes("soybean"))
        ) {
          // Import and use the legumes template
          const { createLegumesReport } = await import(
            "../../exporting/legumes-template"
          );
          console.log("Using legumes template with data:", {
            recordCount: filteredData.length,
            sampleRecord: filteredData.length > 0 ? filteredData[0] : null,
          });
          await createLegumesReport(
            workbook,
            filteredData,
            barangayFilter,
            monthString,
            year,
            safeMergeCells
          );
        } else if (
          cropTypeFilter &&
          (cropTypeFilter.toLowerCase() === "spice" ||
            cropTypeFilter.toLowerCase() === "spices" ||
            cropTypeFilter.toLowerCase().includes("ginger") ||
            cropTypeFilter.toLowerCase().includes("onion") ||
            cropTypeFilter.toLowerCase().includes("pepper") ||
            cropTypeFilter.toLowerCase().includes("turmeric"))
        ) {
          // Import and use the spices template
          const { createSpicesReport } = await import(
            "../../exporting/spices-template"
          );
          console.log("Using spices template with data:", {
            recordCount: filteredData.length,
            sampleRecord: filteredData.length > 0 ? filteredData[0] : null,
          });
          await createSpicesReport(
            workbook,
            filteredData,
            barangayFilter,
            monthString,
            year,
            safeMergeCells
          );
        } else if (
          cropTypeFilter &&
          (cropTypeFilter.toLowerCase() === "vegetable" ||
            cropTypeFilter.toLowerCase().includes("eggplant") ||
            cropTypeFilter.toLowerCase().includes("ampalaya") ||
            cropTypeFilter.toLowerCase().includes("okra") ||
            cropTypeFilter.toLowerCase().includes("sitao") ||
            cropTypeFilter.toLowerCase().includes("squash") ||
            cropTypeFilter.toLowerCase().includes("tomato"))
        ) {
          // Import and use the vegetable template
          const { createVegetableReport } = await import(
            "../../exporting/vegetable-template"
          );
          console.log("Using vegetable template with data:", {
            recordCount: filteredData.length,
            sampleRecord: filteredData.length > 0 ? filteredData[0] : null,
          });
          await createVegetableReport(
            workbook,
            filteredData,
            barangayFilter,
            monthString,
            year,
            safeMergeCells
          );
        }
      case "highValueCrops":
        // Import and use the high value crops template
        const { createHighValueCropsReport } = await import(
          "../../exporting/high-value-crops-template"
        );

        // Get the high value crop type from the filters
        const highValueCropType = filters?.highValueCropType || "";

        console.log("Using high value crops template with data:", {
          recordCount: filteredData.length,
          sampleRecord:
            filteredData.length > 0
              ? JSON.stringify(filteredData[0]).substring(0, 500)
              : null,
          highValueCropType: highValueCropType,
          filters: JSON.stringify(filters),
        });

        // Add highValueCropType to each data item
        filteredData = filteredData.map((item) => ({
          ...item,
          highValueCropType: highValueCropType,
        }));

        await createHighValueCropsReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year,
          safeMergeCells
        );
        break;

      default:
        // Default export for other data types
        const worksheet = workbook.addWorksheet("Data");

        // Add headers based on first item keys
        if (filteredData.length > 0) {
          const headers = Object.keys(filteredData[0]);
          worksheet.addRow(headers);

          // Add data rows
          filteredData.forEach((item) => {
            const row = [];
            headers.forEach((header) => {
              row.push(item[header] || "");
            });
            worksheet.addRow(row);
          });
        }
        break;
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile(
      buffer,
      `${dataType}_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    showToast("Export completed successfully", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast(`Export failed: ${error.message}`, "error");
  }
};

// Add a helper function to download files
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

// Helper function to create Rice Report
const createRiceReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year
) => {
  // Create separate worksheets for irrigated and rainfed
  const irrigatedData = data.filter(
    (item) => item.area_type?.toLowerCase() === "irrigated"
  );
  const rainfedData = data.filter(
    (item) => item.area_type?.toLowerCase() === "rainfed"
  );

  // Create irrigated worksheet if data exists
  if (irrigatedData.length > 0) {
    await createRiceWorksheet(
      workbook,
      irrigatedData,
      "Irrigated",
      barangayFilter,
      monthName,
      year
    );
  }

  // Create rainfed worksheet if data exists
  if (rainfedData.length > 0) {
    await createRiceWorksheet(
      workbook,
      rainfedData,
      "Rainfed",
      barangayFilter,
      monthName,
      year
    );
  }

  // If no data in either category, create empty templates
  if (irrigatedData.length === 0 && rainfedData.length === 0) {
    await createRiceWorksheet(
      workbook,
      [],
      "Irrigated",
      barangayFilter,
      monthName,
      year
    );
    await createRiceWorksheet(
      workbook,
      [],
      "Rainfed",
      barangayFilter,
      monthName,
      year
    );
  }
};

// Helper function to create Rice Worksheet (for both irrigated and rainfed)
const createRiceWorksheet = async (
  workbook,
  data,
  areaType,
  barangayFilter,
  monthName,
  year
) => {
  const worksheet = workbook.addWorksheet(`Rice ${areaType}`);

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // Barangay
    { width: 10 }, // Area Hrvstd (ha) - Hybrid
    { width: 10 }, // Production - Hybrid
    { width: 10 }, // Ave Yield (mt/ha) - Hybrid
    { width: 10 }, // Area Hrvstd (ha) - Certified
    { width: 10 }, // Production - Certified
    { width: 10 }, // Ave Yield (mt/ha) - Certified
    { width: 10 }, // Area Hrvstd (ha) - Good Seeds
    { width: 10 }, // Production - Good Seeds
    { width: 10 }, // Ave Yield (mt/ha) - Good Seeds
    { width: 10 }, // Area Hrvstd (ha) - Total
    { width: 10 }, // Production - Total
    { width: 10 }, // Ave Yield (mt/ha) - Total
  ];

  // Add title and header
  safeMergeCells(worksheet, "A1:N1");
  worksheet.getCell("A1").value = "RICE PROGRAM";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  safeMergeCells(worksheet, "A2:N2");
  worksheet.getCell("A2").value = "HARVESTING ACCOMPLISHMENT REPORT";
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A2").font = { bold: true, size: 12 };

  safeMergeCells(worksheet, "A3:N3");
  worksheet.getCell("A3").value = "WET OR DRY SEASON";
  worksheet.getCell("A3").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A3").font = { bold: true, size: 12 };

  safeMergeCells(worksheet, "A4:N4");
  worksheet.getCell("A4").value = `For the month of ${monthName} ${year}`;
  worksheet.getCell("A4").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A4").font = { bold: true, size: 12 };

  // Add region, province, municipality info
  worksheet.getCell("A6").value = "Region: Caraga";
  worksheet.getCell("A7").value = "Province: Agusan del Norte";
  worksheet.getCell("A8").value = "Municipality: Butuan City";

  // Add area type header
  safeMergeCells(worksheet, "A10:N10");
  worksheet.getCell("A10").value = areaType.toUpperCase();
  worksheet.getCell("A10").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A10").font = { bold: true };
  worksheet.getCell("A10").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "D3E0F0" }, // Light blue background
  };

  // Add column headers
  safeMergeCells(worksheet, "A11:A12");
  worksheet.getCell("A11").value = "No.";
  worksheet.getCell("A11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A11").font = { bold: true };

  safeMergeCells(worksheet, "B11:B12");
  worksheet.getCell("B11").value = "Barangay";
  worksheet.getCell("B11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("B11").font = { bold: true };

  // Hybrid Seeds
  safeMergeCells(worksheet, "C11:E11");
  worksheet.getCell("C11").value = "Hybrid Seeds";
  worksheet.getCell("C11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("C11").font = { bold: true };

  worksheet.getCell("C12").value = "Area Hrvstd (ha)";
  worksheet.getCell("C12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("C12").font = { bold: true };

  worksheet.getCell("D12").value = "Production";
  worksheet.getCell("D12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("D12").font = { bold: true };

  worksheet.getCell("E12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("E12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("E12").font = { bold: true };

  // Certified Seeds
  safeMergeCells(worksheet, "F11:H11");
  worksheet.getCell("F11").value = "Certified Seeds";
  worksheet.getCell("F11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("F11").font = { bold: true };

  worksheet.getCell("F12").value = "Area Hrvstd (ha)";
  worksheet.getCell("F12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("F12").font = { bold: true };

  worksheet.getCell("G12").value = "Production";
  worksheet.getCell("G12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("G12").font = { bold: true };

  worksheet.getCell("H12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("H12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("H12").font = { bold: true };

  // Good Seeds
  safeMergeCells(worksheet, "I11:K11");
  worksheet.getCell("I11").value = "Good Seeds";
  worksheet.getCell("I11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("I11").font = { bold: true };

  worksheet.getCell("I12").value = "Area Hrvstd (ha)";
  worksheet.getCell("I12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("I12").font = { bold: true };

  worksheet.getCell("J12").value = "Production";
  worksheet.getCell("J12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("J12").font = { bold: true };

  worksheet.getCell("K12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("K12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("K12").font = { bold: true };

  // Total
  safeMergeCells(worksheet, "L11:N11");
  worksheet.getCell("L11").value = "Total";
  worksheet.getCell("L11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L11").font = { bold: true };

  worksheet.getCell("L12").value = "Area Hrvstd (ha)";
  worksheet.getCell("L12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L12").font = { bold: true };

  worksheet.getCell("M12").value = "Production";
  worksheet.getCell("M12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("M12").font = { bold: true };

  worksheet.getCell("N12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("N12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("N12").font = { bold: true };

  // Style all header cells
  for (let col = 1; col <= 14; col++) {
    [
      "A11",
      "B11",
      "C11",
      "D11",
      "E11",
      "F11",
      "G11",
      "H11",
      "I11",
      "J11",
      "K11",
      "L11",
      "M11",
      "N11",
      "A12",
      "B12",
      "C12",
      "D12",
      "E12",
      "F12",
      "G12",
      "H12",
      "I12",
      "J12",
      "K12",
      "L12",
      "M12",
      "N12",
    ].forEach((cell) => {
      worksheet.getCell(cell).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D3E0F0" }, // Light blue background
      };
    });
  }

  // Group data by barangay and seed type
  const barangayData = {};

  // If specific barangay is filtered, only include that one
  const barangays = barangayFilter
    ? [barangayFilter]
    : [...new Set(data.map((item) => item.barangay).filter(Boolean))].sort();

  // Initialize data structure for each barangay
  barangays.forEach((barangay) => {
    barangayData[barangay] = {
      hybrid: { area: 0, production: 0 },
      certified: { area: 0, production: 0 },
      good: { area: 0, production: 0 },
      total: { area: 0, production: 0 },
    };
  });

  // Populate data
  data.forEach((item) => {
    if (!item.barangay || !barangays.includes(item.barangay)) return;

    const seedType = item.seed_type?.toLowerCase() || "unknown";
    const area = Number.parseFloat(item.area_harvested) || 0;
    const production = Number.parseFloat(item.production) || 0;

    if (seedType.includes("hybrid")) {
      barangayData[item.barangay].hybrid.area += area;
      barangayData[item.barangay].hybrid.production += production;
    } else if (seedType.includes("certified")) {
      barangayData[item.barangay].certified.area += area;
      barangayData[item.barangay].certified.production += production;
    } else {
      barangayData[item.barangay].good.area += area;
      barangayData[item.barangay].good.production += production;
    }

    // Add to totals
    barangayData[item.barangay].total.area += area;
    barangayData[item.barangay].total.production += production;
  });

  // Add data rows
  let rowIndex = 13;
  let counter = 1;

  barangays.forEach((barangay) => {
    const data = barangayData[barangay];

    // Calculate yields
    const hybridYield =
      data.hybrid.area > 0 ? data.hybrid.production / data.hybrid.area : 0;
    const certifiedYield =
      data.certified.area > 0
        ? data.certified.production / data.certified.area
        : 0;
    const goodYield =
      data.good.area > 0 ? data.good.production / data.good.area : 0;
    const totalYield =
      data.total.area > 0 ? data.total.production / data.total.area : 0;

    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = barangay;

    // Hybrid data
    worksheet.getCell(`C${rowIndex}`).value =
      data.hybrid.area > 0 ? data.hybrid.area.toFixed(2) : "-";
    worksheet.getCell(`D${rowIndex}`).value =
      data.hybrid.production > 0 ? data.hybrid.production.toFixed(2) : "-";
    worksheet.getCell(`E${rowIndex}`).value =
      hybridYield > 0 ? hybridYield.toFixed(2) : "#DIV/0!";

    // Certified data
    worksheet.getCell(`F${rowIndex}`).value =
      data.certified.area > 0 ? data.certified.area.toFixed(2) : "-";
    worksheet.getCell(`G${rowIndex}`).value =
      data.certified.production > 0
        ? data.certified.production.toFixed(2)
        : "-";
    worksheet.getCell(`H${rowIndex}`).value =
      certifiedYield > 0 ? certifiedYield.toFixed(2) : "#DIV/0!";

    // Good seeds data
    worksheet.getCell(`I${rowIndex}`).value =
      data.good.area > 0 ? data.good.area.toFixed(2) : "-";
    worksheet.getCell(`J${rowIndex}`).value =
      data.good.production > 0 ? data.good.production.toFixed(2) : "-";
    worksheet.getCell(`K${rowIndex}`).value =
      goodYield > 0 ? goodYield.toFixed(2) : "#DIV/0!";

    // Total data
    worksheet.getCell(`L${rowIndex}`).value =
      data.total.area > 0 ? data.total.area.toFixed(2) : "-";
    worksheet.getCell(`M${rowIndex}`).value =
      data.total.production > 0 ? data.total.production.toFixed(2) : "-";
    worksheet.getCell(`N${rowIndex}`).value =
      totalYield > 0 ? totalYield.toFixed(2) : "#DIV/0!";

    // Add borders to all cells in the row
    for (let col = 1; col <= 14; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }

    rowIndex++;
    counter++;
  });

  // Add empty rows to reach 30 rows
  while (counter <= 30) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 14; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }

    rowIndex++;
    counter++;
  }

  // Add TOTAL row
  worksheet.getCell(`A${rowIndex}`).value = "TOTAL";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };

  // Calculate totals for all columns
  let totalHybridArea = 0;
  let totalHybridProduction = 0;
  let totalCertifiedArea = 0;
  let totalCertifiedProduction = 0;
  let totalGoodArea = 0;
  let totalGoodProduction = 0;
  let grandTotalArea = 0;
  let grandTotalProduction = 0;

  Object.values(barangayData).forEach((data) => {
    totalHybridArea += data.hybrid.area;
    totalHybridProduction += data.hybrid.production;
    totalCertifiedArea += data.certified.area;
    totalCertifiedProduction += data.certified.production;
    totalGoodArea += data.good.area;
    totalGoodProduction += data.good.production;
    grandTotalArea += data.total.area;
    grandTotalProduction += data.total.production;
  });

  // Calculate yields for totals
  const totalHybridYield =
    totalHybridArea > 0 ? totalHybridProduction / totalHybridArea : 0;
  const totalCertifiedYield =
    totalCertifiedArea > 0 ? totalCertifiedProduction / totalCertifiedArea : 0;
  const totalGoodYield =
    totalGoodArea > 0 ? totalGoodProduction / totalGoodArea : 0;
  const grandTotalYield =
    grandTotalArea > 0 ? grandTotalProduction / grandTotalArea : 0;

  // Hybrid totals
  worksheet.getCell(`C${rowIndex}`).value =
    totalHybridArea > 0 ? totalHybridArea.toFixed(2) : "-";
  worksheet.getCell(`D${rowIndex}`).value =
    totalHybridProduction > 0 ? totalHybridProduction.toFixed(2) : "-";
  worksheet.getCell(`E${rowIndex}`).value =
    totalHybridYield > 0 ? totalHybridYield.toFixed(2) : "#DIV/0!";

  // Certified totals
  worksheet.getCell(`F${rowIndex}`).value =
    totalCertifiedArea > 0 ? totalCertifiedArea.toFixed(2) : "-";
  worksheet.getCell(`G${rowIndex}`).value =
    totalCertifiedProduction > 0 ? totalCertifiedProduction.toFixed(2) : "-";
  worksheet.getCell(`H${rowIndex}`).value =
    totalCertifiedYield > 0 ? totalCertifiedYield.toFixed(2) : "#DIV/0!";

  // Good seeds totals
  worksheet.getCell(`I${rowIndex}`).value =
    totalGoodArea > 0 ? totalGoodArea.toFixed(2) : "-";
  worksheet.getCell(`J${rowIndex}`).value =
    totalGoodProduction > 0 ? totalGoodProduction.toFixed(2) : "-";
  worksheet.getCell(`K${rowIndex}`).value =
    totalGoodYield > 0 ? totalGoodYield.toFixed(2) : "#DIV/0!";

  // Grand totals
  worksheet.getCell(`L${rowIndex}`).value =
    grandTotalArea > 0 ? grandTotalArea.toFixed(2) : "-";
  worksheet.getCell(`M${rowIndex}`).value =
    grandTotalProduction > 0 ? grandTotalProduction.toFixed(2) : "-";
  worksheet.getCell(`N${rowIndex}`).value =
    grandTotalYield > 0 ? grandTotalYield.toFixed(2) : "#DIV/0!";

  // Add borders and styling to total row
  for (let col = 1; col <= 14; col++) {
    const cell = worksheet.getCell(rowIndex, col);
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true };
  }

  // Add signature section
  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "Prepared by:";
  worksheet.getCell(`F${rowIndex}`).value = "Reviewed by:";
  worksheet.getCell(`K${rowIndex}`).value = "Noted by:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "YN KRYZL M. MONTANA";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`F${rowIndex}`).value = "JOAN B. DELA TORRE";
  worksheet.getCell(`F${rowIndex}`).font = { bold: true };
  worksheet.getCell(`K${rowIndex}`).value = "PIERRE ANTHONY D. JOVEN";
  worksheet.getCell(`K${rowIndex}`).font = { bold: true };

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "AT";
  worksheet.getCell(`F${rowIndex}`).value = "Rice Program Coordinator";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};
