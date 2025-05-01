"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";

const ImportExcelButton = ({ onImport, setMessage }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [showImportSummary, setShowImportSummary] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage({ type: "info", content: "Processing Excel file..." });
      setImportStats(null);
      setShowImportSummary(false);

      // Check if ExcelJS is loaded
      if (!window.ExcelJS) {
        // Load ExcelJS dynamically
        await loadExcelJS();
      }

      const { data, stats } = await parseExcelFile(file);

      if (data.length === 0) {
        setMessage({
          type: "error",
          content:
            "No valid data found in the Excel file. Please check the file format.",
        });
        return;
      }

      // Set import statistics
      setImportStats(stats);
      setShowImportSummary(true);

      // Pass the data to the parent component
      onImport(data);

      setMessage({
        type: "success",
        content: `Successfully imported ${data.length} records from ${file.name}`,
      });
    } catch (error) {
      console.error("Import error:", error);
      setMessage({
        type: "error",
        content: `Failed to import: ${error.message}`,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Load ExcelJS dynamically
  const loadExcelJS = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/exceljs/dist/exceljs.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load ExcelJS"));
      document.body.appendChild(script);
    });
  };

  // Parse Excel file using a more flexible approach
  const parseExcelFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new window.ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const allData = [];
    const stats = {
      totalSheets: workbook.worksheets.length,
      processedSheets: 0,
      totalRows: 0,
      processedRows: 0,
      farmers: 0,
      rice: 0,
      livestock: 0,
      crops: 0,
      operators: 0,
      highValueCrops: 0,
      errors: [],
    };

    // Process each worksheet
    for (const worksheet of workbook.worksheets) {
      stats.processedSheets++;

      try {
        // Get column headers (first row)
        const headers = [];
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.text.trim().toLowerCase();
        });

        // Skip empty worksheets or those without headers
        if (headers.length < 2) continue;

        // Determine data type based on headers
        const dataType = determineDataType(headers);
        if (!dataType) continue;

        // Count total rows
        stats.totalRows += worksheet.rowCount - 1; // Exclude header row

        // Process rows based on data type
        const parsedData = await processWorksheetData(
          worksheet,
          headers,
          dataType
        );

        // Update statistics
        stats.processedRows += parsedData.length;

        if (dataType === "farmer") stats.farmers += parsedData.length;
        if (dataType === "rice") stats.rice += parsedData.length;
        if (dataType === "livestock") stats.livestock += parsedData.length;
        if (dataType === "crops") stats.crops += parsedData.length;
        if (dataType === "operator") stats.operators += parsedData.length;
        if (dataType === "highValueCrops")
          stats.highValueCrops += parsedData.length;

        // Add to all data
        allData.push(...parsedData);
      } catch (error) {
        console.error(`Error processing worksheet "${worksheet.name}":`, error);
        stats.errors.push(
          `Error in sheet "${worksheet.name}": ${error.message}`
        );
      }
    }

    return { data: allData, stats };
  };

  // Determine data type based on column headers
  const determineDataType = (headers) => {
    const headerStr = headers.join(" ");

    // Check for farmer information
    if (
      containsAll(headers, ["name", "barangay"]) &&
      (containsAny(headers, ["contact", "phone", "mobile"]) ||
        containsAny(headers, ["address", "home"]))
    ) {
      return "farmer";
    }

    // Check for rice data
    if (
      containsAny(headers, ["rice", "palay"]) &&
      containsAny(headers, ["area", "hectare", "harvested"]) &&
      containsAny(headers, ["production", "yield"])
    ) {
      return "rice";
    }

    // Check for livestock data
    if (
      containsAny(headers, [
        "animal",
        "livestock",
        "cattle",
        "chicken",
        "swine",
        "goat",
      ]) &&
      containsAny(headers, ["quantity", "count", "number"])
    ) {
      return "livestock";
    }

    // Check for operator/fishery data
    if (
      containsAny(headers, ["fishpond", "fish", "operator", "aquaculture"]) &&
      containsAny(headers, ["area", "production"])
    ) {
      return "operator";
    }

    // Check for high value crops
    if (
      containsAny(headers, [
        "high value",
        "hvc",
        "cacao",
        "coffee",
        "coconut",
        "mango",
      ]) &&
      containsAny(headers, ["quantity", "production"])
    ) {
      return "highValueCrops";
    }

    // Check for other crops
    if (
      containsAny(headers, [
        "crop",
        "vegetable",
        "banana",
        "spice",
        "legume",
      ]) &&
      containsAny(headers, ["quantity", "production"])
    ) {
      return "crops";
    }

    return null;
  };

  // Process worksheet data based on data type
  const processWorksheetData = async (worksheet, headers, dataType) => {
    const data = [];

    // Find column indices for common fields
    const nameIndex = findColumnIndex(headers, [
      "name",
      "farmer name",
      "farmer",
    ]);
    const barangayIndex = findColumnIndex(headers, [
      "barangay",
      "brgy",
      "location",
    ]);
    const contactIndex = findColumnIndex(headers, [
      "contact",
      "phone",
      "mobile",
      "number",
    ]);
    const addressIndex = findColumnIndex(headers, [
      "address",
      "home address",
      "residence",
    ]);

    // Process each row (skip header)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);

      // Skip empty rows
      if (isEmptyRow(row)) continue;

      try {
        // Extract common fields
        const name = nameIndex > 0 ? row.getCell(nameIndex).text.trim() : "";
        const barangay =
          barangayIndex > 0 ? row.getCell(barangayIndex).text.trim() : "";
        const contact =
          contactIndex > 0 ? row.getCell(contactIndex).text.trim() : "";
        const address =
          addressIndex > 0 ? row.getCell(addressIndex).text.trim() : "";

        // Skip rows without essential data
        if (!barangay) continue;

        // Process based on data type
        let rowData = {
          dataType,
          name,
          barangay,
          contact_number: contact,
          home_address: address,
        };

        switch (dataType) {
          case "farmer":
            rowData = processFarmerRow(row, headers, rowData);
            break;
          case "rice":
            rowData = processRiceRow(row, headers, rowData);
            break;
          case "livestock":
            rowData = processLivestockRow(row, headers, rowData);
            break;
          case "operator":
            rowData = processOperatorRow(row, headers, rowData);
            break;
          case "crops":
            rowData = processCropsRow(row, headers, rowData);
            break;
          case "highValueCrops":
            rowData = processHighValueCropsRow(row, headers, rowData);
            break;
        }

        // Add to data array if valid
        if (rowData) {
          data.push(rowData);
        }
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        // Continue with next row
      }
    }

    return data;
  };

  // Process farmer row
  const processFarmerRow = (row, headers, baseData) => {
    // Find column indices for farmer-specific fields
    const emailIndex = findColumnIndex(headers, ["email", "facebook", "fb"]);
    const rsbsaIndex = findColumnIndex(headers, ["rsbsa", "id", "farmer id"]);
    const farmerTypeIndex = findColumnIndex(headers, [
      "type",
      "farmer type",
      "category",
    ]);

    // Extract farmer-specific fields
    const email = emailIndex > 0 ? row.getCell(emailIndex).text.trim() : "";
    const rsbsa = rsbsaIndex > 0 ? row.getCell(rsbsaIndex).text.trim() : "";
    const farmerType =
      farmerTypeIndex > 0
        ? determineFarmerType(row.getCell(farmerTypeIndex).text.trim())
        : "Grower";

    return {
      ...baseData,
      facebook_email: email,
      rsbsa_id: rsbsa,
      farmer_type: farmerType,
    };
  };

  // Process rice row
  const processRiceRow = (row, headers, baseData) => {
    // Find column indices for rice-specific fields
    const areaTypeIndex = findColumnIndex(headers, [
      "area type",
      "ecosystem",
      "irrigated/rainfed",
    ]);
    const seedTypeIndex = findColumnIndex(headers, [
      "seed type",
      "seed",
      "variety",
    ]);
    const areaHarvestedIndex = findColumnIndex(headers, [
      "area harvested",
      "area",
      "hectare",
    ]);
    const productionIndex = findColumnIndex(headers, [
      "production",
      "yield total",
    ]);
    const aveYieldIndex = findColumnIndex(headers, [
      "ave yield",
      "average yield",
      "mt/ha",
    ]);

    // Extract rice-specific fields
    const areaType =
      areaTypeIndex > 0
        ? determineAreaType(row.getCell(areaTypeIndex).text.trim())
        : "Irrigated";
    const seedType =
      seedTypeIndex > 0
        ? determineSeedType(row.getCell(seedTypeIndex).text.trim())
        : "Certified";
    const areaHarvested =
      areaHarvestedIndex > 0
        ? extractNumber(row.getCell(areaHarvestedIndex).text)
        : "";
    const production =
      productionIndex > 0
        ? extractNumber(row.getCell(productionIndex).text)
        : "";
    const aveYield =
      aveYieldIndex > 0 ? extractNumber(row.getCell(aveYieldIndex).text) : "";

    return {
      ...baseData,
      farmer_type: "Grower",
      area_type: areaType,
      seed_type: seedType,
      area_harvested: areaHarvested.toString(),
      production: production.toString(),
      ave_yield: aveYield.toString(),
    };
  };

  // Process livestock row
  const processLivestockRow = (row, headers, baseData) => {
    // Find column indices for livestock-specific fields
    const animalTypeIndex = findColumnIndex(headers, [
      "animal type",
      "animal",
      "livestock type",
    ]);
    const subcategoryIndex = findColumnIndex(headers, [
      "subcategory",
      "category",
      "type",
    ]);
    const quantityIndex = findColumnIndex(headers, [
      "quantity",
      "count",
      "number",
      "total",
    ]);

    // Extract livestock-specific fields
    const animalType =
      animalTypeIndex > 0
        ? determineAnimalType(row.getCell(animalTypeIndex).text.trim())
        : "";
    const subcategory =
      subcategoryIndex > 0
        ? row.getCell(subcategoryIndex).text.trim()
        : getDefaultSubcategory(animalType);
    const quantity =
      quantityIndex > 0 ? extractNumber(row.getCell(quantityIndex).text) : "";

    // Skip if no animal type or quantity
    if (!animalType || !quantity) return null;

    return {
      ...baseData,
      farmer_type: "Raiser",
      animal_type: animalType,
      subcategory: subcategory,
      quantity: quantity.toString(),
    };
  };

  // Process operator row
  const processOperatorRow = (row, headers, baseData) => {
    // Find column indices for operator-specific fields
    const locationIndex = findColumnIndex(headers, [
      "location",
      "fishpond location",
      "pond location",
    ]);
    const speciesIndex = findColumnIndex(headers, [
      "species",
      "cultured species",
      "fish type",
    ]);
    const areaIndex = findColumnIndex(headers, ["area", "pond size", "size"]);
    const productionIndex = findColumnIndex(headers, [
      "production",
      "harvest",
      "yield",
    ]);

    // Extract operator-specific fields
    const location =
      locationIndex > 0 ? row.getCell(locationIndex).text.trim() : "";
    const species =
      speciesIndex > 0 ? row.getCell(speciesIndex).text.trim() : "";
    const area =
      areaIndex > 0 ? extractNumber(row.getCell(areaIndex).text) : "";
    const production =
      productionIndex > 0
        ? extractNumber(row.getCell(productionIndex).text)
        : "";

    // Skip if no location or species
    if (!location || !species) return null;

    return {
      ...baseData,
      farmer_type: "Operator",
      fishpond_location: location,
      cultured_species: species,
      area: area.toString(),
      production: production.toString(),
    };
  };

  // Process crops row
  const processCropsRow = (row, headers, baseData) => {
    // Find column indices for crops-specific fields
    const cropTypeIndex = findColumnIndex(headers, [
      "crop type",
      "category",
      "type",
    ]);
    const cropValueIndex = findColumnIndex(headers, [
      "crop",
      "crop name",
      "variety",
    ]);
    const quantityIndex = findColumnIndex(headers, [
      "quantity",
      "production",
      "yield",
    ]);
    const areaIndex = findColumnIndex(headers, ["area", "hectare", "size"]);

    // Extract crops-specific fields
    const cropTypeRaw =
      cropTypeIndex > 0 ? row.getCell(cropTypeIndex).text.trim() : "";
    const cropType = determineCropType(cropTypeRaw);
    const cropValue =
      cropValueIndex > 0 ? row.getCell(cropValueIndex).text.trim() : "";
    const quantity =
      quantityIndex > 0 ? extractNumber(row.getCell(quantityIndex).text) : "";
    const area =
      areaIndex > 0 ? extractNumber(row.getCell(areaIndex).text) : "";

    // Skip if no crop value or quantity
    if (!cropValue || !quantity) return null;

    return {
      ...baseData,
      farmer_type: "Grower",
      crop_type: cropType,
      crop_value: cropValue,
      quantity: quantity.toString(),
      area_hectare: area.toString(),
      cropping_intensity: "seasonal",
    };
  };

  // Process high value crops row
  const processHighValueCropsRow = (row, headers, baseData) => {
    // Find column indices for high value crops-specific fields
    const cropIndex = findColumnIndex(headers, [
      "crop",
      "high value crop",
      "hvc",
    ]);
    const quantityIndex = findColumnIndex(headers, [
      "quantity",
      "production",
      "yield",
    ]);
    const areaIndex = findColumnIndex(headers, ["area", "hectare", "size"]);
    const monthIndex = findColumnIndex(headers, ["month", "period", "date"]);

    // Extract high value crops-specific fields
    const crop = cropIndex > 0 ? row.getCell(cropIndex).text.trim() : "";
    const quantity =
      quantityIndex > 0 ? extractNumber(row.getCell(quantityIndex).text) : "";
    const area =
      areaIndex > 0 ? extractNumber(row.getCell(areaIndex).text) : "";
    const month =
      monthIndex > 0
        ? determineMonth(row.getCell(monthIndex).text.trim())
        : getCurrentMonth();

    // Skip if no crop or quantity
    if (!crop || !quantity) return null;

    return {
      ...baseData,
      farmer_type: "Grower",
      crop_type: "High Value Crops",
      high_value_crop: crop,
      quantity: quantity.toString(),
      area_hectare: area.toString(),
      month: month,
      cropping_intensity: "seasonal",
    };
  };

  // Helper function to check if a row is empty
  const isEmptyRow = (row) => {
    let isEmpty = true;
    row.eachCell({ includeEmpty: false }, () => {
      isEmpty = false;
    });
    return isEmpty;
  };

  // Helper function to find column index by possible header names
  const findColumnIndex = (headers, possibleNames) => {
    for (let i = 0; i < headers.length; i++) {
      if (
        headers[i] &&
        possibleNames.some((name) => headers[i].includes(name.toLowerCase()))
      ) {
        return i;
      }
    }
    return -1;
  };

  // Helper function to check if array contains all specified values
  const containsAll = (array, values) => {
    return values.every((value) =>
      array.some((item) => item && item.includes(value.toLowerCase()))
    );
  };

  // Helper function to check if array contains any of the specified values
  const containsAny = (array, values) => {
    return values.some((value) =>
      array.some((item) => item && item.includes(value.toLowerCase()))
    );
  };

  // Helper function to extract number from string
  const extractNumber = (text) => {
    if (!text) return "";
    const match = text
      .toString()
      .replace(/,/g, "")
      .match(/[-+]?\d*\.?\d+/);
    return match ? Number.parseFloat(match[0]) : "";
  };

  // Helper function to determine farmer type
  const determineFarmerType = (text) => {
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("grower") ||
      lowerText.includes("crop") ||
      lowerText.includes("farm")
    ) {
      return "Grower";
    } else if (
      lowerText.includes("raiser") ||
      lowerText.includes("livestock") ||
      lowerText.includes("animal")
    ) {
      return "Raiser";
    } else if (
      lowerText.includes("operator") ||
      lowerText.includes("fish") ||
      lowerText.includes("aqua")
    ) {
      return "Operator";
    }
    return "Grower"; // Default
  };

  // Helper function to determine area type
  const determineAreaType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("irrigated") || lowerText.includes("irrig")) {
      return "Irrigated";
    } else if (lowerText.includes("rainfed") || lowerText.includes("rain")) {
      return "Rainfed";
    }
    return "Irrigated"; // Default
  };

  // Helper function to determine seed type
  const determineSeedType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("hybrid")) {
      return "Hybrid";
    } else if (lowerText.includes("certified")) {
      return "Certified";
    } else if (lowerText.includes("good")) {
      return "Good Seeds";
    }
    return "Certified"; // Default
  };

  // Helper function to determine animal type
  const determineAnimalType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("chicken") || lowerText.includes("poultry")) {
      return "Chicken";
    } else if (
      lowerText.includes("swine") ||
      lowerText.includes("pig") ||
      lowerText.includes("hog")
    ) {
      return "Swine";
    } else if (lowerText.includes("cattle") || lowerText.includes("cow")) {
      return "Cattle";
    } else if (lowerText.includes("carabao") || lowerText.includes("buffalo")) {
      return "Carabao";
    } else if (lowerText.includes("goat")) {
      return "Goat";
    }
    return text; // Return original if no match
  };

  // Helper function to determine crop type
  const determineCropType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("vegetable") || lowerText.includes("veg")) {
      return "Vegetable";
    } else if (lowerText.includes("banana")) {
      return "Banana";
    } else if (lowerText.includes("spice")) {
      return "Spices";
    } else if (
      lowerText.includes("legume") ||
      lowerText.includes("peanut") ||
      lowerText.includes("mungbean")
    ) {
      return "Legumes";
    } else if (lowerText.includes("rice") || lowerText.includes("palay")) {
      return "Rice";
    }
    return "Vegetable"; // Default
  };

  // Helper function to determine month
  const determineMonth = (text) => {
    const months = {
      january: "1",
      jan: "1",
      february: "2",
      feb: "2",
      march: "3",
      mar: "3",
      april: "4",
      apr: "4",
      may: "5",
      june: "6",
      jun: "6",
      july: "7",
      jul: "7",
      august: "8",
      aug: "8",
      september: "9",
      sep: "9",
      sept: "9",
      october: "10",
      oct: "10",
      november: "11",
      nov: "11",
      december: "12",
      dec: "12",
    };

    const lowerText = text.toLowerCase();

    // Check for month names
    for (const [monthName, monthNum] of Object.entries(months)) {
      if (lowerText.includes(monthName)) {
        return monthNum;
      }
    }

    // Check if it's already a number between 1-12
    if (/^(1[0-2]|[1-9])$/.test(text)) {
      return text;
    }

    return getCurrentMonth(); // Default to current month
  };

  // Get current month as string (1-12)
  const getCurrentMonth = () => {
    return (new Date().getMonth() + 1).toString();
  };

  // Get default subcategory for livestock
  const getDefaultSubcategory = (animalType) => {
    switch (animalType) {
      case "Chicken":
        return "Broiler";
      case "Swine":
        return "Fatteners";
      case "Cattle":
        return "Caracow";
      case "Carabao":
        return "Carabull";
      case "Goat":
        return "Doe";
      default:
        return "";
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="excel-import"
        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-md cursor-pointer bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isImporting ? (
          <>
            <svg
              className="inline-block w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Import from Excel
          </>
        )}
      </label>
      <input
        id="excel-import"
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
        disabled={isImporting}
      />

      {showImportSummary && importStats && (
        <div className="p-4 mt-4 border rounded-md bg-gray-50">
          <h3 className="mb-2 font-medium text-gray-900">Import Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              Processed {importStats.processedSheets} sheets with{" "}
              {importStats.processedRows} valid records
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
              {importStats.farmers > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.farmers} Farmers</span>
                </div>
              )}
              {importStats.rice > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.rice} Rice</span>
                </div>
              )}
              {importStats.livestock > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.livestock} Livestock</span>
                </div>
              )}
              {importStats.crops > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.crops} Crops</span>
                </div>
              )}
              {importStats.operators > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.operators} Operators</span>
                </div>
              )}
              {importStats.highValueCrops > 0 && (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  <span>{importStats.highValueCrops} HVC</span>
                </div>
              )}
            </div>

            {importStats.errors.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="font-medium">Warnings:</span>
                </div>
                <ul className="ml-2 text-xs list-disc list-inside text-amber-600">
                  {importStats.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importStats.errors.length > 3 && (
                    <li>...and {importStats.errors.length - 3} more issues</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExcelButton;
