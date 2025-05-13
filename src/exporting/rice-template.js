// Rice template for Excel export
// This template creates a report for rice crops with separate worksheets for irrigated and rainfed

export const createRiceReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells,
  areaTypeFilter = "" // New parameter for filtering by area_type (irrigated/rainfed)
) => {
  // Filter data by area_type if specified
  let irrigatedData, rainfedData;

  if (areaTypeFilter.toLowerCase() === "irrigated") {
    irrigatedData = data.filter(
      (item) => item.area_type?.toLowerCase() === "irrigated"
    );
    rainfedData = []; // Empty array since we only want irrigated
  } else if (areaTypeFilter.toLowerCase() === "rainfed") {
    irrigatedData = []; // Empty array since we only want rainfed
    rainfedData = data.filter(
      (item) => item.area_type?.toLowerCase() === "rainfed"
    );
  } else {
    // No filter, include both
    irrigatedData = data.filter(
      (item) => item.area_type?.toLowerCase() === "irrigated"
    );
    rainfedData = data.filter(
      (item) => item.area_type?.toLowerCase() === "rainfed"
    );
  }

  // Create irrigated worksheet if data exists or if specifically requested
  if (
    irrigatedData.length > 0 ||
    areaTypeFilter.toLowerCase() === "irrigated" ||
    !areaTypeFilter
  ) {
    await createRiceWorksheet(
      workbook,
      irrigatedData,
      "IRRIGATED",
      barangayFilter,
      monthName,
      year,
      safeMergeCells
    );
  }

  // Create rainfed worksheet if data exists or if specifically requested
  if (
    rainfedData.length > 0 ||
    areaTypeFilter.toLowerCase() === "rainfed" ||
    !areaTypeFilter
  ) {
    await createRiceWorksheet(
      workbook,
      rainfedData,
      "RAINFED",
      barangayFilter,
      monthName,
      year,
      safeMergeCells
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
  year,
  safeMergeCells
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

  // Add title and header - centered at the top
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
  worksheet.getCell("A4").value = `For the month of ${monthName || "_____"}`;
  worksheet.getCell("A4").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A4").font = { bold: true, size: 12 };

  // Add region, province, municipality info - left aligned
  worksheet.getCell("A6").value = "Region: Caraga";
  worksheet.getCell("A7").value = "Province: Agusan del Norte";
  worksheet.getCell("A8").value = "Municipality: Butuan City";

  // Create the table starting at row 10
  // Add area type header - match the exact design from the image
  safeMergeCells(worksheet, "A10:N10");
  worksheet.getCell("A10").value = areaType;
  worksheet.getCell("A10").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A10").font = { bold: true };
  worksheet.getCell("A10").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background to match the image
  };

  // Create the table header - first row
  // First column for row numbers
  worksheet.getCell("A11").value = "";
  worksheet.getCell("A11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Barangay column with light blue background
  safeMergeCells(worksheet, "B11:B12");
  worksheet.getCell("B11").value = `Barangay ${barangayFilter || "_____"}`;
  worksheet.getCell("B11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("B11").font = { bold: true };
  worksheet.getCell("B11").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background
  };
  worksheet.getCell("B11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Hybrid Seeds
  safeMergeCells(worksheet, "C11:E11");
  worksheet.getCell("C11").value = "Hybrid Seeds";
  worksheet.getCell("C11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("C11").font = { bold: true };
  worksheet.getCell("C11").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background
  };
  worksheet.getCell("C11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Certified Seeds
  safeMergeCells(worksheet, "F11:H11");
  worksheet.getCell("F11").value = "Certified Seeds";
  worksheet.getCell("F11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("F11").font = { bold: true };
  worksheet.getCell("F11").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background
  };
  worksheet.getCell("F11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Good Seeds
  safeMergeCells(worksheet, "I11:K11");
  worksheet.getCell("I11").value = "Good Seeds";
  worksheet.getCell("I11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("I11").font = { bold: true };
  worksheet.getCell("I11").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background
  };
  worksheet.getCell("I11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Total
  safeMergeCells(worksheet, "L11:N11");
  worksheet.getCell("L11").value = "Total";
  worksheet.getCell("L11").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L11").font = { bold: true };
  worksheet.getCell("L11").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "B8CCE4" }, // Light blue background
  };
  worksheet.getCell("L11").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Create the table header - second row
  // First column for row numbers
  worksheet.getCell("A12").value = "";
  worksheet.getCell("A12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Hybrid Seeds subheaders
  worksheet.getCell("C12").value = "Area Hrvstd (ha)";
  worksheet.getCell("C12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("C12").font = { bold: true };
  worksheet.getCell("C12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("D12").value = "Production";
  worksheet.getCell("D12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("D12").font = { bold: true };
  worksheet.getCell("D12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("E12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("E12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("E12").font = { bold: true };
  worksheet.getCell("E12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Certified Seeds subheaders
  worksheet.getCell("F12").value = "Area Hrvstd (ha)";
  worksheet.getCell("F12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("F12").font = { bold: true };
  worksheet.getCell("F12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("G12").value = "Production";
  worksheet.getCell("G12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("G12").font = { bold: true };
  worksheet.getCell("G12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("H12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("H12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("H12").font = { bold: true };
  worksheet.getCell("H12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Good Seeds subheaders
  worksheet.getCell("I12").value = "Area Hrvstd (ha)";
  worksheet.getCell("I12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("I12").font = { bold: true };
  worksheet.getCell("I12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("J12").value = "Production";
  worksheet.getCell("J12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("J12").font = { bold: true };
  worksheet.getCell("J12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("K12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("K12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("K12").font = { bold: true };
  worksheet.getCell("K12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Total subheaders
  worksheet.getCell("L12").value = "Area Hrvstd (ha)";
  worksheet.getCell("L12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("L12").font = { bold: true };
  worksheet.getCell("L12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("M12").value = "Production";
  worksheet.getCell("M12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("M12").font = { bold: true };
  worksheet.getCell("M12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  worksheet.getCell("N12").value = "Ave Yield (mt/ha)";
  worksheet.getCell("N12").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("N12").font = { bold: true };
  worksheet.getCell("N12").border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

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
      data.hybrid.area > 0 ? data.hybrid.area.toFixed(2) : "";
    worksheet.getCell(`D${rowIndex}`).value =
      data.hybrid.production > 0 ? data.hybrid.production.toFixed(2) : "";
    worksheet.getCell(`E${rowIndex}`).value =
      hybridYield > 0 ? hybridYield.toFixed(2) : "";

    // Certified data
    worksheet.getCell(`F${rowIndex}`).value =
      data.certified.area > 0 ? data.certified.area.toFixed(2) : "";
    worksheet.getCell(`G${rowIndex}`).value =
      data.certified.production > 0 ? data.certified.production.toFixed(2) : "";
    worksheet.getCell(`H${rowIndex}`).value =
      certifiedYield > 0 ? certifiedYield.toFixed(2) : "";

    // Good seeds data
    worksheet.getCell(`I${rowIndex}`).value =
      data.good.area > 0 ? data.good.area.toFixed(2) : "";
    worksheet.getCell(`J${rowIndex}`).value =
      data.good.production > 0 ? data.good.production.toFixed(2) : "";
    worksheet.getCell(`K${rowIndex}`).value =
      goodYield > 0 ? goodYield.toFixed(2) : "";

    // Total data
    worksheet.getCell(`L${rowIndex}`).value =
      data.total.area > 0 ? data.total.area.toFixed(2) : "";
    worksheet.getCell(`M${rowIndex}`).value =
      data.total.production > 0 ? data.total.production.toFixed(2) : "";
    worksheet.getCell(`N${rowIndex}`).value =
      totalYield > 0 ? totalYield.toFixed(2) : "";

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

  // Add TOTAL row
  worksheet.getCell(`A${rowIndex}`).value = "TOTAL";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`A${rowIndex}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

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
    totalHybridYield > 0 ? "#DIV/0!" : "#DIV/0!"; // Match the exact format in the image

  // Certified totals
  worksheet.getCell(`F${rowIndex}`).value =
    totalCertifiedArea > 0 ? totalCertifiedArea.toFixed(2) : "-";
  worksheet.getCell(`G${rowIndex}`).value =
    totalCertifiedProduction > 0 ? totalCertifiedProduction.toFixed(2) : "-";
  worksheet.getCell(`H${rowIndex}`).value =
    totalCertifiedYield > 0 ? "#DIV/0!" : "#DIV/0!"; // Match the exact format in the image

  // Good seeds totals
  worksheet.getCell(`I${rowIndex}`).value =
    totalGoodArea > 0 ? totalGoodArea.toFixed(2) : "-";
  worksheet.getCell(`J${rowIndex}`).value =
    totalGoodProduction > 0 ? totalGoodProduction.toFixed(2) : "-";
  worksheet.getCell(`K${rowIndex}`).value = "-"; // Match the exact format in the image

  // Grand totals
  worksheet.getCell(`L${rowIndex}`).value =
    grandTotalArea > 0 ? grandTotalArea.toFixed(2) : "-";
  worksheet.getCell(`M${rowIndex}`).value =
    grandTotalProduction > 0 ? grandTotalProduction.toFixed(2) : "-";
  worksheet.getCell(`N${rowIndex}`).value =
    grandTotalYield > 0 ? "#DIV/0!" : "#DIV/0!"; // Match the exact format in the image

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
