// Legumes template for Excel export
// This template creates a report for legume crops (peanut, mungbean, soybean)

export const createLegumesReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
  // Create a new worksheet
  const worksheet = workbook.addWorksheet("Legumes");

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
    { width: 12 }, // PEANUT
    { width: 12 }, // MUNGBEAN
    { width: 12 }, // SOYBEAN
  ];

  // Add title
  safeMergeCells(worksheet, "A1:O1");
  worksheet.getCell("A1").value = "BUTUAN CITY LEGUMES PROFILING";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add subtitle with year
  safeMergeCells(worksheet, "A2:O2");
  const formattedDate = monthName
    ? `${monthName} ${year}`
    : `${new Date().toLocaleString("default", { month: "long" })} ${year}`;
  worksheet.getCell("A2").value = `As of ${formattedDate}`;
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A2").font = { bold: true, size: 12 };

  // Add barangay
  worksheet.getCell("A4").value = "BARANGAY:__________";
  worksheet.getCell("A4").font = { bold: true };
  if (barangayFilter) {
    worksheet.getCell("A4").value = `BARANGAY: ${barangayFilter}`;
  }

  // Add section headers
  safeMergeCells(worksheet, "A6:K6");
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

  safeMergeCells(worksheet, "L6:O6");
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
  worksheet.getCell(`G${headerRow}`).value = "Farm Location Coordinates";
  worksheet.getCell(`H${headerRow}`).value = "Market Outlet Location";
  worksheet.getCell(`I${headerRow}`).value = "Name of Buyer";
  worksheet.getCell(`J${headerRow}`).value = "Association/Organization";
  worksheet.getCell(`K${headerRow}`).value = "LEGUMES Area (hectare)";
  worksheet.getCell(`L${headerRow}`).value = "PEANUT";
  worksheet.getCell(`M${headerRow}`).value = "MUNGBEAN";
  worksheet.getCell(`N${headerRow}`).value = "SOYBEAN";

  // Style header row
  for (let col = 1; col <= 14; col++) {
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

  // Helper function to parse production_data - same as in inventory.jsx
  const parseProductionData = (crop) => {
    let productionData = {};

    // Handle string format production_data
    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
      } catch (e) {
        console.warn("Error parsing production_data string:", e.message);
      }
    }
    // Handle object format production_data
    else if (crop.production_data && typeof crop.production_data === "object") {
      if (Array.isArray(crop.production_data)) {
        // If it's an array, use the first item or merge all items
        if (crop.production_data.length > 0) {
          productionData = crop.production_data[0];
        }
      } else {
        productionData = crop.production_data;
      }
    }

    return productionData;
  };

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Debug the data structure

  // Filter only legume crops - case insensitive match
  const legumeCrops = filteredData.filter(
    (item) => item.crop_type && /^legumes?$/i.test(item.crop_type)
  );

  // Group crops by farmer_id
  const farmersMap = {};

  legumeCrops.forEach((crop) => {
    if (!crop.farmer_id) return;

    // If this is the first crop for this farmer, initialize the farmer data
    if (!farmersMap[crop.farmer_id]) {
      farmersMap[crop.farmer_id] = {
        farmer_id: crop.farmer_id,
        // Try multiple possible name fields
        name: crop.name || crop.farmer_name || "",
        // Try multiple possible contact fields
        contact_number: crop.contact_number || crop.phone || "",
        // Try multiple possible email fields
        facebook_email: crop.facebook_email || crop.email || "",
        // Try multiple possible address fields
        home_address: crop.home_address || crop.address || "",
        barangay: crop.barangay || "",
        farm_address: crop.farm_address || crop.barangay || "",
        // Try multiple possible coordinate fields
        farm_location_longitude:
          crop.farm_location_longitude || crop.longitude || "",
        farm_location_latitude:
          crop.farm_location_latitude || crop.latitude || "",
        // Try multiple possible market fields
        market_outlet_location: crop.market_outlet_location || "",
        buyer_name: crop.buyer_name || "",
        association_organization:
          crop.association_organization || crop.organization || "",
        area_hectare: 0,
        varieties: {
          peanut: 0,
          mungbean: 0,
          soybean: 0,
        },
      };
    }

    // Add area
    const area = Number.parseFloat(crop.area_hectare) || 0;
    farmersMap[crop.farmer_id].area_hectare += area;

    // Get crop value and quantity with improved extraction
    const productionData = parseProductionData(crop);

    // Try to get crop value from multiple possible sources
    const cropValue = (
      productionData.crop ||
      crop.variety_clone ||
      crop.crop_value ||
      ""
    ).toLowerCase();

    // Try to get quantity from multiple possible sources with better fallbacks
    let quantity = 0;

    // First check production data
    if (productionData.quantity !== undefined) {
      quantity = Number.parseFloat(productionData.quantity) || 0;
    }
    // Then check direct crop quantity
    else if (crop.quantity !== undefined) {
      quantity = Number.parseFloat(crop.quantity) || 0;
    }
    // Then check production field
    else if (crop.production !== undefined) {
      quantity = Number.parseFloat(crop.production) || 0;
    }

    // Add legume variety data based on crop value with improved matching
    if (cropValue.includes("peanut")) {
      farmersMap[crop.farmer_id].varieties.peanut += quantity;
    } else if (
      cropValue.includes("mungbean") ||
      cropValue.includes("mung bean")
    ) {
      farmersMap[crop.farmer_id].varieties.mungbean += quantity;
    } else if (
      cropValue.includes("soybean") ||
      cropValue.includes("soy bean")
    ) {
      farmersMap[crop.farmer_id].varieties.soybean += quantity;
    } else {
    }
  });

  // Sort farmers by barangay
  const sortedFarmers = Object.values(farmersMap).sort((a, b) => {
    if (a.barangay < b.barangay) return -1;
    if (a.barangay > b.barangay) return 1;
    return 0;
  });

  // Add farmer rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Initialize totals
  let totalArea = 0;
  let totalPeanut = 0;
  let totalMungbean = 0;
  let totalSoybean = 0;

  sortedFarmers.forEach((farmer) => {
    // Skip farmers with no legume crops
    if (
      farmer.area_hectare === 0 &&
      farmer.varieties.peanut === 0 &&
      farmer.varieties.mungbean === 0 &&
      farmer.varieties.soybean === 0
    ) {
      return;
    }

    worksheet.getCell(`A${rowIndex}`).value = counter;
    worksheet.getCell(`B${rowIndex}`).value = farmer.name;
    worksheet.getCell(`C${rowIndex}`).value = farmer.contact_number;
    worksheet.getCell(`D${rowIndex}`).value = farmer.facebook_email;
    worksheet.getCell(`E${rowIndex}`).value = farmer.home_address;
    worksheet.getCell(`F${rowIndex}`).value =
      farmer.farm_address || farmer.barangay;

    // Format coordinates properly
    const coordinates = [];
    if (farmer.farm_location_longitude)
      coordinates.push(farmer.farm_location_longitude);
    if (farmer.farm_location_latitude)
      coordinates.push(farmer.farm_location_latitude);
    worksheet.getCell(`G${rowIndex}`).value =
      coordinates.length > 0 ? coordinates.join(", ") : "";

    worksheet.getCell(`H${rowIndex}`).value = farmer.market_outlet_location;
    worksheet.getCell(`I${rowIndex}`).value = farmer.buyer_name;
    worksheet.getCell(`J${rowIndex}`).value = farmer.association_organization;
    worksheet.getCell(`K${rowIndex}`).value =
      farmer.area_hectare > 0 ? farmer.area_hectare.toFixed(2) : "";
    worksheet.getCell(`L${rowIndex}`).value =
      farmer.varieties.peanut > 0 ? farmer.varieties.peanut.toFixed(2) : "";
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.varieties.mungbean > 0 ? farmer.varieties.mungbean.toFixed(2) : "";
    worksheet.getCell(`N${rowIndex}`).value =
      farmer.varieties.soybean > 0 ? farmer.varieties.soybean.toFixed(2) : "";

    // Add to totals
    totalArea += farmer.area_hectare;
    totalPeanut += farmer.varieties.peanut;
    totalMungbean += farmer.varieties.mungbean;
    totalSoybean += farmer.varieties.soybean;

    // Add borders to all cells in the row
    for (let col = 1; col <= 14; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle" };

      // Set background color for the row (light orange)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCC99" }, // Light orange
      };
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

      // Set background color for the row (light orange)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCC99" }, // Light orange
      };
    }

    rowIndex++;
    counter++;
  }

  // Add total row
  worksheet.getCell(`A${rowIndex}`).value = "TOTAL";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`K${rowIndex}`).value =
    totalArea > 0 ? totalArea.toFixed(2) : "";
  worksheet.getCell(`L${rowIndex}`).value =
    totalPeanut > 0 ? totalPeanut.toFixed(2) : "";
  worksheet.getCell(`M${rowIndex}`).value =
    totalMungbean > 0 ? totalMungbean.toFixed(2) : "";
  worksheet.getCell(`N${rowIndex}`).value =
    totalSoybean > 0 ? totalSoybean.toFixed(2) : "";

  // Style the total row
  for (let col = 1; col <= 14; col++) {
    const cell = worksheet.getCell(rowIndex, col);
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle" };
    cell.font = { bold: true };

    // Set background color for the total row
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2CC" }, // Light yellow background
    };
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
  worksheet.getCell(`A${rowIndex}`).value = "HVCDP Report";
  worksheet.getCell(`F${rowIndex}`).value = "HVCDP Coordinator";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};
