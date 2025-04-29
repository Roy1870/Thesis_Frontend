"use client";

import { useState } from "react";
import MonthlyTrendChart from "./monthly-trend-chart";
import BarangayDistributionChart from "./barangay-distribution-chart";
import ItemBreakdownChart from "./items-breakdown-chart";
import ProductionComparisonChart from "./production-comparison-chart";

export default function CategoryAnalytics({
  category,
  categoryData,
  rawData,
  availableYears,
  loading,
}) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [expanded, setExpanded] = useState(false);

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get monthly data for this specific category
  const getMonthlyData = () => {
    if (!rawData || !category) return [];

    const monthlyProductionMap = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    // Process data based on category
    if (category.id === "rice") {
      // Add rice production to monthly data
      rawData.rice.forEach((rice) => {
        if (rice.harvest_date) {
          const harvestDate = new Date(rice.harvest_date);
          // Filter by year
          if (harvestDate.getFullYear() === selectedYear) {
            const month = harvestDate.toLocaleString("en-US", {
              month: "short",
            });
            const production = Number.parseFloat(
              rice.production || rice.yield_amount || 0
            );
            if (!isNaN(production) && production > 0) {
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + production;
            }
          }
        }
      });
    } else if (category.id === "livestock") {
      // Add livestock data to monthly data
      rawData.livestock.forEach((livestock) => {
        if (livestock.created_at) {
          const addedDate = new Date(livestock.created_at);
          // Filter by year
          if (addedDate.getFullYear() === selectedYear) {
            const month = addedDate.toLocaleString("en-US", {
              month: "short",
            });
            const quantity = Number.parseInt(livestock.quantity || 0);
            if (!isNaN(quantity) && quantity > 0) {
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + quantity;
            }
          }
        }
      });
    } else if (category.id === "fish") {
      // Add fish data from operators
      rawData.operators.forEach((operator) => {
        if (operator.date_of_harvest) {
          const harvestDate = new Date(operator.date_of_harvest);
          // Filter by year
          if (harvestDate.getFullYear() === selectedYear) {
            const month = harvestDate.toLocaleString("en-US", {
              month: "short",
            });
            const production = Number.parseFloat(operator.production_kg || 0);
            if (!isNaN(production) && production > 0) {
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + production;
            }
          }
        }
      });
    } else {
      // For other categories, filter crops by category
      const filterCropsByCategory = (crop) => {
        const cropType = (crop.crop_type || "").toLowerCase();
        const cropValue = (crop.crop_value || "").toLowerCase();

        switch (category.id) {
          case "banana":
            return cropType.includes("banana") || cropValue.includes("banana");
          case "vegetables":
            return (
              cropType.includes("vegetable") ||
              cropValue.includes("vegetable") ||
              cropType.includes("tomato") ||
              cropValue.includes("tomato") ||
              cropType.includes("eggplant") ||
              cropValue.includes("eggplant") ||
              cropType.includes("cabbage") ||
              cropValue.includes("cabbage")
            );
          case "legumes":
            return (
              cropType.includes("legume") ||
              cropValue.includes("legume") ||
              cropType.includes("bean") ||
              cropValue.includes("bean")
            );
          case "spices":
            return cropType.includes("spice") || cropValue.includes("spice");
          case "highValueCrops":
            return cropType === "high value crops";
          default:
            return false;
        }
      };

      // Process regular crops
      rawData.crops.filter(filterCropsByCategory).forEach((crop) => {
        if (crop.harvest_date) {
          const harvestDate = new Date(crop.harvest_date);
          // Filter by year
          if (harvestDate.getFullYear() === selectedYear) {
            const month = harvestDate.toLocaleString("en-US", {
              month: "short",
            });
            const production = Number.parseFloat(
              crop.yield_amount || crop.production || crop.quantity || 0
            );
            if (!isNaN(production) && production > 0) {
              monthlyProductionMap[month] =
                (monthlyProductionMap[month] || 0) + production;
            }
          }
        }
      });

      // Process high value crops if needed
      if (category.id === "highValueCrops") {
        rawData.highValueCrops.forEach((crop) => {
          if (crop.harvest_date) {
            const harvestDate = new Date(crop.harvest_date);
            // Filter by year
            if (harvestDate.getFullYear() === selectedYear) {
              const month = harvestDate.toLocaleString("en-US", {
                month: "short",
              });
              const production = Number.parseFloat(
                crop.yield_amount || crop.production || crop.quantity || 0
              );
              if (!isNaN(production) && production > 0) {
                monthlyProductionMap[month] =
                  (monthlyProductionMap[month] || 0) + production;
              }
            }
          }
        });
      }
    }

    // Convert monthly production to array for chart
    const monthOrder = [
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
    return monthOrder.map((month) => ({
      name: month,
      production: monthlyProductionMap[month] || 0,
    }));
  };

  // Get barangay data for this specific category
  const getBarangayData = () => {
    if (!rawData || !category) return [];

    const barangayMap = {};

    // Helper function to add data to the barangay map
    const addToBarangayMap = (item, value, barangay, date) => {
      if (isNaN(value) || value <= 0) return;

      // Skip if date is not provided
      if (!date) return;

      // Filter by month and year
      const itemDate = new Date(date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.toLocaleString("en-US", { month: "short" });

      // Skip if year doesn't match
      if (selectedYear !== itemYear) return;

      // Skip if month doesn't match (unless "All" is selected)
      if (selectedMonth !== "All" && selectedMonth !== itemMonth) return;

      barangay = barangay || item.barangay || "Unknown";

      if (!barangayMap[barangay]) {
        barangayMap[barangay] = 0;
      }

      barangayMap[barangay] += value;
    };

    // Process data based on category
    if (category.id === "livestock") {
      // Add livestock data
      rawData.livestock.forEach((livestock) => {
        const quantity = Number.parseInt(livestock.quantity || 0);
        addToBarangayMap(
          livestock,
          quantity,
          livestock.barangay,
          livestock.created_at
        );
      });
    } else if (category.id === "rice") {
      // Add rice data
      rawData.rice.forEach((rice) => {
        const production = Number.parseFloat(
          rice.production || rice.yield_amount || 0
        );
        addToBarangayMap(rice, production, rice.barangay, rice.harvest_date);
      });
    } else if (category.id === "fish") {
      // Add fish data from operators
      rawData.operators.forEach((operator) => {
        const production = Number.parseFloat(operator.production_kg || 0);
        addToBarangayMap(
          operator,
          production,
          operator.barangay,
          operator.date_of_harvest
        );
      });
    } else {
      // For other categories, filter crops by category
      const filterCropsByCategory = (crop) => {
        const cropType = (crop.crop_type || "").toLowerCase();
        const cropValue = (crop.crop_value || "").toLowerCase();

        switch (category.id) {
          case "banana":
            return cropType.includes("banana") || cropValue.includes("banana");
          case "vegetables":
            return (
              cropType.includes("vegetable") ||
              cropValue.includes("vegetable") ||
              cropType.includes("tomato") ||
              cropValue.includes("tomato") ||
              cropType.includes("eggplant") ||
              cropValue.includes("eggplant") ||
              cropType.includes("cabbage") ||
              cropValue.includes("cabbage")
            );
          case "legumes":
            return (
              cropType.includes("legume") ||
              cropValue.includes("legume") ||
              cropType.includes("bean") ||
              cropValue.includes("bean")
            );
          case "spices":
            return cropType.includes("spice") || cropValue.includes("spice");
          case "highValueCrops":
            return cropType === "high value crops";
          default:
            return false;
        }
      };

      // Process regular crops
      rawData.crops.filter(filterCropsByCategory).forEach((crop) => {
        const production = Number.parseFloat(
          crop.yield_amount || crop.production || crop.quantity || 0
        );
        addToBarangayMap(crop, production, crop.barangay, crop.harvest_date);
      });

      // Process high value crops if needed
      if (category.id === "highValueCrops") {
        rawData.highValueCrops.forEach((crop) => {
          const production = Number.parseFloat(
            crop.yield_amount || crop.production || crop.quantity || 0
          );
          addToBarangayMap(crop, production, crop.barangay, crop.harvest_date);
        });
      }
    }

    // Convert to array format for chart
    return Object.entries(barangayMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 barangays
  };

  // Get year-over-year comparison data
  const getYearlyComparisonData = () => {
    if (!rawData || !category) return [];

    const yearlyData = {};
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    // Initialize yearly data
    years.forEach((year) => {
      yearlyData[year] = 0;
    });

    // Process data based on category
    if (category.id === "livestock") {
      // Add livestock data
      rawData.livestock.forEach((livestock) => {
        if (livestock.created_at) {
          const year = new Date(livestock.created_at).getFullYear();
          if (years.includes(year)) {
            const quantity = Number.parseInt(livestock.quantity || 0);
            if (!isNaN(quantity) && quantity > 0) {
              yearlyData[year] = (yearlyData[year] || 0) + quantity;
            }
          }
        }
      });
    } else if (category.id === "rice") {
      // Add rice data
      rawData.rice.forEach((rice) => {
        if (rice.harvest_date) {
          const year = new Date(rice.harvest_date).getFullYear();
          if (years.includes(year)) {
            const production = Number.parseFloat(
              rice.production || rice.yield_amount || 0
            );
            if (!isNaN(production) && production > 0) {
              yearlyData[year] = (yearlyData[year] || 0) + production;
            }
          }
        }
      });
    } else if (category.id === "fish") {
      // Add fish data from operators
      rawData.operators.forEach((operator) => {
        if (operator.date_of_harvest) {
          const year = new Date(operator.date_of_harvest).getFullYear();
          if (years.includes(year)) {
            const production = Number.parseFloat(operator.production_kg || 0);
            if (!isNaN(production) && production > 0) {
              yearlyData[year] = (yearlyData[year] || 0) + production;
            }
          }
        }
      });
    } else {
      // For other categories, filter crops by category
      const filterCropsByCategory = (crop) => {
        const cropType = (crop.crop_type || "").toLowerCase();
        const cropValue = (crop.crop_value || "").toLowerCase();

        switch (category.id) {
          case "banana":
            return cropType.includes("banana") || cropValue.includes("banana");
          case "vegetables":
            return (
              cropType.includes("vegetable") ||
              cropValue.includes("vegetable") ||
              cropType.includes("tomato") ||
              cropValue.includes("tomato") ||
              cropType.includes("eggplant") ||
              cropValue.includes("eggplant") ||
              cropType.includes("cabbage") ||
              cropValue.includes("cabbage")
            );
          case "legumes":
            return (
              cropType.includes("legume") ||
              cropValue.includes("legume") ||
              cropType.includes("bean") ||
              cropValue.includes("bean")
            );
          case "spices":
            return cropType.includes("spice") || cropValue.includes("spice");
          case "highValueCrops":
            return cropType === "high value crops";
          default:
            return false;
        }
      };

      // Process regular crops
      rawData.crops.filter(filterCropsByCategory).forEach((crop) => {
        if (crop.harvest_date) {
          const year = new Date(crop.harvest_date).getFullYear();
          if (years.includes(year)) {
            const production = Number.parseFloat(
              crop.yield_amount || crop.production || crop.quantity || 0
            );
            if (!isNaN(production) && production > 0) {
              yearlyData[year] = (yearlyData[year] || 0) + production;
            }
          }
        }
      });

      // Process high value crops if needed
      if (category.id === "highValueCrops") {
        rawData.highValueCrops.forEach((crop) => {
          if (crop.harvest_date) {
            const year = new Date(crop.harvest_date).getFullYear();
            if (years.includes(year)) {
              const production = Number.parseFloat(
                crop.yield_amount || crop.production || crop.quantity || 0
              );
              if (!isNaN(production) && production > 0) {
                yearlyData[year] = (yearlyData[year] || 0) + production;
              }
            }
          }
        });
      }
    }

    // Convert to array format for chart
    return years.map((year) => ({
      name: year.toString(),
      value: yearlyData[year] || 0,
    }));
  };

  return (
    <div className="mb-12">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 mr-3 text-xl rounded-full bg-green-50">
            {category.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {category.name} Analytics
          </h2>
        </div>
        <div className="flex items-center">
          <div className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            Total:{" "}
            {formatNumber(
              categoryData?.total?.toFixed(category.unit === "heads" ? 0 : 2)
            )}{" "}
            {category.unit}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-8 h-8 ml-2 text-gray-500 bg-white border border-gray-200 rounded-full hover:bg-gray-50"
          >
            {expanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All Months</option>
          {[
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
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <MonthlyTrendChart
          data={getMonthlyData()}
          title={`${category.name} Monthly Production (${selectedYear})`}
          unit={category.unit}
          loading={loading}
        />

        {/* Barangay Distribution Chart */}
        <BarangayDistributionChart
          data={getBarangayData()}
          title={`${category.name} by Barangay (${selectedMonth} ${selectedYear})`}
          unit={category.unit}
          loading={loading}
        />

        {/* Item Breakdown Chart - Only show if expanded */}
        {expanded && (
          <ItemBreakdownChart
            data={categoryData?.items || []}
            title={`${category.name} Breakdown by Item`}
            unit={category.unit}
            loading={loading}
          />
        )}

        {/* Year-over-Year Comparison - Only show if expanded */}
        {expanded && (
          <ProductionComparisonChart
            data={getYearlyComparisonData()}
            title={`${category.name} Year-over-Year Comparison`}
            unit={category.unit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
