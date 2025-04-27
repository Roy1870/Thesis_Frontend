// Vegetable template for Excel export

// Export the createVegetableReport function
export const createVegetableReport = async (
  workbook,
  data,
  barangayFilter,
  monthName,
  year,
  safeMergeCells
) => {
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
    { width: 15 }, // Name of Buyer
    { width: 20 }, // Association/Organization
    { width: 12 }, // Area (hectare)
    { width: 12 }, // Eggplant
    { width: 12 }, // Ampalaya
    { width: 12 }, // Okra
    { width: 12 }, // Pole Sitao
    { width: 12 }, // Squash
    { width: 12 }, // Tomato
    { width: 12 }, // Other Crop (specify)
    { width: 12 }, // Other Crop (specify)
    { width: 12 }, // Other Crop (specify)
    { width: 12 }, // Other Crop (specify)
  ];

  // Add title
  safeMergeCells(worksheet, "A1:V1");
  worksheet.getCell("A1").value = "BUTUAN CITY VEGETABLE PROFILE";
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  // Add subtitle with year and month
  safeMergeCells(worksheet, "A2:V2");
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

  safeMergeCells(worksheet, "L6:V6");
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

  // Add vegetable columns
  const vegetables = [
    "Eggplant",
    "Ampalaya",
    "Okra",
    "Pole Sitao",
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
  for (let col = 1; col <= 22; col++) {
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

  // Filter data by barangay if specified
  const filteredData = barangayFilter
    ? data.filter((item) => item.barangay === barangayFilter)
    : data;

  // Debug the data structure

  // Filter only vegetable crops
  const vegetableCrops = filteredData.filter(
    (item) =>
      item.crop_type &&
      (item.crop_type.toLowerCase() === "vegetable" ||
        item.crop_type.toLowerCase().includes("vegetable"))
  );

  // Group crops by farmer_id
  const farmersMap = {};

  vegetableCrops.forEach((crop) => {
    if (!crop.farmer_id) return;

    // If this is the first crop for this farmer, initialize the farmer data
    if (!farmersMap[crop.farmer_id]) {
      // Debug the crop structure to see what fields are available

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
        crops: {
          eggplant: 0,
          ampalaya: 0,
          okra: 0,
          "pole sitao": 0,
          squash: 0,
          tomato: 0,
          other1: { name: "", quantity: 0 },
          other2: { name: "", quantity: 0 },
          other3: { name: "", quantity: 0 },
          other4: { name: "", quantity: 0 },
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

    // Add vegetable data based on crop value
    if (cropValue.includes("eggplant")) {
      farmersMap[crop.farmer_id].crops.eggplant += quantity;
    } else if (cropValue.includes("ampalaya")) {
      farmersMap[crop.farmer_id].crops.ampalaya += quantity;
    } else if (cropValue.includes("okra")) {
      farmersMap[crop.farmer_id].crops.okra += quantity;
    } else if (
      cropValue.includes("sitao") ||
      cropValue.includes("pole sitao")
    ) {
      farmersMap[crop.farmer_id].crops["pole sitao"] += quantity;
    } else if (cropValue.includes("squash")) {
      farmersMap[crop.farmer_id].crops.squash += quantity;
    } else if (cropValue.includes("tomato")) {
      farmersMap[crop.farmer_id].crops.tomato += quantity;
    } else {
      // Handle other vegetable types
      if (farmersMap[crop.farmer_id].crops.other1.quantity === 0) {
        farmersMap[crop.farmer_id].crops.other1.name = cropValue;
        farmersMap[crop.farmer_id].crops.other1.quantity = quantity;
      } else if (farmersMap[crop.farmer_id].crops.other2.quantity === 0) {
        farmersMap[crop.farmer_id].crops.other2.name = cropValue;
        farmersMap[crop.farmer_id].crops.other2.quantity = quantity;
      } else if (farmersMap[crop.farmer_id].crops.other3.quantity === 0) {
        farmersMap[crop.farmer_id].crops.other3.name = cropValue;
        farmersMap[crop.farmer_id].crops.other3.quantity = quantity;
      } else if (farmersMap[crop.farmer_id].crops.other4.quantity === 0) {
        farmersMap[crop.farmer_id].crops.other4.name = cropValue;
        farmersMap[crop.farmer_id].crops.other4.quantity = quantity;
      }
    }
  });

  // Sort farmers by barangay
  const sortedFarmers = Object.values(farmersMap).sort((a, b) => {
    if (a.barangay < b.barangay) return -1;
    if (a.barangay > b.barangay) return 1;
    return 0;
  });

  if (sortedFarmers.length > 0) {
  }

  // Add farmer rows
  let rowIndex = headerRow + 1;
  let counter = 1;

  // Initialize totals
  let totalArea = 0;
  let totalEggplant = 0;
  let totalAmpalaya = 0;
  let totalOkra = 0;
  let totalPoleSitao = 0;
  let totalSquash = 0;
  let totalTomato = 0;

  sortedFarmers.forEach((farmer) => {
    // Skip farmers with no vegetable crops
    if (
      farmer.area_hectare === 0 &&
      farmer.crops.eggplant === 0 &&
      farmer.crops.ampalaya === 0 &&
      farmer.crops.okra === 0 &&
      farmer.crops["pole sitao"] === 0 &&
      farmer.crops.squash === 0 &&
      farmer.crops.tomato === 0 &&
      farmer.crops.other1.quantity === 0 &&
      farmer.crops.other2.quantity === 0 &&
      farmer.crops.other3.quantity === 0 &&
      farmer.crops.other4.quantity === 0
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

    // Add crop production
    worksheet.getCell(`M${rowIndex}`).value =
      farmer.crops.eggplant > 0 ? farmer.crops.eggplant.toFixed(2) : "";
    worksheet.getCell(`N${rowIndex}`).value =
      farmer.crops.ampalaya > 0 ? farmer.crops.ampalaya.toFixed(2) : "";
    worksheet.getCell(`O${rowIndex}`).value =
      farmer.crops.okra > 0 ? farmer.crops.okra.toFixed(2) : "";
    worksheet.getCell(`P${rowIndex}`).value =
      farmer.crops["pole sitao"] > 0
        ? farmer.crops["pole sitao"].toFixed(2)
        : "";
    worksheet.getCell(`Q${rowIndex}`).value =
      farmer.crops.squash > 0 ? farmer.crops.squash.toFixed(2) : "";
    worksheet.getCell(`R${rowIndex}`).value =
      farmer.crops.tomato > 0 ? farmer.crops.tomato.toFixed(2) : "";

    // Add other crops
    if (farmer.crops.other1.quantity > 0) {
      worksheet.getCell(`S${rowIndex}`).value = `${
        farmer.crops.other1.name
      }: ${farmer.crops.other1.quantity.toFixed(2)}`;
    }
    if (farmer.crops.other2.quantity > 0) {
      worksheet.getCell(`T${rowIndex}`).value = `${
        farmer.crops.other2.name
      }: ${farmer.crops.other2.quantity.toFixed(2)}`;
    }
    if (farmer.crops.other3.quantity > 0) {
      worksheet.getCell(`U${rowIndex}`).value = `${
        farmer.crops.other3.name
      }: ${farmer.crops.other3.quantity.toFixed(2)}`;
    }
    if (farmer.crops.other4.quantity > 0) {
      worksheet.getCell(`V${rowIndex}`).value = `${
        farmer.crops.other4.name
      }: ${farmer.crops.other4.quantity.toFixed(2)}`;
    }

    // Add to totals
    totalArea += farmer.area_hectare;
    totalEggplant += farmer.crops.eggplant;
    totalAmpalaya += farmer.crops.ampalaya;
    totalOkra += farmer.crops.okra;
    totalPoleSitao += farmer.crops["pole sitao"];
    totalSquash += farmer.crops.squash;
    totalTomato += farmer.crops.tomato;

    // Add borders to all cells in the row
    for (let col = 1; col <= 22; col++) {
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
    for (let col = 1; col <= 22; col++) {
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
    totalEggplant > 0 ? totalEggplant.toFixed(2) : "";
  worksheet.getCell(`N${rowIndex}`).value =
    totalAmpalaya > 0 ? totalAmpalaya.toFixed(2) : "";
  worksheet.getCell(`O${rowIndex}`).value =
    totalOkra > 0 ? totalOkra.toFixed(2) : "";
  worksheet.getCell(`P${rowIndex}`).value =
    totalPoleSitao > 0 ? totalPoleSitao.toFixed(2) : "";
  worksheet.getCell(`Q${rowIndex}`).value =
    totalSquash > 0 ? totalSquash.toFixed(2) : "";
  worksheet.getCell(`R${rowIndex}`).value =
    totalTomato > 0 ? totalTomato.toFixed(2) : "";

  // Style the total row
  for (let col = 1; col <= 22; col++) {
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
  worksheet.getCell(`F${rowIndex}`).value = "MELANIO M. CATAYAS";
  worksheet.getCell(`F${rowIndex}`).font = { bold: true };
  worksheet.getCell(`K${rowIndex}`).value = "PIERRE ANTHONY D. JOVEN";
  worksheet.getCell(`K${rowIndex}`).font = { bold: true };

  rowIndex += 1;
  worksheet.getCell(`A${rowIndex}`).value = "AT";
  worksheet.getCell(`F${rowIndex}`).value = "HVCDP Coordinator";
  worksheet.getCell(`K${rowIndex}`).value = "City Agriculturist";
};
