// Helper function to parse production_data
export const parseProductionData = (crop) => {
  let productionData = {};
  if (crop.production_data && typeof crop.production_data === "string") {
    try {
      productionData = JSON.parse(crop.production_data);
    } catch (e) {
      // Silent error - continue with empty production data
    }
  } else if (crop.production_data && typeof crop.production_data === "object") {
    productionData = crop.production_data;
  }
  return productionData;
};
