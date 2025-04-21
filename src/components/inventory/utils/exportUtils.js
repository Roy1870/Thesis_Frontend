import { parseProductionData } from "./dataUtils";

// Export to Excel function
export const exportToExcel = (selectedDataType, allData, showToast) => {
  if (selectedDataType === "farmers") return; // Skip export for farmers

  try {
    // Create a workbook with a worksheet
    const workbook = new window.ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(selectedDataType);

    // Define columns based on data type
    let columns = [];

    switch (selectedDataType) {
      case "crops":
        columns = [
          { header: "Crop Type", key: "crop_type" },
          { header: "Crop", key: "crop_value" },
          { header: "Area (ha)", key: "area_hectare" },
          { header: "Quantity", key: "quantity" },
          { header: "Farmer", key: "farmer_name" },
          { header: "Barangay", key: "barangay" },
          { header: "Date Recorded", key: "created_at" },
        ];
        break;

      case "highValueCrops":
        columns = [
          { header: "Crop", key: "crop_value" },
          { header: "Variety/Clone", key: "variety_clone" },
          { header: "Month", key: "month" },
          { header: "Area (ha)", key: "area_hectare" },
          { header: "Quantity", key: "quantity" },
          { header: "Farmer", key: "farmer_name" },
          { header: "Barangay", key: "barangay" },
          { header: "Date Recorded", key: "created_at" },
        ];
        break;

      case "rice":
        columns = [
          { header: "Area Type", key: "area_type" },
          { header: "Seed Type", key: "seed_type" },
          { header: "Area (ha)", key: "area_harvested" },
          { header: "Production", key: "production" },
          { header: "Farmer", key: "farmer_name" },
          { header: "Barangay", key: "barangay" },
          { header: "Date Recorded", key: "created_at" },
        ];
        break;

      case "livestock":
        columns = [
          { header: "Animal Type", key: "animal_type" },
          { header: "Subcategory", key: "subcategory" },
          { header: "Quantity", key: "quantity" },
          { header: "Farmer", key: "farmer_name" },
          { header: "Barangay", key: "barangay" },
          { header: "Date Recorded", key: "created_at" },
        ];
        break;

      case "operators":
        columns = [
          { header: "Location", key: "fishpond_location" },
          { header: "Species", key: "cultured_species" },
          { header: "Area (sqm)", key: "productive_area_sqm" },
          { header: "Production (kg)", key: "production_kg" },
          { header: "Status", key: "operational_status" },
          { header: "Farmer", key: "farmer_name" },
          { header: "Barangay", key: "barangay" },
          { header: "Date Recorded", key: "created_at" },
        ];
        break;

      default:
        break;
    }

    // Set the columns
    worksheet.columns = columns;

    // Process data for export
    const dataToExport = allData.map((item) => {
      // Create a new object with processed values
      const processedItem = { ...item };

      // Format date fields
      if (processedItem.created_at) {
        processedItem.created_at = new Date(
          processedItem.created_at
        ).toLocaleDateString();
      }

      // Process production_data for crops and highValueCrops
      if (
        (selectedDataType === "crops" ||
          selectedDataType === "highValueCrops") &&
        processedItem.production_data
      ) {
        const productionData = parseProductionData(processedItem);
        processedItem.crop_value =
          productionData.crop || processedItem.crop_value || "";
        processedItem.quantity =
          productionData.quantity || processedItem.quantity || "";

        if (selectedDataType === "highValueCrops") {
          processedItem.month =
            productionData.month || processedItem.month || "";
        }
      }

      // Format numeric fields
      if (processedItem.area_hectare) {
        processedItem.area_hectare = Number.parseFloat(
          processedItem.area_hectare
        ).toFixed(2);
      }

      if (processedItem.area_harvested) {
        processedItem.area_harvested = Number.parseFloat(
          processedItem.area_harvested
        ).toFixed(2);
      }

      if (processedItem.production) {
        processedItem.production = Number.parseFloat(
          processedItem.production
        ).toFixed(2);
      }

      return processedItem;
    });

    // Add rows to the worksheet
    worksheet.addRows(dataToExport);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6F5E4" },
    };

    // Auto-size columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Create a blob from the buffer
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDataType}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`${selectedDataType} data exported successfully`, "success");
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    showToast(`Failed to export data: ${error.message}`, "error");
  }
};
