// Banana template for Excel export

// Export the createBananaReport function
export const createBananaReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
  const worksheet = workbook.addWorksheet("Banana Profile");

  // Set column widths
  worksheet.columns = [
    { width: 5 }, // No.
    { width: 20 }, // Name of Growers
    { width: 15 }, // Contact number
    { width: 20 }, // Facebook/Email Account
    { width: 20 }, // Home Address
    { width: 20 }, // Farm Address
    { width: 20 }, // Farm Location Coordinates
    { width: 20 }, // Market Outlet Location
    { width: 15 }, // Name of Buyer
    { width: 20 }, // Association/Organization
    { width: 12 }, // BANANA Area (hectare)
    { width: 12 }, // LAKATAN
    { width: 12 }, // LATUNDAN
    { width: 12 }, // CARDAVA
  ];

  // Add title
  safeMergeCells(worksheet, "A1:N1");
  worksheet.getCell("A1").value = "BUTUAN CITY BANANA PROFILING";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add subtitle with year and month
  safeMergeCells(worksheet, "A2:N2");
  const currentDate = new Date();
  const formattedDate = monthName
    ? `${monthName} ${year}`
    : `${currentDate.toLocaleString("default", { month: "long" })} ${year}`;
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
  safeMergeCells(worksheet, "A6:J6");
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

  safeMergeCells(worksheet, "K6:N6");
  worksheet.getCell(
    "K6"
  ).value = `Production Record from January to December ${year} (kg)`;
  worksheet.getCell("K6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("K6").font = { bold: true };
  worksheet.getCell("K6").fill = {
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
  worksheet.getCell(`K${headerRow}`).value = "BANANA Area (hectare)";
  worksheet.getCell(`L${headerRow}`).value = "LAKATAN";
  worksheet.getCell(`M${headerRow}`).value = "LATUNDAN";
  worksheet.getCell(`N${headerRow}`).value = "CARDAVA";

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

    // Set background colors for production columns
    if (col <= 10) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2CC" }, // Light yellow background for profile columns
      };
    } else if (col === 11) {
      // BANANA Area
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2CC" }, // Light yellow background
      };
    } else if (col === 12) {
      // LAKATAN
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "00FFFF" }, // Cyan
      };
    } else if (col === 13) {
      // LATUNDAN
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00FF" }, // Magenta
      };
    } else if (col === 14) {
      // CARDAVA
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow
      };
    }
  }

  // Add color bands at the top for the production columns
  // LAKATAN - Cyan
  worksheet.getCell("L3").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "00FFFF" }, // Cyan
  };
  worksheet.getCell("L4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "00FFFF" }, // Cyan
  };

  // LATUNDAN - Magenta
  worksheet.getCell("M3").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00FF" }, // Magenta
  };
  worksheet.getCell("M4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00FF" }, // Magenta
  };

  // CARDAVA - Yellow
  worksheet.getCell("N3").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" }, // Yellow
  };
  worksheet.getCell("N4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" }, // Yellow
  };

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Helper function to parse production_data
  const parseProductionData = (crop) => {
    let productionData = {};
    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
      } catch (e) {
        // Silent error - continue with empty production data
      }
    } else if (
      crop.production_data &&
      typeof crop.production_data === "object"
    ) {
      productionData = crop.production_data;
    }
    return productionData;
  };

  // Debug the data structure
  console.log(
    "Data structure sample:",
    filteredData.length > 0 ? filteredData[0] : "No data"
  );

  // Filter only banana crops
  const bananaCrops = filteredData.filter(
    (item) =>
      item.crop_type &&
      (item.crop_type.toLowerCase() === "banana" ||
        item.crop_type.toLowerCase().includes("banana"))
  );

  console.log(`Found ${bananaCrops.length} banana crops`);

  // Group crops by farmer_id
  const farmersMap = {};

  bananaCrops.forEach((crop) => {
    if (!crop.farmer_id) return;

    // If this is the first crop for this farmer, initialize the farmer data
    if (!farmersMap[crop.farmer_id]) {
      // Debug the crop structure to see what fields are available
      console.log("Crop structure:", JSON.stringify(crop, null, 2));

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
          lakatan: 0,
          latundan: 0,
          cardava: 0,
        },
      };
    }

    // Add area
    const area = Number.parseFloat(crop.area_hectare) || 0;
    farmersMap[crop.farmer_id].area_hectare += area;

    // Get crop value and quantity
    const productionData = parseProductionData(crop);
    const cropValue = (
      productionData.crop ||
      crop.variety_clone ||
      ""
    ).toLowerCase();
    const quantity =
      Number.parseFloat(productionData.quantity || crop.quantity) || 0;

    // Add banana variety data based on crop value
    if (cropValue.includes("lakatan")) {
      farmersMap[crop.farmer_id].varieties.lakatan += quantity;
    } else if (cropValue.includes("latundan")) {
      farmersMap[crop.farmer_id].varieties.latundan += quantity;
    } else if (cropValue.includes("cardava") || cropValue.includes("saba")) {
      farmersMap[crop.farmer_id].varieties.cardava += quantity;
    }
  });

  // Sort farmers by barangay
  const sortedFarmers = Object.values(farmersMap).sort((a, b) => {
    if (a.barangay < b.barangay) return -1;
    if (a.barangay > b.barangay) return 1;
    return 0;
  });

  console.log(`Processed ${sortedFarmers.length} farmers with banana crops`);
  if (sortedFarmers.length > 0) {
    console.log(
      "First farmer data:",
      JSON.stringify(sortedFarmers[0], null, 2)
    );
  }

  // Add farmer rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Initialize totals
  let totalArea = 0;
  let totalLakatan = 0;
  let totalLatundan = 0;
  let totalCardava = 0;

  sortedFarmers.forEach((farmer) => {
    // Skip farmers with no banana crops
    if (
      farmer.area_hectare === 0 &&
      farmer.varieties.lakatan === 0 &&
      farmer.varieties.latundan === 0 &&
      farmer.varieties.cardava === 0
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
      farmer.varieties.lakatan > 0 ? farmer.varieties.lakatan.toFixed(2) : "";
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.varieties.latundan > 0 ? farmer.varieties.latundan.toFixed(2) : "";
    worksheet.getCell(`N${rowIndex}`).value =
      farmer.varieties.cardava > 0 ? farmer.varieties.cardava.toFixed(2) : "";

    // Add to totals
    totalArea += farmer.area_hectare;
    totalLakatan += farmer.varieties.lakatan;
    totalLatundan += farmer.varieties.latundan;
    totalCardava += farmer.varieties.cardava;

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
    totalLakatan > 0 ? totalLakatan.toFixed(2) : "";
  worksheet.getCell(`M${rowIndex}`).value =
    totalLatundan > 0 ? totalLatundan.toFixed(2) : "";
  worksheet.getCell(`N${rowIndex}`).value =
    totalCardava > 0 ? totalCardava.toFixed(2) : "";

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
