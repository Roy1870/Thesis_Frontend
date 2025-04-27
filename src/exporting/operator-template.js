// Operator template for Excel export
// This template creates a report for freshwater fishpond operators with proper styling

export const createOperatorReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
  // Create worksheet with a modern name
  const worksheet = workbook.addWorksheet("Fishpond Operators");

  // Set column widths to match the image exactly
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // Name of Operator
    { width: 20 }, // Fishpond Location
    { width: 15 }, // Cultured Species
    { width: 15 }, // Productive Area
    { width: 15 }, // Stocking Density
    { width: 15 }, // Date of Stocking
    { width: 15 }, // Production
    { width: 15 }, // Date of Harvest
    { width: 20 }, // Remarks
  ];

  // Set default row height
  worksheet.properties.defaultRowHeight = 15;

  // Add header with department info - starting at row 1
  // Leave space for logo on left
  safeMergeCells(worksheet, "C1:G3");
  worksheet.getCell("C1").value =
    "Republic of the Philippines\nCITY GOVERNMENT OF BUTUAN\nCITY AGRICULTURE AND VETERINARY DEPARTMENT\nDOP Building, DOP Regional Center, Tiniwisan, Butuan City";
  worksheet.getCell("C1").alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };
  worksheet.getCell("C1").font = {
    bold: true,
    size: 11,
    color: { argb: "000000" }, // Black text
  };

  // Leave space for logo on right
  safeMergeCells(worksheet, "H1:J3");
  worksheet.getCell("H1").value =
    "CITY AGRICULTURE\nAND VETERINARY\nDEPARTMENT\nButuan City, Philippines";
  worksheet.getCell("H1").alignment = {
    horizontal: "right",
    vertical: "middle",
    wrapText: true,
  };
  worksheet.getCell("H1").font = {
    bold: true,
    size: 11,
    color: { argb: "0070C0" }, // Blue text
  };

  // Set header row heights
  worksheet.getRow(1).height = 20;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 20;

  // Add modern gradient-like blue horizontal line below header
  for (let col = 1; col <= 10; col++) {
    const cell = worksheet.getCell(4, col);
    // Use different blue shades for a gradient-like effect
    const blueShades = ["0070C0", "1080D0", "2090E0", "30A0F0"];
    const colorIndex = Math.min(
      Math.floor((col - 1) / 3),
      blueShades.length - 1
    );

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: blueShades[colorIndex] },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  }
  worksheet.getRow(4).height = 5; // Make it a thin line

  // Add space after blue line
  worksheet.getRow(5).height = 10;

  // Row 6: Title - with modern styling
  safeMergeCells(worksheet, "A6:J6");
  worksheet.getCell("A6").value = "FRESHWATER FISHPOND AREAS";
  worksheet.getCell("A6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A6").font = {
    bold: true,
    size: 14,
    color: { argb: "0070C0" }, // Blue text for modern look
  };
  worksheet.getRow(6).height = 25;

  // Add space between title and barangay
  worksheet.getRow(7).height = 15;

  // Row 8: Barangay - with modern styling
  worksheet.getCell("A8").value = "Barangay:";
  worksheet.getCell("A8").alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  worksheet.getCell("A8").font = {
    bold: true,
    size: 11,
    color: { argb: "404040" }, // Dark gray for modern look
  };

  // Add the actual barangay value with modern styling
  safeMergeCells(worksheet, "B8:D8");
  worksheet.getCell("B8").value = barangayFilter || "_____";
  worksheet.getCell("B8").alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  worksheet.getCell("B8").font = {
    size: 11,
    color: { argb: "000000" }, // Black text
  };

  // Add underline to barangay value for modern look
  worksheet.getCell("B8").border = {
    bottom: { style: "thin", color: { argb: "0070C0" } },
  };

  // Add space between barangay and table
  worksheet.getRow(9).height = 15;

  // Row 10: Table headers - with modern styling
  const headers = [
    "NO.",
    "NAME OF OPERATOR",
    "FISHPOND LOCATION\n(w/ geotagged photo)",
    "CULTURED SPECIES\n(TILAPIA, HITO)",
    "PRODUCTIVE AREA (sq.m.)",
    "STOCKING DENSITY (pcs.)",
    "DATE OF STOCKING\n(dd-mm-yyyy)",
    "PRODUCTION (kg.)",
    "Date of Harvest\n(dd-mm-yyyy)",
    "REMARKS\n(Operation or Non-\noperational)",
  ];

  // Add headers with modern formatting
  for (let col = 1; col <= 10; col++) {
    const cell = worksheet.getCell(10, col);
    cell.value = headers[col - 1];
    cell.font = {
      bold: true,
      size: 10,
      color: { argb: "FFFFFF" }, // White text for modern contrast
    };
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

    // Modern blue gradient for header cells
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0070C0" }, // Blue background
    };
  }
  worksheet.getRow(10).height = 40; // Set header row height

  // Filter data by barangay if specified
  let filteredData = [...data];
  if (barangayFilter) {
    filteredData = filteredData.filter(
      (item) => item.barangay && item.barangay === barangayFilter
    );
  }

  // Sort data by operator name
  filteredData.sort((a, b) => {
    return (a.farmer_name || "").localeCompare(b.farmer_name || "");
  });

  // Add data rows - exactly 15 rows as shown in the image
  let rowIndex = 11;

  // Create exactly 15 rows, either with data or empty
  for (let i = 0; i < 15; i++) {
    // Set row height to match image exactly
    worksheet.getRow(rowIndex).height = 25;

    const operator = i < filteredData.length ? filteredData[i] : null;

    // Format dates if operator exists
    const stockingDate = operator?.date_of_stocking
      ? new Date(operator.date_of_stocking).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    const harvestDate = operator?.date_of_harvest
      ? new Date(operator.date_of_harvest).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    // Add row data
    worksheet.getCell(`A${rowIndex}`).value = i + 1; // Always number from 1-15
    worksheet.getCell(`B${rowIndex}`).value = operator?.farmer_name || "";
    worksheet.getCell(`C${rowIndex}`).value = operator?.fishpond_location || "";
    worksheet.getCell(`D${rowIndex}`).value = operator?.cultured_species || "";
    worksheet.getCell(`E${rowIndex}`).value =
      operator?.productive_area_sqm || "";
    worksheet.getCell(`F${rowIndex}`).value = operator?.stocking_density || "";
    worksheet.getCell(`G${rowIndex}`).value = stockingDate;
    worksheet.getCell(`H${rowIndex}`).value = operator?.production_kg || "";
    worksheet.getCell(`I${rowIndex}`).value = harvestDate;
    worksheet.getCell(`J${rowIndex}`).value =
      operator?.operational_status || operator?.remarks || "";

    // Add borders and styling to all cells in the row
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getCell(rowIndex, col);

      // Modern subtle borders
      cell.border = {
        top: { style: "thin", color: { argb: "E0E0E0" } },
        left: { style: "thin", color: { argb: "E0E0E0" } },
        bottom: { style: "thin", color: { argb: "E0E0E0" } },
        right: { style: "thin", color: { argb: "E0E0E0" } },
      };

      // Align text to match image exactly
      if (col === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      // Add alternating row colors for better readability - modern subtle colors
      if (i % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F5F9FC" }, // Very light blue
        };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF" }, // White
        };
      }

      // Add special formatting for operational status
      if (col === 10 && operator?.operational_status) {
        const status = operator.operational_status.toLowerCase();
        if (status.includes("operational") || status.includes("active")) {
          cell.font = { color: { argb: "008000" } }; // Green for operational
        } else if (
          status.includes("non-operational") ||
          status.includes("inactive")
        ) {
          cell.font = { color: { argb: "FF0000" } }; // Red for non-operational
        }
      }

      // Add special formatting for dates
      if ((col === 7 || col === 9) && (stockingDate || harvestDate)) {
        cell.font = { color: { argb: "0070C0" } }; // Blue for dates
      }
    }

    rowIndex++;
  }

  // Add total row with modern styling
  worksheet.getCell(`A${rowIndex}`).value = "TOTAL";
  worksheet.getCell(`A${rowIndex}`).font = {
    bold: true,
    color: { argb: "0070C0" }, // Blue for modern look
  };
  worksheet.getCell(`A${rowIndex}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // Calculate totals
  let totalArea = 0;
  let totalProduction = 0;

  filteredData.forEach((operator) => {
    totalArea += Number(operator?.productive_area_sqm || 0);
    totalProduction += Number(operator?.production_kg || 0);
  });

  // Add totals with modern styling
  worksheet.getCell(`E${rowIndex}`).value =
    totalArea > 0 ? totalArea.toFixed(2) : "";
  worksheet.getCell(`E${rowIndex}`).font = { bold: true };
  worksheet.getCell(`E${rowIndex}`).alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  worksheet.getCell(`H${rowIndex}`).value =
    totalProduction > 0 ? totalProduction.toFixed(2) : "";
  worksheet.getCell(`H${rowIndex}`).font = { bold: true };
  worksheet.getCell(`H${rowIndex}`).alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  // Style the total row
  for (let col = 1; col <= 10; col++) {
    const cell = worksheet.getCell(rowIndex, col);
    cell.border = {
      top: { style: "double", color: { argb: "0070C0" } }, // Double line on top for modern look
      bottom: { style: "thin", color: { argb: "0070C0" } },
    };

    // Light blue background for total row
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "EAF1F8" }, // Very light blue
    };
  }

  rowIndex += 2;

  // Add signature section with modern styling
  worksheet.getCell(`A${rowIndex}`).value = "Validated by:";
  worksheet.getCell(`A${rowIndex}`).font = {
    size: 11,
    bold: true,
    color: { argb: "404040" }, // Dark gray for modern look
  };
  worksheet.getRow(rowIndex).height = 20;
  rowIndex += 2;

  // Add signature line with modern styling
  worksheet.getCell(`A${rowIndex}`).value = "_________________________";
  worksheet.getCell(`A${rowIndex}`).font = {
    color: { argb: "0070C0" }, // Blue for modern look
  };
  worksheet.getRow(rowIndex).height = 20;
  rowIndex++;

  // Add title under signature line with modern styling
  worksheet.getCell(`A${rowIndex}`).value = "Agricultural Technician";
  worksheet.getCell(`A${rowIndex}`).font = {
    size: 11,
    italic: true, // Italic for modern look
    color: { argb: "404040" }, // Dark gray
  };
  worksheet.getRow(rowIndex).height = 20;

  // Add Butuan ON logo text at bottom right with modern styling
  worksheet.getCell(`J${rowIndex}`).value = "BUTUAN ON";
  worksheet.getCell(`J${rowIndex}`).alignment = { horizontal: "right" };
  worksheet.getCell(`J${rowIndex}`).font = {
    bold: true,
    size: 11,
    color: { argb: "00B050" }, // Green color
  };

  // Add date of report generation
  rowIndex += 2;
  const today = new Date();
  worksheet.getCell(
    `A${rowIndex}`
  ).value = `Report generated: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
  worksheet.getCell(`A${rowIndex}`).font = {
    size: 9,
    italic: true,
    color: { argb: "808080" }, // Gray for subtle modern look
  };

  // Set print options for better printing
  worksheet.pageSetup = {
    orientation: "landscape",
    paperSize: 9, // A4
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: `A1:J${rowIndex + 1}`,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Add modern header and footer for printing
  worksheet.headerFooter = {
    oddHeader: "&L&B&10Freshwater Fishpond Areas&C&10&B&A&R&10&D",
    oddFooter:
      "&L&10Page &P of &N&C&10City Agriculture and Veterinary Department&R&10Butuan City",
  };

  return worksheet;
};
