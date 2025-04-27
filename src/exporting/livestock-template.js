// Create a template for livestock reports
export async function createLivestockReport(
  workbook,
  data,
  barangayFilter,
  year,
  safeMergeCells
) {
  // Create a new worksheet
  const worksheet = workbook.addWorksheet("Livestock Report");

  // Set column widths - removed Purok column
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 25 }, // RAISER/FARMER
    { width: 8 }, // Carabull
    { width: 8 }, // Caracow
    { width: 8 }, // Carabull
    { width: 8 }, // Caracow
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
    { width: 8 }, // Free range
    { width: 8 }, // Game fowl
    { width: 8 }, // Fighting Cocks
    { width: 8 }, // Drake
    { width: 8 }, // Hen
    { width: 8 }, // Cock
    { width: 8 }, // Hen
    { width: 8 }, // Gobbler
    { width: 8 }, // Hen
    { width: 8 }, // Buck
    { width: 8 }, // Doe
    { width: 15 }, // Updated By
    { width: 20 }, // Remarks
  ];

  // Add header with logos
  // Row 1-3: Logos and header text
  worksheet.addRow([]);
  const headerRow1 = worksheet.addRow([
    "Republic of the Philippines",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "CITY AGRICULTURE",
  ]);
  const headerRow2 = worksheet.addRow([
    "CITY GOVERNMENT OF BUTUAN",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "AND VETERINARY",
  ]);
  const headerRow3 = worksheet.addRow([
    "CITY AGRICULTURE AND VETERINARY DEPARTMENT",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "DEPARTMENT",
  ]);
  const headerRow4 = worksheet.addRow([
    "DOP Building, DOP Regional Center, Tiniwisan, Butuan City",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Butuan City Philippines",
  ]);

  // Merge cells for header
  safeMergeCells(worksheet, "A2:Q2");
  safeMergeCells(worksheet, "A3:Q3");
  safeMergeCells(worksheet, "A4:Q4");
  safeMergeCells(worksheet, "A5:Q5");
  safeMergeCells(worksheet, "AB2:AC2");
  safeMergeCells(worksheet, "AB3:AC3");
  safeMergeCells(worksheet, "AB4:AC4");
  safeMergeCells(worksheet, "AB5:AC5");

  // Style header rows
  [headerRow1, headerRow2, headerRow3, headerRow4].forEach((row) => {
    row.font = { bold: true, size: 11 };
    row.alignment = { vertical: "middle" };
  });

  // Add a blue line separator
  worksheet.addRow([]);
  const blueLineRow = worksheet.addRow([]);
  blueLineRow.height = 6;
  for (let i = 1; i <= 29; i++) {
    blueLineRow.getCell(i).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0F4C81" },
    };
  }

  // Add barangay and other info
  worksheet.addRow([]);
  const barangayRow = worksheet.addRow([
    "Barangay:",
    barangayFilter || "ALL BARANGAYS",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const aewRow = worksheet.addRow([
    "AEW Assigned:",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const dateRow = worksheet.addRow([
    "Date of Monitoring:",
    year || new Date().getFullYear(),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Style info rows
  [barangayRow, aewRow, dateRow].forEach((row) => {
    row.font = { bold: true, size: 10 };
    row.alignment = { vertical: "middle" };
  });

  // Add table headers
  worksheet.addRow([]);

  // Main header row
  const mainHeaderRow = worksheet.addRow([
    "No.",
    "RAISER/FARMER",
    "CATTLE",
    "",
    "CARABAO",
    "",
    "GOAT",
    "",
    "SHEEP",
    "",
    "SWINE",
    "",
    "",
    "CHICKEN",
    "",
    "",
    "",
    "",
    "DUCK",
    "",
    "QUAIL",
    "",
    "TURKEY",
    "",
    "RABBIT",
    "",
    "",
    "Updated By",
    "Remarks",
  ]);

  // Merge cells for main categories
  safeMergeCells(worksheet, "C12:D12"); // CATTLE
  safeMergeCells(worksheet, "E12:F12"); // CARABAO
  safeMergeCells(worksheet, "G12:H12"); // GOAT
  safeMergeCells(worksheet, "I12:J12"); // SHEEP
  safeMergeCells(worksheet, "K12:M12"); // SWINE
  safeMergeCells(worksheet, "N12:R12"); // CHICKEN
  safeMergeCells(worksheet, "S12:T12"); // DUCK
  safeMergeCells(worksheet, "U12:V12"); // QUAIL
  safeMergeCells(worksheet, "W12:X12"); // TURKEY
  safeMergeCells(worksheet, "Y12:Z12"); // RABBIT

  // Sub-header row
  const subHeaderRow = worksheet.addRow([
    "",
    "",
    "Carabull",
    "Caracow",
    "Carabull",
    "Caracow",
    "Buck",
    "Doe",
    "Ram",
    "Ewe",
    "Sow",
    "Piglet",
    "Boar",
    "Fatteners",
    "Broiler",
    "Layer",
    "Free range",
    "Game fowl",
    "Fighting Cocks",
    "Drake",
    "Hen",
    "Cock",
    "Hen",
    "Gobbler",
    "Hen",
    "Buck",
    "Doe",
    "",
    "",
  ]);

  // Style header rows
  [mainHeaderRow, subHeaderRow].forEach((row) => {
    row.eachCell((cell) => {
      cell.font = { bold: true, size: 10 };
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
        fgColor: { argb: "F2F2F2" },
      };
    });
  });

  // Define mapping of animal types and subcategories to column positions
  const columnMapping = {
    CATTLE: {
      Carabull: 2, // Column C
      Caracow: 3, // Column D
    },
    CARABAO: {
      Carabull: 4, // Column E
      Caracow: 5, // Column F
    },
    GOAT: {
      Buck: 6, // Column G
      Doe: 7, // Column H
    },
    SHEEP: {
      Ram: 8, // Column I
      Ewe: 9, // Column J
    },
    SWINE: {
      Sow: 10, // Column K
      Piglet: 11, // Column L
      Boar: 12, // Column M
    },
    CHICKEN: {
      Fatteners: 13, // Column N
      Broiler: 14, // Column O
      Layer: 15, // Column P
      "Free range": 16, // Column Q
      "Game fowl": 17, // Column R
      "Fighting Cocks": 18, // Column S
    },
    DUCK: {
      Drake: 19, // Column T
      Hen: 20, // Column U
    },
    QUAIL: {
      Cock: 21, // Column V
      Hen: 22, // Column W
    },
    TURKEY: {
      Gobbler: 23, // Column X
      Hen: 24, // Column Y
    },
    RABBIT: {
      Buck: 25, // Column Z
      Doe: 26, // Column AA
    },
  };

  // Process data from livestock_records table
  // Group livestock data by farmer
  const farmerMap = new Map();
  const totals = {}; // Initialize totals object

  // Initialize totals for each animal type and subcategory
  Object.keys(columnMapping).forEach((animalType) => {
    Object.keys(columnMapping[animalType]).forEach((subcategory) => {
      totals[`${animalType}_${subcategory}`] = 0;
    });
  });

  // Log the first few records to help with debugging
  if (data.length > 0) {
  }

  // Process data directly from the livestock_records table
  data.forEach((record) => {
    // Skip records without required fields
    if (!record.animal_type || !record.subcategory || !record.farmer_id) {
      return;
    }

    const farmerId = record.farmer_id;
    if (!farmerMap.has(farmerId)) {
      farmerMap.set(farmerId, {
        farmer_name: record.farmer_name || "Unknown",
        barangay: record.barangay || "Unknown",
        livestock: {},
        updated_by: record.updated_by || "",
        remarks: record.remarks || "",
      });
    }

    // Normalize animal type and subcategory to match our mapping
    const animalType = record.animal_type.toUpperCase();
    const subcategory = record.subcategory;

    // Check if this animal type and subcategory combination exists in our mapping
    if (!columnMapping[animalType] || !columnMapping[animalType][subcategory]) {
      return;
    }

    // Create the key for this specific animal type and subcategory
    const key = `${animalType}_${subcategory}`;

    // Ensure quantity is properly parsed as a number
    const quantity = parseInt(record.quantity || 0, 10);

    // Add to existing count or set new count for this farmer
    const farmer = farmerMap.get(farmerId);
    farmer.livestock[key] = (farmer.livestock[key] || 0) + quantity;

    // Add to the totals
    totals[key] = (totals[key] || 0) + quantity;

    // Update the updated_by and remarks if they exist in the record
    if (record.updated_by) {
      farmer.updated_by = record.updated_by;
    }

    if (record.remarks) {
      farmer.remarks = record.remarks;
    }
  });

  // Add data rows
  let rowNum = 1;
  farmerMap.forEach((farmer) => {
    // Create an array with empty values for all columns
    const rowData = Array(29).fill("");

    // Set the first two columns (No. and Farmer Name)
    rowData[0] = rowNum;
    rowData[1] = farmer.farmer_name;

    // Set the last two columns (Updated By and Remarks)
    rowData[27] = farmer.updated_by || "";
    rowData[28] = farmer.remarks || "";

    // Fill in the livestock data for each animal type and subcategory
    Object.keys(columnMapping).forEach((animalType) => {
      Object.keys(columnMapping[animalType]).forEach((subcategory) => {
        const key = `${animalType}_${subcategory}`;
        const colIndex = columnMapping[animalType][subcategory];
        rowData[colIndex] = farmer.livestock[key] || "";
      });
    });

    const dataRow = worksheet.addRow(rowData);

    // Style data row
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    rowNum++;
  });

  // Add empty rows to complete the table (25 rows total)
  const totalRows = 25;
  const currentRows = rowNum - 1;

  for (let i = 0; i < totalRows - currentRows; i++) {
    const emptyRow = worksheet.addRow(Array(29).fill(""));

    // Style empty row
    emptyRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // Now add the totals row at the bottom after all data and empty rows
  const totalsRowData = Array(29).fill("");
  totalsRowData[0] = "";
  totalsRowData[1] = "TOTAL";

  // Fill in the totals for each animal type and subcategory
  Object.keys(columnMapping).forEach((animalType) => {
    Object.keys(columnMapping[animalType]).forEach((subcategory) => {
      const key = `${animalType}_${subcategory}`;
      const colIndex = columnMapping[animalType][subcategory];
      totalsRowData[colIndex] = totals[key] || 0;
    });
  });

  const totalsRow = worksheet.addRow(totalsRowData);

  // Style totals row
  totalsRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };

    // Add background color to the totals row
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E6F5E4" },
    };
  });

  // Add validation section
  worksheet.addRow([]);
  const validatedByRow = worksheet.addRow([
    "Validated by:",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  const technicianRow = worksheet.addRow([
    "Agricultural Technician",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Add Butuan ON logo text at bottom right
  const butuanRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "BUTUAN ON",
  ]);
  butuanRow.getCell(28).font = {
    bold: true,
    size: 12,
    color: { argb: "0F4C81" },
  };

  // Add a line under the technician signature
  const technicianCell = technicianRow.getCell(1);
  technicianCell.border = {
    top: { style: "thin" },
  };

  // Set print area and page setup
  worksheet.pageSetup = {
    orientation: "landscape",
    paperSize: 9, // A4
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    printArea: "A1:AC" + worksheet.rowCount,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Return the worksheet for further processing if needed
  return worksheet;
}
