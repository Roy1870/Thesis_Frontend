// High Value Crops Template for Excel Export
// This template can be used for Cacao, Mango, Coffee, Rubber, Oil Palm, Durian, and Coconut

export const createHighValueCropsReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
  console.log("Creating high value crops report with data:", {
    recordCount: data.length,
    sampleRecord: data.length > 0 ? data[0] : null,
    barangayFilter,
    monthName,
    year,
  });

  // Determine the crop type from the data
  // Default to "HIGH VALUE CROP" if no specific crop type is found
  let cropType = "HIGH VALUE CROP";

  // Helper function to parse production_data
  const parseProductionData = (crop) => {
    let productionData = {};
    if (crop.production_data && typeof crop.production_data === "string") {
      try {
        productionData = JSON.parse(crop.production_data);
        console.log(
          "Successfully parsed production_data string:",
          productionData
        );
      } catch (e) {
        console.warn("Error parsing production_data string:", e.message);
      }
    } else if (
      crop.production_data &&
      typeof crop.production_data === "object"
    ) {
      if (Array.isArray(crop.production_data)) {
        // If it's an array, use the first item or merge all items
        if (crop.production_data.length > 0) {
          productionData = crop.production_data[0];
          console.log(
            "Using first item from production_data array:",
            productionData
          );
        }
      } else {
        productionData = crop.production_data;
        console.log("Using production_data object directly:", productionData);
      }
    }

    // Add farmer info to each crop
    if (crop.farmer_id && !crop.farmer_name) {
      // If we have a farmer_id but no farmer info, try to add basic farmer details
      productionData.farmer_name = crop.name || crop.farmer_name || "";
      productionData.contact_number = crop.contact_number || crop.phone || "";
      productionData.facebook_email = crop.facebook_email || crop.email || "";
      productionData.home_address = crop.home_address || crop.address || "";
      productionData.barangay = crop.barangay || "";
      productionData.farm_address = crop.farm_address || "";
      productionData.farm_location_longitude =
        crop.farm_location_longitude || crop.longitude || "";
      productionData.farm_location_latitude =
        crop.farm_location_latitude || crop.latitude || "";
      productionData.market_outlet_location = crop.market_outlet_location || "";
      productionData.buyer_name = crop.buyer_name || "";
      productionData.association_organization =
        crop.association_organization || crop.organization || "";
    }

    return productionData;
  };

  // Try to determine crop type from the production_data.crop field
  if (data.length > 0) {
    for (const item of data) {
      const productionData = parseProductionData(item);
      if (productionData.crop) {
        cropType = productionData.crop.toUpperCase();
        console.log("Found crop in production_data:", cropType);
        break;
      } else if (item.crop_value) {
        cropType = item.crop_value.toUpperCase();
        console.log("Found crop_value:", cropType);
        break;
      } else if (item.variety_clone) {
        cropType = item.variety_clone.toUpperCase();
        console.log("Found variety_clone:", cropType);
        break;
      }
    }
  }

  // If still using default, check if there's a highValueCropType passed directly
  if (
    cropType === "HIGH VALUE CROP" &&
    data.length > 0 &&
    data[0].highValueCropType
  ) {
    cropType = data[0].highValueCropType;
    console.log("Using highValueCropType from filter:", cropType);
  }

  console.log("Using crop type for report:", cropType);

  // Create worksheet with the crop type name
  const worksheet = workbook.addWorksheet(`${cropType} Profile`);

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
    { width: 15 }, // VARIETY/CLONE
    { width: 12 }, // Crop Area (hectare)
    { width: 8 }, // JAN
    { width: 8 }, // FEB
    { width: 8 }, // MAR
    { width: 8 }, // APR
    { width: 8 }, // MAY
    { width: 8 }, // JUN
    { width: 8 }, // JUL
    { width: 8 }, // AUG
    { width: 8 }, // SEP
    { width: 8 }, // OCT
    { width: 8 }, // NOV
    { width: 8 }, // DEC
  ];

  // Add title
  safeMergeCells(worksheet, "A1:Y1");
  worksheet.getCell("A1").value = `BUTUAN CITY ${cropType} PROFILING`;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  safeMergeCells(worksheet, "A2:Y2");
  worksheet.getCell("A2").value = `As of ${
    monthName ? monthName + " " : ""
  }${year}`;
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
  safeMergeCells(worksheet, "A6:L6");
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

  safeMergeCells(worksheet, "M6:Y6");
  worksheet.getCell("M6").value = `Production Record from january ${year} (kg)`;
  worksheet.getCell("M6").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("M6").font = { bold: true };
  worksheet.getCell("M6").fill = {
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

  safeMergeCells(worksheet, `G${headerRow - 1}:H${headerRow - 1}`);
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
  worksheet.getCell(`L${headerRow}`).value = "VARIETY/CLONE";
  worksheet.getCell(`M${headerRow}`).value = `${cropType} Area (hectare)`;

  // Add month columns
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
    worksheet.getCell(`${String.fromCharCode(78 + i)}${headerRow}`).value =
      months[i];
  }

  // Style header row
  for (let col = 1; col <= 25; col++) {
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

  // Helper function to parse production data by month
  const parseMonthlyProductionData = (item) => {
    const monthlyData = {};

    // Initialize all months with 0
    months.forEach((month) => {
      monthlyData[month] = 0;
    });

    // Try to extract monthly production data
    if (
      item.monthly_production &&
      typeof item.monthly_production === "object"
    ) {
      // If monthly_production is directly available as an object
      Object.keys(item.monthly_production).forEach((month) => {
        const upperMonth = month.toUpperCase().substring(0, 3);
        if (months.includes(upperMonth)) {
          monthlyData[upperMonth] =
            Number.parseFloat(item.monthly_production[month]) || 0;
        }
      });
    } else if (item.production_data) {
      // Try to parse production_data
      const productionData = parseProductionData(item);

      // Check for month field in production data
      if (productionData.month && productionData.quantity) {
        const monthValue = productionData.month.toUpperCase().substring(0, 3);
        if (months.includes(monthValue)) {
          monthlyData[monthValue] =
            Number.parseFloat(productionData.quantity) || 0;
        }
      }

      // Check for individual month fields in production data
      months.forEach((month) => {
        const monthLower = month.toLowerCase();
        if (
          productionData[monthLower] &&
          !isNaN(Number.parseFloat(productionData[monthLower]))
        ) {
          monthlyData[month] = Number.parseFloat(productionData[monthLower]);
        }
      });
    }

    // Check for individual month fields directly on the item (e.g., jan_production, feb_production)
    months.forEach((month) => {
      const monthField = `${month.toLowerCase()}_production`;
      if (item[monthField] && !isNaN(Number.parseFloat(item[monthField]))) {
        monthlyData[month] = Number.parseFloat(item[monthField]);
      }
    });

    // If we have a single quantity value and a month, assign it to that month
    if (item.quantity && item.month) {
      const monthValue = item.month.toUpperCase().substring(0, 3);
      if (months.includes(monthValue)) {
        monthlyData[monthValue] = Number.parseFloat(item.quantity) || 0;
      }
    }

    return monthlyData;
  };

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Group data by farmer
  const farmersMap = {};

  console.log("Processing filtered data:", filteredData.length, "records");

  // First pass: collect all unique farmers and their basic information
  filteredData.forEach((item) => {
    if (!item.farmer_id) {
      console.log("Skipping item without farmer_id:", item);
      return;
    }

    // Get the crop value from production data
    const productionData = parseProductionData(item);
    const cropValue = (
      productionData.crop ||
      item.crop_value ||
      ""
    ).toLowerCase();

    // Skip if this crop doesn't match our target crop type
    if (
      cropValue.toLowerCase() !== cropType.toLowerCase() &&
      (!item.variety_clone ||
        item.variety_clone.toLowerCase() !== cropType.toLowerCase())
    ) {
      return;
    }

    // If this is the first time we're seeing this farmer, initialize their data
    if (!farmersMap[item.farmer_id]) {
      // Initialize farmer data with the same pattern as other templates
      farmersMap[item.farmer_id] = {
        farmer_id: item.farmer_id,
        name: item.farmer_name || item.name || "",
        contact_number: item.contact_number || item.phone || "",
        facebook_email: item.facebook_email || item.email || "",
        home_address: item.home_address || item.address || "",
        barangay: item.barangay || "",
        farm_address: item.farm_address || item.barangay || "",
        farm_location_longitude:
          item.farm_location_longitude || item.longitude || "",
        farm_location_latitude:
          item.farm_location_latitude || item.latitude || "",
        market_outlet_location: item.market_outlet_location || "",
        buyer_name: item.buyer_name || "",
        association_organization:
          item.association_organization || item.organization || "",
        variety: item.variety_clone || item.variety || "",
        area_hectare: 0,
        monthly_production: {},
        // Track crops by type to avoid double-counting area
        crop_types: new Set(),
      };

      // Initialize monthly production with zeros
      months.forEach((month) => {
        farmersMap[item.farmer_id].monthly_production[month] = 0;
      });
    }

    // Add area only if we haven't counted this crop type for this farmer yet
    if (!farmersMap[item.farmer_id].crop_types.has(cropValue.toLowerCase())) {
      const area = Number.parseFloat(item.area_hectare) || 0;
      farmersMap[item.farmer_id].area_hectare += area;
      farmersMap[item.farmer_id].crop_types.add(cropValue.toLowerCase());
    }

    // Get monthly production data
    const monthlyData = parseMonthlyProductionData(item);

    // Add to farmer's monthly production
    Object.keys(monthlyData).forEach((month) => {
      farmersMap[item.farmer_id].monthly_production[month] +=
        monthlyData[month];
    });

    // If we have a single quantity and no month specified, try to use it
    if (item.quantity && !item.month && !productionData.month) {
      const quantity = Number.parseFloat(item.quantity) || 0;
      // Just add to the first month as a fallback
      if (quantity > 0) {
        const firstMonth = months[0];
        farmersMap[item.farmer_id].monthly_production[firstMonth] += quantity;
      }
    }
  });

  // Convert to array and sort by barangay
  const sortedFarmers = Object.values(farmersMap).sort((a, b) => {
    if (a.barangay < b.barangay) return -1;
    if (a.barangay > b.barangay) return 1;
    return 0;
  });

  console.log(
    `Processed ${sortedFarmers.length} farmers with ${cropType} crops`
  );

  // Add farmer rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  sortedFarmers.forEach((farmer) => {
    // Skip farmers with no area or production
    const hasProduction = Object.values(farmer.monthly_production).some(
      (value) => value > 0
    );
    if (farmer.area_hectare === 0 && !hasProduction) {
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
    worksheet.getCell(`G${rowIndex}`).value = farmer.farm_location_longitude;
    worksheet.getCell(`H${rowIndex}`).value = farmer.farm_location_latitude;

    worksheet.getCell(`I${rowIndex}`).value = farmer.market_outlet_location;
    worksheet.getCell(`J${rowIndex}`).value = farmer.buyer_name;
    worksheet.getCell(`K${rowIndex}`).value = farmer.association_organization;
    worksheet.getCell(`L${rowIndex}`).value = farmer.variety;
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.area_hectare > 0 ? farmer.area_hectare.toFixed(2) : "0";

    // Add monthly production data
    months.forEach((month, index) => {
      const production = farmer.monthly_production[month] || 0;
      worksheet.getCell(`${String.fromCharCode(78 + index)}${rowIndex}`).value =
        production > 0 ? production.toFixed(2) : "0";
    });

    // Add borders to all cells in the row
    for (let col = 1; col <= 25; col++) {
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
    for (let col = 1; col <= 25; col++) {
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

  // Calculate totals
  let totalArea = 0;
  const totalMonthlyProduction = {};

  // Initialize monthly totals with zeros
  months.forEach((month) => {
    totalMonthlyProduction[month] = 0;
  });

  // Sum up all values
  sortedFarmers.forEach((farmer) => {
    totalArea += farmer.area_hectare;

    months.forEach((month) => {
      totalMonthlyProduction[month] += farmer.monthly_production[month] || 0;
    });
  });

  // Add total row
  worksheet.getCell(`A${rowIndex}`).value = "TOTAL";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`M${rowIndex}`).value =
    totalArea > 0 ? totalArea.toFixed(2) : "0";

  // Add monthly totals
  months.forEach((month, index) => {
    const total = totalMonthlyProduction[month] || 0;
    worksheet.getCell(`${String.fromCharCode(78 + index)}${rowIndex}`).value =
      total > 0 ? total.toFixed(2) : "0";
  });

  // Style the total row
  for (let col = 1; col <= 25; col++) {
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
  worksheet.getCell(`I${rowIndex}`).value = "Reviewed by:";
  worksheet.getCell(`Q${rowIndex}`).value = "Noted:";

  rowIndex += 3;
  worksheet.getCell(`A${rowIndex}`).value = "CARLA AMOR E. TAYAG";
  worksheet.getCell(`A${rowIndex}`).font = { bold: true };
  worksheet.getCell(`I${rowIndex}`).value = "MELANIO M. CATAYAS JR.";
  worksheet.getCell(`I${rowIndex}`).font = { bold: true };
  worksheet.getCell(`Q${rowIndex}`).value = "ENGR. PIERRE ANTHONY D. JOVEN";
  worksheet.getCell(`Q${rowIndex}`).font = { bold: true };

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "HVCDP Report Officer";
  worksheet.getCell(`I${rowIndex}`).value = "HVCDP Coordinator";
  worksheet.getCell(`Q${rowIndex}`).value = "City Agriculturist";

  // Add note about template usage
  rowIndex += 3;
  safeMergeCells(worksheet, `A${rowIndex}:L${rowIndex}`);
  worksheet.getCell(`A${rowIndex}`).value =
    "Note: This template can be used for Mango, Coffee, Rubber, Oil Palm, Durian, and Coconut";
  worksheet.getCell(`A${rowIndex}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "9ACD32" }, // Light green background
  };
};
