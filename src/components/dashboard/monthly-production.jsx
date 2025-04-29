"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyProduction({
  monthlyProduction,
  selectedYear,
  setSelectedYear,
  selectedDataType,
  setSelectedDataType,
  availableYears,
  getMonthlyDataByType,
}) {
  const [chartData, setChartData] = useState(monthlyProduction);

  // Update chart data when data type or year changes
  const handleDataTypeChange = (dataType) => {
    setSelectedDataType(dataType);
    setChartData(getMonthlyDataByType(dataType));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setChartData(getMonthlyDataByType(selectedDataType));
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
      <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="mb-2 text-lg font-semibold text-gray-800 sm:mb-0">
          Monthly Production
        </h4>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedDataType}
            onChange={(e) => handleDataTypeChange(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Total">All Categories</option>
            <option value="Crops">Crops</option>
            <option value="Rice">Rice</option>
            <option value="Livestock">Livestock</option>
            <option value="Fish">Fish</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[300px]">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${formatNumber(value.toFixed(2))} ${
                    selectedDataType === "Livestock" ? "heads" : "tons"
                  }`,
                  "Production",
                ]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  border: "1px solid #E0E0E0",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="production"
                fill="#6A9C89"
                name="Production"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p>No monthly production data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
