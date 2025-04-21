"use client";

import { useState, useCallback, useRef } from "react";
import { farmerAPI, livestockAPI, operatorAPI } from "../../services/api";
import { parseProductionData } from "../utils/dataUtils";

export const useInventoryData = (
  selectedDataType,
  debouncedSearchText,
  barangayFilter,
  monthFilter,
  yearFilter,
  abortControllerRef
) => {
  // Data states
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [monthOptions] = useState([
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]);
  const [yearOptions, setYearOptions] = useState([]);

  // Use a ref to track if filters have changed
  const filtersRef = useRef({
    searchText: debouncedSearchText,
    barangay: barangayFilter,
    month: monthFilter,
    year: yearFilter,
  });

  // Extract unique barangays and years from data
  const extractFilterOptions = useCallback((data) => {
    // Extract unique barangays
    const barangays = [
      ...new Set(data.map((item) => item.barangay).filter(Boolean)),
    ].sort();
    setBarangayOptions(barangays);

    // Extract unique years from created_at dates
    const years = [
      ...new Set(
        data
          .map((item) =>
            item.created_at ? new Date(item.created_at).getFullYear() : null
          )
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a); // Sort descending

    // If no years found, add current year
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }

    setYearOptions(years);
  }, []);

  // Paginate data function
  const paginateData = useCallback(() => {
    console.log(
      `Paginating data for page ${currentPage}, pageSize ${pageSize}, total records ${allData.length}`
    );
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = allData.slice(startIndex, startIndex + pageSize);
    console.log(`Paginated results: ${paginatedResults.length} items`);

    setData(paginatedResults);
    setTotalRecords(allData.length);
  }, [allData, currentPage, pageSize]);

  // Fetch all data for client-side filtering
  const fetchAllData = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        // Clear existing data to prevent mixing
        setData([]);

        let response;
        let processedData = [];

        switch (selectedDataType) {
          case "farmers":
            response = await farmerAPI.getAllFarmers(1, 1000, "", [], signal);
            processedData = Array.isArray(response)
              ? response
              : response.data || [];
            break;

          case "crops":
            // First get all farmers
            const farmersResponse = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              signal
            );
            const farmers = Array.isArray(farmersResponse)
              ? farmersResponse
              : farmersResponse.data || [];

            // Extract all crops from farmers
            const allCrops = [];
            for (const farmer of farmers) {
              if (farmer.crops && Array.isArray(farmer.crops)) {
                // Filter out high value crops (they'll be in their own section)
                const regularCrops = farmer.crops.filter(
                  (crop) => crop.crop_type !== "High Value Crops"
                );

                // Add farmer info to each crop
                const farmerCrops = regularCrops.map((crop) => {
                  // Parse production_data
                  const productionData = parseProductionData(crop);

                  return {
                    ...crop,
                    farmer_id: farmer.farmer_id,
                    farmer_name:
                      farmer.name ||
                      `${farmer.first_name || ""} ${
                        farmer.last_name || ""
                      }`.trim() ||
                      "Unknown",
                    barangay: farmer.barangay,
                    // Add parsed production data fields
                    crop_value: productionData.crop || crop.crop_value || "",
                    quantity: productionData.quantity || crop.quantity || "",
                    // Keep original production_data for reference
                    production_data: crop.production_data,
                  };
                });
                allCrops.push(...farmerCrops);
              }
            }

            processedData = allCrops;
            break;

          case "highValueCrops":
            // First get all farmers
            const farmersForHVC = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              signal
            );
            const farmersDataForHVC = Array.isArray(farmersForHVC)
              ? farmersForHVC
              : farmersForHVC.data || [];

            // Extract all high value crops from farmers
            const allHighValueCrops = [];
            for (const farmer of farmersDataForHVC) {
              if (farmer.crops && Array.isArray(farmer.crops)) {
                // Filter only high value crops
                const highValueCrops = farmer.crops.filter(
                  (crop) => crop.crop_type === "High Value Crops"
                );

                // Add farmer info to each crop
                const farmerHVCs = highValueCrops.map((crop) => {
                  // Parse production_data
                  const productionData = parseProductionData(crop);

                  return {
                    ...crop,
                    farmer_id: farmer.farmer_id,
                    farmer_name:
                      farmer.name ||
                      `${farmer.first_name || ""} ${
                        farmer.last_name || ""
                      }`.trim() ||
                      "Unknown",
                    barangay: farmer.barangay,
                    // Add parsed production data fields
                    month: productionData.month || "",
                    crop_value: productionData.crop || crop.crop_value || "",
                    quantity: productionData.quantity || crop.quantity || "",
                    // Keep original production_data for reference
                    production_data: crop.production_data,
                  };
                });
                allHighValueCrops.push(...farmerHVCs);
              }
            }

            processedData = allHighValueCrops;
            break;

          case "rice":
            // First get all farmers
            const farmersForRice = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              signal
            );
            const farmersDataForRice = Array.isArray(farmersForRice)
              ? farmersForRice
              : farmersForRice.data || [];

            // Extract all rice data from farmers
            const allRice = [];
            for (const farmer of farmersDataForRice) {
              if (farmer.rice && Array.isArray(farmer.rice)) {
                // Add farmer info to each rice entry
                const farmerRice = farmer.rice.map((rice) => ({
                  ...rice,
                  farmer_id: farmer.farmer_id,
                  farmer_name:
                    farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim() ||
                    "Unknown",
                  barangay: farmer.barangay,
                }));
                allRice.push(...farmerRice);
              }
            }

            processedData = allRice;
            break;

          case "livestock":
            // Get all livestock records
            const livestockResponse = await livestockAPI.getAllLivestockRecords(
              1,
              1000,
              "",
              signal
            );
            const livestockRecords = Array.isArray(livestockResponse)
              ? livestockResponse
              : livestockResponse.data || [];

            // Get all farmers to add farmer information to livestock records
            const farmersForLivestock = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              signal
            );

            // Create a map of farmer_id to farmer data for quick lookup
            const farmersMap = {};
            const farmersForLivestockData = Array.isArray(farmersForLivestock)
              ? farmersForLivestock
              : farmersForLivestock.data || [];

            farmersForLivestockData.forEach((farmer) => {
              farmersMap[farmer.farmer_id] = farmer;
            });

            // Enrich livestock records with farmer information
            const enrichedLivestockRecords = livestockRecords.map((record) => {
              const farmer = farmersMap[record.farmer_id];
              return {
                ...record,
                farmer_name: farmer
                  ? farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim()
                  : "Unknown",
                barangay: farmer ? farmer.barangay : "Unknown",
              };
            });

            processedData = enrichedLivestockRecords;
            break;

          case "operators":
            // Get all operators
            const operatorsResponse = await operatorAPI.getAllOperators(
              1,
              1000,
              "",
              signal
            );
            const operators = Array.isArray(operatorsResponse)
              ? operatorsResponse
              : operatorsResponse.data || [];

            // Get all farmers to add farmer information to operators
            const farmersForOperators = await farmerAPI.getAllFarmers(
              1,
              1000,
              "",
              [],
              signal
            );

            // Create a map of farmer_id to farmer data for quick lookup
            const farmerOperatorMap = {};
            const farmersForOperatorsData = Array.isArray(farmersForOperators)
              ? farmersForOperators
              : farmersForOperators.data || [];

            farmersForOperatorsData.forEach((farmer) => {
              farmerOperatorMap[farmer.farmer_id] = farmer;
            });

            // Enrich operators with farmer information
            const enrichedOperators = operators.map((operator) => {
              const farmer = farmerOperatorMap[operator.farmer_id];
              return {
                ...operator,
                farmer_name: farmer
                  ? farmer.name ||
                    `${farmer.first_name || ""} ${
                      farmer.last_name || ""
                    }`.trim()
                  : "Unknown",
                barangay: farmer ? farmer.barangay : "Unknown",
              };
            });

            processedData = enrichedOperators;
            break;

          default:
            processedData = [];
        }

        // Extract filter options from the data
        extractFilterOptions(processedData);

        // Set the new data
        setAllData(processedData);

        // Apply pagination to the fetched data
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedResults = processedData.slice(
          startIndex,
          startIndex + pageSize
        );

        setData(paginatedResults);
        setTotalRecords(processedData.length);
        setLoading(false);
      } catch (err) {
        // Only set error if not an abort error (which happens during cleanup)
        if (err.name !== "AbortError") {
          console.error(`Error fetching ${selectedDataType} data:`, err);
          setError(`Failed to fetch ${selectedDataType} data: ${err.message}`);
          setLoading(false);
          setAllData([]);
          setData([]);
          setTotalRecords(0);
        }
      }
    },
    [selectedDataType, extractFilterOptions, currentPage, pageSize]
  );

  // Client-side filtering function
  const filterData = useCallback(() => {
    const shouldPaginateDirectly =
      !debouncedSearchText.trim() &&
      !barangayFilter &&
      !monthFilter &&
      !yearFilter;

    if (shouldPaginateDirectly) {
      paginateData();
      return;
    }

    // Check if filters have changed
    const filtersChanged =
      filtersRef.current.searchText !== debouncedSearchText ||
      filtersRef.current.barangay !== barangayFilter ||
      filtersRef.current.month !== monthFilter ||
      filtersRef.current.year !== yearFilter;

    // Update the filters ref
    filtersRef.current = {
      searchText: debouncedSearchText,
      barangay: barangayFilter,
      month: monthFilter,
      year: yearFilter,
    };

    setLoading(true);
    const searchLower = debouncedSearchText.toLowerCase().trim();
    let filtered = [...allData]; // Start with all data

    // Apply text search if provided
    if (searchLower) {
      switch (selectedDataType) {
        case "farmers":
          filtered = filtered.filter(
            (farmer) =>
              (farmer.name &&
                farmer.name.toLowerCase().includes(searchLower)) ||
              (farmer.contact_number &&
                farmer.contact_number.toLowerCase().includes(searchLower)) ||
              (farmer.facebook_email &&
                farmer.facebook_email.toLowerCase().includes(searchLower)) ||
              (farmer.home_address &&
                farmer.home_address.toLowerCase().includes(searchLower)) ||
              (farmer.barangay &&
                farmer.barangay.toLowerCase().includes(searchLower))
          );
          break;

        case "crops":
          filtered = filtered.filter((crop) => {
            // Get crop value from production_data if available
            let cropValue = crop.crop_value || "";
            let quantity = crop.quantity || "";

            // Try to parse production_data if it's a string
            if (crop.production_data) {
              const productionData = parseProductionData(crop);
              if (productionData.crop) {
                cropValue = productionData.crop;
              }
              if (productionData.quantity) {
                quantity = productionData.quantity;
              }
            }

            return (
              (crop.crop_type &&
                crop.crop_type.toLowerCase().includes(searchLower)) ||
              (cropValue && cropValue.toLowerCase().includes(searchLower)) ||
              (crop.area_hectare &&
                crop.area_hectare.toString().includes(searchLower)) ||
              (quantity && quantity.toString().includes(searchLower)) ||
              (crop.farmer_name &&
                crop.farmer_name.toLowerCase().includes(searchLower)) ||
              (crop.barangay &&
                crop.barangay.toLowerCase().includes(searchLower))
            );
          });
          break;

        case "highValueCrops":
          filtered = filtered.filter((crop) => {
            // Get crop value and month from production_data if available
            let cropValue = crop.crop_value || "";
            let month = crop.month || "";
            let quantity = crop.quantity || "";

            // Try to parse production_data if it's a string
            if (crop.production_data) {
              const productionData = parseProductionData(crop);
              if (productionData.crop) {
                cropValue = productionData.crop;
              }
              if (productionData.month) {
                month = productionData.month;
              }
              if (productionData.quantity) {
                quantity = productionData.quantity;
              }
            }

            return (
              (cropValue && cropValue.toLowerCase().includes(searchLower)) ||
              (month && month.toLowerCase().includes(searchLower)) ||
              (crop.variety_clone &&
                crop.variety_clone.toLowerCase().includes(searchLower)) ||
              (crop.area_hectare &&
                crop.area_hectare.toString().includes(searchLower)) ||
              (quantity && quantity.toString().includes(searchLower)) ||
              (crop.farmer_name &&
                crop.farmer_name.toLowerCase().includes(searchLower)) ||
              (crop.barangay &&
                crop.barangay.toLowerCase().includes(searchLower))
            );
          });
          break;

        case "rice":
          filtered = filtered.filter(
            (rice) =>
              (rice.area_type &&
                rice.area_type.toLowerCase().includes(searchLower)) ||
              (rice.seed_type &&
                rice.seed_type.toLowerCase().includes(searchLower)) ||
              (rice.area_harvested &&
                rice.area_harvested.toString().includes(searchLower)) ||
              (rice.farmer_name &&
                rice.farmer_name.toLowerCase().includes(searchLower)) ||
              (rice.barangay &&
                rice.barangay.toLowerCase().includes(searchLower))
          );
          break;

        case "livestock":
          filtered = filtered.filter(
            (livestock) =>
              (livestock.animal_type &&
                livestock.animal_type.toLowerCase().includes(searchLower)) ||
              (livestock.subcategory &&
                livestock.subcategory.toLowerCase().includes(searchLower)) ||
              (livestock.quantity &&
                livestock.quantity.toString().includes(searchLower)) ||
              (livestock.farmer_name &&
                livestock.farmer_name.toLowerCase().includes(searchLower))
          );
          break;

        case "operators":
          filtered = filtered.filter(
            (operator) =>
              (operator.fishpond_location &&
                operator.fishpond_location
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.cultured_species &&
                operator.cultured_species
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.productive_area_sqm &&
                operator.productive_area_sqm
                  .toString()
                  .includes(searchLower)) ||
              (operator.production_kg &&
                operator.production_kg.toString().includes(searchLower)) ||
              (operator.operational_status &&
                operator.operational_status
                  .toLowerCase()
                  .includes(searchLower)) ||
              (operator.farmer_name &&
                operator.farmer_name.toLowerCase().includes(searchLower))
          );
          break;

        default:
          break;
      }
    }

    // Apply barangay filter if selected
    if (barangayFilter) {
      filtered = filtered.filter(
        (item) => item.barangay && item.barangay === barangayFilter
      );
    }

    // Apply year and month filters if selected
    if (yearFilter || monthFilter) {
      filtered = filtered.filter((item) => {
        if (!item.created_at) return false;

        const date = new Date(item.created_at);
        const itemYear = date.getFullYear().toString();
        const itemMonth = (date.getMonth() + 1).toString(); // JavaScript months are 0-indexed

        // If both year and month are specified, both must match
        if (yearFilter && monthFilter) {
          return itemYear === yearFilter && itemMonth === monthFilter;
        }
        // If only year is specified
        else if (yearFilter) {
          return itemYear === yearFilter;
        }
        // If only month is specified
        else if (monthFilter) {
          return itemMonth === monthFilter;
        }

        return true;
      });
    }

    // Store total filtered records count
    setTotalRecords(filtered.length);

    // Only reset to page 1 if filters have changed
    if (filtersChanged) {
      // Calculate correct starting index based on page 1
      const paginatedResults = filtered.slice(0, pageSize);
      setData(paginatedResults);
      // We don't call setCurrentPage here to avoid the loop
    } else {
      // Normal pagination with current page
      const startIndex = (currentPage - 1) * pageSize;

      // If current page would be out of bounds after filtering, adjust to last page
      if (startIndex >= filtered.length && filtered.length > 0) {
        const newPage = Math.max(1, Math.ceil(filtered.length / pageSize));
        const newStartIndex = (newPage - 1) * pageSize;
        const paginatedResults = filtered.slice(
          newStartIndex,
          newStartIndex + pageSize
        );
        setData(paginatedResults);
        // Only update page if it's different to avoid loops
        if (newPage !== currentPage) {
          setCurrentPage(newPage);
        }
      } else {
        // Normal pagination
        const paginatedResults = filtered.slice(
          startIndex,
          startIndex + pageSize
        );
        setData(paginatedResults);
      }
    }

    setLoading(false);
  }, [
    allData,
    barangayFilter,
    currentPage,
    debouncedSearchText,
    monthFilter,
    pageSize,
    paginateData,
    selectedDataType,
    yearFilter,
  ]);

  return {
    data,
    allData,
    loading,
    error,
    totalRecords,
    currentPage,
    setCurrentPage,
    pageSize,
    barangayOptions,
    monthOptions,
    yearOptions,
    fetchAllData,
    filterData,
    paginateData,
  };
};
