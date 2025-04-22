// Replace the entire exportDataToExcel function with this updated version
export const exportDataToExcel = async (
  dataType,
  data,
  barangayFilter,
  monthFilter,
  yearFilter,
  monthOptions,
  showToast
) => {
  try {
    // Make sure ExcelJS is loaded
    if (!window.ExcelJS) {
      showToast("ExcelJS library not loaded. Please try again.", "error");
      return;
    }

    // Apply filters to data before export
    let filteredData = [...data];

    // Apply barangay filter if selected
    if (barangayFilter) {
      filteredData = filteredData.filter(
        (item) => item.barangay && item.barangay === barangayFilter
      );
    }

    // Apply year and month filters if selected
    if (yearFilter || monthFilter) {
      filteredData = filteredData.filter((item) => {
        if (!item.created_at) return false;

        const date = new Date(item.created_at);
        const itemYear = date.getFullYear().toString();
        const itemMonth = (date.getMonth() + 1).toString(); // JavaScript months are 0-indexed

        // If both year and month are specified, both must match
        if (yearFilter && monthFilter) {
          return itemYear === yearFilter && itemMonth === monthFilter;
        }
        // If only year is specified
        else if (yearFilter) {
          return itemYear === yearFilter;
        }
        // If only month is specified
        else if (monthFilter) {
          return itemMonth === monthFilter;
        }

        return true;
      });
    }

    // Create a new workbook
    const workbook = new window.ExcelJS.Workbook();

    // Get month name for title
    const monthName = monthFilter
      ? monthOptions.find((m) => m.value === monthFilter)?.label || ""
      : "";

    // Get year for title
    const year = yearFilter || new Date().getFullYear();

    // Create worksheet based on data type
    switch (dataType) {
      case "rice":
        await createRiceReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year
        );
        break;
      case "crops":
        await createCropsReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year
        );
        break;
      case "highValueCrops":
        await createHighValueCropsReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year
        );
        break;
      case "livestock":
        await createLivestockReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year
        );
        break;
      case "operators":
        await createFishpondReport(
          workbook,
          filteredData,
          barangayFilter,
          monthName,
          year
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

    // Create a Blob from the buffer
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataType}_export_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast("Export completed successfully", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast(`Export failed: ${error.message}`, "error");
  }
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
  worksheet.mergeCells("A1:N1");
  worksheet.getCell("A1").value = "RICE PROGRAM";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  worksheet.mergeCells("A2:N2");
  worksheet.getCell("A2").value = "HARVESTING ACCOMPLISHMENT REPORT";
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A2").font = { bold: true, size: 12 };

  worksheet.mergeCells("A3:N3");
  worksheet.getCell("A3").value = "WET OR DRY SEASON";
  worksheet.getCell("A3").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A3").font = { bold: true, size: 12 };

  worksheet.mergeCells("A4:N4");
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
  worksheet.mergeCells("A10:N10");
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
  worksheet.mergeCells("A11:A12");
  worksheet.getCell("A11").value = "No.";
  worksheet.getCell("A11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A11").font = { bold: true };

  worksheet.mergeCells("B11:B12");
  worksheet.getCell("B11").value = "Barangay";
  worksheet.getCell("B11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("B11").font = { bold: true };

  // Hybrid Seeds
  worksheet.mergeCells("C11:E11");
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
  worksheet.mergeCells("F11:H11");
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
  worksheet.mergeCells("I11:K11");
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
  worksheet.mergeCells("L11:N11");
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

// Helper function to create Fishpond Report
const createFishpondReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year
) => {
  const worksheet = workbook.addWorksheet("Fishpond Areas");

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // NO.
    { width: 20 }, // NAME OF OPERATOR
    { width: 20 }, // FISHPOND LOCATION
    { width: 15 }, // CULTURED SPECIES
    { width: 15 }, // PRODUCTIVE AREA
    { width: 15 }, // STOCKING DENSITY
    { width: 15 }, // DATE OF STOCKING
    { width: 15 }, // PRODUCTION
    { width: 15 }, // DATE OF HARVEST
    { width: 20 }, // REMARKS
  ];

  // Add header with logo and title
  worksheet.mergeCells("A1:J3");
  worksheet.getCell("A1").value = "FRESHWATER FISHPOND AREAS";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add barangay header
  worksheet.mergeCells("A5:B5");
  worksheet.getCell("A5").value = "Barangay:";
  worksheet.getCell("A5").font = { bold: true };
  if (barangayFilter) {
    worksheet.getCell("C5").value = barangayFilter;
  }

  // Add table headers
  const headerRow = 7;
  worksheet.getCell(`A${headerRow}`).value = "NO.";
  worksheet.getCell(`B${headerRow}`).value = "NAME OF OPERATOR";
  worksheet.getCell(`C${headerRow}`).value =
    "FISHPOND LOCATION\n(w/ geotagged photo)";
  worksheet.getCell(`D${headerRow}`).value =
    "CULTURED SPECIES\n(TILAPIA, HITO)";
  worksheet.getCell(`E${headerRow}`).value = "PRODUCTIVE AREA (sq.m.)";
  worksheet.getCell(`F${headerRow}`).value = "STOCKING DENSITY (pcs.)";
  worksheet.getCell(`G${headerRow}`).value = "DATE OF STOCKING\n(dd-mm-yyyy)";
  worksheet.getCell(`H${headerRow}`).value = "PRODUCTION (kg.)";
  worksheet.getCell(`I${headerRow}`).value = "Date of Harvest\n(dd-mm-yyyy)";
  worksheet.getCell(`J${headerRow}`).value =
    "REMARKS\n(Operation or Non-operational)";

  // Style header row
  for (let col = 1; col <= 10; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D3E0F0" }, // Light blue background
    };
  }

  // Add data rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Add data rows
  filteredData.forEach((item) => {
    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = item.farmer_name || "";
    worksheet.getCell(`C${rowIndex}`).value = item.fishpond_location || "";
    worksheet.getCell(`D${rowIndex}`).value = item.cultured_species || "";
    worksheet.getCell(`E${rowIndex}`).value = item.productive_area_sqm || "";
    worksheet.getCell(`F${rowIndex}`).value = item.stocking_density || "";
    worksheet.getCell(`G${rowIndex}`).value = item.date_of_stocking || "";
    worksheet.getCell(`H${rowIndex}`).value = item.production_kg || "";
    worksheet.getCell(`I${rowIndex}`).value = item.date_of_harvest || "";
    worksheet.getCell(`J${rowIndex}`).value = item.operational_status || "";

    // Add borders to all cells in the row
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };
    }

    rowIndex++;
    counter++;
  });

  // Add empty rows to reach 15 rows
  while (counter <= 15) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    rowIndex++;
    counter++;
  }

  // Add signature section
  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "Validated by:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "____________________________";

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "Agricultural Technician";
};

// Helper function to create Livestock Report
const createLivestockReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year
) => {
  const worksheet = workbook.addWorksheet("Livestock");

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // RAISER/FARMER
    { width: 10 }, // Purok
    { width: 8 }, // Carabull
    { width: 8 }, // Caraheif
    { width: 8 }, // Carabull
    { width: 8 }, // Caraheif
    { width: 8 }, // Buck
    { width: 8 }, // Doe
    { width: 8 }, // Ram
    { width: 8 }, // Ewe
    { width: 8 }, // Sow
    { width: 8 }, // Piglet
    { width: 8 }, // Boar
    { width: 8 }, // Fatteners
    { width: 8 }, // Broiler
    { width: 8 }, // Layer
    { width: 8 }, // Free-range
    { width: 8 }, // Game-fowl
    { width: 8 }, // Fighting Cocks
    { width: 8 }, // Drake
    { width: 8 }, // Hen
    { width: 8 }, // Cock
    { width: 8 }, // Hen
    { width: 8 }, // Gobbler
    { width: 8 }, // Hen
    { width: 8 }, // Buck
    { width: 8 }, // Doe
    { width: 10 }, // Updated By
    { width: 15 }, // Remarks
  ];

  // Add header with logo and title
  worksheet.mergeCells("A1:AD3");
  worksheet.getCell("A1").value = "CITY AGRICULTURE AND VETERINARY DEPARTMENT";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add barangay and other info
  worksheet.mergeCells("A5:B5");
  worksheet.getCell("A5").value = "Barangay:";
  if (barangayFilter) {
    worksheet.getCell("C5").value = barangayFilter;
  }

  worksheet.mergeCells("A6:B6");
  worksheet.getCell("A6").value = "AEW Assigned:";

  worksheet.mergeCells("A7:B7");
  worksheet.getCell("A7").value = "Date of Monitoring:";

  // Add table headers
  const headerRow1 = 9;
  const headerRow2 = 10;

  worksheet.getCell(`A${headerRow1}`).value = "No.";
  worksheet.mergeCells(`A${headerRow1}:A${headerRow2}`);

  worksheet.getCell(`B${headerRow1}`).value = "RAISER/FARMER";
  worksheet.mergeCells(`B${headerRow1}:B${headerRow2}`);

  worksheet.getCell(`C${headerRow1}`).value = "Purok";
  worksheet.mergeCells(`C${headerRow1}:C${headerRow2}`);

  // CATTLE
  worksheet.getCell(`D${headerRow1}`).value = "CATTLE";
  worksheet.mergeCells(`D${headerRow1}:E${headerRow1}`);
  worksheet.getCell(`D${headerRow2}`).value = "Carabull";
  worksheet.getCell(`E${headerRow2}`).value = "Caraheif";

  // CARABAO
  worksheet.getCell(`F${headerRow1}`).value = "CARABAO";
  worksheet.mergeCells(`F${headerRow1}:G${headerRow1}`);
  worksheet.getCell(`F${headerRow2}`).value = "Carabull";
  worksheet.getCell(`G${headerRow2}`).value = "Caraheif";

  // GOAT
  worksheet.getCell(`H${headerRow1}`).value = "GOAT";
  worksheet.mergeCells(`H${headerRow1}:I${headerRow1}`);
  worksheet.getCell(`H${headerRow2}`).value = "Buck";
  worksheet.getCell(`I${headerRow2}`).value = "Doe";

  // SHEEP
  worksheet.getCell(`J${headerRow1}`).value = "SHEEP";
  worksheet.mergeCells(`J${headerRow1}:K${headerRow1}`);
  worksheet.getCell(`J${headerRow2}`).value = "Ram";
  worksheet.getCell(`K${headerRow2}`).value = "Ewe";

  // SWINE
  worksheet.getCell(`L${headerRow1}`).value = "SWINE";
  worksheet.mergeCells(`L${headerRow1}:N${headerRow1}`);
  worksheet.getCell(`L${headerRow2}`).value = "Sow";
  worksheet.getCell(`M${headerRow2}`).value = "Piglet";
  worksheet.getCell(`N${headerRow2}`).value = "Boar";

  // CHICKEN
  worksheet.getCell(`O${headerRow1}`).value = "CHICKEN";
  worksheet.mergeCells(`O${headerRow1}:S${headerRow1}`);
  worksheet.getCell(`O${headerRow2}`).value = "Fatteners";
  worksheet.getCell(`P${headerRow2}`).value = "Broiler";
  worksheet.getCell(`Q${headerRow2}`).value = "Layer";
  worksheet.getCell(`R${headerRow2}`).value = "Free-range";
  worksheet.getCell(`S${headerRow2}`).value = "Game-fowl";

  // DUCK
  worksheet.getCell(`T${headerRow1}`).value = "DUCK";
  worksheet.mergeCells(`T${headerRow1}:U${headerRow1}`);
  worksheet.getCell(`T${headerRow2}`).value = "Drake";
  worksheet.getCell(`U${headerRow2}`).value = "Hen";

  // QUAIL
  worksheet.getCell(`V${headerRow1}`).value = "QUAIL";
  worksheet.mergeCells(`V${headerRow1}:W${headerRow1}`);
  worksheet.getCell(`V${headerRow2}`).value = "Cock";
  worksheet.getCell(`W${headerRow2}`).value = "Hen";

  // TURKEY
  worksheet.getCell(`X${headerRow1}`).value = "TURKEY";
  worksheet.mergeCells(`X${headerRow1}:Y${headerRow1}`);
  worksheet.getCell(`X${headerRow2}`).value = "Gobbler";
  worksheet.getCell(`Y${headerRow2}`).value = "Hen";

  // RABBIT
  worksheet.getCell(`Z${headerRow1}`).value = "RABBIT";
  worksheet.mergeCells(`Z${headerRow1}:AA${headerRow1}`);
  worksheet.getCell(`Z${headerRow2}`).value = "Buck";
  worksheet.getCell(`AA${headerRow2}`).value = "Doe";

  // Updated By and Remarks
  worksheet.getCell(`AB${headerRow1}`).value = "Updated By";
  worksheet.mergeCells(`AB${headerRow1}:AB${headerRow2}`);

  worksheet.getCell(`AC${headerRow1}`).value = "Remarks";
  worksheet.mergeCells(`AC${headerRow1}:AC${headerRow2}`);

  // Style header rows
  for (let row = headerRow1; row <= headerRow2; row++) {
    for (let col = 1; col <= 29; col++) {
      const cell = worksheet.getCell(row, col);
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D3E0F0" }, // Light blue background
      };
    }
  }

  // Group livestock data by farmer and animal type
  const livestockByFarmer = {};

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Process data
  filteredData.forEach((item) => {
    if (!item.farmer_id) return;

    if (!livestockByFarmer[item.farmer_id]) {
      livestockByFarmer[item.farmer_id] = {
        farmer_name: item.farmer_name || "Unknown",
        purok: item.purok || "",
        animals: {},
      };
    }

    const animalType = item.animal_type?.toLowerCase() || "";
    const subcategory = item.subcategory?.toLowerCase() || "";
    const quantity = Number.parseInt(item.quantity) || 0;

    if (!livestockByFarmer[item.farmer_id].animals[animalType]) {
      livestockByFarmer[item.farmer_id].animals[animalType] = {};
    }

    livestockByFarmer[item.farmer_id].animals[animalType][subcategory] =
      quantity;
  });

  // Add data rows
  let rowIndex = headerRow2 + 1;
  let counter = 1;

  Object.values(livestockByFarmer).forEach((farmer) => {
    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = farmer.farmer_name;
    worksheet.getCell(`C${rowIndex}`).value = farmer.purok;

    // CATTLE
    worksheet.getCell(`D${rowIndex}`).value =
      farmer.animals.cattle?.carabull || "";
    worksheet.getCell(`E${rowIndex}`).value =
      farmer.animals.cattle?.caraheif || "";

    // CARABAO
    worksheet.getCell(`F${rowIndex}`).value =
      farmer.animals.carabao?.carabull || "";
    worksheet.getCell(`G${rowIndex}`).value =
      farmer.animals.carabao?.caraheif || "";

    // GOAT
    worksheet.getCell(`H${rowIndex}`).value = farmer.animals.goat?.buck || "";
    worksheet.getCell(`I${rowIndex}`).value = farmer.animals.goat?.doe || "";

    // SHEEP
    worksheet.getCell(`J${rowIndex}`).value = farmer.animals.sheep?.ram || "";
    worksheet.getCell(`K${rowIndex}`).value = farmer.animals.sheep?.ewe || "";

    // SWINE
    worksheet.getCell(`L${rowIndex}`).value = farmer.animals.swine?.sow || "";
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.animals.swine?.piglet || "";
    worksheet.getCell(`N${rowIndex}`).value = farmer.animals.swine?.boar || "";

    // CHICKEN
    worksheet.getCell(`O${rowIndex}`).value =
      farmer.animals.chicken?.fatteners || "";
    worksheet.getCell(`P${rowIndex}`).value =
      farmer.animals.chicken?.broiler || "";
    worksheet.getCell(`Q${rowIndex}`).value =
      farmer.animals.chicken?.layer || "";
    worksheet.getCell(`R${rowIndex}`).value =
      farmer.animals.chicken?.["free-range"] || "";
    worksheet.getCell(`S${rowIndex}`).value =
      farmer.animals.chicken?.["game-fowl"] || "";

    // DUCK
    worksheet.getCell(`T${rowIndex}`).value = farmer.animals.duck?.drake || "";
    worksheet.getCell(`U${rowIndex}`).value = farmer.animals.duck?.hen || "";

    // QUAIL
    worksheet.getCell(`V${rowIndex}`).value = farmer.animals.quail?.cock || "";
    worksheet.getCell(`W${rowIndex}`).value = farmer.animals.quail?.hen || "";

    // TURKEY
    worksheet.getCell(`X${rowIndex}`).value =
      farmer.animals.turkey?.gobbler || "";
    worksheet.getCell(`Y${rowIndex}`).value = farmer.animals.turkey?.hen || "";

    // RABBIT
    worksheet.getCell(`Z${rowIndex}`).value = farmer.animals.rabbit?.buck || "";
    worksheet.getCell(`AA${rowIndex}`).value = farmer.animals.rabbit?.doe || "";

    // Add borders to all cells in the row
    for (let col = 1; col <= 29; col++) {
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

  // Add empty rows to reach 25 rows
  while (counter <= 25) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 29; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    rowIndex++;
    counter++;
  }

  // Add signature section
  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "Validated by:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "____________________________";

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "Agricultural Technician";
};

// Helper function to create High Value Crops Report
const createHighValueCropsReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year
) => {
  // Group data by crop type
  const cropTypes = [...new Set(data.map((item) => item.crop_value))].filter(
    Boolean
  );

  // Create separate worksheets for different crop types
  for (const cropType of cropTypes) {
    const cropData = data.filter((item) => item.crop_value === cropType);
    await createCropTypeWorksheet(
      workbook,
      cropData,
      cropType,
      barangayFilter,
      monthName,
      year
    );
  }

  // If no specific crop types found, create a general worksheet
  if (cropTypes.length === 0) {
    await createCropTypeWorksheet(
      workbook,
      data,
      "High Value Crops",
      barangayFilter,
      monthName,
      year
    );
  }
};

// Helper function to create worksheet for each crop type
const createCropTypeWorksheet = async (
  workbook,
  data,
  cropType,
  barangayFilter,
  monthName,
  year
) => {
  const safeCropName = cropType.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 28);
  const worksheet = workbook.addWorksheet(safeCropName);

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // Name of Growers
    { width: 15 }, // Contact number
    { width: 20 }, // Facebook/Email Account
    { width: 20 }, // Home Address
    { width: 20 }, // Farm Address
    { width: 12 }, // Farm Location - Longitude
    { width: 12 }, // Farm Location - Latitude
    { width: 20 }, // Market Outlet Location
    { width: 20 }, // Name of Buyer
    { width: 20 }, // Association/Organization
    { width: 12 }, // Area (hectare)
    { width: 12 }, // Production Jan
    { width: 12 }, // Production Feb
    { width: 12 }, // Production Mar
    { width: 12 }, // Production Apr
    { width: 12 }, // Production May
    { width: 12 }, // Production Jun
    { width: 12 }, // Production Jul
    { width: 12 }, // Production Aug
    { width: 12 }, // Production Sep
    { width: 12 }, // Production Oct
    { width: 12 }, // Production Nov
    { width: 12 }, // Production Dec
  ];

  // Add title
  worksheet.mergeCells("A1:X1");
  worksheet.getCell(
    "A1"
  ).value = `BUTUAN CITY ${cropType.toUpperCase()} PROFILING`;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  worksheet.mergeCells("A2:X2");
  worksheet.getCell("A2").value = `As of ${
    monthName ? monthName + " " : ""
  }${year}`;
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A2").font = { bold: true, size: 12 };

  // Add barangay
  worksheet.getCell("A4").value = "BARANGAY:";
  worksheet.getCell("A4").font = { bold: true };
  if (barangayFilter) {
    worksheet.getCell("B4").value = barangayFilter;
  }

  // Add section headers
  worksheet.mergeCells("A6:K6");
  worksheet.getCell("A6").value = "Growers' Profile";
  worksheet.getCell("A6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A6").font = { bold: true };
  worksheet.getCell("A6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2CC" }, // Light yellow background
  };

  worksheet.mergeCells("L6:X6");
  worksheet.getCell(
    "L6"
  ).value = `Production Record from January to December ${year} (kg)`;
  worksheet.getCell("L6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L6").font = { bold: true };
  worksheet.getCell("L6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2CC" }, // Light yellow background
  };

  // Add table headers
  const headerRow = 7;

  worksheet.getCell(`A${headerRow}`).value = "No.";
  worksheet.getCell(`B${headerRow}`).value = "Name of Growers";
  worksheet.getCell(`C${headerRow}`).value = "Contact number";
  worksheet.getCell(`D${headerRow}`).value = "Facebook/Email Account";
  worksheet.getCell(`E${headerRow}`).value = "Home Address";
  worksheet.getCell(`F${headerRow}`).value = "Farm Address";

  worksheet.mergeCells(`G${headerRow}:H${headerRow - 1}`);
  worksheet.getCell(`G${headerRow - 1}`).value = "Farm Location Coordinates";
  worksheet.getCell(`G${headerRow - 1}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell(`G${headerRow}`).value = "Longitude";
  worksheet.getCell(`H${headerRow}`).value = "Latitude";

  worksheet.getCell(`I${headerRow}`).value = "Market Outlet Location";
  worksheet.getCell(`J${headerRow}`).value = "Name of Buyer";
  worksheet.getCell(`K${headerRow}`).value = "Association/Organization";
  worksheet.getCell(`L${headerRow}`).value = `${cropType} Area (hectare)`;

  // Add monthly production columns
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEPT",
    "OCT",
    "NOV",
    "DEC",
  ];
  for (let i = 0; i < months.length; i++) {
    worksheet.getCell(`${String.fromCharCode(77 + i)}${headerRow}`).value =
      months[i];
  }

  // Style header row
  for (let col = 1; col <= 24; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2CC" }, // Light yellow background
    };
  }

  // Add default values for production columns
  worksheet.getCell(`L${headerRow + 1}`).value = 0;
  for (let i = 0; i < months.length; i++) {
    worksheet.getCell(
      `${String.fromCharCode(77 + i)}${headerRow + 1}`
    ).value = 0;
  }

  // Add data rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Group data by farmer
  const farmerGroups = {};
  filteredData.forEach((item) => {
    if (!item.farmer_id) return;

    if (!farmerGroups[item.farmer_id]) {
      farmerGroups[item.farmer_id] = {
        farmer_name: item.farmer_name || "Unknown",
        contact_number: item.contact_number || "",
        facebook_email: item.facebook_email || "",
        home_address: item.home_address || "",
        farm_address: item.farm_address || "",
        longitude: item.longitude || "",
        latitude: item.latitude || "",
        market_outlet: item.market_outlet || "",
        buyer: item.buyer || "",
        association: item.association || "",
        area_hectare: 0,
        monthly_production: Array(12).fill(0),
      };
    }

    // Add area
    farmerGroups[item.farmer_id].area_hectare +=
      Number.parseFloat(item.area_hectare) || 0;

    // Add production data by month
    if (item.created_at) {
      const date = new Date(item.created_at);
      const month = date.getMonth();
      farmerGroups[item.farmer_id].monthly_production[month] +=
        Number.parseFloat(item.quantity) || 0;
    }
  });

  // Add farmer rows
  Object.values(farmerGroups).forEach((farmer) => {
    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = farmer.farmer_name;
    worksheet.getCell(`C${rowIndex}`).value = farmer.contact_number;
    worksheet.getCell(`D${rowIndex}`).value = farmer.facebook_email;
    worksheet.getCell(`E${rowIndex}`).value = farmer.home_address;
    worksheet.getCell(`F${rowIndex}`).value = farmer.farm_address;
    worksheet.getCell(`G${rowIndex}`).value = farmer.longitude;
    worksheet.getCell(`H${rowIndex}`).value = farmer.latitude;
    worksheet.getCell(`I${rowIndex}`).value = farmer.market_outlet;
    worksheet.getCell(`J${rowIndex}`).value = farmer.buyer;
    worksheet.getCell(`K${rowIndex}`).value = farmer.association;
    worksheet.getCell(`L${rowIndex}`).value =
      farmer.area_hectare > 0 ? farmer.area_hectare.toFixed(2) : 0;

    // Add monthly production
    for (let i = 0; i < 12; i++) {
      worksheet.getCell(`${String.fromCharCode(77 + i)}${rowIndex}`).value =
        farmer.monthly_production[i] > 0
          ? farmer.monthly_production[i].toFixed(2)
          : 0;
    }

    // Add borders to all cells in the row
    for (let col = 1; col <= 24; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };
    }

    rowIndex++;
    counter++;
  });

  // Add empty rows to reach 35 rows
  while (counter <= 35) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 24; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    rowIndex++;
    counter++;
  }

  // Add signature section
  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "Prepared by:";
  worksheet.getCell(`F${rowIndex}`).value = "Reviewed by:";
  worksheet.getCell(`K${rowIndex}`).value = "Noted:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "CARLA AMOR E. TAYAG";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`F${rowIndex}`).value = "MELANIO M. CATAYAS JR.,";
  worksheet.getCell(`F${rowIndex}`).font = { bold: true };
  worksheet.getCell(`K${rowIndex}`).value = "ENGR. PIERRE ANTHONY D. JOVEN";
  worksheet.getCell(`K${rowIndex}`).font = { bold: true };

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "AT";
  worksheet.getCell(`F${rowIndex}`).value = "HVCDP Coordinator";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};

// Helper function to create Crops Report
const createCropsReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year
) => {
  // For regular crops, we'll create a vegetable profile report
  const worksheet = workbook.addWorksheet("Vegetable Profile");

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // Name of Growers
    { width: 15 }, // Contact number
    { width: 20 }, // Facebook/Email Account
    { width: 20 }, // Home Address
    { width: 20 }, // Farm Address
    { width: 12 }, // Farm Location - Longitude
    { width: 12 }, // Farm Location - Latitude
    { width: 20 }, // Market Outlet Location
    { width: 20 }, // Name of Buyer
    { width: 20 }, // Association/Organization
    { width: 12 }, // Area (hectare)
    { width: 12 }, // Eggplant
    { width: 12 }, // Ampalaya
    { width: 12 }, // Okra
    { width: 12 }, // Pele Sitao
    { width: 12 }, // Squash
    { width: 12 }, // Tomato
    { width: 12 }, // Other Crop 1
    { width: 12 }, // Other Crop 2
    { width: 12 }, // Other Crop 3
    { width: 12 }, // Other Crop 4
  ];

  // Add title
  worksheet.mergeCells("A1:U1");
  worksheet.getCell("A1").value = "BUTUAN CITY VEGETABLE PROFILE";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  worksheet.mergeCells("A2:U2");
  worksheet.getCell("A2").value = `As of ${
    monthName ? monthName + " " : ""
  }${year}`;
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A2").font = { bold: true, size: 12 };

  // Add barangay
  worksheet.getCell("A4").value = "BARANGAY:";
  worksheet.getCell("A4").font = { bold: true };
  if (barangayFilter) {
    worksheet.getCell("B4").value = barangayFilter;
  }

  // Add section headers
  worksheet.mergeCells("A6:K6");
  worksheet.getCell("A6").value = "Growers' Profile";
  worksheet.getCell("A6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A6").font = { bold: true };
  worksheet.getCell("A6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2CC" }, // Light yellow background
  };

  worksheet.mergeCells("L6:U6");
  worksheet.getCell("L6").value = `Production Record from January ${year} (kg)`;
  worksheet.getCell("L6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L6").font = { bold: true };
  worksheet.getCell("L6").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2CC" }, // Light yellow background
  };

  // Add table headers
  const headerRow = 7;

  worksheet.getCell(`A${headerRow}`).value = "No.";
  worksheet.getCell(`B${headerRow}`).value = "Name of Growers";
  worksheet.getCell(`C${headerRow}`).value = "Contact number";
  worksheet.getCell(`D${headerRow}`).value = "Facebook/Email Account";
  worksheet.getCell(`E${headerRow}`).value = "Home Address";
  worksheet.getCell(`F${headerRow}`).value = "Farm Address";

  worksheet.mergeCells(`G${headerRow}:H${headerRow - 1}`);
  worksheet.getCell(`G${headerRow - 1}`).value = "Farm Location Coordinates";
  worksheet.getCell(`G${headerRow - 1}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell(`G${headerRow}`).value = "Longitude";
  worksheet.getCell(`H${headerRow}`).value = "Latitude";

  worksheet.getCell(`I${headerRow}`).value = "Market Outlet Location";
  worksheet.getCell(`J${headerRow}`).value = "Name of Buyer";
  worksheet.getCell(`K${headerRow}`).value = "Association/Organization";
  worksheet.getCell(`L${headerRow}`).value = "Area (hectare)";

  // Add vegetable columns
  const vegetables = [
    "Eggplant",
    "Ampalaya",
    "Okra",
    "Pele Sitao",
    "Squash",
    "Tomato",
    "Other Crop (specify)",
    "Other Crop (specify)",
    "Other Crop (specify)",
    "Other Crop (specify)",
  ];
  for (let i = 0; i < vegetables.length; i++) {
    worksheet.getCell(`${String.fromCharCode(77 + i)}${headerRow}`).value =
      vegetables[i];
  }

  // Style header row
  for (let col = 1; col <= 21; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2CC" }, // Light yellow background
    };
  }

  // Add default values for production columns
  worksheet.getCell(`L${headerRow + 1}`).value = 0;
  for (let i = 0; i < vegetables.length; i++) {
    worksheet.getCell(
      `${String.fromCharCode(77 + i)}${headerRow + 1}`
    ).value = 0;
  }

  // Add data rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Group data by farmer
  const farmerGroups = {};
  filteredData.forEach((item) => {
    if (!item.farmer_id) return;

    if (!farmerGroups[item.farmer_id]) {
      farmerGroups[item.farmer_id] = {
        farmer_name: item.farmer_name || "Unknown",
        contact_number: item.contact_number || "",
        facebook_email: item.facebook_email || "",
        home_address: item.home_address || "",
        farm_address: item.farm_address || "",
        longitude: item.longitude || "",
        latitude: item.latitude || "",
        market_outlet: item.market_outlet || "",
        buyer: item.buyer || "",
        association: item.association || "",
        area_hectare: 0,
        crops: {},
      };
    }

    // Add area
    farmerGroups[item.farmer_id].area_hectare +=
      Number.parseFloat(item.area_hectare) || 0;

    // Add crop data
    const cropValue = item.crop_value?.toLowerCase() || "";
    if (cropValue) {
      farmerGroups[item.farmer_id].crops[cropValue] =
        (Number.parseFloat(item.quantity) || 0) +
        (farmerGroups[item.farmer_id].crops[cropValue] || 0);
    }
  });

  // Add farmer rows
  Object.values(farmerGroups).forEach((farmer) => {
    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = farmer.farmer_name;
    worksheet.getCell(`C${rowIndex}`).value = farmer.contact_number;
    worksheet.getCell(`D${rowIndex}`).value = farmer.facebook_email;
    worksheet.getCell(`E${rowIndex}`).value = farmer.home_address;
    worksheet.getCell(`F${rowIndex}`).value = farmer.farm_address;
    worksheet.getCell(`G${rowIndex}`).value = farmer.longitude;
    worksheet.getCell(`H${rowIndex}`).value = farmer.latitude;
    worksheet.getCell(`I${rowIndex}`).value = farmer.market_outlet;
    worksheet.getCell(`J${rowIndex}`).value = farmer.buyer;
    worksheet.getCell(`K${rowIndex}`).value = farmer.association;
    worksheet.getCell(`L${rowIndex}`).value =
      farmer.area_hectare > 0 ? farmer.area_hectare.toFixed(2) : 0;

    // Add crop production
    worksheet.getCell(`M${rowIndex}`).value = farmer.crops.eggplant || 0;
    worksheet.getCell(`N${rowIndex}`).value = farmer.crops.ampalaya || 0;
    worksheet.getCell(`O${rowIndex}`).value = farmer.crops.okra || 0;
    worksheet.getCell(`P${rowIndex}`).value = farmer.crops["pele sitao"] || 0;
    worksheet.getCell(`Q${rowIndex}`).value = farmer.crops.squash || 0;
    worksheet.getCell(`R${rowIndex}`).value = farmer.crops.tomato || 0;

    // Add borders to all cells in the row
    for (let col = 1; col <= 21; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };
    }

    rowIndex++;
    counter++;
  });

  // Add empty rows to reach 35 rows
  while (counter <= 35) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 21; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    rowIndex++;
    counter++;
  }

  // Add signature section
  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "Prepared by:";
  worksheet.getCell(`F${rowIndex}`).value = "Reviewed by:";
  worksheet.getCell(`K${rowIndex}`).value = "Noted:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "CARLA AMOR E. TAYAG";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`F${rowIndex}`).value = "MELANIO M. CATAYAS";
  worksheet.getCell(`F${rowIndex}`).font = { bold: true };
  worksheet.getCell(`K${rowIndex}`).value = "PIERRE ANTHONY D. JOVEN";
  worksheet.getCell(`K${rowIndex}`).font = { bold: true };

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "AT";
  worksheet.getCell(`F${rowIndex}`).value = "HVCDP Coordinator";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};
