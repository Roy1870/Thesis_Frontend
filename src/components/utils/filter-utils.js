// Helper functions for filtering dashboard data

/**
 * Filters data by date based on selected year and month
 * @param {Object} item - The data item to filter
 * @param {string|number} selectedYear - The selected year or "All"
 * @param {string} selectedMonth - The selected month or "All"
 * @returns {boolean} - Whether the item matches the filter criteria
 */
export function filterDataByDate(item, selectedYear, selectedMonth) {
  // If both filters are set to "All", include all items
  if (selectedYear === "All" && selectedMonth === "All") {
    return true;
  }

  // Try different date fields in priority order
  const dateFields = [
    "harvest_date",
    "date_of_harvest",
    "created_at",
    "updated_at",
  ];

  // Try each date field until we find one that works
  for (const field of dateFields) {
    if (item[field]) {
      try {
        const itemDate = new Date(item[field]);

        // Skip invalid dates
        if (isNaN(itemDate.getTime())) continue;

        const itemYear = itemDate.getFullYear();
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const itemMonth = monthNames[itemDate.getMonth()];

        // Check if the item matches our filters
        const yearMatches =
          selectedYear === "All" || itemYear === Number(selectedYear);
        const monthMatches =
          selectedMonth === "All" || itemMonth === selectedMonth;

        return yearMatches && monthMatches;
      } catch (e) {
        // If this date field fails, try the next one
        continue;
      }
    }
  }

  // If we get here, no valid date field was found
  return false;
}

/**
 * Filters an array of items by date
 * @param {Array} items - Array of items to filter
 * @param {string|number} selectedYear - The selected year or "All"
 * @param {string} selectedMonth - The selected month or "All"
 * @param {string} dateField - The field name containing the date (optional)
 * @returns {Array} - Filtered array of items
 */
export function filterArrayByDate(
  items,
  selectedYear,
  selectedMonth,
  dateField = "harvest_date"
) {
  if (!Array.isArray(items)) return [];

  // If both filters are set to "All", return all items
  if (selectedYear === "All" && selectedMonth === "All") {
    return items;
  }

  return items.filter((item) => {
    // If the item has the specified date field, use that for filtering
    if (item[dateField]) {
      return filterDataByDate(
        { ...item, harvest_date: item[dateField] },
        selectedYear,
        selectedMonth
      );
    }

    // If the item has any date field, use that
    if (item.harvest_date || item.created_at || item.date_of_harvest) {
      return filterDataByDate(item, selectedYear, selectedMonth);
    }

    // If no date field is found, exclude the item when filtering
    return false;
  });
}

/**
 * Creates a deep copy of category data and filters items by date
 * @param {Object} categoryData - The category data object
 * @param {string|number} selectedYear - The selected year or "All"
 * @param {string} selectedMonth - The selected month or "All"
 * @returns {Object} - Filtered category data
 */
export function filterCategoryData(categoryData, selectedYear, selectedMonth) {
  // If both filters are set to "All", return all category data
  if (selectedYear === "All" && selectedMonth === "All") {
    return JSON.parse(JSON.stringify(categoryData));
  }

  // Create a deep copy to avoid mutating the original data
  const filteredCategoryData = {};

  // Filter each category
  Object.keys(categoryData).forEach((category) => {
    if (!categoryData[category]) {
      filteredCategoryData[category] = { total: 0, items: [] };
      return;
    }

    // Start with empty items array
    filteredCategoryData[category] = {
      items: [],
      total: 0,
    };

    // If the category doesn't have items, skip filtering
    if (!Array.isArray(categoryData[category].items)) {
      return;
    }

    // Filter items by date if they have date fields
    const filteredItems = categoryData[category].items.filter((item) => {
      // Check if the item has any date fields
      const hasDateField =
        item.harvest_date || item.created_at || item.date_of_harvest;

      // If no date field, include the item (don't filter it out)
      if (!hasDateField) return true;

      // Otherwise, apply date filtering
      return filterDataByDate(item, selectedYear, selectedMonth);
    });

    filteredCategoryData[category].items = filteredItems;

    // Recalculate the total based on filtered items
    filteredCategoryData[category].total = filteredItems.reduce(
      (sum, item) => sum + (item.value || 0),
      0
    );
  });

  return filteredCategoryData;
}
