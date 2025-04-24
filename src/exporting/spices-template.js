// Spices template for Excel export
// This template creates a report for spice crops (ginger, onion, hotpepper, sweet pepper, turmeric)

export const createSpicesReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
  console.log("Creating spices report with data:", {
    recordCount: data.length,
    sampleRecord: data.length > 0 ? data[0] : null,
    barangayFilter,
    monthName,
    year,
  });

  // Create a new worksheet
  const worksheet = workbook.addWorksheet("Spices");

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
    { width: 15 }, // Name of Buyer
    { width: 20 }, // Association/Organization
    { width: 12 }, // Area (hectare)
    { width: 12 }, // Ginger
    { width: 12 }, // Onion
    { width: 12 }, // Hotpepper
    { width: 12 }, // Sweet Pepper
    { width: 12 }, // Turmeric
  ];

  // Add title
  safeMergeCells(worksheet, "A1:Q1");
  worksheet.getCell("A1").value = "BUTUAN CITY SPICES PROFILING";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add subtitle with year
  safeMergeCells(worksheet, "A2:Q2");
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

  safeMergeCells(worksheet, "L6:Q6");
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

  // Farm Location Coordinates split into two columns
  worksheet.getCell(`G${headerRow}`).value = "Longitude";
  worksheet.getCell(`H${headerRow}`).value = "Latitude";

  worksheet.getCell(`I${headerRow}`).value = "Market Outlet Location";
  worksheet.getCell(`J${headerRow}`).value = "Name of Buyer";
  worksheet.getCell(`K${headerRow}`).value = "Association/Organization";
  worksheet.getCell(`L${headerRow}`).value = "Area (hectare)";
  worksheet.getCell(`M${headerRow}`).value = "Ginger";
  worksheet.getCell(`N${headerRow}`).value = "Onion";
  worksheet.getCell(`O${headerRow}`).value = "Hotpepper";
  worksheet.getCell(`P${headerRow}`).value = "Sweet Pepper";
  worksheet.getCell(`Q${headerRow}`).value = "Turmeric";

  // Style header row
  for (let col = 1; col <= 17; col++) {
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
  console.log(
    "Data structure sample:",
    filteredData.length > 0 ? filteredData[0] : "No data"
  );

  // Filter only spice crops - case insensitive match
  const spiceCrops = filteredData.filter(
    (item) => item.crop_type && /^spices?$/i.test(item.crop_type)
  );

  console.log(`Found ${spiceCrops.length} spice crops`);

  // Group crops by farmer_id
  const farmersMap = {};

  spiceCrops.forEach((crop) => {
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
          ginger: 0,
          onion: 0,
          hotpepper: 0,
          sweetpepper: 0,
          turmeric: 0,
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

    // Add spice variety data based on crop value with improved matching
    if (cropValue.includes("ginger")) {
      farmersMap[crop.farmer_id].varieties.ginger += quantity;
    } else if (cropValue.includes("onion")) {
      farmersMap[crop.farmer_id].varieties.onion += quantity;
    } else if (
      cropValue.includes("hotpepper") ||
      cropValue.includes("hot pepper")
    ) {
      farmersMap[crop.farmer_id].varieties.hotpepper += quantity;
    } else if (
      cropValue.includes("sweetpepper") ||
      cropValue.includes("sweet pepper")
    ) {
      farmersMap[crop.farmer_id].varieties.sweetpepper += quantity;
    } else if (cropValue.includes("turmeric")) {
      farmersMap[crop.farmer_id].varieties.turmeric += quantity;
    }
  });

  // Sort farmers by barangay
  const sortedFarmers = Object.values(farmersMap).sort((a, b) => {
    if (a.barangay < b.barangay) return -1;
    if (a.barangay > b.barangay) return 1;
    return 0;
  });

  console.log(`Processed ${sortedFarmers.length} farmers with spice crops`);

  // Add farmer rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Initialize totals
  let totalArea = 0;
  let totalGinger = 0;
  let totalOnion = 0;
  let totalHotpepper = 0;
  let totalSweetpepper = 0;
  let totalTurmeric = 0;

  sortedFarmers.forEach((farmer) => {
    // Skip farmers with no spice crops
    if (
      farmer.area_hectare === 0 &&
      farmer.varieties.ginger === 0 &&
      farmer.varieties.onion === 0 &&
      farmer.varieties.hotpepper === 0 &&
      farmer.varieties.sweetpepper === 0 &&
      farmer.varieties.turmeric === 0
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
    worksheet.getCell(`G${rowIndex}`).value = farmer.farm_location_longitude;
    worksheet.getCell(`H${rowIndex}`).value = farmer.farm_location_latitude;
    worksheet.getCell(`I${rowIndex}`).value = farmer.market_outlet_location;
    worksheet.getCell(`J${rowIndex}`).value = farmer.buyer_name;
    worksheet.getCell(`K${rowIndex}`).value = farmer.association_organization;
    worksheet.getCell(`L${rowIndex}`).value =
      farmer.area_hectare > 0 ? farmer.area_hectare.toFixed(2) : "";
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.varieties.ginger > 0 ? farmer.varieties.ginger.toFixed(2) : "";
    worksheet.getCell(`N${rowIndex}`).value =
      farmer.varieties.onion > 0 ? farmer.varieties.onion.toFixed(2) : "";
    worksheet.getCell(`O${rowIndex}`).value =
      farmer.varieties.hotpepper > 0
        ? farmer.varieties.hotpepper.toFixed(2)
        : "";
    worksheet.getCell(`P${rowIndex}`).value =
      farmer.varieties.sweetpepper > 0
        ? farmer.varieties.sweetpepper.toFixed(2)
        : "";
    worksheet.getCell(`Q${rowIndex}`).value =
      farmer.varieties.turmeric > 0 ? farmer.varieties.turmeric.toFixed(2) : "";

    // Add to totals
    totalArea += farmer.area_hectare;
    totalGinger += farmer.varieties.ginger;
    totalOnion += farmer.varieties.onion;
    totalHotpepper += farmer.varieties.hotpepper;
    totalSweetpepper += farmer.varieties.sweetpepper;
    totalTurmeric += farmer.varieties.turmeric;

    // Add borders to all cells in the row
    for (let col = 1; col <= 17; col++) {
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

  // Add empty rows to reach 35 rows
  while (counter <= 35) {
    worksheet.getCell(`A${rowIndex}`).value = counter;

    // Add borders to all cells in the row
    for (let col = 1; col <= 17; col++) {
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
  worksheet.getCell(`L${rowIndex}`).value =
    totalArea > 0 ? totalArea.toFixed(2) : "";
  worksheet.getCell(`M${rowIndex}`).value =
    totalGinger > 0 ? totalGinger.toFixed(2) : "";
  worksheet.getCell(`N${rowIndex}`).value =
    totalOnion > 0 ? totalOnion.toFixed(2) : "";
  worksheet.getCell(`O${rowIndex}`).value =
    totalHotpepper > 0 ? totalHotpepper.toFixed(2) : "";
  worksheet.getCell(`P${rowIndex}`).value =
    totalSweetpepper > 0 ? totalSweetpepper.toFixed(2) : "";
  worksheet.getCell(`Q${rowIndex}`).value =
    totalTurmeric > 0 ? totalTurmeric.toFixed(2) : "";

  // Style the total row
  for (let col = 1; col <= 17; col++) {
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
  worksheet.getCell(`A${rowIndex}`).value = "AT";
  worksheet.getCell(`F${rowIndex}`).value = "HVCDP";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};
